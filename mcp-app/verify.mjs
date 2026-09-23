import assert from "node:assert/strict";
import { mkdtemp, rm, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";
import puppeteer from "puppeteer";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ElicitRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { toolData } from "./tool-data.js";

const root = fileURLToPath(new URL("./", import.meta.url));
const director = path.resolve(root, "..", ".github", "skills", "product-demo-director", "scripts", "director.mjs");
const temporary = await mkdtemp(path.join(tmpdir(), "productshot-mcp-check-"));
const project = path.join(temporary, "project");
const clients = [];
let browser;
const appsCapability = { extensions: { "io.modelcontextprotocol/ui": { mimeTypes: ["text/html;profile=mcp-app"] } } };
const discovery = {
  summary: "Isolated product fixture, not a real product claim.",
  sourceRevision: "fixture",
  capabilities: [
    { id: "tables", title: "Tables <script>unsafe()</script>", proof: "Records are visible", confidence: "source-verified", evidence: ["fixture:1"], limitations: "Fixture only" },
    { id: "forms", title: "Forms", proof: "Submission is visible", confidence: "documented", evidence: ["fixture:2"], limitations: "Not run" },
    { id: "charts", title: "Charts", proof: "Totals are visible", confidence: "needs-confirmation", evidence: ["fixture:3"], limitations: "Not verified" },
  ],
};

function cli(...args) {
  const result = spawnSync(process.execPath, [director, ...args, "--project", project], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

async function connect(capabilities = appsCapability, onElicit) {
  const client = new Client({ name: "ProductShot regression client", version: "0.1.0" }, { capabilities });
  clients.push(client);
  if (onElicit) client.setRequestHandler(ElicitRequestSchema, onElicit);
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(root, "server.mjs"), "--project", project], stderr: "pipe" }));
  return client;
}

function data(result) {
  assert.ok(!result.isError, JSON.stringify(result));
  return result.structuredContent;
}

try {
  const built = spawnSync(process.execPath, [path.join(root, "build.mjs")], { encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr);
  cli("init", "--name", "MCP test project", "--source", "Isolated regression fixture");
  const client = await connect();
  const call = (name, args = {}) => client.callTool({ name, arguments: args });
  const listed = await client.listTools();
  const pickerTool = listed.tools.find((tool) => tool.name === "productshot_open_feature_app");
  const formTool = listed.tools.find((tool) => tool.name === "productshot_select_features");
  assert.equal(formTool._meta?.ui, undefined, "Native form must not open a legacy App");
  assert.equal(formTool.annotations.readOnlyHint, false);
  assert.equal(pickerTool._meta.ui.resourceUri, "ui://productshot/feature-picker.html");
  assert.ok((await call("productshot_select_features")).isError, "Must inspect product first");
  data(await call("productshot_publish_discovery", { revision: 0, discovery }));
  const picker = data(await call("productshot_open_feature_app", { recommendedIds: ["tables", "forms"] }));
  const serializedPicker = await call("productshot_open_feature_app", { recommendedIds: ["tables", "forms"] });
  assert.equal(serializedPicker.content.length, 1, "Host text concatenation must preserve a single JSON document");
  assert.deepEqual(toolData({ content: serializedPicker.content }), picker);
  assert.throws(() => toolData({ content: [{ type: "text", text: "not JSON" }] }), /没有传递/);
  assert.throws(() => toolData({ structuredContent: {}, content: serializedPicker.content }), /无效/);
  assert.throws(() => toolData({ content: [{ type: "text", text: JSON.stringify({ ...picker, recommendedIds: ["missing"] }) }] }), /无效/);
  assert.throws(() => toolData({ isError: true, content: serializedPicker.content }));
  assert.equal(picker.revision, 1);
  assert.equal(picker.selection, null);
  assert.equal(picker.appsSupported, true);
  assert.equal(cli("read").revision, 1, "Opening a form must not save defaults");
  assert.ok((await call("productshot_open_feature_app", { recommendedIds: ["missing"] })).isError);
  const resource = await client.readResource({ uri: pickerTool._meta.ui.resourceUri });
  const html = resource.contents[0].text;
  assert.equal(resource.contents[0].mimeType, "text/html;profile=mcp-app");
  assert.ok(!html.includes("<!-- APP_SCRIPT -->"));
  assert.ok(!/<script[^>]+src=/i.test(html), "Bundle must not require external scripts");
  for (const args of [
    { revision: 1, capabilityIds: [], additional: "" },
    { revision: 0, capabilityIds: ["tables"], additional: "" },
    { revision: 1, capabilityIds: ["missing"], additional: "" },
    { revision: 1, capabilityIds: ["tables", "tables"], additional: "" },
  ]) assert.ok((await call("productshot_save_features", args)).isError, "Reject invalid/stale selections");
  assert.equal(cli("read").revision, 1);

  const plainClient = await connect({});
  const fallback = data(await plainClient.callTool({ name: "productshot_select_features", arguments: { recommendedIds: ["tables"] } }));
  assert.equal(fallback.appsSupported, false);
  assert.equal(fallback.action, "unsupported");
  assert.equal(fallback.interaction, "native-chat");
  const firstFormClient = await connect({ elicitation: { form: {} } }, async (request) => {
    assert.deepEqual(request.params.requestedSchema.properties.capabilityIds.default, ["tables", "forms"]);
    assert.equal(request.params.requestedSchema.properties.additional.default, "");
    return { action: "cancel" };
  });
  data(await firstFormClient.callTool({ name: "productshot_select_features", arguments: { recommendedIds: ["tables", "forms"] } }));
  assert.equal(cli("read").revision, 1);
  const urlOnlyClient = await connect({ elicitation: { url: {} } });
  assert.equal(data(await urlOnlyClient.callTool({ name: "productshot_select_features", arguments: {} })).action, "unsupported");

  // This is an SDK test host, not evidence of a real Agent generating a reply.
  const bridgeBuild = await build({
    stdin: {
      contents: `
        import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge";
        window.mountApp = async (html, initial, options) => {
          const frame = document.querySelector("iframe");
          const capabilities = { serverTools: {}, ...(options.messages ? { message: { text: {} } } : {}) };
          const bridge = new AppBridge(null, {name:"Regression host",version:"1"}, capabilities);
          window.bridge = bridge;
          bridge.oncalltool = (params) => window.mcpCall(params);
          bridge.onmessage = (params) => window.hostMessage(params);
          bridge.oninitialized = async () => {
            await bridge.sendToolInput({arguments:{recommendedIds:options.recommendedIds}});
            await bridge.sendToolResult(initial);
          };
          await bridge.connect(new PostMessageTransport(frame.contentWindow, frame.contentWindow));
          frame.srcdoc = html;
        };
      `,
      resolveDir: root,
      sourcefile: "regression-host.js",
    },
    bundle: true, write: false, format: "iife", platform: "browser",
  });
  browser = await puppeteer.launch({ headless: true });
  const messages = [];
  let rejectMessage = false, failSave = false;
  async function openApp(initial, options = { messages: true }) {
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 1000 });
    await page.setContent('<!doctype html><title>SDK regression host only</title><iframe title="Feature picker" sandbox="allow-scripts" style="width:100%;height:900px;border:0"></iframe>');
    await page.exposeFunction("mcpCall", async (params) => {
      if (failSave) return { isError: true, content: [{ type: "text", text: "Test save failure" }] };
      const result = await client.callTool(params);
      return options.contentOnly ? { content: result.content, isError: result.isError } : result;
    });
    await page.exposeFunction("hostMessage", (params) => {
      messages.push(params);
      return rejectMessage ? { isError: true } : {};
    });
    await page.addScriptTag({ content: bridgeBuild.outputFiles[0].text });
    const delivered = options.contentOnly ? { content: initial.content, isError: initial.isError } : initial;
    await page.evaluate((html, initial, options) => window.mountApp(html, initial, options), html, delivered, { ...options, recommendedIds: initial.structuredContent.recommendedIds });
    const frame = await (await page.$("iframe")).contentFrame();
    await frame.waitForSelector('[data-capability="tables"]');
    await frame.waitForFunction(() => !document.querySelector("#confirm").disabled);
    return { page, frame };
  }

  const { page, frame } = await openApp(await call("productshot_open_feature_app", { recommendedIds: ["tables", "forms"] }));
  assert.equal(await frame.$$eval("input:checked", (items) => items.length), 2);
  assert.equal(await frame.evaluate(() => typeof window.unsafe), "undefined");
  assert.match(await frame.$eval("#choices", (el) => el.textContent), /<script>unsafe/);
  assert.equal(cli("read").revision, 1);
  await frame.click('[data-capability="forms"]');
  await frame.type("#additional", "Custom capability");
  await frame.click("#confirm");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("继续请求已交给宿主"));
  let saved = cli("read");
  assert.deepEqual(saved.documents.selection.capabilityIds, ["tables"]);
  assert.equal(saved.documents.selection.additional, "Custom capability");
  assert.equal(saved.revision, 2);
  assert.equal(saved.approvals.selection, undefined);
  assert.equal(messages.length, 1);
  assert.match(messages[0].content[0].text, /productshot_read_project/);

  await frame.click('[data-capability="charts"]');
  data(await call("productshot_save_features", { revision: 2, capabilityIds: ["forms"], additional: "" }));
  await page.evaluate((result) => window.bridge.sendToolResult(result), await call("productshot_open_feature_app"));
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("项目有新版本"));
  assert.equal(await frame.$eval('[data-capability="charts"]', (el) => el.checked), true);
  await frame.click("#confirm");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("未确认保存"));
  assert.equal(cli("read").revision, 3);
  assert.equal(messages.length, 1, "A rejected stale write must not send a message");
  await frame.click("#reload");
  await frame.waitForFunction(() => document.querySelector("#reload").textContent.includes("确认丢弃"));
  await frame.click("#reload");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("已读取最新选择"));
  assert.deepEqual(await frame.$$eval("input:checked", (items) => items.map((el) => el.dataset.capability)), ["forms"]);
  await frame.click('[data-capability="forms"]');
  await frame.click("#confirm");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("至少选择"));
  assert.equal(cli("read").revision, 3);
  await frame.type("#additional", "Only custom");
  failSave = true;
  await frame.click("#confirm");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("Test save failure"));
  assert.equal(await frame.$eval("#additional", (el) => el.value), "Only custom");
  assert.equal(messages.length, 1);
  failSave = false;
  rejectMessage = true;
  await frame.click("#confirm");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("未能通知 Agent"));
  const savedRevision = cli("read").revision;
  assert.equal(savedRevision, 4);
  rejectMessage = false;
  await frame.click("#retry");
  await frame.waitForFunction(() => document.querySelector("#status").textContent.includes("继续请求已交给宿主"));
  assert.equal(cli("read").revision, savedRevision, "Retry notification must not repeat write");

  const restored = data(await call("productshot_open_feature_app", { recommendedIds: ["tables", "charts"] }));
  assert.deepEqual(restored.selection.capabilityIds, [], "Custom-only selection must not be replaced by defaults");
  const contentOnly = await openApp(await call("productshot_open_feature_app"), { messages: true, contentOnly: true });
  assert.equal(await contentOnly.frame.$eval("#additional", (el) => el.value), "Only custom");
  await contentOnly.frame.click('[data-capability="tables"]');
  await contentOnly.frame.click("#confirm");
  await contentOnly.frame.waitForFunction(() => document.querySelector("#status").textContent.includes("继续请求已交给宿主"));
  assert.deepEqual(cli("read").documents.selection.capabilityIds, ["tables"]);
  const unsupported = await openApp(await call("productshot_open_feature_app"), { messages: false });
  const messageCount = messages.length;
  await unsupported.frame.click("#confirm");
  await unsupported.frame.waitForFunction(() => document.querySelector("#status").textContent.includes("未声明支持"));
  assert.equal(messages.length, messageCount);
  assert.equal(cli("read").revision, savedRevision + 2);
  await unsupported.page.setViewport({ width: 320, height: 850 });
  assert.ok(await unsupported.frame.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  saved = cli("read");
  const selectionInput = path.join(temporary, "selection.json");
  const selection = {
    ...saved.documents.selection,
    audience: "Existing audience",
    audienceOptions: [{ id: "builders", label: "Builders", reason: "Fixture recommendation" }],
  };
  await writeFile(selectionInput, JSON.stringify(selection));
  cli("publish", "--revision", String(saved.revision), "--stage", "selection", "--input", selectionInput);
  cli("approve", "--revision", String(saved.revision + 1), "--stage", "selection", "--note", "Explicit test approval only");
  const beforeChange = cli("read");
  const same = data(await call("productshot_save_features", {
    revision: beforeChange.revision, capabilityIds: selection.capabilityIds, additional: selection.additional,
  }));
  assert.deepEqual(same.selection.audienceOptions, selection.audienceOptions);
  assert.ok(cli("read").approvals.selection, "Unchanged picks must preserve existing approval");
  const changed = data(await call("productshot_save_features", { revision: same.revision, capabilityIds: ["charts"], additional: "" }));
  assert.equal(changed.selection.audience, "Existing audience");
  assert.deepEqual(changed.selection.audienceOptions, []);
  assert.equal(cli("read").approvals.selection, undefined, "Changed picks invalidate old approval");
  let responseHandler = async () => ({ action: "cancel" });
  const formClient = await connect({ elicitation: { form: {} } }, (request) => responseHandler(request));
  const select = (recommendedIds = ["tables"]) => formClient.callTool({ name: "productshot_select_features", arguments: { recommendedIds } });
  const beforeForm = cli("read").revision;
  for (const action of ["cancel", "decline"]) {
    responseHandler = async (request) => {
      assert.equal(request.params.mode, "form");
      assert.deepEqual(request.params.requestedSchema.properties.capabilityIds.default, ["charts"]);
      assert.equal(cli("read").revision, beforeForm, "Form opening must not write");
      return { action };
    };
    assert.equal(data(await select()).action, action);
    assert.equal(cli("read").revision, beforeForm);
  }
  let accept;
  let formOpened;
  const opened = new Promise((resolve) => { formOpened = resolve; });
  responseHandler = async () => {
    formOpened();
    return new Promise((resolve) => { accept = resolve; });
  };
  let completed = false;
  const pending = select().then((value) => { completed = true; return value; });
  await opened;
  assert.equal(completed, false, "Tool must wait for the native form, not return then wake the Agent");
  assert.equal(cli("read").revision, beforeForm);
  accept({ action: "accept", content: { capabilityIds: ["tables", "forms"], additional: "Native input" } });
  const accepted = data(await pending);
  assert.equal(accepted.action, "accept");
  assert.equal(accepted.saved, true);
  assert.equal(accepted.interaction, "elicitation");
  assert.equal(accepted.revision, beforeForm + 1);
  assert.deepEqual(cli("read").documents.selection.capabilityIds, ["tables", "forms"]);
  assert.equal(cli("read").documents.selection.audience, "Existing audience");
  assert.equal(cli("read").approvals.selection, undefined);
  for (const content of [
    { capabilityIds: [] },
    { capabilityIds: ["missing"] },
    { capabilityIds: ["tables", "tables"] },
    { additional: "No selected IDs field" },
  ]) {
    responseHandler = async () => ({ action: "accept", content });
    assert.ok((await select()).isError, "Malformed or empty responses must not be saved");
    assert.equal(cli("read").revision, beforeForm + 1);
  }
  responseHandler = async () => {
    data(await call("productshot_save_features", { revision: cli("read").revision, capabilityIds: ["charts"], additional: "" }));
    return { action: "accept", content: { capabilityIds: ["forms"], additional: "" } };
  };
  assert.ok((await select()).isError, "Changes made while the form is open must cause a conflict");
  assert.deepEqual(cli("read").documents.selection.capabilityIds, ["charts"]);
  const legacyFormClient = await connect({ elicitation: {} }, async () => ({ action: "accept", content: { capabilityIds: [], additional: "Custom only" } }));
  const customOnly = data(await legacyFormClient.callTool({ name: "productshot_select_features", arguments: {} }));
  assert.deepEqual(customOnly.selection.capabilityIds, []);
  assert.equal(customOnly.selection.additional, "Custom only");
  const beforeFailure = cli("read").revision;
  responseHandler = async (request) => {
    assert.deepEqual(request.params.requestedSchema.properties.capabilityIds.default, []);
    assert.equal(request.params.requestedSchema.properties.additional.default, "Custom only");
    throw new Error("Fixture host elicitation failed");
  };
  assert.ok((await select()).isError, "Host form errors must be visible, not accepted");
  assert.equal(cli("read").revision, beforeFailure);
  saved = cli("read");
  assert.equal((await readdir(path.join(project, "history"))).length, saved.revision + 1);
  console.log("PASS: native form pending/accept/cancel/decline, unsupported/legacy clients, malformed/stale answers, plus stdio MCP, App defaults, persistence, safe text, message rejection/retry and narrow layout.");
  console.log("Real Agent rendering and automatic continuation are NOT verified by this test host.");
} catch (error) {
  if (browser) {
    for (const page of await browser.pages()) {
      for (const frame of page.frames()) {
        console.error("Browser test status:", await frame.evaluate(() => document.querySelector("#status")?.textContent ?? "(host page)"));
      }
    }
  }
  throw error;
} finally {
  if (browser) await browser.close();
  for (const client of clients) await client.close();
  await rm(temporary, { recursive: true, force: true });
}
