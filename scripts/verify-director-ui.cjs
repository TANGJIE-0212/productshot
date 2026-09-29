const assert = require("node:assert/strict");
const net = require("node:net");
const { spawn } = require("node:child_process");
const puppeteer = require("puppeteer");
const media = process.argv[2];
const variant = process.argv[3] || "neo";
const storageKeys = { morandi: "productshot-five-page-ui-v1", studio: "productshot-studio-ui-v1", neo: "productshot-neo-ui-v1", glass: "productshot-glass-ui-v1", spatial: "productshot-spatial-ui-v1" };
const storageKey = storageKeys[variant];
assert.ok(storageKey, "Unknown test variant");
let server, browser;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const freePort = () => new Promise(resolve => {
  const socket = net.createServer(); socket.listen(0, "127.0.0.1", () => {
    const port = socket.address().port; socket.close(() => resolve(port));
  });
});
async function verifyHeadingActions(page, nextLabel, disabled = false) {
  const mode = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "{}").mode, storageKey);
  if (nextLabel && !disabled && mode === "step") nextLabel = nextLabel.replace("下一步：", "确认并继续：");
  assert.equal(await page.$$eval('[data-action="back"]', els => els.length), 1);
  assert.equal(await page.$$eval('[data-action="next"]', els => els.length), nextLabel ? 1 : 0);
  assert.equal(await page.$$eval('[data-action="export"]', els => els.length), nextLabel ? 0 : 1);
  assert.equal(await page.$$eval("main > .page-foot", els => els.length), 1);
  assert.equal(await page.$(".page-head button"), null, "Navigation belongs below the content, not in the heading");
  assert.equal(await page.$eval('.page-foot [data-action="back"]', el => el.textContent.trim()), "← 上一步");
  const forward = `.page-foot [data-action="${nextLabel ? "next" : "export"}"]`;
  assert.equal(await page.$eval(forward, el => el.textContent.trim()), nextLabel || "下载草稿 ↓");
  assert.equal(await page.$eval(forward, el => el.disabled), disabled);
  assert.ok(await page.$eval(".page-foot", foot => {
    const rect = foot.getBoundingClientRect();
    return foot === foot.parentElement.lastElementChild
      && [...foot.parentElement.children].filter(el => el !== foot)
        .every(el => el.getBoundingClientRect().bottom <= rect.top + 1);
  }), "Bottom navigation must follow all page content without covering it");
  for (const selector of ['.page-foot [data-action="back"]', forward]) {
    await page.$eval(selector, el => el.scrollIntoView({ block: "center", behavior: "instant" }));
    assert.ok(await page.$eval(selector, button => {
      const box = button.getBoundingClientRect(), foot = button.closest(".page-foot").getBoundingClientRect();
      return box.width > 0 && box.height >= 44 && box.left >= 0 && box.right <= innerWidth
        && box.top >= 0 && box.bottom <= innerHeight
        && box.top >= foot.top && box.bottom <= foot.bottom
        && button.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    }), `${selector} must be visible and unobscured after scrolling into view`);
  }
}

async function verifyRecordingSelection(page, count, index = 0) {
  assert.equal(await page.$('.script-views, .narration-script, [data-action="script-view"], .sample-narration'), null, "One storyboard workspace, no duplicate narration editor or transcript");
  assert.equal(await page.$eval('[data-field="shot.narration"]', el => el.closest("label").firstChild.textContent), "这一幕的讲解");
  assert.ok(await page.$(".narrative-framing"));
  assert.deepEqual(await page.$$eval(".script-layout > *", els => els.map(el => el.className)), ["shot-list", "shot-workspace", "detail-panel"]);
  assert.equal(await page.$$eval(".shot-item", els => els.length), count);
  assert.equal(await page.$$eval(".shot-item.selected", els => els.length), 1);
  assert.deepEqual(await page.$$eval('.shot-item[aria-pressed="true"]', els => els.map(el => Number(el.dataset.index))), [index]);
  assert.equal(await page.$(".recording-workspace, .recording-beats, .recording-detail"), null);
  assert.deepEqual(await page.$$eval(".shot-copy [data-field]", els => els.map(el => el.dataset.field)), ["shot.title", "shot.narration", "shot.caption"]);
  assert.deepEqual(await page.$$eval(".detail-panel [data-field]", els => els.map(el => el.dataset.field)), ["before", "prompt", "action", "editing", "after", "highlight", "camera", "verify", "transition"].map(key => `shot.${key}`));
  const id = await page.$eval(".shot-workspace", el => el.dataset.scriptId);
  assert.ok(id);
  assert.ok(await page.$$eval(".script-layout [data-field]", (els, id) => els.every(el => el.dataset.scriptId === id), id));
  if (page.viewport().width === 1440) {
    assert.ok(await page.$eval(".script-layout", el => {
      const [list, workspace, settings] = [...el.children].map(child => child.getBoundingClientRect());
      return list.right < workspace.left && workspace.right < settings.left
        && Math.abs(list.top - workspace.top) < 1 && Math.abs(workspace.top - settings.top) < 1;
    }), "Desktop uses the existing scenario layout: left list, middle preview/copy, right settings");
  }
}

async function editShotFields(page, values) {
  if (!await page.$eval(".detail-panel details", el => el.open)) await page.click(".detail-panel details > summary");
  for (const [key, value] of Object.entries(values)) {
    await page.$eval(`[data-field="shot.${key}"]`, (el, value) => {
      el.value = value; el.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
  }
}

async function verifyShotFields(page, values) {
  for (const [key, value] of Object.entries(values)) {
    assert.equal(await page.$eval(`[data-field="shot.${key}"]`, el => el.value), value, `${key} survives switching and reload`);
  }
}

async function verifyRecordingPreview(page, filename) {
  assert.match(await page.$eval(".recording-status", el => el.textContent), /Agent 未连接.*未执行新录制/);
  if (filename && media) {
    await page.waitForFunction(() => {
      const img = document.querySelector(".shot-reference img");
      return img?.complete && img.naturalWidth > 0;
    });
    assert.equal(await page.$eval(".shot-reference img", el => el.getAttribute("src")), `/demo-assets/${filename}`);
    assert.match(await page.$eval(".shot-reference figcaption", el => el.textContent), /已有实录参考/);
    assert.equal(await page.$(".shot-reference .media-empty"), null);
  } else {
    assert.equal(await page.$(".shot-reference img"), null, "Do not invent screenshots for unrecorded features");
    assert.match(await page.$eval(".shot-reference .media-empty", el => el.textContent), /未开始录制，不会自动生成截图/);
  }
}

async function verifyDefaultFlow(browser, url) {
  for (const [width, height] of [[1440, 1000], [390, 844], [320, 640]]) {
    const context = await browser.createBrowserContext();
    try {
      const page = await context.newPage();
      await page.setViewport({ width, height });
      await page.goto(url, { waitUntil: "networkidle0" });
      if (variant === "studio") await page.click('[name="production-mode"][value="step"]');
      else {
        assert.equal(await page.$("#production-controls"), null);
        assert.deepEqual(await page.$$eval('#source-form button[type="submit"]', els => els.map(el => el.value)), ["oneclick", "step"]);
        assert.ok(await page.$eval("#source-form", form => {
          const source = form.querySelector(".source-heading").getBoundingClientRect();
          const goal = form.querySelector(".goal-input").getBoundingClientRect();
          const actions = form.querySelector(".intake-start").getBoundingClientRect();
          return source.bottom <= goal.top && goal.bottom <= actions.top
            && form.querySelector(".source-heading #files") !== null
            && [...form.querySelectorAll('.intake-start button')].every(el => {
              const rect = el.getBoundingClientRect();
              return rect.left >= 0 && rect.right <= innerWidth && rect.height >= 44;
            });
        }), "Intake order must be source/attachment, goal, then two start buttons");
      }
      if (variant !== "studio") {
        assert.equal(await page.$('.home [data-action="load-sample"]'), null);
        assert.equal(await page.$$eval('[data-action="fill-example"]', els => els.length), 0);
        assert.equal(await page.$eval("#source", el => el.value), "https://github.com/gim-home/biz-table/");
        assert.match(await page.$eval('[data-field="videoGoal"]', el => el.value), /向 LT 汇报.*1 分钟/);
        await page.reload({ waitUntil: "networkidle0" });
        await page.click('#source-form [type="submit"][value="step"]');
        assert.match(await page.$eval(".top-right", el => el.textContent), /示例预览/);
      } else await page.click('#source-form [type="submit"][value="step"]');
      assert.deepEqual(await page.$$eval("[data-feature]:checked", els => els.map(el => el.dataset.feature)), ["build", "import", "dashboard", "workflow", "form"]);
      await page.click('[data-feature="teams"]');
      await verifyHeadingActions(page, "下一步：分镜脚本");
      assert.deepEqual(await page.$$eval("[data-feature]:checked", els => els.map(el => el.dataset.feature)), ["build", "import", "dashboard", "workflow", "form", "teams"]);
      assert.equal(await page.$eval('[name="presentation"][value="features"]', el => el.checked), true);
      assert.match(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).videoGoal, storageKey), /向 LT 汇报/);
      await page.click('.page-foot [data-action="next"]');
      assert.equal(await page.$eval("main h1", el => el.textContent), "分镜脚本");
      await verifyRecordingSelection(page, 6);
      await verifyRecordingPreview(page, "empty.png");
      await verifyHeadingActions(page, "下一步：效果与修改");
      const draft = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
      await page.click('.page-foot [data-action="next"]');
      assert.equal(await page.$eval("main h1", el => el.textContent), "效果与修改");
      await verifyHeadingActions(page, null);
      assert.match(await page.$eval("main", el => el.textContent), /概念成片/);
      assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).featureShotDrafts, storageKey), draft.featureShotDrafts);
      await page.evaluate(() => {
        const createURL = URL.createObjectURL;
        URL.createObjectURL = function (blob) {
          blob.text().then(text => { window.downloadedDraft = JSON.parse(text); });
          return createURL.call(URL, blob);
        };
        HTMLAnchorElement.prototype.click = function () { window.downloadedFilename = this.download; };
      });
      await page.click('.page-foot [data-action="export"]');
      await page.waitForFunction(() => window.downloadedDraft);
      assert.equal(await page.evaluate(() => window.downloadedFilename), "productshot-ui-draft.json");
      assert.deepEqual(await page.evaluate(() => window.downloadedDraft.featureShotDrafts), draft.featureShotDrafts);
      await page.click('.page-foot [data-action="back"]');
      await verifyHeadingActions(page, "下一步：效果与修改");
      await page.click('.page-foot [data-action="back"]');
      await verifyHeadingActions(page, "下一步：分镜脚本");
      await page.click('.page-foot [data-action="back"]');
      assert.ok(await page.$("#source-form"));
      assert.equal(await page.$('[data-action="back"]'), null);
    } finally {
      await context.close();
    }
  }
}
async function verifyAutomaticFlow(browser, url) {
  const context = await browser.createBrowserContext();
  try {
    const page = await context.newPage();
    const readState = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    await page.goto(url, { waitUntil: "networkidle0" });
    assert.equal(await page.$("#production-controls"), null);
    await page.click('#source-form [type="submit"][value="oneclick"]');
    assert.equal((await readState()).mode, "oneclick");
    assert.equal((await readState()).page, 4, "One-click goes directly from intake to results");
    assert.equal(await page.$eval("main h1", el => el.textContent), "效果与修改");
    assert.equal(await page.$("#production-controls"), null, "No repeated mode selector after intake");
    if (media) await page.waitForFunction(() => document.querySelector("video")?.readyState >= 1);
    else assert.match(await page.$eval(".video-wrap", el => el.textContent), /未提供本地实录/);

    await page.click('[data-action="home"]');
    await page.click('#source-form [type="submit"][value="step"]');
    assert.equal((await readState()).mode, "step");
    assert.equal((await readState()).page, 1, "Step mode exposes feature selection");
    assert.equal(await page.$eval("main h1", el => el.textContent), "功能选择");
    assert.equal(await page.$("#production-controls"), null);
    await page.click('[data-action="next"]');
    assert.equal((await readState()).page, 3, "Direct-feature step mode proceeds to storyboard");
    assert.equal(await page.$eval("main h1", el => el.textContent), "分镜脚本");
    await page.click('[data-action="next"]');
    assert.equal((await readState()).page, 4);
    assert.equal(await page.$eval("main h1", el => el.textContent), "效果与修改");
  } finally { await context.close(); }
}
(async () => {
  try {
    const port = await freePort();
    const url = `http://127.0.0.1:${port}`;
    server = spawn(process.execPath, ["scripts\\serve-director-ui.mjs", "--port", String(port), "--variant", variant, ...(media ? ["--media-dir", media] : [])], { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    server.stdout.on("data", chunk => output += chunk);
    server.stderr.on("data", chunk => output += chunk);
    for (let i = 0; i < 50 && !output.includes("ProductShot UI:"); i++) await delay(100);
    assert.match(output, /ProductShot UI:/);
    assert.equal((await fetch(url + "/demo-assets/status").then(r => r.json())).available, Boolean(media));
    assert.equal((await fetch(url + "/project.json")).status, 404);
    assert.equal((await fetch(url + "/app.js", { method: "POST" })).status, 405);
    assert.equal((await fetch(url + "/app.js", { headers: { Range: "bytes=10-5" } })).status, 416);
    assert.equal((await fetch(url + "/app.js", { headers: { Range: "bytes=0-10" } })).status, 206);
    browser = await puppeteer.launch({ headless: true });
    if (["neo", "spatial"].includes(variant)) await verifyAutomaticFlow(browser, url);
    await verifyDefaultFlow(browser, url);
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(url, { waitUntil: "networkidle0" });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.variant || "morandi"), variant);
    assert.deepEqual(await page.$$eval(".steps .step", els => els.map(el => el.textContent.trim())), ["1产品与目标", "2功能选择", "3分镜脚本", "4效果与修改"]);
    const untouchedKeys = Object.values(storageKeys).filter(key => key !== storageKey);
    await page.evaluate(keys => keys.forEach(key => localStorage.setItem(key, "other-variant-draft")), untouchedKeys);
    if (["neo", "spatial"].includes(variant)) {
      for (const width of [1920, 1440, 1024, 810, 768, 701, 390, 320]) {
        await page.setViewport({ width, height: 1000 });
        const title = await page.$eval(".home-title", el => {
          const range = document.createRange();
          range.selectNodeContents(el.querySelector("span") || el);
          const lines = [...range.getClientRects()];
          const container = el.parentElement.getBoundingClientRect();
          return {
            text: el.textContent,
            lines: lines.length,
            fits: lines.every(rect => rect.left >= container.left && rect.right <= container.right),
            overflow: document.documentElement.scrollWidth > innerWidth + 1
          };
        });
        assert.equal(title.text, "制作产品介绍视频");
        assert.equal(title.lines, 1, `Homepage title must stay on one line at ${width}px`);
        assert.equal(title.fits, true, `Homepage title must fit its column at ${width}px`);
        assert.equal(title.overflow, false, `Homepage must not overflow at ${width}px`);
      }
      await page.setViewport({ width: 1440, height: 1000 });
    }
    if (variant === "studio") {
      assert.equal(await page.$eval(".studio-art img", img => img.complete && img.naturalWidth > 0), true);
      assert.equal((await fetch(url + "/studio.css")).status, 200);
    }
    if (variant === "neo") {
      assert.equal((await fetch(url + "/neo.css")).status, 200);
      assert.equal(await page.$(".neo-edition"), null);
      assert.equal(await page.$eval(".source-box", el => getComputedStyle(el).borderTopWidth), "2px");
    }
    if (variant === "glass") {
      assert.equal((await fetch(url + "/glass.css")).status, 200);
      assert.equal((await fetch(url + "/glass-landscape.svg")).status, 200);
      assert.match(await page.$eval(".source-box", el => getComputedStyle(el).backdropFilter), /blur/);
      assert.ok(await page.$(".brand-glass"));
      assert.equal(await page.$(".brand-face"), null);
      assert.ok(await page.$eval(".source-box", el => Number(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)[3]) < .3), "Glass fill should remain translucent");
    }
    if (variant === "spatial") {
      for (const width of [1920, 1440, 1024, 768, 390, 320]) {
        await page.setViewport({ width, height: 1000 });
        const layout = await page.evaluate(() => {
          const home = document.querySelector(".home");
          const text = home.firstElementChild.getBoundingClientRect();
          const art = home.querySelector(".spatial-stage").getBoundingClientRect();
          return { text: text.toJSON(), art: art.toJSON(), overflow: document.documentElement.scrollWidth > innerWidth + 1 };
        });
        assert.equal(layout.overflow, false, `Home overflow at ${width}`);
        if (width > 700) {
          assert.ok(Math.abs(layout.text.top - layout.art.top) < 2, "Desktop text and artwork must share top alignment");
          assert.ok(Math.abs(layout.text.height - layout.art.height) < 2, "Desktop columns should have equal height");
          assert.ok(Math.abs(layout.text.width - layout.art.width) < 2, "Desktop columns should share width");
          assert.ok(layout.art.left >= layout.text.right + 20, "Artwork must not overlap form");
        } else assert.ok(layout.art.top >= layout.text.bottom, "Mobile illustration follows content without overlap");
      }
      await page.setViewport({ width: 1440, height: 1000 });
      await page.waitForFunction(() => document.getElementById("spatial-canvas")?.width > 0);
      assert.ok(await page.$(".brand-spatial"));
      assert.ok(await page.$("#spatial-motion"));
      assert.equal(await page.$(".spatial-stage-heading"), null);
      assert.equal(await page.$eval("#spatial-status", el => el.hidden && el.textContent === ""), true);
      assert.match(await page.$eval(".source-box", el => getComputedStyle(el).backdropFilter), /blur\(24px\)/);
      const firstFrame = await page.$eval("#spatial-canvas", c => c.toDataURL());
      await delay(500);
      assert.notEqual(await page.$eval("#spatial-canvas", c => c.toDataURL()), firstFrame, "Other 3D objects should animate");
      await page.click("#spatial-motion");
      const pausedFrame = await page.$eval("#spatial-canvas", c => c.toDataURL());
      await delay(180);
      assert.equal(await page.$eval("#spatial-canvas", c => c.toDataURL()), pausedFrame);
      await page.click("#spatial-motion");
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.waitForFunction(() => document.getElementById("spatial-motion").disabled);
      const reducedFrame = await page.$eval("#spatial-canvas", c => c.toDataURL());
      await delay(180);
      assert.equal(await page.$eval("#spatial-canvas", c => c.toDataURL()), reducedFrame);
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "no-preference" }]);
      await page.evaluate(() => scrollTo(0, 0));
    }
    assert.equal(await page.$(".home-bottom"), null);
    if (["neo", "spatial"].includes(variant)) {
      assert.doesNotMatch(await page.title(), /[CE] 版/);
      assert.doesNotMatch(await page.$eval(".home", el => el.innerText), /[CE] \//);
      assert.doesNotMatch(await page.$eval(".home>div", el => getComputedStyle(el, "::before").content), /E \//);
      assert.equal(await page.$$eval('[data-action="fill-example"]', els => els.length), 0);
      assert.equal(await page.$eval("#source", el => el.value), "https://github.com/gim-home/biz-table/");
      assert.match(await page.$eval('[data-field="videoGoal"]', el => el.value), /LT.*1 分钟/);
      await page.type('[data-field="videoGoal"]', " 只介绍协作。");
      await page.reload({ waitUntil: "networkidle0" });
      assert.match(await page.$eval('[data-field="videoGoal"]', el => el.value), /只介绍协作/);
      const exampleState = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
      assert.equal(exampleState.page, 0);
      assert.equal(exampleState.sample, false, "Filling inputs must not fabricate analysis");
      await page.$eval("#source", el => {
        el.value = "https://example.com/changed-product";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await page.click('#source-form [type="submit"][value="step"]');
      assert.match(await page.$eval("main", el => el.textContent), /分析尚未开始/);
      assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).sample, storageKey), false, "Changing the example URL must not load unrelated Biz Table data");
      await page.evaluate(key => localStorage.removeItem(key), storageKey);
      await page.reload({ waitUntil: "networkidle0" });
    }
    await page.click('[data-action="connect"]');
    assert.equal(await page.$eval("#connection", d => d.open), true);
    await page.click('#connection .primary');
    assert.equal(await page.$eval("#connection", d => d.open), false);
    await page.$eval("#source", el => { el.value = ""; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.$eval('[data-field="videoGoal"]', el => { el.value = ""; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.click('#source-form [type="submit"][value="step"]');
    assert.match(await page.$eval("#notice", n => n.textContent), /先放一个链接/);
    await page.type("#source", "https://example.com/my-product");
    await page.click('#source-form [type="submit"][value="step"]');
    assert.match(await page.$eval("#notice", n => n.textContent), /简单说明视频用途/);
    await page.type('[data-field="videoGoal"]', "向合作伙伴介绍产品的新功能");
    await page.click(variant === "studio" ? '#source-form [type="submit"]' : '#source-form [type="submit"][value="step"]');
    assert.match(await page.$eval("main", n => n.textContent), /分析尚未开始/);
    await verifyHeadingActions(page, "下一步：等待分析", true);
    for (const width of [390, 320]) {
      await page.setViewport({ width, height: 640 });
      await verifyHeadingActions(page, "下一步：等待分析", true);
    }
    await page.setViewport({ width: 1440, height: 1000 });
    await page.click('.page-foot [data-action="next"]');
    assert.equal(await page.$eval("main h1", el => el.textContent), "产品分析");
    await page.click('[data-action="back"]');
    await page.$eval("#source", el => { el.value = "https://github.com/gim-home/biz-table/"; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.$eval('[data-field="videoGoal"]', el => { el.value = "向 LT 汇报 Biz Table 项目，时长约 1 分钟。"; el.dispatchEvent(new Event("input", { bubbles: true })); });
    await page.click('#source-form [type="submit"][value="step"]');
    await page.click('[data-feature="teams"]');
    assert.equal(await page.$eval('input[name="presentation"][value="features"]', el => el.checked), true);
    assert.equal(await page.$$eval(".scenario-teaser .pill", els => els.length), 3);
    assert.equal(await page.$$eval("[data-feature]:checked", els => els.length), 6);
    assert.equal(await page.$(".audience-options"), null);
    assert.equal(await page.$$eval(".feature-row", els => els.length), 6);
    await page.click('[data-action="next"]');
    const buildScript = '.script-layout';
    await verifyRecordingSelection(page, 6);
    assert.deepEqual(await page.$$eval(".shot-item strong", els => els.map(el => el.textContent)), ["从业务描述建立关联结构", "让数据进入同一结构", "从业务问题生成数据视图", "用对话修改同一视图", "生成连接现有数据的表单", "Teams / Microsoft 365 接入"]);
    assert.match(await page.$eval(`${buildScript} [data-field="shot.before"]`, el => el.value), /真实 Agent 已连接/);
    await verifyRecordingPreview(page, "empty.png");
    if (media) assert.match(await page.$eval(".shot-reference figcaption", el => el.textContent), /不含 Agent 宿主/);
    assert.match(await page.$eval(`${buildScript} [data-field="shot.prompt"]`, el => el.value), /帮我搭一个小店业务工作台.*先建结构/);
    assert.match(await page.$eval(`${buildScript} [data-field="shot.editing"]`, el => el.value), /剪去中间长等待/);
    assert.match(await page.$eval(`${buildScript} [data-field="shot.camera"]`, el => el.value), /推近/);
    assert.match(await page.$eval(`${buildScript} [data-field="shot.caption"]`, el => el.value), /建立关联结构/);
    assert.doesNotMatch(await page.evaluate(key => Object.values(JSON.parse(localStorage.getItem(key)).featureShotDrafts.find(s => s.id === "build")).join("\n"), storageKey), /尚未排练/);
    await editShotFields(page, { caption: "自定义屏幕文案" });
    await page.click('.shot-item[data-index="4"]');
    await verifyRecordingPreview(page, "form.png");
    if (media) assert.match(await page.$eval(".shot-reference figcaption", el => el.textContent), /没有录到从现有订单生成新表单/);
    await page.click('.shot-item[data-index="2"]');
    await verifyRecordingPreview(page, "after.png");
    if (media) assert.match(await page.$eval(".shot-reference figcaption", el => el.textContent), /不是本稿从经营问题生成的新概览/);
    await page.click('.shot-item[data-index="0"]');
    await page.reload({ waitUntil: "networkidle0" });
    await verifyRecordingSelection(page, 6);
    await verifyShotFields(page, { caption: "自定义屏幕文案" });
    await page.click('[data-action="back"]');
    assert.equal(await page.$(".brief-summary"), null);
    assert.equal(await page.$(".demo-banner"), null);
    assert.equal(await page.$(".save-status"), null);
    assert.match(await page.$eval(".top-right", n => n.textContent), /示例预览/);
    assert.equal(await page.$$eval(".scenario-presentation .scenario-teaser .pill", els => els.length), 3);
    await page.click(".scenario-example-chips .pill");
    assert.equal(await page.$eval('[name="presentation"][value="scenario"]', el => el.checked), true);
    await page.click('[name="presentation"][value="features"]');
    for (const id of ["build", "import", "dashboard", "workflow", "form", "teams"]) {
      if (await page.$eval(`[data-feature="${id}"]`, input => input.checked)) await page.click(`[data-feature="${id}"]`);
    }
    await page.click('[data-action="next"]');
    assert.match(await page.$eval("#notice", n => n.textContent), /至少选择/);
    await page.click('[data-action="add-extra"]');
    await page.type('[data-extra]', "Custom feature <img src=x onerror=alert(1)>");
    await page.click('input[name="presentation"][value="scenario"]');
    assert.equal(await page.$eval('.page-foot [data-action="next"]', el => el.textContent.trim()), "确认并继续：选择场景");
    await page.click('[data-action="next"]');
    assert.ok(await page.$(".scenario-grid"));
    assert.match(await page.$eval(".page-head", el => el.textContent), /向 LT 汇报 Biz Table/);
    assert.equal(await page.$$eval(".compact-scenario", els => els.length), 3);
    assert.equal(await page.$eval(".compact-analysis", el => el.open), false);
    assert.equal(await page.$eval(".custom-scenario-editor", el => el.open), false);
    assert.equal(await page.$(".current-scenario-details"), null);
    assert.equal(await page.$(".compact-scenario details, .compact-scenario .scenario-flow"), null);
    assert.ok(await page.$eval(".selected-scenario-panel", panel =>
      ["storyUser", "storyPain", "storyContext", "storyOutcome"].every(key => {
        const field = panel.querySelector(`[data-field="${key}"]`);
        return field && field.getBoundingClientRect().height > 0 && field.value.trim();
      })));
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewport({ width, height: 1000 });
      const layout = await page.evaluate(() => {
        const cards = [...document.querySelectorAll(".compact-scenario")].map(el => el.getBoundingClientRect());
        return {
          tops: cards.map(rect => Math.round(rect.top)),
          heights: cards.map(rect => rect.height),
          below: document.querySelector(".selected-scenario-panel").getBoundingClientRect().top >= Math.max(...cards.map(rect => rect.bottom)),
          overflow: document.documentElement.scrollWidth > innerWidth + 1
        };
      });
      assert.equal(layout.overflow, false, `Scenario overflow at ${width}`);
      assert.equal(layout.below, true, "Selected details belong below the choices");
      assert.equal(new Set(layout.tops).size, width > 700 ? 1 : 3);
      assert.ok(layout.heights.every(height => height < 300), "Scenario choices must remain compact");
    }
    await page.setViewport({ width: 1440, height: 1000 });
    const alignedCards = await page.$$eval(".compact-scenario", els => els.map(el => Math.round(el.getBoundingClientRect().top)));
    assert.equal(new Set(alignedCards).size, 1, "Restore original three-card desktop row");
    assert.ok(await page.$(".brand .brand-symbol"));
    await page.click('[data-action="scenario"][data-id="recruiting"]');
    assert.equal(await page.$eval('[data-field="storyTitle"]', el => el.value), "内训报名与组织工作台");
    const storyFields = ["storyUser", "storyPain", "storyContext", "storyOutcome"];
    const recruitingDetails = await page.$$eval(".selected-scenario-panel [data-field]", els => Object.fromEntries(els.map(el => [el.dataset.field, el.value])));
    for (const key of storyFields) {
      await page.$eval(`[data-field="${key}"]`, (el, value) => {
        el.value = value; el.dispatchEvent(new Event("input", { bubbles: true }));
      }, `${recruitingDetails[key]}（保留修改）`);
    }
    assert.doesNotMatch(await page.$eval(".step-feature", el => el.textContent), /待补充/);
    await page.click('[data-action="step-add"]');
    await page.type('[data-step="5"]', "核对反馈来源");
    await page.click('[data-action="step-up"][data-index="5"]');
    assert.equal(await page.$eval('[data-step="4"]', el => el.value), "核对反馈来源");
    await page.click('[data-action="step-delete"][data-index="5"]');
    await page.click('[data-action="scenario"][data-id="retail"]');
    assert.notEqual(await page.$eval('[data-field="storyContext"]', el => el.value), `${recruitingDetails.storyContext}（保留修改）`);
    await page.click('[data-action="scenario"][data-id="recruiting"]');
    await page.reload({ waitUntil: "networkidle0" });
    for (const key of storyFields) assert.equal(await page.$eval(`[data-field="${key}"]`, el => el.value), `${recruitingDetails[key]}（保留修改）`);
    assert.equal(await page.$eval('[data-step="4"]', el => el.value), "核对反馈来源");
    await page.click(".custom-scenario-editor>summary");
    await page.click('#custom-scenario-form [type="submit"]');
    assert.match(await page.$eval("#notice", el => el.textContent), /请填写/);
    for (const [key, value] of Object.entries({ title: "维修工单系统", user: "物业维修主管", pain: "报修单容易遗漏", story: "住户报修，主管派单并核对处理状态。", steps: "创建工单表\n提交报修单\n核对处理状态" })) {
      await page.type(`[data-field="scene.${key}"]`, value);
    }
    await page.click('#custom-scenario-form [type="submit"]');
    assert.equal(await page.$eval('[data-field="storyTitle"]', el => el.value), "维修工单系统");
    await page.reload({ waitUntil: "networkidle0" });
    assert.equal(await page.$eval('[data-field="storyTitle"]', el => el.value), "维修工单系统");
    assert.equal(await page.$$eval(".outline-row", els => els.length), 3);
    assert.equal(await page.$eval('[data-field="storyUser"]', el => el.value), "物业维修主管");
    assert.match(await page.$eval(".step-feature", el => el.textContent), /待补充/);
    await page.click('[data-action="scenario"][data-id="recruiting"]');
    await page.click('[data-action="next"]');
    assert.ok(await page.$(".editing-note"));
    await verifyRecordingSelection(page, 6);
    await verifyRecordingPreview(page, "empty.png");
    if (media) assert.match(await page.$eval(".shot-reference figcaption", el => el.textContent), /不是当前小店场景的新画面/);
    await verifyHeadingActions(page, "下一步：效果与修改");
    await page.click('.page-foot [data-action="back"]');
    assert.equal(await page.$eval("main h1", el => el.textContent), "场景与大纲");
    await verifyHeadingActions(page, "下一步：分镜脚本");
    await page.click('.page-foot [data-action="back"]');
    assert.equal(await page.$eval("main h1", el => el.textContent), "功能选择");
    await verifyHeadingActions(page, "下一步：选择场景");
    await page.click('.page-foot [data-action="next"]');
    await page.click('.page-foot [data-action="next"]');
    await page.click('[data-action="shot"][data-index="3"]');
    const scriptKeys = ["title", "narration", "caption", "before", "prompt", "action", "editing", "after", "highlight", "camera", "verify", "transition"];
    const scenarioEdits = Object.fromEntries(scriptKeys.map(key => [key, `场景独立编辑 ${key}\n保留内容 <test>`]));
    scenarioEdits.title = "场景独立镜头 <test>";
    scenarioEdits.narration = "保留真实提交。";
    await editShotFields(page, scenarioEdits);
    assert.equal(await page.$eval(".shot-item.selected strong", el => el.textContent), scenarioEdits.title);
    await page.reload({ waitUntil: "networkidle0" });
    await verifyRecordingSelection(page, 6, 3);
    await verifyShotFields(page, scenarioEdits);
    await page.click('[data-action="next"]');
    if (media) {
      await page.waitForFunction(() => document.querySelector("video")?.readyState >= 1);
      assert.equal(await page.$eval("video", v => v.videoWidth), 1600);
      await page.$eval("video", async v => { v.muted = true; await v.play(); });
      await page.waitForFunction(() => document.querySelector("video").currentTime > 0.5);
      await page.$eval("video", v => v.pause());
    } else assert.match(await page.$eval(".video-wrap", el => el.textContent), /未提供本地实录/);
    await page.click('[data-action="clip"][data-index="5"]');
    if (media) {
      await page.waitForFunction(() => Math.abs(document.querySelector("video").currentTime - 49.5) < 0.5);
      const imagesReady = await page.$$eval(".clips img", imgs => imgs.every(img => img.complete && img.naturalWidth > 0));
      assert.equal(imagesReady, true);
    }
    assert.match(await page.$eval("#feedback-target", el => el.value), /片段 06/);
    await page.type('[data-field="feedbackText"]', "片尾多停留两秒 <script>bad()</script>");
    await page.click('#feedback-form [type="submit"]');
    assert.match(await page.$eval(".feedback-item", el => el.textContent), /待处理.*片尾多停留两秒/s);
    assert.equal(await page.$(".feedback-item script"), null);
    await page.reload({ waitUntil: "networkidle0" });
    assert.equal(await page.$$eval(".feedback-item", els => els.length), 1, await page.$eval("main", el => el.textContent.slice(0, 600)));
    // The direct-feature branch skips scenes and maintains its own shot drafts.
    await page.click('[data-action="page"][data-index="1"]');
    const sceneBefore = await page.evaluate(key => JSON.parse(localStorage.getItem(key)).steps, storageKey);
    await page.click('input[name="presentation"][value="features"]');
    assert.equal(await page.$('.steps [data-action="page"][data-index="2"]'), null);
    await page.click('[data-action="next"]');
    assert.equal(await page.$eval("main h1", el => el.textContent), "分镜脚本");
    await verifyRecordingSelection(page, 1);
    assert.match(await page.$eval(".shot-item", el => el.textContent), /Custom feature <img/);
    assert.equal(await page.$(".script-layout img"), null);
    await verifyRecordingPreview(page);
    const customScriptId = await page.$eval(".shot-workspace", el => el.dataset.scriptId);
    for (const key of ["prompt", "action", "after"]) {
      assert.equal(await page.$eval(`[data-field="shot.${key}"]`, el => el.value), "", "Unknown features must not get invented inputs, actions or results");
    }
    assert.match(await page.$eval('[data-field="shot.verify"]', el => el.value), /不能编造/);
    const featureEdits = Object.fromEntries(scriptKeys.map(key => [key, `功能独立编辑 ${key} 保留内容 <test>`]));
    featureEdits.narration = "独立功能旁白";
    await editShotFields(page, featureEdits);
    assert.equal(await page.$eval(".shot-item.selected strong", el => el.textContent), featureEdits.title);
    assert.equal(await page.$(".script-layout test"), null);
    await page.click('[data-action="back"]');
    assert.equal(await page.$eval("main h1", el => el.textContent), "功能选择");
    for (let i = 0; i < 7; i++) {
      await page.click('[data-action="add-extra"]');
      const input = (await page.$$("[data-extra]")).at(-1);
      await input.type(`补充能力 ${i}`);
    }
    assert.equal(await page.$$eval("[data-extra]", els => els.length), 8);
    await page.click('[data-action="next"]');
    await page.click('.shot-item[data-index="0"]');
    await verifyRecordingSelection(page, 8);
    const compactHeight = await page.$eval(".shot-item.selected", el => el.getBoundingClientRect().height);
    assert.ok(compactHeight < 380, `Overview too tall: ${compactHeight}`);
    await page.click('.shot-item[data-index="7"]');
    await verifyRecordingSelection(page, 8, 7);
    const eighthScriptId = await page.$eval(".shot-workspace", el => el.dataset.scriptId);
    assert.notEqual(eighthScriptId, customScriptId);
    await verifyRecordingPreview(page);
    const eighthEdits = Object.fromEntries(scriptKeys.map(key => [key, `第八项独立编辑 ${key} ${"长内容".repeat(25)}`]));
    await editShotFields(page, eighthEdits);
    await page.click('.shot-item[data-index="0"]');
    await verifyRecordingSelection(page, 8);
    assert.equal(await page.$eval(".shot-workspace", el => el.dataset.scriptId), customScriptId);
    await verifyShotFields(page, featureEdits);
    await page.click('.shot-item[data-index="7"]');
    await page.reload({ waitUntil: "networkidle0" });
    assert.equal(await page.$(".error-banner"), null, await page.evaluate(() => document.querySelector(".error-banner")?.textContent));
    await verifyRecordingSelection(page, 8, 7);
    assert.equal(await page.$eval(".shot-workspace", el => el.dataset.scriptId), eighthScriptId);
    await verifyShotFields(page, eighthEdits);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewport({ width, height: 950 });
      await page.click('.shot-item[data-index="7"]');
      await verifyRecordingSelection(page, 8, 7);
      await verifyRecordingPreview(page);
      await page.click(".detail-panel details > summary");
      await verifyShotFields(page, eighthEdits);
      await verifyHeadingActions(page, "下一步：效果与修改");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Feature scripts overflow at ${width}`);
    }
    await page.setViewport({ width: 1440, height: 1000 });
    await page.click('[data-action="back"]');
    await page.click('[aria-label="删除补充功能 8"]');
    await page.click('[data-extra-check]');
    await page.click('[data-extra-check]');
    await page.click('[data-action="next"]');
    assert.equal(await page.$$eval(".shot-item", els => els.length), 7);
    await page.click('.shot-item[data-index="0"]');
    await verifyRecordingSelection(page, 7);
    assert.equal(await page.$eval(".shot-workspace", el => el.dataset.scriptId), customScriptId);
    await verifyShotFields(page, featureEdits);
    await page.click('[data-action="back"]');
    await page.click('input[name="presentation"][value="scenario"]');
    assert.equal(await page.$$eval(".steps .step", els => els.length), 4);
    await page.click('[data-action="next"]');
    assert.equal(await page.$eval("main h1", el => el.textContent), "场景与大纲");
    assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).steps, storageKey), sceneBefore);
    await page.click('[data-action="next"]');
    await page.click('.shot-item[data-index="3"]');
    await verifyShotFields(page, scenarioEdits);
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewport({ width, height: 950 });
      for (let i = 0; i < 5; i++) {
        if (i === 2) await page.click('[data-action="next"]');
        else await page.click(`.steps [data-action="page"][data-index="${i}"]`);
        assert.equal(await page.$eval("main h1", el => el.textContent), ["制作产品介绍视频", "功能选择", "场景与大纲", "分镜脚本", "效果与修改"][i]);
        if (i === 3) {
          await verifyRecordingSelection(page, 6, 3);
          await verifyShotFields(page, scenarioEdits);
          await page.click(".detail-panel details > summary");
        }
        if (i > 0) await verifyHeadingActions(page, [null, "下一步：选择场景", "下一步：分镜脚本", "下一步：效果与修改", null][i]);
        const shellText = await page.$eval("#app", el => el.textContent);
        assert.doesNotMatch(shellText, /这次，讲给谁听|先看一遍，再把它变得更好|成为主角|A STORY WORTH SHOWING|MAKE IT YOURS/);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
        assert.equal(overflow, false, `Horizontal overflow at page ${i}, width ${width}`);
      }
    }
    const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert.deepEqual(await page.evaluate(keys => keys.map(key => localStorage.getItem(key)), untouchedKeys), untouchedKeys.map(() => "other-variant-draft"));
    assert.equal(saved.source, "https://github.com/gim-home/biz-table/");
    assert.match(saved.videoGoal, /向 LT 汇报 Biz Table/);
    assert.equal(saved.shots[3].narration, "保留真实提交。");
    for (const key of scriptKeys) {
      assert.equal(saved.shots[3][key], scenarioEdits[key]);
      assert.equal(saved.featureShotDrafts.find(shot => shot.id === customScriptId)[key], featureEdits[key]);
      assert.equal(saved.featureShotDrafts.find(shot => shot.id === eighthScriptId)[key], eighthEdits[key], "Removing a feature must not discard its draft");
    }
    // Old generated filler upgrades in place, but rewritten recording details survive.
    await page.evaluate(key => {
      const draft = JSON.parse(localStorage.getItem(key));
      const build = draft.featureShotDrafts.find(s => s.id === "build");
      delete build.planVersion;
      delete build.prompt;
      build.before = "在授权产品环境中定位该功能的实际入口；尚未排练。";
      build.narration = "用户修改后的建表旁白";
      draft.selected = ["build"];
      draft.presentation = "features";
      draft.page = 3;
      draft.shot = 0;
      localStorage.setItem(key, JSON.stringify(draft));
    }, storageKey);
    await page.reload({ waitUntil: "networkidle0" });
    assert.match(await page.$eval(`${buildScript} [data-field="shot.before"]`, el => el.value), /真实 Agent 已连接/);
    assert.match(await page.$eval(`${buildScript} [data-field="shot.prompt"]`, el => el.value), /帮我搭一个小店业务工作台/);
    assert.equal(await page.$eval(`${buildScript} [data-field="shot.narration"]`, el => el.value), "用户修改后的建表旁白");
    assert.equal(await page.$eval(`${buildScript} [data-field="shot.caption"]`, el => el.value), "自定义屏幕文案");
    await page.click('[data-action="page"][data-index="4"]');
    await page.evaluate(key => {
      const draft = JSON.parse(localStorage.getItem(key));
      draft.shots[0].title = "先看空白起点";
      draft.shots[1].title = "用户自定义标题";
      draft.feedbackTarget = "片段 01 · 先看空白起点";
      localStorage.setItem(key, JSON.stringify(draft));
    }, storageKey);
    await page.reload({ waitUntil: "networkidle0" });
    await page.click('[data-action="page"][data-index="4"]');
    const migrated = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
    assert.equal(migrated.shots[0].title, "说清业务，结构就建立起来");
    assert.equal(migrated.shots[1].title, "用户自定义标题");
    assert.equal(migrated.shots[3].narration, "保留真实提交。");
    assert.equal(migrated.feedbackTarget, "片段 01 · 说清业务，结构就建立起来");
    assert.deepEqual(migrated.feedback, saved.feedback);
    await page.evaluate(key => localStorage.setItem(key, '{"version":99}'), storageKey);
    await page.reload({ waitUntil: "networkidle0" });
    assert.match(await page.$eval(".error-banner", el => el.textContent), /未覆盖/);
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), '{"version":99}');
    assert.deepEqual(errors, []);
    console.log(`PASS (${variant}): intake source/attachments→goal→two mode buttons; single storyboard with per-scene narration, compatible framing drafts, no separate narration stop; automatic/manual progression, cancellation, media failures, and existing responsive/scenario/migration/export/server checks.`);
  } finally {
    if (browser) await browser.close();
    if (server) server.kill();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
