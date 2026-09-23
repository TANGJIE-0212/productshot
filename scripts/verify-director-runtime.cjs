const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const net = require("node:net");
const { spawn, spawnSync } = require("node:child_process");
const puppeteer = require(path.join(process.cwd(), "node_modules", "puppeteer"));
const tool = path.join(process.cwd(), ".github", "skills", "product-demo-director", "scripts", "director.mjs");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "director-check-"));
const project = path.join(tmp, "project");
let server, browser;
function run(command, options = {}, expected = 0) {
  const result = spawnSync(process.execPath, [tool, command, "--project", project, ...Object.entries(options).flatMap(([k, v]) => [`--${k}`, String(v)])], { encoding: "utf8" });
  assert.equal(result.status, expected, result.stderr);
  return JSON.parse(expected === 0 ? result.stdout : result.stderr);
}
const read = () => run("read");
function publish(stage, data) {
  const input = path.join(tmp, `${stage}.json`); fs.writeFileSync(input, JSON.stringify(data));
  return run("publish", { revision: read().revision, stage, input });
}
function approve(stage) { return run("approve", { revision: read().revision, stage, note: "Explicit approval in automated isolated test, not a user project." }); }
(async () => {
  try {
    run("init", { name: "Runtime fixture", source: "Local test fixture only" });
    run("init", { name: "Overwrite attempt", source: "test" }, 1);
    const discovery = { summary: "Actual fixture document", sourceRevision: "test-1", capabilities: [{ id: "form", title: "Form", proof: "Submission result", confidence: "source-verified", evidence: ["fixture.ts:1"], limitations: "Fixture, no product execution" }] };
    publish("discovery", discovery);
    const selection = { capabilityIds: ["form"], additional: "", scope: "single", audience: "Test audience" };
    const input = path.join(tmp, "selection.json"); fs.writeFileSync(input, JSON.stringify(selection));
    run("publish", { stage: "selection", revision: 1, input }, 1);
    approve("discovery");
    publish("selection", selection); approve("selection");
    const outline = { scenarios: [{ id: "scenario-1", title: "Collect order", context: "Isolated test", outcome: "Order captured", steps: [{ id: "collect", title: "Collect", purpose: "Capture the order" }] }] };
    publish("outline", outline); approve("outline");
    const direction = Object.fromEntries(["before", "actions", "highlight", "camera", "motion", "after", "hold", "transition", "verify", "mustKeep"].map((k) => [k, `Fixture ${k}`]));
    const storyboard = { shots: ["open", "fill", "submit"].map((id) => ({ id, stepId: "collect", title: id, purpose: `${id} test form`, sourceType: "real-recording", direction, evidence: ["test reference"] })) };
    publish("storyboard", storyboard); approve("storyboard");
    assert.equal(read().documents.outline.scenarios[0].steps.length, 1);
    assert.equal(read().documents.storyboard.shots.length, 3);
    const stale = read().revision - 1;
    run("approve", { stage: "storyboard", revision: stale, note: "stale" }, 1);
    const revisionBefore = read().revision;
    const bad = structuredClone(storyboard); bad.shots[0].stepId = "missing";
    const badPath = path.join(tmp, "bad.json"); fs.writeFileSync(badPath, JSON.stringify(bad));
    run("publish", { stage: "storyboard", revision: revisionBefore, input: badPath }, 1);
    assert.equal(read().revision, revisionBefore);
    const artifact = path.join(tmp, "actual-artifact.txt"); fs.writeFileSync(artifact, "test evidence");
    const sha256 = require("node:crypto").createHash("sha256").update(fs.readFileSync(artifact)).digest("hex");
    publish("review", { summary: "Fixture artifact only", limitations: "Not a video", artifacts: [{ label: "Evidence", path: artifact, sha256, validation: "Text fixture exists" }] });
    approve("review"); assert.ok(read().release);
    const originalShots = JSON.stringify(read().documents.storyboard);
    outline.scenarios[0].context = "Changed context";
    publish("outline", outline);
    assert.equal(read().release, null);
    assert.equal(read().approvals.outline, undefined);
    assert.equal(read().approvals.storyboard, undefined);
    assert.equal(JSON.stringify(read().documents.storyboard), originalShots);
    approve("outline"); approve("storyboard");
    assert.equal(fs.readdirSync(path.join(project, "history")).length, read().revision + 1);

    const port = await new Promise((resolve) => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const n = s.address().port; s.close(() => resolve(n)); }); });
    server = spawn(process.execPath, [tool, "serve", "--project", project, "--port", String(port)], { windowsHide: true });
    const start = await new Promise((resolve, reject) => {
      let buffer = ""; const timer = setTimeout(() => reject(new Error("Serve startup timeout")), 15000);
      server.stdout.on("data", (data) => { buffer += data; if (buffer.includes("\n")) { clearTimeout(timer); resolve(JSON.parse(buffer.trim())); } });
      server.on("error", reject);
      server.on("exit", (code) => { clearTimeout(timer); reject(new Error(`Server exited ${code}`)); });
    });
    const url = new URL(start.url); const token = url.hash.slice(1); const base = url.origin;
    assert.equal((await fetch(base)).status, 200);
    assert.equal((await fetch(`${base}/api/project`)).status, 403);
    assert.equal((await fetch(`${base}/api/project`, { headers: { "X-Director-Token": token, Origin: "https://untrusted.example" } })).status, 403);
    assert.equal((await fetch(`${base}/project.json`, { headers: { "X-Director-Token": token } })).status, 404);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage(); const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.setViewport({ width: 1440, height: 960 });
    url.searchParams.set("stage", "discovery");
    await page.goto(url.href, { waitUntil: "networkidle0" });
    assert.match(await page.$eval("main", (e) => e.textContent), /Actual fixture document/);
    assert.equal(page.url().includes("#"), false);
    assert.equal(await page.$("aside, #feedback, .conversation, [data-question]"), null);
    await page.click('[data-action="home"]');
    assert.match(await page.$eval("main", (e) => e.textContent), /在 Codex 原生对话中运行 Skill/);
    assert.equal(await page.$$eval(".workflow button", (items) => items.length), 4);
    await page.click('[data-tab="outline"]');
    await page.$eval('[data-path="scenarios.0.steps.0.title"]', (el) => { el.value = "Browser changed"; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.click('[data-action="save"]');
    await page.waitForFunction(() => document.getElementById("notice").textContent.includes("已保存到项目"));
    assert.equal(read().documents.outline.scenarios[0].steps[0].title, "Browser changed");
    assert.equal(read().approvals.storyboard, undefined);
    run("request", { revision: read().revision, stage: "outline", text: "Please keep the empty initial state." });
    assert.equal(read().requests.at(-1).status, "open");
    const requestId = read().requests.at(-1).id;
    run("resolve", { revision: read().revision, id: requestId, note: "Updated in isolated test" });
    assert.equal(read().requests.at(-1).resolution, "Updated in isolated test");
    await page.click('[data-action="refresh"]');
    await page.waitForFunction((revision) => document.querySelector(".project-name").textContent.includes(`revision ${revision}`), {}, read().revision);
    await page.$eval('[data-path="scenarios.0.steps.0.title"]', (el) => { el.value = "Unsaved draft"; el.dispatchEvent(new Event("input", { bubbles: true })); });
    const latestOutline = structuredClone(read().documents.outline); latestOutline.scenarios[0].steps[0].title = "Agent newer version";
    publish("outline", latestOutline);
    await page.waitForFunction(() => document.getElementById("notice").textContent.includes("草稿保留"), { timeout: 8000 });
    assert.equal(await page.$eval('[data-path="scenarios.0.steps.0.title"]', (el) => el.value), "Unsaved draft");
    const conflictResponse = page.waitForResponse((response) => response.url().endsWith("/api/action") && response.request().method() === "POST");
    await page.click('[data-action="save"]');
    assert.equal((await conflictResponse).status(), 409);
    assert.equal(read().documents.outline.scenarios[0].steps[0].title, "Agent newer version");
    await page.click('[data-action="refresh"]');
    await page.waitForFunction(() => document.querySelector('[data-path="scenarios.0.steps.0.title"]').value === "Agent newer version");
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewport({ width, height: 900 });
      await page.click('[data-action="home"]');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `home overflow ${width}`);
      for (const tab of ["selection", "outline", "storyboard", "review"]) {
        await page.click(`[data-tab="${tab}"]`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `overflow ${width}/${tab}`);
      }
    }
    await page.setViewport({ width: 1440, height: 960 });
    const messagePath = path.join(tmp, "message.json");
    fs.writeFileSync(messagePath, JSON.stringify({ stage: "outline", kind: "single", text: "Legacy question", choices: [{ id: "a", label: "Collect orders" }] }));
    const question = run("message", { revision: read().revision, input: messagePath }).conversation.at(-1);
    const answerPath = path.join(tmp, "answer.json");
    fs.writeFileSync(answerPath, JSON.stringify({ questionId: question.id, choiceIds: ["a"], text: "Keep the empty start." }));
    run("answer", { revision: read().revision, input: answerPath });
    assert.equal(read().conversation.at(-1).choiceIds[0], "a");
    assert.equal(read().approvals.outline, undefined);
    run("answer", { revision: read().revision, input: answerPath }, 1);
    await page.click('[data-tab="selection"]');
    publish("outline", { scenarios: [{ ...latestOutline.scenarios[0], context: "Native Agent updated this result" }] });
    await page.waitForFunction(() => document.querySelector('[data-tab="outline"]').getAttribute("aria-current") === "step", { timeout: 8000 });
    assert.equal(await page.$eval('[data-path="scenarios.0.context"]', (el) => el.value), "Native Agent updated this result");
    assert.equal(await page.$("aside, #feedback, .conversation, [data-question]"), null);
    approve("outline");
    await page.waitForFunction(() => document.querySelector('[data-tab="storyboard"]').getAttribute("aria-current") === "step", { timeout: 8000 });
    await page.click(".shot summary");
    await page.$eval('[data-path="shots.0.direction.camera"]', (el) => { el.value = "Browser camera correction"; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.click('[data-action="save"]');
    await page.waitForFunction(() => document.getElementById("notice").textContent.includes("已保存到项目"));
    assert.equal(read().documents.storyboard.shots[0].direction.camera, "Browser camera correction");
    approve("storyboard"); approve("review");
    await page.reload({ waitUntil: "networkidle0" });
    await page.click('[data-tab="review"]');
    await page.type('[data-path="notes"]', "Hold the result longer.");
    await page.click('[data-action="save"]');
    await page.waitForFunction(() => document.getElementById("notice").textContent.includes("已保存到项目"));
    assert.equal(read().documents.review.notes, "Hold the result longer.");
    assert.equal(read().release, null);
    assert.equal(read().approvals.review, undefined);
    const response = await fetch(`${base}/api/action`, {
      method: "POST", headers: { "X-Director-Token": token, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish", stage: "review", revision: read().revision, data: { ...read().documents.review, summary: "Fake production claim" } })
    });
    assert.equal(response.status, 400);
    await page.reload({ waitUntil: "networkidle0" });
    await page.click('[data-tab="review"]');
    assert.equal(await page.$eval('[data-path="notes"]', (el) => el.value), "Hold the result longer.");
    await page.setRequestInterception(true);
    let holdNextRead = true, releaseRead;
    const heldRead = new Promise((resolve) => { releaseRead = resolve; });
    const intercept = (request) => {
      if (holdNextRead && request.url().endsWith("/api/project")) {
        holdNextRead = false; releaseRead(request);
      } else request.continue();
    };
    page.on("request", intercept);
    await page.click('[data-action="refresh"]');
    const delayedRead = await heldRead;
    await page.$eval('[data-path="notes"]', (el) => {
      el.value += " New edit during refresh.";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await delayedRead.respond({ status: 200, contentType: "application/json", body: JSON.stringify(read()) });
    await page.waitForNetworkIdle();
    assert.equal(await page.$eval('[data-path="notes"]', (el) => el.value), "Hold the result longer. New edit during refresh.");
    assert.equal(read().documents.review.notes, "Hold the result longer.");
    page.off("request", intercept);
    await page.setRequestInterception(false);
    assert.deepEqual(errors, []);
    console.log("PASS: native Agent CLI-to-browser stage updates, result-only UI, homepage, browser-to-Agent outline/shot/review edits, stale-draft protection, stage gates, history, legacy records, access checks and 320–1440 layouts.");
  } finally {
    if (browser) await browser.close();
    if (server && server.exitCode === null) { server.kill(); await new Promise((r) => server.once("exit", r)); }
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });
