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

async function connect(capabilities = appsCapability) {
  const client = new Client({ name: "ProductShot regression client", version: "0.1.0" }, { capabilities });
  clients.push(client);
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
  const pickerTool = listed.tools.find((tool) => tool.name === "productshot_select_features");
  assert.equal(pickerTool._meta.ui.resourceUri, "ui://productshot/feature-picker.html");
  assert.ok((await call("productshot_select_features")).isError, "Must inspect product first");
  data(await call("productshot_publish_discovery", { revision: 0, discovery }));
  const picker = data(await call("productshot_select_features", { recommendedIds: ["tables", "forms"] }));
  const serializedPicker = await call("productshot_select_features", { recommendedIds: ["tables", "forms"] });
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
  assert.ok((await call("productshot_select_features", { recommendedIds: ["missing"] })).isError);
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

  const { page, frame } = await openApp(await call("productshot_select_features", { recommendedIds: ["tables", "forms"] }));
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
  await page.evaluate((result) => window.bridge.sendToolResult(result), await call("productshot_select_features"));
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

  const restored = data(await call("productshot_select_features", { recommendedIds: ["tables", "charts"] }));
  assert.deepEqual(restored.selection.capabilityIds, [], "Custom-only selection must not be replaced by defaults");
  const contentOnly = await openApp(await call("productshot_select_features"), { messages: true, contentOnly: true });
  assert.equal(await contentOnly.frame.$eval("#additional", (el) => el.value), "Only custom");
  await contentOnly.frame.click('[data-capability="tables"]');
  await contentOnly.frame.click("#confirm");
  await contentOnly.frame.waitForFunction(() => document.querySelector("#status").textContent.includes("继续请求已交给宿主"));
  assert.deepEqual(cli("read").documents.selection.capabilityIds, ["tables"]);
  const unsupported = await openApp(await call("productshot_select_features"), { messages: false });
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
  saved = cli("read");
  assert.equal((await readdir(path.join(project, "history"))).length, saved.revision + 1);
  console.log("PASS: stdio MCP, resource, defaults, selection persistence, stale writes, safe text, SDK AppBridge, message rejection/retry, unsupported host, narrow layout.");
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
