(() => {
  "use strict";
  const story = document.body.dataset.version === "story";
  const query = new URLSearchParams(location.search);
  const design = query.get("design") === "director" ? "director" : "canvas";
  let mark = ["frame", "cut", "path"].includes(query.get("mark")) ? query.get("mark") : design === "director" ? "cut" : "frame";
  document.body.dataset.design = design;
  let canvasZoom = 100;
  const storageKey = `productshot-mockup-${story ? "story" : "demo"}-v1`;
  const icons = {
    film: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>',
    home: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',
    layers: '<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="4" width="7" height="6" rx="1"/><path d="M6 14h12M6 18h8"/>',
    record: '<rect x="3" y="4" width="18" height="14" rx="3"/><circle cx="12" cy="11" r="3"/><path d="M8 22h8m-4-4v4"/>',
    sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5zM20 2v4m-2-2h4"/>',
    audio: '<path d="M4 10v4m4-8v12m4-15v18m4-15v12m4-8v4"/>',
    play: '<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="4"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 4v16M4 12h16"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    share: '<path d="M12 16V3m-5 5 5-5 5 5M5 13v7h14v-7"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    settings: '<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2" fill="white"/><circle cx="16" cy="12" r="2" fill="white"/><circle cx="10" cy="18" r="2" fill="white"/>',
    message: '<path d="M20 15a3 3 0 0 1-3 3H9l-5 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"/>',
    undo: '<path d="M4 10h10a6 6 0 0 1 0 12M4 10l5-5m-5 5 5 5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    box: '<path d="m12 3 9 5v9l-9 5-9-5V8zm-9 5 9 5 9-5m-9 5v9M7 5l10 5"/>',
    chart: '<path d="M4 3v17h17M8 16V9m5 7V5m5 11v-5"/>',
    list: '<path d="M8 5h13M8 12h13M8 19h8"/><rect x="2" y="4" width="2" height="2" rx=".3"/><rect x="2" y="11" width="2" height="2" rx=".3"/><rect x="2" y="18" width="2" height="2" rx=".3"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.film}</svg>`;
  const marks = {
    frame: '<path d="M11 5H5v6m16-6h6v6M5 21v6h6m16-6v6h-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"/><path d="m13 10 10 6-10 6z" fill="currentColor"/>',
    cut: '<path d="M4 6h17v5H9v10H4zM11 21h12V11h5v15H11z" fill="currentColor"/><path d="m13 13 6 3-6 3z" fill="currentColor"/>',
    path: '<path d="M8 27V6h10a7 7 0 0 1 0 14h-4" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="m15 10 6 3-6 3z" fill="currentColor"/>',
  };
  const markSVG = (key) => `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true">${marks[key]}</svg>`;
  const variantLink = (version = story ? "story" : "demo", mode = design) => `studio-${version}.html?design=${mode}&mark=${mark}`;
  const esc = (value) => String(value).replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  const button = (action, label, symbol, cls = "", extra = "") => `<button type="button" class="button ${cls}" data-action="${action}" ${extra}>${symbol ? icon(symbol) : ""}${label}</button>`;
  const tiny = (action, symbol, label, extra = "") => `<button type="button" class="icon-button" data-action="${action}" aria-label="${label}" title="${label}" ${extra}>${icon(symbol)}</button>`;
  const uid = () => globalThis.crypto?.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const directionFields = [
    ["before", "起始画面", "观众首先看到什么？哪些结果此时还不应该出现？"],
    ["actions", "操作顺序", "谁先做什么，产品如何响应，再做什么？"],
    ["highlight", "高亮重点", "强调哪个目标，何时出现，何时撤掉？"],
    ["camera", "镜头路径", "从全景推进到哪里，保留什么上下文，何时拉回？"],
    ["motion", "动效与来源", "什么元素从哪里到哪里？是产品动作，还是后期叠加？"],
    ["after", "结束画面", "最终留下什么可见的结果？"],
    ["hold", "继续的条件", "等待什么加载完成、讲完或看清？不需要填写秒数。"],
    ["transition", "与下一幕的衔接", "保留哪个对象或画面，把它带到下一步？"],
    ["verify", "如何验证", "什么证据说明操作成功？缺少什么时应停止？"],
    ["mustKeep", "不能丢的细节", "哪些已经确认的要求，后续修改也必须保留？"],
  ];
  function directionFor(kind) {
    const common = {
      before: "先建立完整工作区，保留产品名称与当前任务的上下文。",
      actions: "1. 展示操作前状态。\n2. 执行真实操作。\n3. 等结果出现后再强调重点。",
      highlight: "目标出现并稳定后，用细描边强调一个关键区域；进入下一步前撤掉。",
      camera: "从工作区全景平缓推进到操作区域，保留标题和相关字段；结果看清后拉回。",
      motion: "只叠加演示光标、焦点框和运镜，不改写产品数据，也不伪造生成过程。",
      after: "结果稳定可读，保留本幕的任务上下文。",
      hold: "操作完成、目标可见且结果可读之后继续；有旁白时等待对应语义结束。",
      transition: "保留同一份数据或选中对象，再进入下一幕。",
      verify: "录制时核对实际操作结果；目标缺失或操作失败时停止，不补画成功状态。",
      mustKeep: "先有操作，再有结果；重点可读；不得使用模拟画面作为真实操作证据。",
    };
    const byKind = {
      table: {
        before: "打开已建立结构的空表；能看见表名、字段和零条记录，不提前出现业务数据。",
        actions: "1. 展示表与关联结构。\n2. 依次指向建议字段。\n3. 保持空表，准备进入数据导入。",
        highlight: "先强调表名，再依次描边核心字段；不同时点亮所有字段，导入前撤掉描边。",
        camera: "全工作区 → 表名与字段表头的中近景 → 拉回空白数据区；表名始终可见。",
        after: "完整的空结构仍在画面中，零记录状态清楚可见。",
        verify: "核对字段与关联已存在、记录数为零；没有验证前不宣称系统已建好。",
      },
      data: {
        before: "沿用上一幕的表；数据尚未导入。",
        actions: "1. 选择授权示例数据。\n2. 查看字段映射和预览。\n3. 确认导入，等待实际记录出现。",
        highlight: "映射时强调对应字段；完成后强调实际导入结果与行数，再移除焦点框。",
        camera: "空表全景 → 映射区域 → 回到结果行；镜头沿数据流转方向平移，避免连续跳切。",
        after: "记录已进入原来的表，留下可读的结果和导入反馈。",
        motion: "可在真实记录出现时加轻量引导标注；数据飞入若为后期效果必须标记，不充当导入证据。",
      },
      chart: {
        before: "先展示已有数据的表格；本次请求的新图表尚不存在。",
        actions: "1. 用户在 Agent 输入框提出 Dashboard 请求并发送。\n2. 展示真实执行与产品变化。\n3. 核对新图表，然后查看一个关键指标。",
        highlight: "请求发送后强调所指目标；指标就绪、镜头停稳后描边该指标，不给整个 Dashboard 撒花。",
        camera: "数据表与 Agent 同框 → 平移到新 Dashboard → 推进关键指标，保留指标标题与筛选条件 → 拉回全景。",
        after: "新图表与指标稳定可读，保留当前数据和筛选条件。",
        verify: "核对请求确实执行、图表实际新增且数据正确；不能隐藏已有图表后再显现，冒充新生成。",
      },
      form: {
        before: "从同一业务上下文打开空表单，保留关联对象。",
        actions: "1. 按字段顺序填写示例内容。\n2. 点击提交。\n3. 等待成功反馈并核对新增记录。",
        highlight: "填写时只提示当前字段；提交后移到成功反馈，不盖住输入值或错误信息。",
        camera: "表单完整视图 → 轻推当前输入字段 → 拉回提交按钮与结果；不要裁掉字段标签。",
        after: "成功状态与已提交结果可见，不提前进入结束页。",
        transition: "结果看清后再收束；有旁白时不在提交说明未讲完前切走。",
        verify: "检查真实成功响应和结果记录；失败时保留错误并停止，不能仅叠加成功文案。",
      },
      explain: {
        before: "沿用上一幕的数据对象和配色，明确为流程讲解示意。",
        actions: "1. 展示同一份数据。\n2. 依次连接表格、Dashboard 与 Form。\n3. 将焦点交给下一段产品操作。",
        highlight: "只强调当前解释的关系，讲完撤掉，不同时突出全部节点。",
        camera: "关系全景 → 轻推当前连接 → 拉回完整关系，并匹配下一幕产品构图。",
        motion: "数据对象沿明确路径依次连接三个入口；使用讲解动画，不声称是产品内部实时执行画面。",
        after: "关系完整可见，下一步操作对象处于视觉焦点。",
        verify: "确认解释符合已核验功能；不在示意动画中新增未经确认的能力。",
      },
    };
    return { ...common, ...byKind[kind] };
  }
  const makeShot = (title, kind, duration, purpose, narration) => ({
    id: uid(), title, kind, duration, purpose, narration, zoom: 1.15, focusX: 65, focusY: 45,
    highlight: kind !== "explain", cursor: kind !== "explain", speed: 1,
    direction: directionFor(kind),
  });
  function defaults() {
    const shots = [
      makeShot("从一张空表开始", "table", 8, "展示空表结构，先让观众看清字段与关系。", "从一张空表开始，为商品、采购和销售建立清晰的结构。"),
      makeShot("让数据进入工作流", "data", 10, "导入之后保留结果，不提前展示有数据的表。", "当数据进入表格，零散的信息就成为可追踪的日常业务。"),
      makeShot("把数据变成洞察", "chart", 12, "从数据进入统计视图，聚焦库存与销售趋势。", "同一份数据，变成了团队一眼就能看懂的经营仪表盘。"),
      makeShot("用表单收集新订单", "form", 9, "演示输入、提交、成功，结果必须可见。", "一张简单的表单，让新的订单回到同一个系统。"),
    ];
    const form = shots.pop();
    const formShots = [
      makeShot("打开订单表单", "form", 4, "进入空表单，让观众先看清字段。", "打开一张新的订单表单。"),
      makeShot("填写客户、商品和数量", "form", 7, "按顺序填写字段，保持字段标签可见。", "填写客户、商品和数量。"),
      makeShot("确认提交并核对结果", "form", 5, "点击提交，保留成功状态并核对新增记录。", "提交后，核对订单已经进入系统。"),
    ];
    Object.assign(formShots[0].direction, { before: "从业务工作区打开入口，尚未显示表单。", actions: "点击新订单表单入口，等待表单字段出现。", after: "空表单完整可见，尚未填写。", transition: "保持同一张表单，开始填写。", verify: "表单已加载且字段与任务一致。", mustKeep: "不提前出现填写完成或提交成功状态。" });
    Object.assign(formShots[1].direction, { before: "沿用上一镜的空表单。", actions: "依次填写客户、商品、数量，核对输入值；此镜不提交。", after: "填写内容清楚可见，尚未提交。", transition: "保留输入值，焦点移到确认按钮。", verify: "输入值与授权示例一致，验证提示已处理。", mustKeep: "字段标签与输入值同时可读。" });
    Object.assign(formShots[2].direction, { before: "表单填写完毕，确认按钮可见。", actions: "点击确认；等待真实响应；核对业务记录。", after: "可见成功反馈与新增记录证据。", transition: "结果看清之后再进入总结。", verify: "实际提交成功且新增记录可追溯。", mustKeep: "无成功结果时不得剪出虚假成功。" });
    shots.push(...formShots);
    if (story) shots.splice(2, 0, makeShot("一份数据，连接整个业务", "explain", 6, "解释表格、仪表盘和表单之间的关系，再回到真实演示。", "表格、仪表盘和表单，不是三个工具，而是同一份数据的三个入口。"));
    const steps = [
      { id: uid(), title: "从 0 开始建表", purpose: "为小超市建立商品、采购与销售的空结构。", shotIds: shots.filter((s) => s.kind === "table").map((s) => s.id) },
      { id: uid(), title: "让经营数据进入", purpose: "导入授权的示例数据，保留真实导入结果。", shotIds: shots.filter((s) => s.kind === "data").map((s) => s.id) },
      { id: uid(), title: "查看 Dashboard", purpose: "用同一份数据查看经营指标与图表。", shotIds: shots.filter((s) => ["chart", "explain"].includes(s.kind)).map((s) => s.id) },
      { id: uid(), title: "用 Form 收集订单", purpose: form.purpose, shotIds: formShots.map((s) => s.id) },
    ];
    return {
      name: "把进销存，变成一个简单的工作流", audience: "内部团队 · All Hands",
      goal: "用一个连贯的任务，介绍从空表到数据、Dashboard 和 Form 的产品能力。",
      url: "", scope: "workflow",
      notes: "先展示空结构，再引入数据；保留表单提交的成功状态。", shots,
      sourceType: "link", audienceChoice: "team",
      capabilities: ["structure", "dashboard", "agent", "form"],
      customCapability: "", scenarioChoice: "workflow", discoveryFeedback: "",
      constraints: ["empty", "success"],
      handoffImported: false, planRevision: 1, outlineApproved: false,
      scenarios: [{ id: uid(), title: "小超市的进销存系统", context: "从一张空表出发，把商品、经营数据和新订单放进同一个工作流。", outcome: "观众能看清：几项能力如何围绕同一份数据，完成一件事。", steps, shotIds: shots.map((s) => s.id) }],
      repo: "", discoveryStage: "source",
      background: "lavender", voice: "calm", volume: 75, musicVolume: 18,
      captions: true, music: true, comments: [], approved: false,
    };
  }
  let model = defaults();
  let loadWarning = "";
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const value = JSON.parse(saved);
      const validShot = (s) => s && typeof s.id === "string" && typeof s.title === "string" && s.title.length <= 60 &&
        ["table", "data", "chart", "form", "explain"].includes(s.kind) && Number.isFinite(s.duration) && s.duration >= 3 && s.duration <= 30 &&
        typeof s.purpose === "string" && typeof s.narration === "string" && Number.isFinite(s.zoom) && s.zoom >= 1 && s.zoom <= 2 &&
        Number.isFinite(s.focusX) && s.focusX >= 0 && s.focusX <= 100 && Number.isFinite(s.focusY) && s.focusY >= 0 && s.focusY <= 100 &&
        typeof s.highlight === "boolean" && typeof s.cursor === "boolean" && [0.75, 1, 1.5, 2].includes(s.speed);
      if (!value || !Array.isArray(value.shots) || value.shots.length > 24 || !value.shots.every(validShot) ||
        new Set(value.shots.map((s) => s.id)).size !== value.shots.length ||
        !["name", "audience", "goal", "url", "notes"].every((key) => typeof value[key] === "string" && value[key].length <= 4000) ||
        !["workflow", "feature", "overview"].includes(value.scope) || !["lavender", "mint", "blue"].includes(value.background) ||
        !["calm", "warm"].includes(value.voice) || ![value.volume, value.musicVolume].every((v) => Number.isFinite(v) && v >= 0 && v <= 100) ||
        typeof value.approved !== "boolean" || typeof value.captions !== "boolean" || typeof value.music !== "boolean" ||
        !Array.isArray(value.comments) || value.comments.length > 100 || !value.comments.every((c) => c && typeof c.id === "string" && typeof c.text === "string" && typeof c.shot === "string" && typeof c.time === "string" && typeof c.resolved === "boolean")) {
        throw new Error("保存的原型数据格式不兼容");
      }
      model = value;
    }
  } catch (error) { loadWarning = `未能恢复上次原型：${error.message}。已显示默认示例；原存储未被覆盖。`; }
  model.sourceType = ["link", "repo"].includes(model.sourceType) ? model.sourceType : "link";
  model.audienceChoice = ["team", "leaders", "customers", "unsure", "custom"].includes(model.audienceChoice) ? model.audienceChoice : "team";
  model.capabilities = Array.isArray(model.capabilities) ? model.capabilities.filter((item) => ["structure", "dashboard", "agent", "form", "custom"].includes(item)) : ["structure", "dashboard", "agent", "form"];
  model.customCapability = typeof model.customCapability === "string" ? model.customCapability.slice(0, 300) : "";
  model.scenarioChoice = ["workflow", "before-after", "showcase", "custom"].includes(model.scenarioChoice) ? model.scenarioChoice : "workflow";
  model.discoveryFeedback = typeof model.discoveryFeedback === "string" ? model.discoveryFeedback.slice(0, 1000) : "";
  model.constraints = Array.isArray(model.constraints) ? model.constraints.filter((item) => ["empty", "success", "agent", "no-story"].includes(item)) : ["empty", "success"];
  model.handoffImported = typeof model.handoffImported === "boolean" ? model.handoffImported : true;
  model.planRevision = Number.isInteger(model.planRevision) && model.planRevision > 0 ? model.planRevision : 1;
  for (const shot of model.shots) {
    if (!shot.direction) shot.direction = directionFor(shot.kind);
    for (const [key] of directionFields) {
      if (typeof shot.direction[key] !== "string") shot.direction[key] = "";
      shot.direction[key] = shot.direction[key].slice(0, 2000);
    }
  }
  if (!Array.isArray(model.scenarios) || !model.scenarios.length || !model.scenarios.every((s) =>
    s && typeof s.id === "string" && typeof s.title === "string" && typeof s.context === "string" &&
    typeof s.outcome === "string" && Array.isArray(s.shotIds) && s.shotIds.every((id) => typeof id === "string"))) {
    model.scenarios = [{ id: uid(), title: "一家小超市，开始管理每天的生意", context: model.goal, outcome: "展示一个从开始到结果的连贯任务。", shotIds: model.shots.map((s) => s.id) }];
  }
  model.outlineApproved = typeof model.outlineApproved === "boolean" ? model.outlineApproved : model.approved;
  model.repo = typeof model.repo === "string" ? model.repo.slice(0, 1000) : "";
  model.discoveryStage = ["source", "features", "audience", "ready"].includes(model.discoveryStage) ? model.discoveryStage : "source";
  model.flowReached = Number.isInteger(model.flowReached) ? Math.max(0,Math.min(4,model.flowReached)) : 0;
  model.checkpoints = model.checkpoints && typeof model.checkpoints === "object" && !Array.isArray(model.checkpoints) ? model.checkpoints : {};
  model.chat = Array.isArray(model.chat) ? model.chat.filter((m)=>m && ["user","director"].includes(m.role) && typeof m.text==="string").slice(-60) : [];
  model.chatDraft = typeof model.chatDraft==="string" ? model.chatDraft.slice(0,2000) : "";
  let chatMode="feedback", chatTarget="", pendingChat=null;
  const appendChat = (role,text) => { model.chat.push({role,text}); model.chat=model.chat.slice(-60); };
  function checkpoint(key, data) {
    model.checkpoints[key]={revision:model.planRevision, savedAt:new Date().toISOString(), data:structuredClone(data)};
  }
  function ensureSteps(scene) {
    if (!Array.isArray(scene.steps) || !scene.steps.every((s) => s && typeof s.id === "string" && typeof s.title === "string" && typeof s.purpose === "string" && Array.isArray(s.shotIds))) {
      scene.steps = scene.shotIds.map((id) => model.shots.find((s) => s.id === id)).filter(Boolean).map((shot) => ({
        id: uid(), title: shot.title, purpose: shot.purpose, shotIds: [shot.id],
      }));
    }
  }
  model.scenarios.forEach(ensureSteps);
  let activeScenario = model.scenarios[0].id;
  let view = "home", inspectorTab = "effects", selected = (model.shots.find((s) => s.kind === "chart") || model.shots[0])?.id || "";
  let productionTab = "capture";
  let intakeStep = "handoff";
  let time = 0, playing = false, lastTick = 0, raf = 0, captureTimer = 0, captureProgress = 0, captureStatus = "idle";
  let toastTimer = 0;
  const stages = [["home", "首页", "home"], ["understand", "理解与功能选择", "box"], ["brief", "大纲", "list"], ["plan", "故事与分镜", "layers"], ["review", "预览与审片", "film"]];
  const duration = (s) => s.duration / s.speed;
  const total = () => model.shots.reduce((sum, s) => sum + duration(s), 0);
  const currentShot = () => model.shots.find((s) => s.id === selected) || model.shots[0];
  function startOf(id) { let t = 0; for (const s of model.shots) { if (s.id === id) return t; t += duration(s); } return 0; }
  time = startOf(selected);
  function shotAt(t) { let end = 0; for (const s of model.shots) { end += duration(s); if (t < end) return s; } return model.shots[model.shots.length - 1]; }
  const stamp = (t) => `${Math.floor(t / 60).toString().padStart(2, "0")}:${Math.floor(t % 60).toString().padStart(2, "0")}`;
  function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(model)); return true; }
    catch (error) { toast(`无法保存到浏览器：${error.message}。可以下载方案 JSON。`); return false; }
  }
  function changed(plan = false) {
    if (plan) {
      if (model.approved) model.planRevision += 1;
      model.approved = false;
    }
    reconcileScenarios();
    persist();
  }
  function reconcileScenarios() {
    const used = new Set();
    for (const scene of model.scenarios) {
      ensureSteps(scene);
      for (const step of scene.steps) step.shotIds = step.shotIds.filter((id) => {
        if (used.has(id) || !model.shots.some((s) => s.id === id)) return false;
        used.add(id); return true;
      });
    }
    const orphans = model.shots.filter((s) => !used.has(s.id));
    if (orphans.length) {
      const scene = model.scenarios.find((s) => s.id === activeScenario) || model.scenarios[0];
      scene.steps.push({ id: uid(), title: "待归类的镜头", purpose: "这些镜头保留自旧版工程，请确认其所属业务步骤。", shotIds: orphans.map((s) => s.id) });
      model.approved = false; model.outlineApproved = false;
    }
    for (const scene of model.scenarios) scene.shotIds = scene.steps.flatMap((s) => s.shotIds);
    const byId = new Map(model.shots.map((s) => [s.id, s]));
    model.shots = model.scenarios.flatMap((s) => s.shotIds).map((id) => byId.get(id));
  }
  const allSteps = () => model.scenarios.flatMap((s) => s.steps);
  const stepForShot = (id) => allSteps().find((s) => s.shotIds.includes(id));
  const stepById = (id) => allSteps().find((s) => s.id === id);
  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    clearTimeout(toastTimer); el.textContent = message; el.hidden = false;
    toastTimer = setTimeout(() => { el.hidden = true; }, 6500);
  }
  function halt() { playing = false; cancelAnimationFrame(raf); if ("speechSynthesis" in window) speechSynthesis.cancel(); }
  function navigate(next) {
    halt();
    if (["explain", "audio"].includes(next)) { productionTab = next; view = "review"; }
    else if (next === "capture") { productionTab = "capture"; view = "review"; }
    else {
      const index=stages.findIndex(([key])=>key===next);
      if(index>model.flowReached){toast("请先确认当前阶段，或点击“浏览完整示例”查看原型。");return;}
      view = next;
    }
    chatMode="feedback";chatTarget="";
    render();
  }
  function conversationPane() {
    const guidance = {
      home:"你好，我是你的 Demo 导演。先了解这五个阶段；准备好后把产品链接或 Repo 给我，不需要先写完整故事。",
      understand: model.discoveryStage==="source" ? "先提供产品入口。正式版会读取授权内容；本原型仅用固定示例演示理解结果。"
        : model.discoveryStage==="features" ? "你想展示一个功能、几个相关功能，还是整个产品？右边可以多选，也可以补充我漏掉的内容。"
        : model.discoveryStage==="audience" ? "接下来确认观众。给团队、管理层还是 Partner 看，会影响我们选择的场景和讲法。"
        : "产品方向已保存。接下来可以提出几种场景，挑选一版简单大纲。",
      brief:"先看场景和先后顺序即可。比如：建表 → 数据进入 → Dashboard → Form。不要在大纲里安排每一镜或放截图。",
      plan:"现在把每一步拆细。例如 Form：打开 → 填写 → 确认。你可以在右边编辑，或在左边指定某一镜的修改并应用。",
      review:"看中间画面，在底部选镜头，右边调设置。生成进度也在这里；不需要另开一个只有 loading 的制作台。",
    };
    const modes = view==="brief" ? [["feedback","讨论反馈"],["step-title","修改步骤名称"],["step-add","添加业务步骤"]]
      : view==="plan" ? [["feedback","讨论反馈"],["camera","修改镜头路径"],["highlight","修改高亮重点"],["actions","修改操作顺序"]]
      : view==="review" ? [["feedback","讨论反馈"],["caption","修改当前镜头旁白"]] : [["feedback","讨论反馈"], ...(view==="understand"?[["source","填写产品链接 / Repo"]]:[])];
    if(!modes.some(([key])=>key===chatMode))chatMode="feedback";
    const targets = view==="brief" ? allSteps().map((s)=>[s.id,s.title]) : model.shots.map((s)=>[s.id,s.title]);
    if(!targets.some(([id])=>id===chatTarget))chatTarget=view==="review"?selected:targets[0]?.[0] || "";
    const showTargets=["step-title","camera","highlight","actions","caption"].includes(chatMode);
    return `<aside class="director-chat"><header><span class="director-emblem">${markSVG(mark)}</span><div><strong>你的 Demo 导演</strong><small>对话交互模拟 · 未连接 AI</small></div></header>
      <div class="chat-history" aria-live="polite"><div class="chat-message director"><span>PRODUCTSHOT</span><p>${guidance[view]}</p></div>${model.chat.map((m)=>`<div class="chat-message ${m.role}"><span>${m.role==="user"?"你":"导演 · 原型"}</span><p>${esc(m.text)}</p></div>`).join("")}
      ${pendingChat ? `<div class="chat-proposal"><span>待你确认 · ${esc(pendingChat.label)}</span><p>${esc(pendingChat.text)}</p><div>${button("apply-chat","应用这项修改","check","small")}${button("discard-chat","取消","","small")}</div></div>`:""}</div>
      <div class="chat-next">${view==="home"?button("start-flow","了解了，开始","arrow","primary")
        :view==="understand"?button(model.discoveryStage==="source"?"understand-demo":model.discoveryStage==="features"?"confirm-features":"home-outline",model.discoveryStage==="source"?"显示示例理解结果":model.discoveryStage==="features"?"确认功能，继续":"确认方向，讨论大纲","arrow","soft")
        :view==="brief"?button("confirm-outline","保存大纲，细化分镜","arrow","soft")
        :view==="plan"?button("approve","确认分镜，进入审片","arrow","soft",!model.outlineApproved?"disabled":"")
        :button("go-plan","返回调整分镜","back","soft")}</div>
      <form class="chat-composer" id="director-chat-form"><label>如何处理这条内容<select id="chat-mode">${modes.map(([key,label])=>`<option value="${key}" ${key===chatMode?"selected":""}>${label}</option>`).join("")}</select></label>
      ${showTargets?`<label>修改对象<select id="chat-target">${targets.map(([id,label])=>`<option value="${id}" ${id===chatTarget?"selected":""}>${esc(label)}</option>`).join("")}</select></label>`:""}
      <textarea id="chat-input" maxlength="2000" aria-label="给导演的消息" placeholder="${chatMode==="feedback"?"直接说哪里不对，或补充你的想法…":"输入修改后的内容，发送后可预览并确认应用…"}">${esc(model.chatDraft)}</textarea><div><small>${chatMode==="feedback"?"自由反馈只记录，不假装已理解执行":"指定字段修改 · 不调用 AI"}</small><button type="submit" aria-label="发送给导演">${icon("arrow")}</button></div></form>
      <div class="chat-footer">${button("browse-example","浏览完整示例","","small")}<small>左右编辑同一份方案</small></div></aside>`;
  }
  function thumbnail(shot) {
    if (shot.kind === "explain") return '<div class="mini-diagram"><span>数据</span><b>→</b><span>洞察</span><b>→</b><span>行动</span></div>';
    const content = shot.kind === "chart"
      ? `<div class="mini-metrics"><span>Products <b>128</b></span><span>Orders <b>36</b></span><span>Low stock <b>4</b></span></div><div class="mini-chart">${[16, 23, 19, 34, 28, 38].map((n) => `<i style="height:${n}px"></i>`).join("")}</div>`
      : shot.kind === "form" ? '<div class="mini-form"><span>Customer <b>Northstar Market</b></span><span>Product <b>Organic oat milk</b></span><span>Quantity <b>12</b></span><em>Submit order</em></div>'
      : `<div class="mini-table"><div><b>Product</b><b>Category</b><b>Stock</b></div>${shot.kind === "table" ? '<p>No records yet<br><small>Your structure is ready.</small></p>' : [["Oat milk","Beverages","128"],["Sourdough","Bakery","36"],["Avocado","Produce","12"]].map((row) => `<div>${row.map((v) => `<span>${v}</span>`).join("")}</div>`).join("")}</div>`;
    return `<div class="mini-window"><div class="mini-title"><span>◈ Northstar</span><small>${shot.kind === "chart" ? "Overview" : shot.kind === "form" ? "New sales order" : "Products"}</small></div>${content}</div>`;
  }
  function shell() {
    document.body.dataset.view = view;
    return `<div class="workbench">
      <header class="wb-topbar"><a class="wb-brand" href="studio-designs.html" aria-label="ProductShot · 返回设计对比">${markSVG(mark)}<b>ProductShot</b></a>
        <span class="wb-divider"></span><div class="wb-project"><h1>${esc(model.name)}</h1><span>v${model.planRevision} <i></i> 本机自动保存</span></div>
        <div class="wb-top-actions"><a class="wb-compare" href="${variantLink(undefined, design === "canvas" ? "director" : "canvas")}">${design === "canvas" ? "B · 剪辑工作台" : "A · 画布工作台"} ${icon("arrow")}</a>${tiny("icon-options", "settings", "比较产品图标")}${button("share", "分享", "share")}${button("delivery", "交付", "download", "primary")}</div>
      </header>
      <div class="wb-subbar"><nav class="nav" aria-label="工作流程">${stages.map(([key,name,symbol],i)=>`<button type="button" data-view="${key}" aria-label="${name}" class="${view===key?"active":""}" ${view===key?'aria-current="page"':""} ${i>model.flowReached?"disabled":""}><small>${i+1}</small>${icon(symbol)}<span>${name}</span>${model.checkpoints[key]?'<i class="stage-saved" title="有已保存版本"></i>':""}</button>`).join("")}</nav><div class="wb-edition"><a href="${variantLink("demo")}" class="${!story ? "active" : ""}">纯 Demo</a><a href="${variantLink("story")}" class="${story ? "active" : ""}">讲解 + 声音</a></div></div>
      <div class="wb-prototype"><span>交互设计原型</span> 示例画面与制作进度为模拟，不执行产品操作或生成视频。<a href="studio-designs.html">设计对比</a></div>
      <div class="creation-shell">${conversationPane()}
      <main class="wb-main" id="page-content">${content()}</main>
      </div>
      <footer class="wb-status"><span>${icon("lock")} 本机保存 · 不上传素材</span><span>${design === "canvas" ? "A / Canvas workspace" : "B / Editing workspace"}</span><span>${model.shots.length} 个镜头 · ${story ? "含讲解与声音设计" : "纯产品 Demo"}</span></footer>
    </div><div id="toast" class="toast" role="status" hidden></div><dialog id="dialog" aria-labelledby="dialog-title"></dialog>`;
  }
  function content() {
    if (view === "home") return homePage();
    if (view === "understand") return understandingPage();
    if (view === "brief") return outlinePage();
    if (view === "plan") return planPage();
    if (view === "capture") return reviewPage();
    if (view === "audio") return audioPage();
    if (view === "explain") return explainPage();
    return reviewPage();
  }
  function homePage() {
    return `<div class="home-page"><section class="home-intro"><div><span class="welcome-eyebrow">MEET YOUR DEMO DIRECTOR</span><h2>好产品，<br>值得被讲清楚。</h2><p>不必先会写脚本，也不用先成为剪辑师。<br>从一个产品开始，和你的 Agent 一起找到值得展示的故事。</p><div class="home-cta">${button("start-flow","了解了，开始","arrow","primary")}${button("copy-skill","复制 Skill 调用语","copy","")}</div></div>${design === "canvas" ? '<img src="studio-art/story-garden.svg" alt="原创品牌插画：创作者整理故事画面，不属于成片素材" width="480" height="300">' : ""}</section>
      <section class="skill-introduction"><span class="page-index">YOUR AGENT, YOUR DIRECTOR</span><h3>在熟悉的 Agent 里想清楚，在这里把它做好。</h3><p>调用 <code>product-demo-director</code>，提供网址或 Repo。Skill 先理解产品，再和你确认功能、观众、场景与大纲。网页承接这些决定，不让你重新填一遍复杂表单。</p><div class="skill-command">使用 product-demo-director，先理解这个产品，和我一起确定要展示的功能、观众与场景。</div></section>
      <section class="home-process"><h3>从一句“我想展示一下”，到一段清楚的演示。</h3><ol>${[["认识产品","提供网址或 Repo，理解能力后再选展示内容与观众。"],["确认大纲","挑一个实际场景，列清楚先做什么、再做什么。"],["细化分镜","把业务步骤拆成镜头，确认操作、焦点与镜头动作。"],["预览与审片","在同一个页面等待制作、查看画面，按镜头提出修改。"]].map(([title,text],i)=>`<li><span>0${i+1}</span><div><h4>${title}</h4><p>${text}</p></div></li>`).join("")}</ol></section><div class="home-footnote">当前为 UI 原型：制作和产品理解使用标明的示例，不调用 AI，也不生成视频。插画只属于网站外壳。</div></div>`;
  }
  function understandingPage() {
    return `<div class="understanding-page"><header class="plain-page-heading"><div><span class="page-index">02 / UNDERSTAND</span><h2>先理解产品，再决定展示什么。</h2><p>这些问题可以在 Agent 里完成；这里演示信息怎样逐步确认，也可以导入已确认的方案。</p></div></header>
    <section class="intake-panel"><header><div><h3>先认识你的产品</h3></div>${button("import-plan","已有 Agent 方案","download","small")}</header>
    <p class="intake-description">提供网址或 Repo，任选一种，也可以同时提供。项目名称和故事不必现在就想好。</p>
    <div class="source-fields"><label class="field">产品网址<input data-home-field="url" maxlength="1000" placeholder="https://your-product.com" value="${esc(model.url)}"></label><label class="field">代码仓库 / 本机路径<input data-home-field="repo" maxlength="1000" placeholder="https://github.com/team/repo" value="${esc(model.repo)}"></label></div>
    <div class="intake-next"><small>原型不会访问输入地址、上传代码或调用 AI。</small>${button("understand-demo","查看示例理解结果","arrow","primary")}</div>
    ${model.discoveryStage !== "source" ? `<div class="understanding-results"><div class="sample-disclosure">固定示例：以下能力来自预置的业务表格场景，不是对输入地址的分析结果。</div><h3>这些能力，你想展示哪几个？</h3><div class="capability-picks">${capabilityOptions.map(([key,title,desc]) => `<button data-action="home-capability" data-capability="${key}" aria-pressed="${model.capabilities.includes(key)}"><span class="pick-check">${model.capabilities.includes(key) ? icon("check") : ""}</span><span><b>${title}</b><small>${desc}</small></span></button>`).join("")}</div>
    <label class="field">也可以自己补充<input data-home-field="customCapability" maxlength="300" placeholder="比如：最近新增的几项能力，或者 AI 漏掉的功能" value="${esc(model.customCapability)}"></label><div class="scope-options">${[["feature","聚焦一个功能"],["workflow","展示几个相关功能"],["overview","介绍整体产品"]].map(([key,label]) => `<button data-action="home-scope" data-scope="${key}" class="${model.scope===key?"selected":""}">${label}</button>`).join("")}</div>
    ${["audience","ready"].includes(model.discoveryStage) ? `<div class="audience-choice"><h3>这些内容是给谁看的？</h3><div class="audience-chips">${[["team","团队 / All Hands"],["leaders","老板 / LT Review"],["customers","客户 / Partner"],["unsure","还没想好"]].map(([key,label]) => `<button data-action="home-audience" data-audience="${key}" class="${model.audienceChoice===key?"selected":""}">${label}</button>`).join("")}</div><label class="field">补充观众的背景<input data-home-field="audience" maxlength="300" placeholder="例如：了解产品，但没看过新功能的合作伙伴" value="${esc(model.audience)}"></label>${button("home-outline","接着讨论场景大纲","arrow","primary")}</div>` : button("confirm-features","选好了，聊聊给谁看","arrow","primary")}</div>` : ""}
    </section><input id="plan-import" type="file" accept="application/json,.json" hidden></div>`;
  }
  function field(label, key, value, area = false, extra = "") {
    return `<label class="field">${label}${area ? `<textarea data-field="${key}" maxlength="1500" ${extra}>${esc(value)}</textarea>` : `<input data-field="${key}" value="${esc(value)}" maxlength="120" ${extra}>`}</label>`;
  }
  const capabilityOptions = [
    ["structure", "从一句需求生成结构", "先给出字段建议，再建立一张清楚的空表。", "layers"],
    ["dashboard", "把数据变成 Dashboard", "让数据进入后，展示指标、图表和业务洞察。", "chart"],
    ["agent", "用一句话继续调整", "在 Agent 中提出修改，右侧产品随之变化。", "message"],
    ["form", "用 Form 收集新数据", "填写、提交，并看到结果回到同一个系统。", "list"],
  ];
  function discoverySteps() {
    const steps = [["source", "给产品"], ["capabilities", "选重点"], ["scenario", "定例子"], ["draft", "聊方案"]];
    return `<div class="discovery-steps">${steps.map(([key, label], i) => `<button type="button" data-action="intake-jump" data-step="${key}" class="${intakeStep === key ? "current" : ""}"><em>${i + 1}</em>${label}</button>${i < steps.length - 1 ? "<i></i>" : ""}`).join("")}</div>`;
  }
  function guideMessage(text, note = "") {
    return `<div class="guide-message"><span class="guide-avatar">${icon("sparkle")}</span><div><b>ProductShot Director</b><p>${text}</p>${note ? `<small>${note}</small>` : ""}</div></div>`;
  }
  function syncDiscoveryDraft() {
    const templates = {
      structure: ["从一张空表开始", "table", 8, "先让观众看清系统建议了什么结构，而不是直接跳到完成状态。", "从一个还没有数据的结构开始，看清系统为业务准备了哪些字段。"],
      dashboard: ["让数据进入，再形成洞察", "data", 10, "数据进入后再展示 Dashboard，不让结果提前出现。", "当数据进入，零散记录开始变成可以行动的业务信息。"],
      agent: ["用一句话调整 Dashboard", "chart", 12, "先提出要求，再展示图表在原位生成和稳定结果。", "想换一种看法，只要告诉 Agent，新的视图就在原来的数据上出现。"],
      form: ["提交一张真实表单", "form", 9, "展示填写、提交和成功状态，证明操作确实完成。", "团队可以用一张简单表单，把新订单送回同一个工作流。"],
    };
    const existing = new Map(model.shots.filter((shot) => shot.kind !== "explain").map((shot) => [shot.kind, shot]));
    const keyKind = { structure: "table", dashboard: "data", agent: "chart", form: "form" };
    const next = model.capabilities.filter((key) => templates[key]).map((key) => {
      const [title, kind, seconds, purpose, narration] = templates[key];
      return existing.get(keyKind[key]) || makeShot(title, kind, seconds, purpose, narration);
    });
    if (story && next.length > 1) next.splice(Math.min(2, next.length), 0, model.shots.find((shot) => shot.kind === "explain") || makeShot("一份数据，连接整个业务", "explain", 6, "解释产品步骤之间的关系，再回到真实演示。", "这些能力不是互相独立的页面，而是同一条工作流。"));
    if (next.length) model.shots = next;
    model.scope = model.capabilities.length <= 1 ? "feature" : model.capabilities.length >= 4 ? "overview" : "workflow";
    const scenarioText = {
      workflow: "用一个从开始到结果的真实任务，把选中的能力连成一条完整工作流。",
      "before-after": "先展示原来的困难，再用选中的能力证明产品带来的改变。",
      showcase: "不虚构业务故事，用清楚、紧凑的顺序展示选中的能力。",
      custom: model.discoveryFeedback.trim() || "根据用户补充的例子，组织选中的能力与镜头。",
    };
    model.goal = scenarioText[model.scenarioChoice];
    const rules = [];
    if (model.constraints.includes("empty")) rules.push("先展示空状态，不让结果提前出现");
    if (model.constraints.includes("success")) rules.push("保留提交后的成功状态");
    if (model.constraints.includes("agent")) rules.push("保留 Agent 输入、执行和产品变化的完整因果");
    if (model.constraints.includes("no-story")) rules.push("不增加人物故事，只讲产品任务");
    model.notes = rules.join("；") || model.notes;
    selected = (model.shots.find((shot) => shot.kind === "chart") || model.shots[0]).id;
    time = startOf(selected);
    changed(true);
  }
  function briefPage() {
    let inner = "";
    if (intakeStep === "handoff") {
      const chosen = capabilityOptions.filter(([key]) => model.capabilities.includes(key));
      inner = `${guideMessage("前期讨论已经在你的 Agent 里完成。Studio 从一份经过确认的方案开始，不再要求你重新填写导演表单。", "下方是 product-demo-director Skill 交给网页的示例方案。")}
        <div class="discovery-card handoff-card"><div class="handoff-title"><div><span class="tag">PRODUCTSHOT PLAN · REV ${model.planRevision}</span><h3>${esc(model.name)}</h3><p>${esc(model.goal)}</p></div><span class="handoff-approved">${icon(model.approved ? "check" : "clock")} ${model.approved ? "故事与分镜已确认" : "方案有修改 · 需要重新确认"}</span></div>
        <div class="handoff-meta"><div><small>产品来源</small><b>${model.sourceType === "repo" ? "代码仓库" : "产品入口"}</b><span>${esc(model.url)}</span></div><div><small>目标观众</small><b>${esc(model.audience)}</b><span>录制授权将在制作阶段单独确认</span></div></div>
        <h3 style="margin-top:22px">这次要证明的能力</h3><div class="handoff-capabilities">${chosen.map(([, title]) => `<span>${icon("check")}${title}</span>`).join("")}${model.customCapability.trim() ? `<span>${icon("check")}${esc(model.customCapability)}</span>` : ""}</div>
        <h3 style="margin-top:22px">已经锁定的要求</h3><div class="constraint-chips">${[["empty", "必须从空状态开始"], ["success", "必须看到提交成功"], ["agent", "保留 Agent 对话过程"], ["no-story", "不要人物故事，只讲产品"]].filter(([key]) => model.constraints.includes(key)).map(([, label]) => `<span class="selected">${icon("lock")}${label}</span>`).join("") || "<span>尚无锁定要求</span>"}</div>
        <div class="idea-strip">${icon("lock")} <span><b>确认边界：</b>这里批准的是故事和镜头，不等于允许产品写入、付费生成或公开发布。网页会在相关步骤分别申请。</span></div></div>
        <div class="page-footer"><div class="row">${button("import-plan", "导入 Agent 方案", "download")}${button("show-intake", "查看 Skill 如何讨论出来", "message", "soft")}</div>${button("go-plan", "进入分镜与制作", "arrow", "primary")}</div>`;
    } else if (intakeStep === "source") {
      inner = `${guideMessage("先把产品给我。你不需要现在就想好视频名称、介绍范围或完整故事。", "正式版会先阅读授权内容；本原型不会访问你填写的地址。")}
        <div class="discovery-card"><h3>你现在能提供什么？</h3><div class="choice-grid two">${[["link", "产品链接", "已经能打开的网页或本地地址", "eye"], ["repo", "代码仓库", "用于理解新功能、实现和产品边界", "box"]].map(([key, title, desc, symbol]) => `<button type="button" data-action="source-type" data-source="${key}" class="choice-card ${model.sourceType === key ? "selected" : ""}">${icon(symbol)}<span><b>${title}</b><small>${desc}</small></span>${model.sourceType === key ? icon("check") : ""}</button>`).join("")}</div>
        <label class="field" style="margin-top:18px">${model.sourceType === "repo" ? "Repo 地址或本机路径" : "产品入口"}<input data-intake-field="url" value="${esc(model.url)}" maxlength="500" placeholder="${model.sourceType === "repo" ? "https://github.com/org/repo 或 C:\\project" : "https://your-product.example"}"></label>
        <h3 style="margin-top:22px">大概给谁看？</h3><div class="audience-chips">${[["team", "团队 / All Hands"], ["leaders", "老板 / LT Review"], ["customers", "客户 / Partner"], ["unsure", "还没想好"]].map(([key, label]) => `<button type="button" data-action="audience-choice" data-audience="${key}" class="${model.audienceChoice === key ? "selected" : ""}">${label}</button>`).join("")}</div></div>
        <div class="page-footer"><span>只需要一个入口和大概观众，其他内容由后续交互共同确定。</span>${button("intake-next", "看看可以展示什么", "arrow", "primary")}</div>`;
    } else if (intakeStep === "capabilities") {
      inner = `${guideMessage("假设我已经理解到下面这些能力。哪些是这次真的值得展示的？", "这是虚构产品的 UI 流程示例，不是对你填写入口的真实分析。")}
        <div class="discovery-card"><div class="discovery-card-head"><div><h3>产品能力候选</h3><p>可以多选，也可以补充我没有发现的内容。</p></div><span class="tag">理解结果 · 模拟</span></div><div class="choice-grid">${capabilityOptions.map(([key, title, desc, symbol]) => `<button type="button" data-action="capability" data-capability="${key}" class="choice-card ${model.capabilities.includes(key) ? "selected" : ""}">${icon(symbol)}<span><b>${title}</b><small>${desc}</small></span>${model.capabilities.includes(key) ? icon("check") : ""}</button>`).join("")}</div>
        <label class="field" style="margin-top:18px">还有一个我没发现、但你很想展示的能力<input data-intake-field="customCapability" value="${esc(model.customCapability)}" maxlength="300" placeholder="可以先写得很模糊，例如：我们刚做的几个新功能"></label></div>
        <div class="page-footer">${button("intake-back", "上一步", "back")}<div class="row"><span>已选择 ${model.capabilities.length} 项</span>${button("intake-next", "一起想一个展示例子", "arrow", "primary", model.capabilities.length ? "" : "disabled")}</div></div>`;
    } else if (intakeStep === "scenario") {
      const scenarios = [
        ["workflow", "用一个任务串起来", "例如从空表开始，让数据进入，再看 Dashboard 和 Form。", "推荐"],
        ["before-after", "先讲问题，再看改变", "先看到原来为什么麻烦，再用产品操作证明改变。", ""],
        ["showcase", "只秀能力，不编故事", "按理解顺序清楚展示新功能，适合短更新或内部汇报。", ""],
        ["custom", "我有自己的例子", "先说一个不完整的想法，我们再一起把它变成任务。", ""],
      ];
      inner = `${guideMessage("这些能力可以用不同方式来证明。你不用先知道“进销存”这样的完整例子，先选一个方向。")}
        <div class="discovery-card"><div class="choice-grid scenario-grid">${scenarios.map(([key, title, desc, badge]) => `<button type="button" data-action="scenario" data-scenario="${key}" class="choice-card ${model.scenarioChoice === key ? "selected" : ""}"><span><b>${title}${badge ? `<em>${badge}</em>` : ""}</b><small>${desc}</small></span>${model.scenarioChoice === key ? icon("check") : ""}</button>`).join("")}</div>
        ${model.scenarioChoice === "custom" ? `<label class="field" style="margin-top:18px">先讲讲你脑子里还不完整的例子<textarea data-intake-field="discoveryFeedback" maxlength="1000" placeholder="例如：我只知道想展示这几个新功能，还不知道用什么业务例子。">${esc(model.discoveryFeedback)}</textarea></label>` : ""}
        <div class="idea-strip">${icon("sparkle")} <span><b>Director 的建议：</b>${model.scenarioChoice === "showcase" ? "这次不强行编业务故事，用同一个示例数据保持镜头连续。" : model.scenarioChoice === "before-after" ? "先用零散表格交代问题，再用一条真实操作证明改变。" : model.scenarioChoice === "custom" ? "我会先从你模糊的想法里提取任务、起点和结果，再给你镜头草案。" : "用“从空结构到可运营系统”的任务，可以自然覆盖你选中的多个能力。"}</span></div></div>
        <div class="page-footer">${button("intake-back", "上一步", "back")}${button("intake-next", "生成可讨论的草案", "arrow", "primary")}</div>`;
    } else {
      const chosen = capabilityOptions.filter(([key]) => model.capabilities.includes(key));
      inner = `${guideMessage("我先整理成这版，不要求你一次认可。你只要指出哪里不对，我们继续掰扯。")}
        <div class="discovery-card"><div class="draft-head"><div><span class="tag">故事草案 · UI 模拟</span><h3>${model.scenarioChoice === "showcase" ? "用同一份示例数据，依次展示这些能力" : "从一个空白起点，到一个看得见的业务结果"}</h3></div>${button("intake-back", "换个展示例子", "undo", "small")}</div>
        <div class="draft-flow">${chosen.map(([key, title], i) => `<div class="draft-moment"><em>${String(i + 1).padStart(2, "0")}</em><span><b>${title}</b><small>${({ structure: "先看清起点和建议", dashboard: "让数据出现，再看洞察", agent: "先提出修改，再看结果", form: "填写、提交并保留成功状态" })[key]}</small></span></div>`).join("")}${model.customCapability.trim() ? `<div class="draft-moment"><em>${String(chosen.length + 1).padStart(2, "0")}</em><span><b>${esc(model.customCapability)}</b><small>用户补充，待继续确认怎样证明</small></span></div>` : ""}</div>
        <h3 style="margin-top:22px">哪些要求已经在你脑子里变清楚了？</h3><div class="constraint-chips">${[["empty", "必须从空状态开始"], ["success", "必须看到提交成功"], ["agent", "保留 Agent 对话过程"], ["no-story", "不要人物故事，只讲产品"]].map(([key, label]) => `<button type="button" data-action="constraint" data-constraint="${key}" class="${model.constraints.includes(key) ? "selected" : ""}">${model.constraints.includes(key) ? icon("check") : ""}${label}</button>`).join("")}</div>
        <label class="field" style="margin-top:18px">这版哪里不对？可以像聊天一样直接说<textarea data-intake-field="discoveryFeedback" maxlength="1000" placeholder="例如：不行，第一幕应该是一张空表；Dashboard 生成前要先看到我在左边输入要求。">${esc(model.discoveryFeedback)}</textarea></label>
        <div class="idea-strip">${icon("message")} <span>这段反馈会进入下一轮方案。正式版会由 Agent 根据反馈修订，而不是要求你填写导演字段。</span></div></div>
        <div class="page-footer">${button("restart-intake", "重新梳理", "undo")}<div class="row"><span>下一步仍可逐镜头修改</span>${button("accept-draft", "先按这版进入分镜", "arrow", "primary")}</div></div>`;
    }
    const handoff = intakeStep === "handoff";
    return `<section class="page-card discovery-page"><div class="section-intro"><h2>${handoff ? "从 Agent 里确认方案，再进入制作网页。" : "你先提供产品，我们一起把“展示什么”想清楚。"}</h2><p>${handoff ? "前期由 Skill 对话完成产品理解、例子建议和镜头确认；网页承接录制、编排与审片。" : "用户不需要先会写 brief。系统通过多轮选择、建议和反馈，逐渐形成可确认的故事与镜头。"}</p></div>${handoff ? '<div class="handoff-flow"><span>Agent / Skill</span><b>讨论与确认</b><i>→</i><span>ProductShot Studio</span><b>制作与审片</b></div>' : discoverySteps()}<div class="discovery-layout"><div class="guide-thread">${inner}</div><aside><div class="callout"><h3>${icon("message")} ${handoff ? "为什么拆成两段" : "对话承担的工作"}</h3><p>${handoff ? "Agent 已经有你的上下文，更适合多轮讨论和继续追问。" : "识别候选功能，而不是让用户先定义范围。"}</p><p>${handoff ? "网页适合承接画面、时间线、录制状态和审片反馈，不需要再模拟一套聊天。" : "提供两到三个可拍的例子，而不是要求用户自己发明故事。"}</p><p>${handoff ? "两边通过版本化方案交接，修改故事时回到 Agent，修改镜头效果时留在 Studio。" : "把“这里不对，应该先是空表”变成结构化约束和下一轮镜头。"}</p></div><div class="callout" style="margin-top:16px;background:#f1f8f5;border-color:#e0eee7;color:#82a08f"><h3 style="color:#648c78">确认是渐进的</h3><p>功能重点 → 展示例子 → 故事草案 → 逐镜头确认。用户随时可以回到上一轮，不会因为一次选择锁死方向。</p></div></aside></div><input id="plan-import" type="file" accept="application/json,.json" hidden></section>`;
  }
  function scenarioShots(scenario) {
    return scenario.shotIds.map((id) => model.shots.find((shot) => shot.id === id)).filter(Boolean);
  }
  function illustratedShot(shot) {
    const asset = { table: "structure", data: "data", chart: "insight", form: "collect", explain: "connect" }[shot.kind] || "connect";
    return `<img class="story-illustration" src="studio-art/${asset}.svg" alt="" width="340" height="200" draggable="false"><span class="illustration-label">场景插画 · 非产品画面</span>`;
  }
  function outlinePage() {
    const scene = model.scenarios.find((s) => s.id === activeScenario) || model.scenarios[0];
    activeScenario = scene.id;
    return `<section class="page-card plain-outline"><header class="plain-page-heading"><div><span class="page-index">03 / OUTLINE</span><h2>先定一个场景，再排清楚顺序。</h2><p>大纲只回答：在什么场景里，先做什么，再做什么。</p></div>${button("propose-outline","换一个大纲","layers","small")}</header>
      <div class="scenario-tabs">${model.scenarios.map((s,i)=>`<button data-action="select-scenario" data-id="${s.id}" class="${s.id===activeScenario?"active":""}">${i+1} · ${esc(s.title)}</button>`).join("")}${tiny("new-scenario","plus","添加场景")}</div>
      <div class="scenario-heading"><div><span class="page-index">SCENARIO ${model.scenarios.indexOf(scene)+1}</span><h2>${esc(scene.title)}</h2><p>${esc(scene.context)}</p></div><div class="row">${tiny("edit-scenario","settings","编辑场景")}${model.scenarios.length>1?tiny("remove-scenario","trash","删除场景"):""}</div></div>
      <ol class="outline-flow simple-steps">${scene.steps.map((step,i)=>`<li><span class="step-number">${String(i+1).padStart(2,"0")}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.purpose)}</p></div><div class="flow-actions">${tiny("outline-up","back","步骤前移",`data-id="${step.id}" ${i===0?"disabled":""}`)}${tiny("outline-down","arrow","步骤后移",`data-id="${step.id}" ${i===scene.steps.length-1?"disabled":""}`)}${tiny("edit-outline-step","settings","编辑步骤",`data-id="${step.id}"`)}${tiny("remove-outline-step","trash","删除步骤",`data-id="${step.id}" ${scene.steps.length<=1?"disabled":""}`)}</div></li>`).join("") || '<li class="empty">这个场景还没有步骤。可以自己添加。</li>'}</ol>
      <button class="outline-add" data-action="new-outline-step">${icon("plus")} 添加一项</button>
      <div class="outline-takeaway"><span>这段演示要说明</span><p>${esc(scene.outcome)}</p></div>
      <footer class="page-footer"><span class="outline-tab">${model.outlineApproved?"大纲已确认 · 示例":"大纲已修改，待确认"}</span>${button("confirm-outline",model.outlineApproved?"进入故事与分镜":"确认并保存大纲","arrow","primary")}</footer>
      <input id="plan-import" type="file" accept="application/json,.json" hidden></section>`;
  }
  function oldCanvasOutlinePage() {
    const scenario = model.scenarios.find((s) => s.id === activeScenario) || model.scenarios[0];
    activeScenario = scenario.id;
    const shots = scenarioShots(scenario);
    const focused = shots.find((s) => s.id === selected) || shots[0];
    if (focused) selected = focused.id;
    const rail = `<aside class="scene-rail"><header><strong>项目结构</strong>${tiny("new-scenario", "plus", "添加场景")}</header><div class="rail-project">${icon("box")} 产品演示 <span>${model.scenarios.length}</span></div><div class="rail-scenes">${model.scenarios.map((s, i) => `<button data-action="select-scenario" data-id="${s.id}" class="${s.id === activeScenario ? "selected" : ""}"><span>${String(i + 1).padStart(2, "0")}</span><b>${esc(s.title)}</b><small>${scenarioShots(s).length}</small></button>`).join("")}</div><div class="rail-section-label">场景步骤</div>${shots.map((s, i) => `<button class="rail-step ${s.id === selected ? "selected" : ""}" data-action="focus-outline" data-id="${s.id}">${icon(s.kind === "explain" ? "sparkle" : "film")}<span>${String(i + 1).padStart(2, "0")} &nbsp; ${esc(s.title)}</span></button>`).join("")}<button class="rail-add" data-action="new-outline-step">${icon("plus")} 添加步骤</button><div class="rail-source"><span>方案来源</span><b>Agent / product-demo-director</b><small>大纲可修改 · 示例方案</small>${button("import-plan", "导入方案", "download", "small")}</div></aside>`;
    const cards = `<ol class="outline-flow board-cards">${shots.map((s, i) => `<li class="${s.id === selected ? "focused" : ""}"><button class="board-shot" data-action="focus-outline" data-id="${s.id}" aria-pressed="${s.id === selected}"><div class="board-shot-label"><span>${String(i + 1).padStart(2, "0")}</span><b>${s.kind === "explain" ? "讲解" : "产品操作"}</b>${s.id === selected ? icon("check") : ""}</div><div class="board-shot-art">${design === "canvas" ? illustratedShot(s) : thumbnail(s)}</div><h3>${esc(s.title)}</h3><p>${esc(s.purpose)}</p></button><div class="flow-actions">${tiny("outline-up", "back", "步骤前移", `data-id="${s.id}" ${i === 0 ? "disabled" : ""}`)}${tiny("outline-down", "arrow", "步骤后移", `data-id="${s.id}" ${i === shots.length - 1 ? "disabled" : ""}`)}<span>步骤 ${i + 1}</span>${tiny("edit-outline-step", "settings", "编辑步骤", `data-id="${s.id}"`)}${tiny("remove-outline-step", "trash", "删除步骤", `data-id="${s.id}" ${model.shots.length <= 1 ? "disabled" : ""}`)}</div></li>`).join("")}</ol>`;
    const screen = focused ? `<div class="outline-monitor"><div class="monitor-toolbar"><span>当前步骤 / ${esc(focused.title)}</span><span>界面示意 · 非实拍</span></div><div class="preview-stage bg-${model.background}">${previewHTML(focused)}</div><div class="monitor-controls">${button("edit-shot", "进入动态预览", "play", "small", `data-id="${focused.id}"`)}<span>先确认顺序，再细化拍法</span>${icon("eye")}</div></div>` : '<div class="empty">这个场景还没有步骤，点击添加开始。</div>';
    const welcome = design === "canvas" ? `<div class="illustrated-welcome"><div class="welcome-copy"><span class="welcome-eyebrow">YOUR STORY, IN THE MAKING</span><h2>让好产品，<br>有个好故事。</h2><p>把想法排成一条清楚的路。<br>从一个场景开始，让每一步都值得被看见。</p><a href="#scenario-board" class="welcome-link">看看这次怎么讲 ${icon("arrow")}</a></div><img src="studio-art/story-garden.svg" alt="原创插画：一位创作者把画面整理成连贯的故事" width="480" height="300"></div>
      <div class="illustrated-scenarios" aria-label="选择场景"><span>当前故事</span><div>${model.scenarios.map((s, i) => `<button type="button" data-action="select-scenario" data-id="${s.id}" aria-pressed="${s.id === activeScenario}">${String(i + 1).padStart(2, "0")} <b>${esc(s.title)}</b></button>`).join("")}${tiny("new-scenario", "plus", "添加场景")}</div></div>` : "";
    return `<section class="outline-sheet canvas-workspace">${design === "director" ? rail : ""}${welcome}<div class="canvas-center" id="scenario-board">
      <header class="canvas-toolbar"><div><span class="status-dot ${model.outlineApproved ? "confirmed" : ""}"></span><strong>场景大纲</strong><span class="outline-tab">${model.outlineApproved ? "已确认 · 示例" : "待确认修改"}</span></div><div class="row">${design === "canvas" ? tiny("import-plan", "download", "导入 Agent 方案") : ""}${button("propose-outline", "比较大纲", "layers", "small")}${tiny("edit-scenario", "settings", "编辑场景")}${model.scenarios.length > 1 ? tiny("remove-scenario", "trash", "删除场景") : ""}</div></header>
      <div class="canvas-scroll"><div class="canvas-paper" style="--board-zoom:${canvasZoom / 100}"><div class="scenario-heading"><div><span class="page-index">SCENE ${String(model.scenarios.indexOf(scenario) + 1).padStart(2, "0")}</span><h2>${esc(scenario.title)}</h2><p>${esc(scenario.context)}</p></div><span class="scenario-count">${shots.length} 步</span></div>
        ${design === "director" ? screen : ""}
        <div class="board-label"><strong>${design === "director" ? "镜头顺序" : "从这里开始，走向一个清楚的结果"}</strong><span>点击步骤编辑</span></div>${cards}
        ${!shots.length ? '<p class="empty">添加第一个步骤，开始编排场景。</p>' : ""}
        <button class="outline-add" data-action="new-outline-step">${icon("plus")} 添加步骤</button>
        ${design === "canvas" ? `<div class="board-outcome"><span>最终结果</span><p>${esc(scenario.outcome)}</p></div>` : ""}
      </div></div>
      <div class="canvas-bottom"><span>${model.scenarios.indexOf(scenario) + 1} / ${model.scenarios.length} 个场景</span><div class="zoom-controls">${button("canvas-zoom-out", "−", "", "small", canvasZoom <= 70 ? "disabled" : "")}<output aria-label="画板缩放">${canvasZoom}%</output>${button("canvas-zoom-in", "+", "", "small", canvasZoom >= 120 ? "disabled" : "")}${button("canvas-fit", "适应画布", "", "small")}</div></div>
    </div><aside class="outline-properties"><div class="properties-title"><strong>步骤说明</strong><span>${focused ? String(shots.indexOf(focused) + 1).padStart(2, "0") : "—"}</span></div>
      ${focused ? `<div class="property-summary"><span class="property-label">选中步骤</span><h3>${esc(focused.title)}</h3><p>${esc(focused.purpose)}</p>${button("edit-outline-step", "修改这一步", "settings", "small", `data-id="${focused.id}"`)}</div><div class="property-group"><span class="property-label">画面重点</span><p>${esc(focused.direction.highlight || "下一步在分镜中确认。")}</p>${button("direction-from-outline", "细化拍摄说明", "arrow", "small", `data-id="${focused.id}"`)}</div>` : '<div class="property-group">添加步骤后可查看和修改。</div>'}
      <div class="property-group"><span class="property-label">目标观众</span><p>${esc(model.audience)}</p><span class="property-label">不能丢的要求</span><p>${esc(model.notes || "暂无附加要求")}</p></div>
      <details class="property-source"><summary>产品来源与制作边界</summary><p>${esc(model.url)}</p><p>虚构示例画面。确认大纲不授予录制、产品写入或公开发布权限。</p></details>
      <div class="property-confirm">${button("confirm-outline", model.outlineApproved ? "进入故事与分镜" : "确认并保存大纲", "arrow", "primary")}<small>后续修改仍需重新确认</small></div>
    </aside></section><input id="plan-import" type="file" accept="application/json,.json" hidden>`;
  }
  function legacyOutlinePage() {
    const scenario = model.scenarios.find((s) => s.id === activeScenario) || model.scenarios[0];
    activeScenario = scenario.id;
    const shots = scenarioShots(scenario);
    return `<section class="outline-sheet">
      <header class="outline-toolbar"><div class="outline-tab"><span class="status-dot ${model.outlineApproved ? "confirmed" : ""}"></span>${model.outlineApproved ? "已确认大纲 · 示例" : "大纲草案 · 有未确认修改"}</div><div class="row">${button("import-plan", "导入 Agent 方案", "download", "small")}${button("propose-outline", "比较其他大纲", "layers", "small")}</div></header>
      <div class="outline-layout"><div class="outline-document">
        <div class="outline-kicker">THE OUTLINE <span>先把一件事讲清楚。</span></div>
        <div class="scenario-tabs" aria-label="场景列表">${model.scenarios.map((s, i) => `<button data-action="select-scenario" data-id="${s.id}" class="${s.id === activeScenario ? "active" : ""}" aria-pressed="${s.id === activeScenario}">${String(i + 1).padStart(2, "0")} <span>${esc(s.title)}</span></button>`).join("")}<button data-action="new-scenario" aria-label="添加场景">${icon("plus")}</button></div>
        <div class="scenario-heading"><div><div class="outline-counter">SCENARIO ${String(model.scenarios.indexOf(scenario) + 1).padStart(2, "0")}</div><h2>${esc(scenario.title)}</h2><p>${esc(scenario.context)}</p></div><div class="row">${tiny("edit-scenario", "settings", "编辑场景")}${model.scenarios.length > 1 ? tiny("remove-scenario", "trash", "删除场景") : ""}</div></div>
        <div class="outline-flow-label"><span>演示顺序</span><span>${shots.length} 个步骤 · 可调整</span></div>
        <ol class="outline-flow">${shots.map((s, i) => `<li><span class="flow-number">${String(i + 1).padStart(2, "0")}</span><div class="flow-copy"><h3>${esc(s.title)}</h3><p>${esc(s.purpose)}</p><span class="flow-kind">${s.kind === "explain" ? "讲解示意" : "产品操作 · 待实拍"}</span></div><div class="flow-actions">${tiny("outline-up", "back", "步骤前移", `data-id="${s.id}" ${i === 0 ? "disabled" : ""}`)}${tiny("outline-down", "arrow", "步骤后移", `data-id="${s.id}" ${i === shots.length - 1 ? "disabled" : ""}`)}${tiny("edit-outline-step", "settings", "编辑步骤", `data-id="${s.id}"`)}${tiny("remove-outline-step", "trash", "删除步骤", `data-id="${s.id}" ${model.shots.length <= 1 ? "disabled" : ""}`)}</div></li>`).join("") || '<li class="empty">还没有步骤。先添加要展示的操作。</li>'}</ol>
        <button class="outline-add" data-action="new-outline-step">${icon("plus")} 添加一个步骤</button>
        <div class="outline-ending"><span>观众最后应该明白</span><p>${esc(scenario.outcome)}</p></div>
      </div><aside class="outline-aside">
        <div class="outline-art" aria-label="大纲示意：表格、数据与结果相连"><span class="art-label">FROM AN IDEA<br>TO SOMETHING REAL.</span><div class="art-plane plane-back"><i></i><i></i><i></i><i></i></div><div class="art-plane plane-front"><span>WORKFLOW</span><div class="art-chart"><i></i><i></i><i></i><i></i><i></i></div><b>One connected story.</b></div><span class="art-caption">场景概念图 · 非产品截图</span></div>
        <section class="outline-facts"><h3>这一版的方向</h3><dl><dt>给谁看</dt><dd>${esc(model.audience)}</dd><dt>产品来源</dt><dd class="source-wrap">${esc(model.url)}</dd><dt>展示方式</dt><dd>${({ workflow: "一个任务，串起几项能力", "before-after": "先看问题，再看改变", showcase: "同一场景，分别证明功能", custom: "自定义场景" })[model.scenarioChoice]}</dd></dl></section>
        <section class="outline-facts"><h3>已经说好的细节</h3><p class="outline-constraints">${esc(model.notes || "暂无补充要求；可在场景和分镜中继续讨论。")}</p></section>
        <div class="outline-aside-note">大纲由 Agent 提议，你在这里选、改、确认。镜头怎么动，下一步再细化。</div>
      </aside></div>
      <footer class="outline-bottom"><span>本页编辑会保存在浏览器，不会启动录制。</span>${button("confirm-outline", model.outlineApproved ? "进入故事与分镜" : "确认并保存大纲", "arrow", "primary")}</footer>
    </section><input id="plan-import" type="file" accept="application/json,.json" hidden>`;
  }
  function directionEditor(s) {
    return `<details class="direction-details"><summary>展开拍摄说明 <span>操作 · 高亮 · 运镜 · 衔接</span>${icon("down")}</summary><div class="direction-grid">${directionFields.map(([key, label, hint]) => `<label class="field">${label}<small>${hint}</small><textarea data-direction="${key}" data-id="${esc(s.id)}" maxlength="2000" rows="${["actions", "camera", "motion"].includes(key) ? 4 : 3}">${esc(s.direction[key])}</textarea></label>`).join("")}</div><p class="direction-note">这是可修改的拍摄意图，不会自动执行。目标坐标、动效时长和音画时间在排练后确定。</p></details>`;
  }
  function planPage() {
    return `<section class="page-card"><div class="section-intro"><span class="page-index">04 / STORYBOARD</span><h2>把一个步骤，拆成可以拍的镜头。</h2><p>例如“用 Form 收集订单”可拆成：打开表单 → 填写字段 → 点击确认。这里只编辑拍摄说明，不放装饰插画或伪造截图。</p></div>
      ${!model.outlineApproved ? `<div class="outline-warning">大纲有未确认修改。请先${button("go-brief", "回到大纲确认", "", "small")}，再确认拍摄方案。</div>` : ""}
      ${model.scenarios.map((scene)=>`<section class="scenario-storyboard"><div class="storyboard-scenario">${esc(scene.title)}</div>${scene.steps.map((step,i)=>`<section class="step-storyboard"><header><div><span>大纲步骤 ${i+1}</span><h3>${esc(step.title)}</h3></div>${button("new-shot","添加分镜","plus","small",`data-step="${step.id}"`)}</header><div class="plan-list">${step.shotIds.map((id,j)=> {
        const s=model.shots.find((item)=>item.id===id);
        return `<article class="plan-card"><span class="plan-number">${i+1}.${j+1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.purpose)}</p><span class="tag">${s.sourceContract ? `导入来源：${esc(s.sourceContract.sourceType || s.sourceContract.kind)}` : s.kind==="explain"?"讲解素材 · 待制作":"产品操作 · 待录制"} · 节奏待排练</span></div><div class="row">${tiny("move-up","back","分镜前移",`data-id="${s.id}" ${j===0?"disabled":""}`)}${tiny("move-down","arrow","分镜后移",`data-id="${s.id}" ${j===step.shotIds.length-1?"disabled":""}`)}${tiny("edit-shot-text","settings","编辑镜头",`data-id="${s.id}"`)}${tiny("delete-plan-shot","trash","删除镜头",`data-id="${s.id}"`)}</div>${directionEditor(s)}</article>`;
      }).join("") || '<p class="empty">还没有分镜。由 Agent 或你继续把这个步骤拆清楚；不会自动用一个标题冒充镜头。</p>'}</div></section>`).join("")}</section>`).join("")}
      <div class="page-footer">${button("go-brief", "回到大纲", "back")}<div class="row"><span id="plan-approval-status">${model.approved ? "示例分镜已确认" : "拍摄说明修改后，需要重新确认"}</span>${button("approve", model.approved ? "进入预览与审片" : "确认拍摄方案", "check", "primary", !model.outlineApproved ? "disabled" : "")}</div></div></section>`;
  }
  function capturePage() {
    const titles = ["检查产品入口与权限", "准备镜头起始状态", "排练操作与结果验证", "连续录制与动作时间标记", "保存原片和镜头工程"];
    const index = Math.min(4, Math.floor(captureProgress / 20));
    return `<section class="page-card"><div class="section-intro"><h2>先排练，再把操作连续拍下来。</h2><p>正式录制会执行真实操作。本页仅模拟任务进度，不打开网站或写入数据。</p></div><div class="capture-grid"><div class="capture-stage">${icon("record")}<h3>${captureStatus === "done" ? "模拟制作流程已完成" : captureStatus === "running" ? "正在演示制作流程…" : "为一次顺畅的演示做准备"}</h3><p>${captureStatus === "done" ? "可以进入审片查看示例画面。没有新录制文件被创建。" : "后端接入后，这里会显示浏览器状态、实际步骤、失败原因和录制结果。"}</p>
      ${captureStatus === "running" ? button("cancel-capture", "停止模拟", "", "") : button("start-capture", captureStatus === "done" ? "重新体验模拟流程" : "开始模拟排练与录制", "play", "primary", model.approved ? "" : "disabled")}
      ${!model.approved ? '<p>请先在“故事与分镜”确认示例方案。</p>' : ""}<div class="progress-bar"><div style="width:${captureProgress}%"></div></div><p>${captureProgress}% · 模拟进度</p></div>
      <div>${titles.map((title, i) => `<div class="capture-check ${captureProgress >= (i + 1) * 20 ? "done" : captureStatus === "running" && i === index ? "active" : ""}"><span class="check-circle">${captureProgress >= (i + 1) * 20 ? icon("check") : i + 1}</span>${title}</div>`).join("")}<div class="callout" style="margin-top:20px"><h3>真实执行的边界</h3><p>在正式版中，登录、创建数据和重复提交都需要授权；排练也可能产生写入。失败的操作不能被渲染成成功演示。</p></div></div></div>
      <div class="page-footer">${button("go-plan", "回到分镜", "back")}${button("go-review", "查看示例预览", "arrow", "soft")}</div></section>`;
  }
  function reviewPage() {
    if (!model.shots.length) return `<section class="page-card"><div class="section-intro"><h2>还没有可预览的镜头</h2><p>大纲可以先确定，镜头与素材在后续制作中补充。</p></div>${button("go-plan","回到故事与分镜","back","primary")}</section>`;
    if (!model.shots.some((s)=>s.id===selected)) selected=model.shots[0].id;
    return `<div class="review-page"><header class="review-heading"><div><span class="page-index">05 / REVIEW</span><h2>看画面，逐镜修改。</h2></div><div class="row">${story ? button("review-audio","旁白与声音","audio","small") : ""}${button("go-plan","回到分镜","layers","small")}</div></header>
      <div class="render-banner"><div><b>${captureStatus==="running"?"正在模拟制作…":captureStatus==="done"?"模拟制作完成":"制作与预览在这里衔接"}</b><p>${captureStatus==="running"?`${captureProgress}% · 模拟进度，不执行真实录制`:"当前展示的是预置示例画面，没有生成或录制新视频。"}</p></div>${captureStatus==="running"?button("cancel-capture","取消","","small"):button("start-capture",captureStatus==="done"?"重新模拟制作":"体验制作进度","play","small",model.approved?"":"disabled")}<div class="progress-bar"><div style="width:${captureProgress}%"></div></div></div>
      ${story && productionTab==="audio"?`<div class="audio-drawer">${button("close-audio","收起声音设置","back","small")}${audioPage()}</div>`:""}
      <div class="simple-review-grid"><section class="panel review-screen"><div class="preview-header"><strong>画面预览</strong><div class="right"><span>16:9</span><span>·</span><span>示例素材</span>${tiny("fullscreen", "eye", "放大预览")}</div></div>
      <div class="preview-stage bg-${model.background}" id="preview-stage">${previewHTML(currentShot())}</div>
      <div class="preview-controls"><button class="play-btn" data-action="play" aria-label="${playing ? "暂停预览" : "播放预览"}">${icon(playing ? "pause" : "play")}</button><span class="timecode" id="timecode">${stamp(time)} / ${stamp(total())}</span><input type="range" id="playhead" aria-label="预览时间线" min="0" max="${total()}" step="0.05" value="${time}">${tiny("rewind", "undo", "回到开头")}</div>
      <div class="preview-status"><span>素材示意 · 不包含网站外壳插画</span><span>${story ? "声音可在上方单独设置" : "当前版本不含声音"}</span></div></section>
      <aside class="panel inspector">${inspector()}</aside><div class="single-sequence">${timeline()}</div></div></div>`;
  }
  function previewHTML(s) {
    if (s.kind === "explain") return `<div class="flow-scene"><h2>一份数据，三个入口。</h2><p>不再在不同工具之间，重复搬运信息。</p><div class="flow-nodes">${[["list", "表格"], ["chart", "Dashboard"], ["message", "Form"]].map(([symbol, label], i) => `${i ? '<span class="flow-arrow">→</span>' : ""}<div class="flow-node">${icon(symbol)}${label}</div>`).join("")}</div></div><div class="preview-watermark">概念讲解 · 示例动画，非已生成素材</div>${story && model.captions ? `<div class="play-caption"><span>${esc(s.narration)}</span></div>` : ""}`;
    let screen = "";
    if (s.kind === "chart") {
      screen = `<h3>Inventory overview</h3><p class="product-caption">One clear picture of your business</p><div class="metric-cards"><div class="metric-card">Total products<b>128</b></div><div class="metric-card">Orders this week<b>36</b></div><div class="metric-card">Low stock<b>4</b></div></div><div class="chart-bars">${[38, 55, 42, 69, 52, 80, 65, 91].map((n, i) => `<i data-height="${n}" style="height:${n}%;animation-delay:${i * .1}s"></i>`).join("")}</div>`;
    } else if (s.kind === "form") {
      screen = `<h3>New sales order</h3><p class="product-caption">Bring every order into the same workflow</p><div class="mock-form"><div>Customer · Northstar Market</div><div>Product · Organic oat milk</div><div>Quantity · 12</div><div class="mock-submit">Submit order</div><div class="success">✓ 示例成功状态 · 非实际提交</div></div>`;
    } else {
      const rows = s.kind === "table" ? [] : [["Organic oat milk", "Beverages", "128", "In stock"], ["Sourdough bread", "Bakery", "36", "In stock"], ["Sparkling water", "Beverages", "64", "In stock"], ["Avocado", "Produce", "12", "Low stock"], ["Greek yogurt", "Dairy", "48", "In stock"]];
      screen = `<h3>${s.kind === "table" ? "Your inventory, structured." : "Product inventory"}</h3><p class="product-caption">${s.kind === "table" ? "A clean starting point for your team" : "Keep your products, orders and stock connected"}</p><div class="product-tools"><span>▦ Grid view &nbsp; / &nbsp; All products</span><span>+ Add record</span></div><table class="data-table"><thead><tr><th style="width:35%">Product</th><th>Category</th><th>Stock</th><th>Status</th></tr></thead><tbody>${rows.map((r) => `<tr>${r.map((v, i) => `<td>${i === 3 ? `<span class="stock">${v}</span>` : v}</td>`).join("")}</tr>`).join("")}${!rows.length ? '<tr><td colspan="4" style="text-align:center;padding:35px;color:#b1b4c3">No records yet. Your structure is ready.</td></tr>' : ""}</tbody></table>`;
    }
    return `<div class="demo-browser" style="--zoom:${s.zoom};--fx:${s.focusX}%;--fy:${s.focusY}%"><div class="browser-top"><i class="traffic"></i><i class="traffic"></i><i class="traffic"></i><span class="browser-address">northstar.example / workspace</span></div><div class="product-body"><div class="product-nav"><div class="product-logo"><b>◈</b> Northstar</div><p>Workspace</p><p class="${s.kind === "table" || s.kind === "data" ? "chosen" : ""}">▦ Products</p><p>↗ Purchase orders</p><p>↙ Sales orders</p><p class="${s.kind === "chart" ? "chosen" : ""}">▥ Dashboard</p><p class="${s.kind === "form" ? "chosen" : ""}">▤ Forms</p></div><div class="product-content">${screen}${s.highlight ? '<div class="product-highlight"></div>' : ""}${s.cursor ? '<div class="demo-cursor"><svg viewBox="0 0 24 31"><path d="M2 2L2 25L8 19L13 29L18 27L13 17L22 17Z" fill="white" stroke="#564567" stroke-width="1.4"/></svg></div>' : ""}</div></div></div><div class="preview-watermark">示例界面 · 非真实产品录屏</div>${story && model.captions ? `<div class="play-caption"><span>${esc(s.narration)}</span></div>` : ""}`;
  }
  function inspector() {
    const s = currentShot();
    return `<div class="inspector-tabs"><button data-action="inspector-effects" class="${inspectorTab === "effects" ? "selected" : ""}">镜头设置</button><button data-action="inspector-comments" class="${inspectorTab === "comments" ? "selected" : ""}">审片反馈 <span>${model.comments.filter((c) => !c.resolved).length || ""}</span></button></div>
      ${inspectorTab === "comments" ? commentsHTML() : `
      <section class="inspector-section"><h3>当前镜头 <span class="tag">SCENE ${String(model.shots.indexOf(s) + 1).padStart(2, "0")}</span></h3>
      <label class="field">镜头名称<input data-shot-field="title" value="${esc(s.title)}" maxlength="60"></label>
      <label class="field">表达目的<textarea data-shot-field="purpose" maxlength="500">${esc(s.purpose)}</textarea></label>
      <div class="row"><label class="field">素材时长 / s<input type="number" data-shot-field="duration" min="3" max="30" step="1" value="${s.duration}"></label><label class="field">播放速度<select data-shot-field="speed">${[.75, 1, 1.5, 2].map((n) => `<option value="${n}" ${s.speed === n ? "selected" : ""}>${n}×</option>`).join("")}</select></label></div></section>
      <section class="inspector-section"><h3>运镜与焦点 ${icon("settings")}</h3><div class="range-label"><span>缩放倍率</span><b id="zoom-label">${s.zoom.toFixed(2)}×</b></div><input type="range" data-shot-field="zoom" aria-label="缩放倍率" min="1" max="2" step=".05" value="${s.zoom}" ${s.kind === "explain" ? "disabled" : ""}>
      <div class="range-label" style="margin-top:14px"><span>水平焦点</span><b id="focusX-label">${s.focusX}%</b></div><input type="range" data-shot-field="focusX" aria-label="水平焦点" min="0" max="100" step="1" value="${s.focusX}" ${s.kind === "explain" ? "disabled" : ""}>
      <label class="switch-label">重点高亮<input type="checkbox" data-shot-field="highlight" ${s.highlight ? "checked" : ""} ${s.kind === "explain" ? "disabled" : ""}></label><label class="switch-label">演示光标<input type="checkbox" data-shot-field="cursor" ${s.cursor ? "checked" : ""} ${s.kind === "explain" ? "disabled" : ""}></label></section>
      <section class="inspector-section"><h3>画布背景</h3><div class="swatches">${["lavender", "mint", "blue"].map((bg) => `<button type="button" class="swatch ${model.background === bg ? "selected" : ""}" data-action="background" data-bg="${bg}" aria-label="${({ lavender: "薰衣草", mint: "薄荷", blue: "晴空" })[bg]}背景" aria-pressed="${model.background === bg}"></button>`).join("")}</div><div class="row" style="margin-top:16px">${button("duplicate-shot", "复制", "copy", "small")}${button("delete-shot", "移除", "trash", "small", model.shots.length <= 1 ? "disabled" : "")}</div></section>
      <div class="inspector-note">${s.kind === "explain" ? "讲解镜头展示关系，不作为真实产品能力证据。" : "这里改变的是示例预览。正式版将保留原录、动作轨迹与独立效果层。"}</div>`}`;
  }
  function commentsHTML() {
    return `<section class="inspector-section" style="grid-column:1/-1"><h3>把反馈留在这一刻 <span class="tag">${stamp(time)}</span></h3><p style="font-size:10px;color:#a19aaa;line-height:1.8">关联当前镜头和时间点，不丢掉之前确认的要求。</p><div class="feedback-box"><textarea id="feedback-text" aria-label="审片反馈" maxlength="500" placeholder="例如：这里的结果多停留两秒，其他镜头不变。"></textarea>${button("add-comment", "添加反馈", "plus", "soft small")}</div><div class="feedback-list">${model.comments.map((c) => `<article class="feedback-item ${c.resolved ? "resolved" : ""}"><header><span>${esc(c.time)} · ${esc(c.shot)}</span><button data-action="resolve-comment" data-id="${c.id}">${c.resolved ? "重开" : "解决"}</button></header>${esc(c.text)}</article>`).join("") || '<p class="empty">还没有反馈。<br>好的修改，从清楚的问题开始。</p>'}</div></section>`;
  }
  function wave(cls = "") { return `<div class="wave-track ${cls}">${Array.from({ length: 160 }, (_, i) => `<i style="height:${4 + ((i * 7 + i % 3 * 11) % 18)}px"></i>`).join("")}</div>`; }
  function timeline() {
    return `<section class="panel timeline"><div class="timeline-toolbar"><strong>时间线 <span class="tag" style="margin-left:7px">轻量编排</span></strong><div class="row">${icon("clock")} ${stamp(total())}<span>·</span>点击片段定位</div></div><div class="timeline-body"><div class="time-ruler">${Array.from({ length: 6 }, (_, i) => `<span>${stamp(total() * i / 5)}</span>`).join("")}</div><div class="track"><span class="track-label">${icon("film")} 画面</span><div class="track-content">${model.shots.map((s, i) => `<button type="button" data-action="select-shot" data-id="${s.id}" class="timeline-clip ${s.id === selected ? "active" : ""} ${s.kind === "explain" ? "explain" : ""}" style="flex:${duration(s)}" title="${esc(s.title)}">${String(i + 1).padStart(2, "0")} ${esc(s.title)}<small>${duration(s).toFixed(1)}s</small></button>`).join("")}</div></div>
      <div class="timeline-footer"><span>在底部选择镜头，在右侧修改。${story ? "声音由上方按钮单独展开。" : ""}</span><span>示例时长 · 非实际素材</span></div></div></section>`;
  }
  function audioPage() {
    return `<section class="page-card"><div class="section-intro"><h2>不只是念字幕，而是把产品讲清楚。</h2><p>编辑每幕旁白。试听使用浏览器系统语音，不代表最终配音质量；不会调用付费 TTS。</p></div><div class="audio-grid"><div>${model.shots.map((s, i) => `<article class="script-card"><div class="script-card-header"><span>SCENE ${String(i + 1).padStart(2, "0")} · ${esc(s.title)}</span><span>${duration(s).toFixed(1)}s</span></div><textarea data-narration="${s.id}" aria-label="${esc(s.title)}旁白" maxlength="240">${esc(s.narration)}</textarea><div style="margin-top:9px">${button("speak-shot", "系统语音试听", "play", "small", `data-id="${s.id}"`)}</div></article>`).join("")}</div><aside><div class="callout"><h3>选择讲解的语气</h3><p>保持相同文案，先比较演绎方式。正式版会提供声线与短句试听审批。</p>${[["calm", "清楚 · 从容", "适合功能讲解与内部汇报"], ["warm", "自然 · 轻快", "适合故事串场与产品介绍"]].map(([key, title, subtitle]) => `<label class="voice-option"><input type="radio" name="voice" value="${key}" ${model.voice === key ? "checked" : ""}><div><strong>${title}</strong><p>${subtitle}</p></div></label>`).join("")}</div>
      <div class="inspector-section" style="border:1px solid var(--line);border-radius:11px;margin-top:16px"><h3>声音与字幕</h3><div class="range-label"><span>试听音量</span><b id="volume-label">${model.volume}%</b></div><input type="range" data-audio="volume" aria-label="试听音量" min="0" max="100" value="${model.volume}"><label class="switch-label">显示字幕<input type="checkbox" data-audio="captions" ${model.captions ? "checked" : ""}></label><label class="switch-label">背景音乐轨道 · 示意<input type="checkbox" data-audio="music" ${model.music ? "checked" : ""}></label><div class="range-label" style="margin-top:12px"><span>音乐音量 · 方案参数</span><b id="musicVolume-label">${model.musicVolume}%</b></div><input type="range" data-audio="musicVolume" aria-label="音乐音量参数" min="0" max="100" value="${model.musicVolume}"><p style="font-size:9px;color:#a29aaa;margin-top:12px;line-height:1.8">音乐尚未加载，不会播放。系统试听不生成音频文件，也未自动校准镜头时长。</p>${button("stop-speech", "停止试听", "pause", "small", 'style="margin-top:12px"')}</div></aside></div><div class="page-footer"><span>正式版：语义事件、旁白、字幕和镜头使用统一时间映射。</span>${button("go-review", "回到完整预览", "arrow", "primary")}</div></section>`;
  }
  function explainPage() {
    return `<section class="page-card"><div class="section-intro"><h2>让操作之间，多一层理解。</h2><p>讲解镜头负责“为什么”和“如何关联”，真实 Demo 负责证明。这里只演示镜头插入与编排。</p></div><div class="explain-cards">${[
      ["数据关系", "把表格、仪表盘、表单连接起来，说明同一份数据的不同入口。", "list"],
      ["问题与改变", "用同一组元素从零散到有序，解释产品解决了什么问题。", "sparkle"],
      ["从操作到结果", "承接上一幕的对象，把它带进下一步，避免生硬换页。", "arrow"],
    ].map(([title, desc, symbol]) => `<article class="explain-card"><div class="explain-art"><div class="mini-flow"><i></i>${icon(symbol)}<i></i>${icon("arrow")}<i></i></div></div><h3>${title}</h3><p>${desc}</p>${button("insert-explain", "插入讲解镜头", "plus", "soft", `data-title="${title}"`)}</article>`).join("")}</div><div class="callout" style="margin-top:22px"><h3>先设计表达，再选择制作工具。</h3><p>本版呈现轻量 HTML 讲解的产品形态。Blender、AI 生视频和精细三维制作属于后续能力，没有在本原型中接入。三个入口目前共用关系动画示意，不代表已实现三套生成模板。</p></div><div class="page-footer"><span>新增镜头后，分镜需要重新确认。</span>${button("go-review", "查看镜头编排", "arrow", "primary")}</div></section>`;
  }
  function render() { document.getElementById("app").innerHTML = shell(); }
  function refreshEditedView() {
    const projectTitle = document.querySelector(".wb-project h1");
    if (projectTitle) projectTitle.textContent = model.name;
    const projectMeta = document.querySelector(".wb-project>span");
    if (projectMeta) projectMeta.innerHTML = `v${model.planRevision} <i></i> 本机自动保存`;
    const heading = document.querySelector(".project-heading h1");
    if (heading) heading.innerHTML = `${esc(model.name)} <span class="pill">${model.approved ? "分镜已确认 · 模拟" : "示例项目 · 可编辑"}</span>`;
    const summary = document.querySelector(".project-sub");
    if (summary) summary.innerHTML = `${esc(model.audience)}<span>·</span>${model.shots.length} 个镜头<span>·</span>${stamp(total())}<span>·</span>16:9 / 1080p 设计目标`;
    const track = document.querySelector(".timeline");
    if (track) track.outerHTML = timeline();
    document.querySelectorAll(".shot").forEach((element) => {
      const shot = model.shots.find((s) => s.id === element.dataset.id);
      if (!shot) return;
      element.querySelector(".shot-title").textContent = shot.title;
      element.querySelector(".shot-top span:last-child").textContent = `${duration(shot).toFixed(1)}s`;
    });
    const clock = document.getElementById("timecode");
    if (clock) clock.textContent = `${stamp(time)} / ${stamp(total())}`;
    const playhead = document.getElementById("playhead");
    if (playhead) { playhead.max = String(total()); playhead.value = String(time); }
    const play = document.querySelector('[data-action="play"]');
    if (play) { play.innerHTML = icon("play"); play.setAttribute("aria-label", "播放预览"); }
    updatePreview();
  }
  function updatePreview() {
    const stage = document.getElementById("preview-stage");
    if (stage) { stage.className = `preview-stage bg-${model.background}`; stage.innerHTML = previewHTML(currentShot()); }
  }
  function setShot(id, seek = true) { halt(); selected = id; if (seek) time = startOf(id); render(); }
  function tick(now) {
    if (!playing) return;
    time = Math.min(total(), time + (now - lastTick) / 1000);
    lastTick = now;
    const active = shotAt(time);
    if (active.id !== selected) {
      selected = active.id;
      render();
    }
    const progress = (time - startOf(selected)) / duration(currentShot());
    const browser = document.querySelector(".demo-browser");
    if (browser) {
      const envelope = Math.min(1, progress * 5, (1 - progress) * 5);
      const smooth = Math.max(0, envelope) ** 2 * (3 - 2 * Math.max(0, envelope));
      browser.style.setProperty("--zoom", String(1 + (currentShot().zoom - 1) * smooth));
      const cursor = browser.querySelector(".demo-cursor");
      if (cursor) { cursor.style.left = `${48 + Math.sin(progress * Math.PI) * 26}%`; cursor.style.top = `${48 + progress * 14}%`; }
      browser.querySelectorAll(".chart-bars i").forEach((bar) => { bar.style.height = `${Number(bar.dataset.height) * Math.min(1, progress * 3)}%`; });
    }
    document.querySelectorAll(".flow-node").forEach((node, i) => { node.style.setProperty("--node-offset", `${Math.sin(progress * Math.PI * 2 + i) * 7}px`); });
    const slider = document.getElementById("playhead");
    if (slider) slider.value = String(time);
    const clock = document.getElementById("timecode");
    if (clock) clock.textContent = `${stamp(time)} / ${stamp(total())}`;
    if (time >= total()) { halt(); render(); return; }
    raf = requestAnimationFrame(tick);
  }
  function importApprovedPlan(raw) {
    if (!raw || raw.format !== "productshot-plan" || raw.version !== 1 || raw.status !== "approved") throw new Error("只接受已批准的 productshot-plan v1");
    if (!Number.isInteger(raw.revision) || raw.revision < 1) throw new Error("方案 revision 无效");
    if (!raw.project || typeof raw.project.name !== "string" || !raw.project.name.trim() || raw.project.name.length > 100) throw new Error("项目名称无效");
    if (!raw.project.source || !["url", "repo", "recording", "mixed"].includes(raw.project.source.type) || typeof raw.project.source.value !== "string" || raw.project.source.value.length > 1000) throw new Error("产品来源无效");
    if (!raw.project.audience || typeof raw.project.audience.label !== "string" || raw.project.audience.label.length > 120) throw new Error("目标观众无效");
    if (!Array.isArray(raw.capabilities) || !raw.capabilities.length || raw.capabilities.length > 12) throw new Error("能力清单需要 1–12 项");
    if (!raw.capabilities.every((capability) => capability && typeof capability.id === "string" &&
      typeof capability.title === "string" && capability.title.length <= 300)) throw new Error("能力条目需要有效的 ID 和标题");
    if (!Array.isArray(raw.shots) || !raw.shots.length || raw.shots.length > 24) throw new Error("镜头需要 1–24 项");
    if (new Set(raw.shots.map((shot) => shot?.id)).size !== raw.shots.length) throw new Error("镜头 ID 不能重复");
    const inferKind = (shot) => {
      if (shot.kind === "explanation") return "explain";
      const text = `${shot.title || ""} ${shot.purpose || ""}`.toLowerCase();
      if (/dashboard|chart|图表|仪表盘/.test(text)) return "chart";
      if (/form|表单|submit|提交/.test(text)) return "form";
      if (/empty|structure|table|空表|结构/.test(text)) return "table";
      return "data";
    };
    const shots = raw.shots.map((shot) => {
      if (!shot || typeof shot.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(shot.id) || typeof shot.title !== "string" || !shot.title.trim() || shot.title.length > 100 ||
        typeof shot.purpose !== "string" || shot.purpose.length > 1000 || !["product", "explanation", "generated", "mixed"].includes(shot.kind) ||
        (shot.estimatedSeconds !== undefined && (!Number.isFinite(shot.estimatedSeconds) || shot.estimatedSeconds < 2 || shot.estimatedSeconds > 30))) throw new Error("镜头字段无效");
      if (shot.direction !== undefined && (!shot.direction || !directionFields.every(([key]) =>
        typeof shot.direction[key] === "string" && shot.direction[key].trim() && shot.direction[key].length <= 2000))) throw new Error("拍摄说明需要完整的十项文本字段");
      const kind = inferKind(shot);
      const legacy = {
        before: shot.before, actions: shot.action, after: shot.after,
        highlight: shot.focus, camera: "", motion: "", hold: "",
        transition: shot.transition, verify: Array.isArray(shot.evidence) ? shot.evidence.join("\n") : "",
        mustKeep: Array.isArray(shot.mustKeep) ? shot.mustKeep.join("\n") : "",
      };
      return {
        id: shot.id, title: shot.title.trim().slice(0, 60), kind, duration: Math.max(3, shot.estimatedSeconds ?? 8),
        purpose: shot.purpose.trim().slice(0, 500), narration: typeof shot.sound === "string" ? shot.sound.slice(0, 240) : "",
        zoom: 1.15, focusX: 65, focusY: 45, highlight: kind !== "explain", cursor: kind !== "explain", speed: 1,
        direction: Object.fromEntries(directionFields.map(([key]) => [key, shot.direction?.[key] ?? (typeof legacy[key] === "string" ? legacy[key].slice(0, 2000) : "")])),
        sourceContract: structuredClone(shot),
      };
    });
    model.name = raw.project.name.trim();
    model.url = raw.project.source.value.trim();
    model.sourceType = raw.project.source.type === "repo" ? "repo" : "link";
    model.audience = raw.project.audience.label.trim();
    model.audienceChoice = ["team", "leaders", "customers", "unsure"].includes(raw.project.audience.id) ? raw.project.audience.id : "unsure";
    model.capabilities = raw.capabilities.map((capability) => capability?.id).filter((id) => ["structure", "dashboard", "agent", "form"].includes(id));
    model.customCapability = raw.capabilities.filter((capability) => !["structure", "dashboard", "agent", "form"].includes(capability?.id)).map((capability) => capability?.title).filter((title) => typeof title === "string").join("；").slice(0, 300);
    model.scenarioChoice = ["workflow", "before-after", "showcase", "custom"].includes(raw.scenario?.type) ? raw.scenario.type : "custom";
    model.goal = typeof raw.scenario?.summary === "string" ? raw.scenario.summary.slice(0, 2000) : "";
    model.notes = Array.isArray(raw.constraints) ? raw.constraints.map((item) => item?.text).filter((text) => typeof text === "string").join("；").slice(0, 4000) : "";
    model.constraints = [];
    if (/空|empty/i.test(model.notes)) model.constraints.push("empty");
    if (/成功|success|submit/i.test(model.notes)) model.constraints.push("success");
    if (/agent|对话|composer/i.test(model.notes)) model.constraints.push("agent");
    if (/不要人物|no character|只讲产品/i.test(model.notes)) model.constraints.push("no-story");
    model.shots = shots; model.approved = shots.every((s) => directionFields.every(([key]) => s.direction[key].trim())); model.handoffImported = true; model.planRevision = raw.revision;
    model.importedPlan = structuredClone(raw);
    model.outlineApproved = true;
    model.scenarios = [{ id: uid(), title: typeof raw.scenario?.summary === "string" ? raw.scenario.summary.slice(0, 120) : raw.project.name,
      context: typeof raw.scenario?.reason === "string" ? raw.scenario.reason.slice(0, 2000) : model.goal,
      outcome: typeof raw.story?.takeaway === "string" ? raw.story.takeaway.slice(0, 2000) : "待补充观众应理解的结果", shotIds: shots.map((s) => s.id) }];
    ensureSteps(model.scenarios[0]);
    activeScenario = model.scenarios[0].id;
    model.comments = []; selected = model.shots[0].id; time = 0; intakeStep = "handoff"; view = "brief";
    model.flowReached=Math.max(model.flowReached,3);
    checkpoint("brief",model.scenarios);
    appendChat("director","已导入方案。产品来源和逐镜拍摄说明已保留，未授予产品写入或公开发布权限。");
    persist();
  }
  function modal(title, body, actions) {
    const dialog = document.getElementById("dialog");
    dialog.innerHTML = `<h2 id="dialog-title">${title}</h2>${body}<div class="dialog-actions">${button("close-dialog", "关闭", "")}${actions || ""}</div>`;
    dialog.showModal();
  }
  function addShot(kind = "data", title = "新的产品镜头") {
    if (model.shots.length >= 24) { toast("原型最多支持 24 个镜头。"); return; }
    const step = stepForShot(selected) || allSteps()[0];
    if (!step) { toast("请先在大纲中添加一个步骤。"); return; }
    const shot = makeShot(title, kind, 6, kind === "explain" ? "解释前后镜头的关系，再回到产品操作。" : "说明这一幕的操作、焦点和可见结果。", kind === "explain" ? "同一份数据，让每一个环节自然连接。" : "在这里填写这一幕的讲解。");
    const i = model.shots.findIndex((s) => s.id === selected);
    step.shotIds.splice(Math.max(0,step.shotIds.indexOf(selected)+1),0,shot.id);
    model.shots.splice(i + 1, 0, shot); selected = shot.id; time = startOf(selected);
    changed(true); view = "review"; halt(); render(); toast("已在当前步骤添加分镜。请补充表达目的，并重新确认拍摄方案。");
  }
  document.addEventListener("click", async (event) => {
    const target = event.target.closest("button[data-action],button[data-view]");
    if (!target || target.disabled) return;
    if (target.dataset.view) { navigate(target.dataset.view); return; }
    const action = target.dataset.action;
    if(action==="start-flow"){model.flowReached=Math.max(1,model.flowReached);checkpoint("home",{accepted:true});appendChat("director","我们先认识产品。可以在右边提供网址或 Repo，也可以在左边选择“填写产品链接 / Repo”后发送。");persist();navigate("understand");return;}
    if(action==="browse-example"){model.flowReached=4;persist();toast("已开放所有示例阶段供评审，不代表大纲或分镜获得批准。");render();return;}
    if(action==="discard-chat"){pendingChat=null;render();return;}
    if(action==="apply-chat"){
      if(!pendingChat){toast("没有待应用的修改。");return;}
      const p=pendingChat;
      if(p.revision!==model.planRevision){pendingChat=null;render();toast("方案已在右侧发生变化，请重新发送这项修改，避免覆盖。");return;}
      if(p.mode==="source"){
        if(/^https?:\/\//i.test(p.text))model.url=p.text;else model.repo=p.text;
        model.discoveryStage="source";model.outlineApproved=false;
      }else if(p.mode==="step-add"){
        if(allSteps().length>=24){toast("最多24个业务步骤。");return;}
        const scene=model.scenarios.find((s)=>s.id===p.target);
        if(!scene){toast("场景已不存在，请重新选择。");return;}
        scene.steps.push({id:uid(),title:p.text.slice(0,60),purpose:"由对话补充，具体目的和拍法待确认。",shotIds:[]});model.outlineApproved=false;
      }else if(p.mode==="step-title"){
        const step=stepById(p.target);if(!step){toast("步骤已不存在，请重新选择。");return;}
        step.title=p.text.slice(0,60);model.outlineApproved=false;
      }else{
        const shot=model.shots.find((s)=>s.id===p.target);if(!shot){toast("镜头已不存在，请重新选择。");return;}
        if(p.mode==="caption")shot.narration=p.text.slice(0,240);
        else shot.direction[p.mode]=p.text;
      }
      appendChat("director",`已应用到右侧：${p.label}。受影响的方案需要重新确认，其他内容保留。`);
      pendingChat=null;changed(true);render();return;
    }
    if(action==="review-audio"){halt();productionTab="audio";render();return;}
    if(action==="close-audio"){productionTab="capture";if("speechSynthesis" in window)speechSynthesis.cancel();render();return;}
    if(action==="copy-skill"){
      try{await navigator.clipboard.writeText("使用 product-demo-director，先理解这个产品，和我一起确定展示功能、观众、场景大纲与逐镜拍摄说明。");toast("已复制调用语。在你的 Agent 中使用；本页没有启动 Agent。");}
      catch{toast("浏览器不允许复制，请选择首页中的 Skill 调用语手动复制。");}return;
    }
    if (action === "production-tab") { productionTab = target.dataset.tab; halt(); render(); return; }
    if (action === "understand-demo") {
      if (!model.url.trim() && !model.repo.trim()) { toast("请提供产品网址或 Repo，至少一个即可。"); return; }
      model.discoveryStage = "features"; changed(true); render(); return;
    }
    if (action === "home-capability") {
      const key = target.dataset.capability;
      model.capabilities = model.capabilities.includes(key) ? model.capabilities.filter((s)=>s!==key) : model.scope === "feature" ? [key] : [...model.capabilities,key];
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "home-scope") {
      model.scope = target.dataset.scope;
      if (model.scope === "feature") model.capabilities = model.capabilities.slice(0,1);
      if (model.scope === "overview") model.capabilities = capabilityOptions.map(([key])=>key);
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "confirm-features") {
      if (!model.capabilities.length && !model.customCapability.trim()) { toast("请选择功能或写下你想展示的能力。"); return; }
      model.discoveryStage = "audience"; changed(true); render(); return;
    }
    if (action === "home-audience") {
      model.audienceChoice = target.dataset.audience;
      model.audience = ({team:"内部团队 · All Hands",leaders:"管理层 · LT Review",customers:"客户 / Partner",unsure:"目标观众待确认"})[model.audienceChoice];
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "home-outline") {
      if (!model.capabilities.length && !model.customCapability.trim()) { toast("请先选择或补充功能。"); return; }
      if (!model.audience.trim() || model.audienceChoice === "unsure") { toast("请先选择观众，或在文本框写下具体的观众背景。"); return; }
      if (!confirm("用所选能力建立一份示例大纲？当前大纲和分镜会保留为上一版快照。这里没有调用真实 AI。")) return;
      model.outlineBackup = structuredClone({ scenarios:model.scenarios,shots:model.shots,scenarioChoice:model.scenarioChoice,approved:model.approved,outlineApproved:model.outlineApproved });
      const seed = defaults(), scene = seed.scenarios[0];
      scene.steps = scene.steps.filter((step,i)=> {
        const keys = ["structure","data","dashboard","form"];
        return keys[i] === "data" ? model.capabilities.includes("dashboard") : model.capabilities.includes(keys[i]);
      });
      if (model.capabilities.includes("agent")) {
        const s = makeShot("提出修改并核对结果","chart",8,"通过 Agent 请求修改图表，并核对实际响应。","");
        s.direction.actions = "在 Agent 输入框发送修改请求；等待产品执行；核对图表变化。";
        seed.shots.push(s); scene.steps.push({id:uid(),title:"用 Agent 调整业务视图",purpose:"在同一业务场景中展示自然语言修改能力。",shotIds:[s.id]});
      }
      if(model.customCapability.trim()) scene.steps.push({id:uid(),title:model.customCapability.slice(0,60),purpose:"用户补充能力；需要进一步确认真实实现和展示方式。",shotIds:[]});
      const used=new Set(scene.steps.flatMap((s)=>s.shotIds));
      model.shots=seed.shots.filter((s)=>used.has(s.id)); model.scenarios=[scene];
      activeScenario=scene.id; selected=model.shots[0]?.id || ""; time=0;
      model.discoveryStage="ready"; model.outlineApproved=false; model.flowReached=Math.max(2,model.flowReached);
      checkpoint("understand",{url:model.url,repo:model.repo,capabilities:model.capabilities,customCapability:model.customCapability,audience:model.audience,scope:model.scope});
      appendChat("director","展示方向已保存。右边出现的是一份待确认的示例大纲，可以换场景、加减步骤；还没有开始录制。");
      changed(true); navigate("brief"); return;
    }
    if (action === "new-shot" || action === "edit-shot-text") {
      if(action==="new-shot" && model.shots.length>=24){toast("最多支持24个镜头。");return;}
      const s=action==="new-shot"?{title:"",purpose:""}:model.shots.find((s)=>s.id===target.dataset.id);
      modal(action==="new-shot"?"把这一步拆成镜头":"修改镜头说明",`<p>一镜只讲清一个动作或结果，例如“打开表单”。此处不自动生成素材。</p><label class="field">镜头名称<input id="shot-title" maxlength="60" value="${esc(s.title)}"></label><label class="field">这个镜头要说明什么<textarea id="shot-purpose" maxlength="500">${esc(s.purpose)}</textarea></label>`,button("save-plan-shot","保存镜头","check","primary",`data-step="${target.dataset.step || ""}" data-id="${target.dataset.id || ""}"`));return;
    }
    if(action==="save-plan-shot"){
      const title=document.getElementById("shot-title").value.trim(),purpose=document.getElementById("shot-purpose").value.trim();
      if(!title || !purpose){toast("请填写镜头名称与表达目的。");return;}
      if(target.dataset.id) Object.assign(model.shots.find((s)=>s.id===target.dataset.id),{title,purpose});
      else {
        const step=stepById(target.dataset.step);
        if(!step){toast("步骤不存在，请重新打开。");return;}
        const s=makeShot(title,"data",8,purpose,"");s.direction=Object.fromEntries(directionFields.map(([key])=>[key,""]));
        model.shots.push(s);step.shotIds.push(s.id);selected=s.id;
      }
      changed(true);render();return;
    }
    if(action==="delete-plan-shot"){
      if(!confirm("移除这一镜？大纲中的业务步骤保留。"))return;
      model.shots=model.shots.filter((s)=>s.id!==target.dataset.id);
      if(selected===target.dataset.id)selected=model.shots[0]?.id || "";
      changed(true);render();return;
    }
    if (action === "focus-outline") { halt(); selected = target.dataset.id; time = startOf(selected); render(); return; }
    if (action === "direction-from-outline") {
      selected = target.dataset.id; navigate("plan");
      const editor = [...document.querySelectorAll(".plan-card")].find((el) => el.querySelector(`[data-direction][data-id="${CSS.escape(selected)}"]`));
      if (editor) { editor.querySelector("details").open = true; editor.scrollIntoView({ block: "start" }); }
      return;
    }
    if (action.startsWith("canvas-")) {
      canvasZoom = action === "canvas-fit" ? 100 : Math.max(70, Math.min(120, canvasZoom + (action === "canvas-zoom-in" ? 10 : -10)));
      render(); return;
    }
    if (action === "icon-options") {
      modal("三个原创标识方向", `<p>保持同一套功能，只比较标识在真实工作台里的辨识度。图形没有使用参考产品的 Logo。</p><div class="mark-options">${[["frame","取景","用取景框表达捕捉与聚焦"],["cut","剪接","用错位片段表达编排与制作"],["path","路径","用连续的 P 表达从想法到成片"]].map(([key,title,desc]) => `<button data-action="select-mark" data-mark="${key}" aria-pressed="${mark===key}">${markSVG(key)}<b>${title}</b><span>${desc}</span></button>`).join("")}</div><p>当前标识：${mark}。选择后链接会保留这一设置。</p>`, ""); return;
    }
    if (action === "select-mark") {
      mark = target.dataset.mark;
      const url = new URL(location.href); url.searchParams.set("mark",mark); url.searchParams.set("design",design);
      history.replaceState(null,"",url); render(); return;
    }
    if (action.startsWith("go-")) { navigate(action.slice(3)); return; }
    if (action === "select-scenario") { activeScenario = target.dataset.id; render(); return; }
    if (action === "remove-scenario") {
      if (model.scenarios.length <= 1) { toast("至少保留一个场景。"); return; }
      const scene = model.scenarios.find((s) => s.id === activeScenario);
      if (!confirm("删除这个场景及其步骤和分镜？审片反馈仍会保留。")) return;
      model.shots = model.shots.filter((s) => !scene.shotIds.includes(s.id));
      model.scenarios = model.scenarios.filter((s) => s.id !== activeScenario);
      activeScenario = model.scenarios[0].id; selected = model.shots[0]?.id || ""; time = 0;
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "confirm-outline") {
      if (model.scenarios.some((s) => !s.steps.length)) { toast("每个场景至少需要一个步骤。"); return; }
      model.outlineApproved = true;model.flowReached=Math.max(3,model.flowReached);
      checkpoint("brief",model.scenarios);
      appendChat("director","大纲已保存。现在逐步骤细化分镜；同一个业务步骤可以拆成多个镜头。");
      persist(); navigate("plan"); return;
    }
    if (action === "edit-scenario" || action === "new-scenario") {
      if (action === "new-scenario" && model.scenarios.length >= 8) { toast("原型最多支持 8 个场景。"); return; }
      const s = action === "new-scenario" ? { title: "", context: "", outcome: "" } : model.scenarios.find((s) => s.id === activeScenario);
      modal(action === "new-scenario" ? "添加一个场景" : "修改这个场景",
        `<p>写清楚这是谁的场景、要做什么，以及希望观众最后理解什么。</p><label class="field">场景名称<input id="scenario-title" maxlength="120" value="${esc(s.title)}"></label><label class="field">场景描述<textarea id="scenario-context" maxlength="2000">${esc(s.context)}</textarea></label><label class="field">最终理解<textarea id="scenario-outcome" maxlength="2000">${esc(s.outcome)}</textarea></label>`,
        button("save-scenario", "保存场景", "check", "primary", `data-new="${action === "new-scenario"}"`)); return;
    }
    if (action === "save-scenario") {
      const title = document.getElementById("scenario-title").value.trim();
      const context = document.getElementById("scenario-context").value.trim();
      const outcome = document.getElementById("scenario-outcome").value.trim();
      if (!title || !context || !outcome) { toast("请补充场景名称、描述和最终理解。"); return; }
      if (target.dataset.new === "true") {
        const scene = { id: uid(), title, context, outcome, steps: [], shotIds: [] };
        model.scenarios.push(scene); activeScenario = scene.id;
      } else Object.assign(model.scenarios.find((s) => s.id === activeScenario), { title, context, outcome });
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "new-outline-step" || action === "edit-outline-step") {
      if (action === "new-outline-step" && allSteps().length >= 24) { toast("原型最多支持 24 个步骤。"); return; }
      const shot = action === "new-outline-step" ? { title: "", purpose: "" } : stepById(target.dataset.id);
      modal(action === "new-outline-step" ? "添加下一步" : "修改这一步",
        `<p>先说明做什么、证明什么。具体镜头动作在分镜中细化。</p><label class="field">步骤名称<input id="step-title" maxlength="60" value="${esc(shot.title)}"></label><label class="field">具体流程<textarea id="step-purpose" maxlength="500">${esc(shot.purpose)}</textarea></label>`,
        button("save-outline-step", "保存步骤", "check", "primary", `data-id="${esc(target.dataset.id || "")}"`)); return;
    }
    if (action === "save-outline-step") {
      const title = document.getElementById("step-title").value.trim(), purpose = document.getElementById("step-purpose").value.trim();
      if (!title || !purpose) { toast("请写下这一步做什么、证明什么。"); return; }
      if (target.dataset.id) Object.assign(stepById(target.dataset.id), { title, purpose });
      else {
        const scene = model.scenarios.find((s) => s.id === activeScenario);
        scene.steps.push({ id: uid(), title, purpose, shotIds: [] });
      }
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "outline-up" || action === "outline-down") {
      const scene = model.scenarios.find((s) => s.id === activeScenario);
      const ids = scene.steps.map((s) => s.id), index = ids.indexOf(target.dataset.id);
      const next = index + (action === "outline-up" ? -1 : 1);
      if (next < 0 || next >= ids.length) { toast("步骤已经位于边界。"); return; }
      [scene.steps[index], scene.steps[next]] = [scene.steps[next], scene.steps[index]];
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "remove-outline-step") {
      const scene = model.scenarios.find((s) => s.id === activeScenario);
      if (scene.steps.length <= 1) { toast("至少保留一个步骤。"); return; }
      if (!confirm("删除这一步及对应分镜？已有审片反馈仍会保留。")) return;
      const step = stepById(target.dataset.id);
      model.shots = model.shots.filter((s) => !step.shotIds.includes(s.id));
      scene.steps = scene.steps.filter((s)=>s.id!==step.id);
      if (step.shotIds.includes(selected)) selected = model.shots[0]?.id || "";
      model.outlineApproved = false; changed(true); render(); return;
    }
    if (action === "propose-outline") {
      modal("一个产品，可以有不同讲法。",
        `<p>以下是预置大纲选项，不是实时 AI 输出。选择后会替换当前大纲，旧方案保留为可恢复快照。</p>
        <div class="outline-options">${[
          ["workflow", "01", "小超市的进销存", "从 0 建表 → 经营数据进入 → Dashboard → Form 收集订单。"],
          ["showcase", "02", "团队项目管理", "整理项目数据 → Dashboard 看进度 → Form 收集新任务。"],
          ["before-after", "03", "客户反馈收集", "建立反馈表 → 收集反馈 → 查看分类统计 → 跟进处理结果。"],
        ].map(([key, n, title, desc]) => `<button data-action="use-outline" data-mode="${key}"><span>${n}</span><div><b>${title}</b><p>${desc}</p></div>${icon("arrow")}</button>`).join("")}</div><p>都不适合？关闭后可直接编辑场景，增删步骤，写你自己的例子。</p>`,
        model.outlineBackup ? button("restore-outline", "恢复上一个大纲", "undo", "soft") : ""); return;
    }
    if (action === "use-outline") {
      if (!confirm("切换会替换当前镜头与拍摄说明。上一个大纲会保留为快照，是否继续？")) return;
      model.outlineBackup = structuredClone({ scenarios: model.scenarios, shots: model.shots, scenarioChoice: model.scenarioChoice, approved: model.approved, outlineApproved: model.outlineApproved });
      const mode = target.dataset.mode;
      const seed = defaults();
      const scene=seed.scenarios[0];
      if(mode==="showcase"){
        scene.title="团队项目管理";scene.context="围绕同一组项目记录，查看进度并收集新任务。";scene.outcome="理解数据、统计与收集如何支撑团队协作。";
        scene.steps=scene.steps.slice(1);
        ["整理项目数据","Dashboard 查看进度","Form 收集新任务"].forEach((name,i)=>{scene.steps[i].title=name;scene.steps[i].purpose="围绕项目管理完成这一步；具体数据和拍法待确认。";scene.steps[i].shotIds=[];});
      } else if(mode==="before-after"){
        scene.title="客户反馈收集";scene.context="用反馈处理流程展示表格、收集和统计能力。";scene.outcome="从反馈收集到处理结果，能追踪每一步。";
        ["建立反馈表","收集反馈","查看分类统计","跟进处理结果"].forEach((name,i)=>{scene.steps[i].title=name;scene.steps[i].purpose="这一环节的真实操作与结果待进一步确认。";scene.steps[i].shotIds=[];});
      }
      model.shots=mode==="workflow"?seed.shots:[];
      model.scenarioChoice = mode;
      model.scenarios=[scene];
      activeScenario = scene.id; selected = model.shots[0]?.id || ""; time = 0;
      model.outlineApproved = false; changed(true); render(); toast("已切换预置大纲。请修改并确认；上一个方案可以恢复。"); return;
    }
    if (action === "restore-outline" && model.outlineBackup) {
      const restored = model.outlineBackup; delete model.outlineBackup;
      Object.assign(model, restored); model.planRevision += 1;
      activeScenario = model.scenarios[0].id; selected = model.shots[0]?.id || ""; time = 0; reconcileScenarios(); persist(); render(); return;
    }
    if (action === "source-type") { model.sourceType = target.dataset.source; changed(true); render(); return; }
    if (action === "audience-choice") {
      model.audienceChoice = target.dataset.audience;
      model.audience = ({ team: "内部团队 · All Hands", leaders: "管理层 · LT Review", customers: "客户与合作伙伴", unsure: "目标观众待确认" })[model.audienceChoice];
      changed(true); render(); return;
    }
    if (action === "capability") {
      const key = target.dataset.capability;
      model.capabilities = model.capabilities.includes(key) ? model.capabilities.filter((item) => item !== key) : [...model.capabilities, key];
      changed(true); render(); return;
    }
    if (action === "scenario") { model.scenarioChoice = target.dataset.scenario; changed(true); render(); return; }
    if (action === "constraint") {
      const key = target.dataset.constraint;
      model.constraints = model.constraints.includes(key) ? model.constraints.filter((item) => item !== key) : [...model.constraints, key];
      changed(true); render(); return;
    }
    if (action === "intake-next" || action === "intake-back") {
      const order = ["source", "capabilities", "scenario", "draft"];
      if (action === "intake-next" && intakeStep === "source" && !model.url.trim()) { toast("先提供一个产品入口、Repo 地址或本机路径。"); return; }
      if (action === "intake-next" && intakeStep === "capabilities" && !model.capabilities.length) { toast("至少选择一个想讨论的能力，或者补充一个新的能力。"); return; }
      intakeStep = order[Math.max(0, Math.min(order.length - 1, order.indexOf(intakeStep) + (action === "intake-next" ? 1 : -1)))];
      if (intakeStep === "draft") syncDiscoveryDraft();
      render();
      if (intakeStep === "capabilities") toast("这是交互流程的模拟结果：当前页面没有访问或分析你填写的产品。");
      return;
    }
    if (action === "intake-jump") {
      const order = ["source", "capabilities", "scenario", "draft"];
      const requested = order.indexOf(target.dataset.step);
      const current = order.indexOf(intakeStep);
      if (requested > current) { toast("按顺序完成这一轮，后面的方案才有依据。"); return; }
      intakeStep = target.dataset.step; render(); return;
    }
    if (action === "restart-intake") { intakeStep = "source"; model.approved = false; persist(); render(); return; }
    if (action === "show-intake") { intakeStep = "source"; render(); return; }
    if (action === "import-plan") { document.getElementById("plan-import").click(); return; }
    if (action === "accept-draft") {
      syncDiscoveryDraft(); model.approved = true; model.handoffImported = true; model.planRevision += 1; persist(); view = "plan"; render();
      toast("已把讨论结果作为新 revision 交给 Studio。逐幕修改会使方案重新进入待确认状态。");
      return;
    }
    if (action === "select-shot" || action === "edit-shot") { view = "review"; setShot(target.dataset.id); return; }
    if (action === "play") { if (playing) { halt(); render(); } else { if (time >= total()) time = 0; selected = shotAt(time).id; playing = true; lastTick = performance.now(); render(); raf = requestAnimationFrame(tick); } return; }
    if (action === "rewind") { halt(); selected = model.shots[0].id; time = 0; render(); return; }
    if (action === "background") { model.background = target.dataset.bg; changed(); halt(); render(); return; }
    if (action === "scope") { model.scope = target.dataset.scope; changed(true); render(); return; }
    if (action === "approve") {
      if (!model.outlineApproved) { toast("请先确认大纲。"); return; }
      if(!model.shots.length || allSteps().some((step)=>!step.shotIds.length)){toast("每个业务步骤都需要继续拆成分镜，再确认拍摄方案。");return;}
      if (model.shots.some((s) => directionFields.some(([key]) => !s.direction[key].trim()))) { toast("拍摄说明尚未完整。请补齐各幕的操作、高亮、镜头路径和验证方式；不需要填写秒数。"); return; }
      model.approved = true;model.flowReached=4;productionTab="capture";
      checkpoint("plan",model.shots);
      appendChat("director","拍摄方案已保存。接下来在同一页体验制作进度、预览和反馈，不另开制作台。");
      changed(); navigate("review"); toast("示例分镜已确认。下一步只模拟制作，不执行产品操作。"); return;
    }
    if (action === "add-shot") { addShot(); return; }
    if (action === "insert-explain") { addShot("explain", target.dataset.title); return; }
    if (action === "move-up" || action === "move-down") {
      const step=stepForShot(target.dataset.id);
      const i = step.shotIds.indexOf(target.dataset.id);
      const next = i + (action === "move-up" ? -1 : 1);
      if (next < 0 || next >= step.shotIds.length) { toast("这个镜头已经在本步骤的边界位置。"); return; }
      [step.shotIds[i], step.shotIds[next]] = [step.shotIds[next], step.shotIds[i]];
      time = startOf(selected); changed(true); render(); return;
    }
    if (action === "duplicate-shot") {
      if (model.shots.length >= 24) { toast("原型最多支持 24 个镜头。"); return; }
      const i = model.shots.indexOf(currentShot());
      const copy = { ...structuredClone(currentShot()), id: uid(), title: `${currentShot().title.slice(0, 50)} · 副本` };
      const step=stepForShot(selected);step.shotIds.splice(step.shotIds.indexOf(selected)+1,0,copy.id);
      model.shots.splice(i + 1, 0, copy); selected = copy.id; time = startOf(selected); changed(true); halt(); render(); return;
    }
    if (action === "delete-shot") {
      if (model.shots.length <= 1) { toast("至少保留一个镜头。"); return; }
      if (!confirm(`移除“${currentShot().title}”？其他镜头不变，已有审片反馈会保留。`)) return;
      const i = model.shots.indexOf(currentShot()); model.shots.splice(i, 1); selected = model.shots[Math.min(i, model.shots.length - 1)].id; time = startOf(selected);
      model.outlineApproved = false; changed(true); halt(); render(); return;
    }
    if (action === "inspector-effects" || action === "inspector-comments") { inspectorTab = action.endsWith("effects") ? "effects" : "comments"; halt(); render(); return; }
    if (action === "add-comment") {
      const value = document.getElementById("feedback-text").value.trim();
      if (!value) { toast("请先写下需要修改的内容。"); return; }
      if (model.comments.length >= 100) { toast("当前原型最多保存 100 条反馈。"); return; }
      model.comments.unshift({ id: uid(), text: value, shot: currentShot().title, time: stamp(time), resolved: false }); changed(); render(); toast("反馈已保存在当前浏览器。"); return;
    }
    if (action === "resolve-comment") { const c = model.comments.find((item) => item.id === target.dataset.id); if (c) { c.resolved = !c.resolved; changed(); render(); } return; }
    if (action === "start-capture") {
      if (!model.approved) { toast("请先确认分镜。"); return; }
      halt();captureProgress = 0; captureStatus = "running"; render();
      clearInterval(captureTimer);
      captureTimer = setInterval(() => {
        captureProgress = Math.min(100, captureProgress + 5);
        if (captureProgress === 100) { clearInterval(captureTimer); captureStatus = "done"; }
        if (view === "review") {
          const banner=document.querySelector(".render-banner");
          if(banner){
            banner.querySelector("b").textContent=captureStatus==="done"?"模拟制作完成":"正在模拟制作…";
            banner.querySelector("p").textContent=captureStatus==="done"?"没有新视频生成，可以继续审阅示例。":`${captureProgress}% · 模拟进度，不执行真实录制`;
            banner.querySelector(".progress-bar>div").style.width=`${captureProgress}%`;
            if(captureStatus==="done")banner.querySelector("button").outerHTML=button("start-capture","重新模拟制作","play","small",model.approved?"":"disabled");
          }
        }
      }, 350); return;
    }
    if (action === "cancel-capture") { clearInterval(captureTimer); captureStatus = "idle"; render(); toast("模拟已停止，没有产品操作或录制文件。"); return; }
    if (action === "delivery") {
      halt();
      modal("交付的不只有视频。", `<p>这是交付界面的预览，当前没有生成 MP4。你可以下载真实可用的原型方案 JSON，交给同事查看镜头与设置。</p><div class="deliverable">01　成片 MP4 <span class="tag">待接入渲染</span></div><div class="deliverable">02　原始录制与动作轨迹 <span class="tag">待接入录制</span></div><div class="deliverable">03　分镜、${story ? "旁白、" : ""}效果参数与反馈 <span class="tag">可下载 JSON</span></div><p style="margin-top:15px">正式版将区分候选成片和用户批准版，不会自动把最新输出当作最终交付。</p>`, button("export-json", "下载原型方案", "download", "primary")); return;
    }
    if (action === "export-json") {
      const blob = new Blob([JSON.stringify({ format: "productshot-ui-mockup", version: 1, mode: story ? "story" : "demo", simulated: true, project: model }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `productshot-${story ? "story" : "demo"}-mockup.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast("已下载方案 JSON；其中的场景与状态均标记为模拟。"); return;
    }
    if (action === "share") {
      const local = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname) || location.protocol === "file:";
      modal("分享工作台原型", `<p>${local ? "目前是本机地址，同事不能从自己的电脑直接打开。原型尚未公开部署。" : "修改只保存在每个人自己的浏览器，不会随链接共享。"}<br>设计 A / B 独立于功能版本，均支持纯 Demo 和讲解声音。</p><label class="field">纯 Demo<input readonly value="${esc(new URL(variantLink("demo"), location.href).href)}"></label><label class="field">讲解与声音<input readonly value="${esc(new URL(variantLink("story"), location.href).href)}"></label>`, button("copy-link", "复制当前版本链接", "copy", "primary")); return;
    }
    if (action === "copy-link") {
      try { await navigator.clipboard.writeText(location.href); toast("链接已复制。浏览器内的私人修改不会随链接分享。"); }
      catch { toast("浏览器未允许复制，请在分享窗口手动选择链接。"); }
      return;
    }
    if (action === "fullscreen") {
      const stage = document.getElementById("preview-stage");
      try { if (document.fullscreenElement) await document.exitFullscreen(); else if (stage.requestFullscreen) await stage.requestFullscreen(); else throw new Error("Unsupported"); }
      catch { toast("此浏览器不支持全屏预览，可以使用浏览器缩放。"); }
      return;
    }
    if (action === "close-dialog") { document.getElementById("dialog").close(); return; }
    if (action === "stop-speech") { if ("speechSynthesis" in window) speechSynthesis.cancel(); return; }
    if (action === "speak-shot") {
      if (!("speechSynthesis" in window)) { toast("当前浏览器不支持系统语音试听。"); return; }
      const s = model.shots.find((item) => item.id === target.dataset.id);
      if (!s || !s.narration.trim()) { toast("请先填写旁白。"); return; }
      speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(s.narration);
      utterance.lang = "zh-CN"; utterance.rate = model.voice === "calm" ? .9 : 1.04; utterance.pitch = model.voice === "calm" ? 1 : 1.08; utterance.volume = model.volume / 100;
      utterance.onerror = (e) => { if (!["canceled", "interrupted"].includes(e.error)) toast(`系统语音不可用：${e.error}。旁白编辑仍可使用。`); };
      speechSynthesis.speak(utterance); toast("正在使用浏览器系统语音试听；不会生成配音文件。"); return;
    }
  });
  document.addEventListener("submit",(event)=>{
    if(event.target.id!=="director-chat-form")return;
    event.preventDefault();
    const text=document.getElementById("chat-input").value.trim();
    if(!text){toast("请先写下想讨论或修改的内容。");return;}
    appendChat("user",text);model.chatDraft="";
    if(chatMode==="feedback"){
      appendChat("director","这条反馈已记录。当前未连接真实 AI，不会假装自动理解并执行。你可以选择一个具体修改字段，填写建议值后预览应用，或直接编辑右侧。");
      pendingChat=null;
    }else{
      const labels={"source":"产品来源","step-title":"步骤名称","step-add":"新增步骤",camera:"镜头路径",highlight:"高亮重点",actions:"操作顺序",caption:"镜头旁白"};
      pendingChat={mode:chatMode,text,target:chatMode==="step-add"?activeScenario:chatTarget,revision:model.planRevision,label:labels[chatMode]};
    }
    persist();render();
    document.querySelector(".chat-proposal")?.scrollIntoView({block:"nearest"});
  });
  document.addEventListener("input", (event) => {
    const input = event.target;
    if(input.id==="chat-input"){model.chatDraft=input.value;persist();return;}
    if (input.id === "playhead") {
      halt(); time = Number(input.value); const next = shotAt(time);
      selected = next.id; updatePreview();
      const clock = document.getElementById("timecode"); if (clock) clock.textContent = `${stamp(time)} / ${stamp(total())}`;
      return;
    }
    if (input.dataset.shotField && input.type === "range") {
      halt(); const key = input.dataset.shotField; currentShot()[key] = Number(input.value); changed();
      const label = document.getElementById(`${key}-label`); if (label) label.textContent = key === "zoom" ? `${Number(input.value).toFixed(2)}×` : `${input.value}%`;
      updatePreview(); return;
    }
    if (input.dataset.audio && input.type === "range") {
      model[input.dataset.audio] = Number(input.value); changed();
      document.getElementById(`${input.dataset.audio}-label`).textContent = `${input.value}%`; return;
    }
  });
  document.addEventListener("change", (event) => {
    const input = event.target;
    if(input.id==="chat-mode"){chatMode=input.value;render();return;}
    if(input.id==="chat-target"){chatTarget=input.value;return;}
    if(input.dataset.homeField){
      const key=input.dataset.homeField;
      model[key]=input.value.trim();
      if(key==="audience") model.audienceChoice="custom";
      if(key==="url" || key==="repo")model.discoveryStage="source";
      model.outlineApproved=false; changed(true);
      return;
    }
    if (input.id === "plan-import") {
      const file = input.files?.[0];
      if (!file) return;
      if (file.size > 128 * 1024) { toast("方案文件不能超过 128 KiB。"); input.value = ""; return; }
      file.text().then((text) => {
        const raw = JSON.parse(text);
        importApprovedPlan(raw);
        render();
        toast(`已导入方案 revision ${model.planRevision}。${model.approved ? "拍摄说明已保留。" : "旧版拍摄说明不完整，需要补充确认。"} 导入不授予录制或发布权限。`);
      }).catch((error) => toast(`导入失败：${error.message}。当前项目未被替换。`)).finally(() => { input.value = ""; });
      return;
    }
    if (input.id === "playhead") { render(); return; }
    if (input.dataset.direction) {
      const shot = model.shots.find((s) => s.id === input.dataset.id);
      if (!shot || !directionFields.some(([key]) => key === input.dataset.direction)) { toast("无法定位这项拍摄说明。"); return; }
      shot.direction[input.dataset.direction] = input.value.trim();
      changed(true);
      const status = document.getElementById("plan-approval-status");
      if (status) status.textContent = "拍摄说明已修改，需要重新确认";
      const approve = document.querySelector('[data-action="approve"]');
      if (approve) approve.innerHTML = `${icon("check")}确认拍摄方案`;
      return;
    }
    if (input.dataset.field) {
      if (input.dataset.field === "name" && !input.value.trim()) { input.value = model.name; toast("项目名称不能为空。"); return; }
      model[input.dataset.field] = input.value.trim(); changed(true); refreshEditedView(); return;
    }
    if (input.dataset.intakeField) {
      model[input.dataset.intakeField] = input.value.trim();
      changed(true);
      return;
    }
    if (input.dataset.shotField) {
      const key = input.dataset.shotField;
      if (input.type === "range") return;
      let value = input.type === "checkbox" ? input.checked : ["duration", "speed"].includes(key) ? Number(input.value) : input.value.trim();
      if (key === "title" && !value) { input.value = currentShot().title; toast("镜头名称不能为空。"); return; }
      if (key === "duration" && (!Number.isFinite(value) || value < 3 || value > 30)) { input.value = currentShot().duration; toast("素材时长需要在 3–30 秒之间。"); return; }
      halt(); currentShot()[key] = value; time = Math.min(time, total()); changed(["title", "purpose", "duration", "speed"].includes(key)); refreshEditedView(); return;
    }
    if (input.dataset.narration) {
      model.shots.find((s) => s.id === input.dataset.narration).narration = input.value.trim(); changed(true); return;
    }
    if (input.dataset.audio && input.type === "checkbox") { model[input.dataset.audio] = input.checked; changed(); return; }
    if (input.name === "voice") { model.voice = input.value; changed(); }
  });
  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && view === "review" && !event.target.closest("input,textarea,select,button,dialog,a")) {
      event.preventDefault(); document.querySelector('[data-action="play"]').click();
    }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing) { halt(); if (view === "review") render(); } });
  window.addEventListener("pagehide", () => { halt(); clearInterval(captureTimer); });
  render();
  if (loadWarning) toast(loadWarning);
})();
