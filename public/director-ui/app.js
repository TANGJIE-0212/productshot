(() => {
  "use strict";
  const variant = document.documentElement.dataset.variant || "morandi";
  const studio = variant === "studio";
  const neo = variant === "neo";
  const STORAGE = ({ studio: "productshot-studio-ui-v1", neo: "productshot-neo-ui-v1", glass: "productshot-glass-ui-v1", spatial: "productshot-spatial-ui-v1" })[variant] || "productshot-five-page-ui-v1";
  const pages = ["产品与目标", "功能选择", "场景故事", "分镜脚本", "效果与修改"];
  const mainPages = [0, 1, 3, 4];
  const DEFAULT_SOURCE = "https://github.com/gim-home/biz-table/";
  const DEFAULT_GOAL = "向 LT 汇报 Biz Table 项目，时长约 1 分钟。";
  const icons = {
    spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
    link: '<path d="m10 13 4-4m-7 6-2 2a4 4 0 0 0 6 5l4-4a4 4 0 0 0 0-6M9 13a4 4 0 0 1 0-6l4-4a4 4 0 0 1 6 6l-2 2" transform="translate(0 -1)"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16m6-10v10M3 15h18"/>',
    form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6m-6 4h6m-6 4h3"/>',
    chart: '<path d="M4 4v16h17M8 16v-4m5 4V7m5 9v-7"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 8h4m-4 8h4m10-8h4m-4 8h4m-11-6 5 3-5 3Z"/>',
    layers: '<path d="m3 8 9-5 9 5-9 5Zm0 5 9 5 9-5M3 18l9 5 9-5" transform="translate(0 -1)"/>',
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    paper: '<path d="M8 12v5a3 3 0 0 0 6 0V6a4 4 0 0 0-8 0v11a5 5 0 0 0 10 0V9"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.spark}</svg>`;
  const brandIcon = variant === "spatial"
    ? '<svg class="brand-symbol brand-spatial" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M20 2 35.6 11v18L20 38 4.4 29V11Z" fill="#aaa2ed"/><path d="m20 2 15.6 9-9.2 5.3L20 12.6Z" fill="#eed1e4"/><path d="M35.6 29 20 38V27.4l6.4-3.7Z" fill="#7068ad"/><path d="M4.4 11v18l9.2-5.3v-7.4Z" fill="#c6c1f4"/><path d="m17 13.5 11 6.5-11 6.5Z" fill="#191c2a"/></svg>'
    : variant === "glass"
    ? '<svg class="brand-symbol brand-glass" viewBox="0 0 40 40" fill="none" aria-hidden="true"><defs><linearGradient id="glass-logo" x1="4" y1="3" x2="35" y2="38" gradientUnits="userSpaceOnUse"><stop stop-color="#d8edff"/><stop offset=".5" stop-color="#a7b8ee"/><stop offset="1" stop-color="#6578c2"/></linearGradient></defs><rect x="8" y="3" width="29" height="30" rx="10" fill="#798cd0" fill-opacity=".4" stroke="#e7efff" stroke-width="1.2"/><rect x="3" y="8" width="29" height="30" rx="10" fill="url(#glass-logo)" stroke="#f4f8ff" stroke-width="1.4"/><path d="m14 16 11 7-11 7Z" fill="#fff" fill-opacity=".92" stroke="#eef4ff" stroke-linejoin="round"/><path d="M8 19v-2a4 4 0 0 1 4-4h6" stroke="#fff" stroke-opacity=".7" stroke-linecap="round"/></svg>'
    : '<svg class="brand-symbol" viewBox="0 0 40 40" fill="none" aria-hidden="true"><path class="brand-depth" d="M12 8h22v24H12z"/><path class="brand-face" d="M6 7h25v26H6z"/><path class="brand-frame" d="M12 3H3v9m23-9h10v9M3 28v9h9m14 0h10v-9"/><path class="brand-play" d="m15 13 10 7-10 7z"/></svg>';
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const features = [
    { id: "build", title: "从业务描述建立关联结构", text: "连接的 Agent 把业务意图转成表、字段和真实关联。", icon: "table", color: "sage", proof: "新版依据：结构工具和关联字段已真实排练；完整自然语言 Agent 宿主仍待补拍。" },
    { id: "import", title: "让数据进入同一结构", text: "把合成业务数据写入刚建立的表，并按业务编号连接记录。", icon: "layers", color: "peach", proof: "新版依据：供应商、商品、采购和订单记录已在隔离环境真实写入并读回；文件导入路径仍需按目标版本确认。" },
    { id: "dashboard", title: "从业务问题生成数据视图", text: "Agent 用同一批数据生成分类、状态和趋势视角。", icon: "chart", color: "blue", proof: "新版依据：小店业务概览及三个数据视角已真实创建并在浏览器核验；Agent 输入过程尚未录制。" },
    { id: "workflow", title: "用对话修改同一视图", text: "继续提出要求，在保留原图表的同时给当前看板增加订单状态视角。", icon: "spark", color: "lavender", proof: "新版依据：同一看板的更新工具已真实排练；目标宿主中的对话修改过程仍待补拍。" },
    { id: "form", title: "生成连接现有数据的表单", text: "从已有销售订单表生成收集入口，并在获准范围内验证字段绑定。", icon: "form", color: "lavender", proof: "新版依据：表单创建、内部表单及发布探针已真实排练；分享策略和关联字段发布限制需在目标版本确认。" },
    { id: "teams", title: "Teams / Microsoft 365 接入", text: "在已配置的租户中访问同一业务应用。", icon: "link", color: "blue", proof: "本片不展示：需要租户、安装及授权条件，当前排练未覆盖。" }
  ];
  const recordingReadiness = {
    build: { demo: true, label: "工具已真实排练 · Agent 宿主待补拍" },
    import: { demo: true, label: "真实写入已排练 · 导入路径待确认" },
    dashboard: { demo: true, label: "看板创建已真实排练 · 待录制" },
    workflow: { demo: true, label: "同一看板修改已真实排练 · 待录制" },
    form: { demo: true, label: "表单创建已真实排练 · 分享策略待确认" },
    teams: { demo: false, label: "本片省略 · 需租户授权" }
  };
  const recommendedFeatures = () => features.filter(f => recordingReadiness[f.id]?.demo).map(f => f.id);
  const sampleNarrationCues = [
    { start: 0.4, end: 9, text: "团队的需求散在聊天和表格里，事情一多，就很难知道该先处理什么。" },
    { start: 9.5, end: 16.3, text: "Biz Table 把业务信息组织成表，让团队有一个共同的工作入口。" },
    { start: 16.9, end: 22.2, text: "进展和重点，不用再逐条翻找。" },
    { start: 23, end: 44.8, text: "收集新需求时，发出一张表单就好。提交的人按提示填写，负责的人收到结构清楚的信息，不必反复追问，也不用在聊天记录里重新整理。" },
    { start: 46, end: 57.7, text: "这些信息回到同一张业务表，团队可以集中查看、分类和跟进。每个需求都有自己的位置，交接也更清楚。" },
    { start: 59, end: 75.1, text: "再通过视图和看板，把分散的信息变成可以讨论的进展。从收集需求到安排工作，Biz Table 让团队围绕同一份信息协作，把精力留给真正需要推进的事情。" }
  ];
  const sampleNarration = sampleNarrationCues.map(cue => cue.text);
  const scenarios = [
    {
      id: "retail", persona: "retailer", title: "从一句话到持续调整的小店工作台",
      text: "店主描述商品、供应商、采购和销售订单，让 Agent 建立关联结构；数据进入后生成概览，再通过对话修改同一看板并增加订单表单。",
      outcome: "观众看到同一个业务应用从结构、数据和视图，继续生长出新的观察角度与收集入口。",
      reason: "这是当前首选：关系、数据增长、图表变化和新表单都容易让陌生观众看懂，同时保留 Agent 创建与持续修改这两个产品核心机制。",
      condition: "库存只作为快照，不宣称自动扣减；完整 Agent 输入与执行必须新拍，分享不等于允许公开发布。",
      flow: [
        { feature: "build", title: "描述小店业务，建立商品、供应商、采购和销售订单的关联结构" },
        { feature: "import", title: "让合成业务数据进入同一结构，并按业务编号建立真实关联" },
        { feature: "dashboard", title: "提出经营问题，生成分类、采购状态和每日订单趋势" },
        { feature: "workflow", title: "补一句话，在同一个看板增加订单状态视角并保留原图表" },
        { feature: "form", title: "为现有销售订单生成新的收集表单和获准的测试入口" }
      ]
    },
    {
      id: "projects", persona: "pm", title: "临时交付项目工作台",
      text: "交付负责人用业务描述建立项目、任务和成员关系，加入测试进度后生成概览，再把当前视图改成突出延期任务，最后增加进度收集入口。",
      outcome: "项目结构、进度观察、视图修订和信息收集都发生在同一个可持续修改的应用里。",
      reason: "产品拟合强，能展示从创建到继续修改的机制；但本次用户明确偏好小店业务应用的成长过程。",
      condition: "不承诺自动催办或预测延期；需要合成项目数据和真实 Agent 宿主重新录制。",
      flow: [
        { feature: "build", title: "用业务描述建立项目、任务和成员关联" },
        { feature: "import", title: "加入合成项目与进度数据" },
        { feature: "dashboard", title: "生成项目进度与负责人视图" },
        { feature: "workflow", title: "把当前视图改成突出延期任务并保留原概览" },
        { feature: "form", title: "生成连接现有任务的进度收集表单" }
      ]
    },
    {
      id: "recruiting", persona: "hr", title: "内训报名与组织工作台",
      text: "培训组织者描述课程、场次和报名关系，加入合成报名数据后生成概览，通过对话调整课程视角，再生成反馈收集表单。",
      outcome: "课程安排、报名概览、视图调整和反馈入口围绕同一套业务数据持续扩展。",
      reason: "同样能证明对话搭建与迭代，但没有比用户已选的小店方向更必要。",
      condition: "不宣称自动推荐课程或评价学员；仅使用合成报名和反馈数据。",
      flow: [
        { feature: "build", title: "描述内训活动并建立课程、场次和报名关联" },
        { feature: "import", title: "加入合成课程与报名数据" },
        { feature: "dashboard", title: "生成课程报名和场次概览" },
        { feature: "workflow", title: "按课程调整同一个概览并保留已有视角" },
        { feature: "form", title: "生成连接现有课程的反馈收集表单" }
      ]
    }
  ];
  const personaDefaults = () => [
    { id: "pm", user: "需要自己搭小型业务工具、又会反复调整需求的业务负责人", pain: "搭建和每次改需求都要翻译成字段、关联、图表与表单配置。", basis: "最直接对应 Agent 创建并持续修改同一个业务应用的机制；这是产品机制推导，不是客户调研。" },
    { id: "hr", user: "已有成熟系统、偶尔补充临时业务工具的团队", pain: "临时需求排期长，但现有系统可能已经覆盖主要工作。", basis: "仍可能受益于快速补充工具，但集成、权限和迁移成本会降低相对收益。" },
    { id: "retailer", user: "从分散清单开始整理商品、采购与订单的小店经营者", pain: "信息分散，建立关联、查看概况和增加收集入口都需要多项配置。", basis: "业务关系直观、便于展示；本次只演示业务台账，不承诺专业 ERP 的库存账务能力。" }
  ];
  const newScenarioInput = () => ({ title: "", user: "", pain: "", story: "", steps: "" });
  const sceneDefaults = () => ({ focus: "all", personas: personaDefaults(), customInput: newScenarioInput(), customScenarios: [], drafts: [] });
  const scenarioSteps = s => s.flow.map((step, i) => ({ id: `${s.id}-${i}`, title: step.title }));
  const shotTemplates = [
    { id: "build", title: "说清业务，结构就建立起来", purpose: "让观众看见业务语言如何变成关联结构。", image: "empty.png", time: 0, narration: "给小店搭一个业务系统，不必从一张张空表开始。告诉 Agent 你要管理什么，它就能建立商品、供应商、采购和订单之间的关联。", before: "真实 Agent 已连接；右边是无业务表的测试应用。合成数据文件已准备，但未导入。", action: "完整输入并发送一次；保留真实消息和执行起点；完成后打开商品表并展开一个关联字段。", after: "商品及相关业务表可打开，关联字段确实指向对应表。", highlight: "先描边业务请求，发送时移除；结果稳定后再描边新表与关联标签。", camera: "先交代双栏；输入完成后推近左侧句子，发送后回到双栏，再推向右侧新表与关联。", verify: "核对表、字段类型、关系方向和空记录状态；部分完成就停止。", transition: "保留同一应用及商品表，准备让合成数据进入。" },
    { id: "import", title: "让业务数据进入同一结构", purpose: "证明生成的是可继续使用的应用，不是静态示意图。", image: "structure.png", time: 10.8, narration: "再把业务数据放进来。商品、采购和订单不再各放一处，而是在同一套结构里连起来。", before: "上一幕的关联表尚无业务记录。", action: "通过实际宿主支持的资料入口附上合成数据；发送指令；打开商品与一笔订单，展示内容及商品关联。", after: "同一批业务数据进入前幕结构，关联可点击，不切换到另一份预建应用。", highlight: "只在真实记录出现后短暂强调数据进入；不得画假行或遮挡结果。", camera: "从双栏移向右侧表格，随着真实行出现逐步拉开，保留表名和实际内容。", verify: "按业务编号核对原值和关系；不能把直接写入称为文件导入。", transition: "数据留在原应用，提出需要观察的经营问题。" },
    { id: "dashboard", title: "从业务问题生成多个观察角度", purpose: "展示同一批业务数据如何变成分类、状态与趋势视图。", image: "before.png", time: 19.4, narration: "想知道商品怎么分布、采购进行到哪一步、订单有什么变化，直接说出你关心的问题。Agent 把同一批数据组织成图表，业务全貌就清楚了。", before: "已有样例数据，当前应用没有本幕概览。", action: "发送经营问题；打开新生成的概览；依次展示品类分布、采购状态和每日订单趋势。", after: "三个承诺视角都真实绑定当前数据；图表类型以当前版本支持为准。", highlight: "图表稳定后短暂点明分类或趋势，不覆盖数值。", camera: "请求阶段保留左侧，结果阶段让看板占主画面；先看整体，再引导两个关键区域。", verify: "三个视角缺一即不通过；内部核验记录计数，不把计数拿来口播。", transition: "保持同一个看板，继续提出订单状态的修改要求。" },
    { id: "workflow", title: "一句话，继续改眼前的视图", purpose: "证明生成后的应用仍可通过对话持续控制。", image: "after.png", time: 29.7, narration: "看完还想追一下订单进展？再补一句话，按状态加一个视图。Agent 修改的就是眼前这套看板，不必从头再搭。", before: "上一幕看板已打开，原有图表可辨认。", action: "在同一业务上下文发送变更要求；记录执行过程；对照原图表仍在且新状态视角已加入。", after: "同一个概览保留原内容并出现订单状态视角。", highlight: "新视角出现后才描边，旧图表不同时闪烁。", camera: "先展示完整修改句，再以原图表作定位锚点，推向新增区域。", verify: "必须是同一看板、原图表仍在且新视角按状态分组；另建无关页面不通过。", transition: "从查看业务转向扩展收集入口，继续使用销售订单表。" },
    { id: "form", title: "新需求来了，生成连接已有业务的表单", purpose: "展示对话如何给现有应用增加新的收集入口。", image: "form.png", time: 38.7, narration: "有新的收集需求，再让 Agent 生成一张订单表单，连接已有业务，分享出去就能填写。从一句话搭建，到看数据、改视图、加入口，这个系统可以跟着你的业务继续生长。", before: "当前订单表存在，本幕表单不存在。", action: "发送表单创建要求；打开新表单与实际入口；仅在授权测试窗口填写一次并按真实策略核对结果。", after: "新的收集入口连接现有销售订单；权限和审核状态按真实环境展示。", highlight: "强调新表单与原订单表的联系，不展示真实个人资料。", camera: "左侧保留生成要求，右侧完整展示表单，再短暂聚焦获准入口；收尾回到完整应用。", verify: "字段绑定、访问范围与实际打开状态均需核验；不得对外发送。", transition: "结束，不追加普通新增计数作为高潮。" },
    { id: "conclusion", title: "回到持续生长的业务应用", purpose: "用一个短收束回顾完整能力链，不增加新的产品主张。", image: "readback.png", time: 49.5, narration: "从业务描述到关联结构，再到数据视图、持续修改和新的收集入口，Biz Table 让同一个业务应用随着需求继续生长。", before: "前五幕的真实结果均已核验。", action: "回到应用全景，依次保留表、看板和表单入口作为已完成结果，不重复操作。", after: "完整业务应用可辨认，影片在真实结果上结束。", highlight: "无；避免多个区域同时闪烁。", camera: "稳定全景短停，旁白结束即收片，不用冻结补时。", verify: "只有前五幕均有真实画面时才使用此收束。", transition: "结束。" }
  ];
  const defaults = () => ({ version: 1, mode: "oneclick", automatic: "idle", scriptView: "recording", narrationDrafts: [], page: 0, source: DEFAULT_SOURCE, videoGoal: DEFAULT_GOAL, presentation: "features", extraFeatures: [], featureShotDrafts: [], audienceAdditional: "", files: [], sample: false, selected: recommendedFeatures(), custom: "", audience: "LT REVIEW", scenario: "retail", storyTitle: scenarios[0].title, storyContext: scenarios[0].text, storyUser: personaDefaults()[2].user, storyPain: personaDefaults()[2].pain, storyOutcome: scenarios[0].outcome, sceneData: sceneDefaults(), steps: scenarioSteps(scenarios[0]), shots: structuredClone(shotTemplates), shot: 0, clip: 0, feedbackTarget: `片段 01 · ${shotTemplates[0].title}`, feedbackText: "", feedback: [], stale: true, savedAt: "" });
  const validSteps = steps => Array.isArray(steps) && steps.length > 0 && steps.length <= 20 && steps.every(x => x && typeof x.id === "string" && typeof x.title === "string");
  const validDraft = d => d && ["id", "title", "context", "user", "pain", "outcome"].every(k => typeof d[k] === "string") && validSteps(d.steps);
  function validSceneData(s) {
    return s && ["all", "pm", "hr", "retailer"].includes(s.focus)
      && Array.isArray(s.personas) && s.personas.length === 3 && s.personas.every((p, i) => p?.id === personaDefaults()[i].id && ["user", "pain", "basis"].every(k => typeof p[k] === "string"))
      && s.customInput && Object.keys(newScenarioInput()).every(k => typeof s.customInput[k] === "string")
      && Array.isArray(s.customScenarios) && s.customScenarios.length <= 20 && s.customScenarios.every(d => validDraft(d) && d.id.startsWith("custom-"))
      && Array.isArray(s.drafts) && s.drafts.length <= 30 && s.drafts.every(validDraft);
  }
  let state = defaults(), saveError = "", loadError = "", mediaAvailable = false, mediaChecked = false, noticeTimer, autoTimer, autoEpoch = 0;
  function validState(s) {
    const strings = ["source", "custom", "audience", "scenario", "storyTitle", "storyContext", "feedbackTarget", "feedbackText", "savedAt"];
    const shotKeys = Object.keys(shotTemplates[0]);
    return s && s.version === 1 && Number.isInteger(s.page) && s.page >= 0 && s.page < 5
      && strings.every(k => typeof s[k] === "string") && typeof s.sample === "boolean" && typeof s.stale === "boolean"
      && ["storyUser", "storyPain", "storyOutcome", "audienceAdditional", "videoGoal"].every(k => s[k] === undefined || typeof s[k] === "string")
      && (s.presentation === undefined || ["scenario", "features"].includes(s.presentation))
      && (s.mode === undefined || ["oneclick", "step"].includes(s.mode))
      && (s.automatic === undefined || ["idle", "checking", "running", "paused", "done", "blocked"].includes(s.automatic))
      && (s.scriptView === undefined || ["recording", "narration"].includes(s.scriptView))
      && (s.narrationDrafts === undefined || Array.isArray(s.narrationDrafts) && s.narrationDrafts.every(d => d && ["id", "opening", "closing"].every(k => typeof d[k] === "string")))
      && (s.scenarioShotDrafts === undefined || Array.isArray(s.scenarioShotDrafts) && s.scenarioShotDrafts.every(d => d && typeof d.id === "string" && Array.isArray(d.shots) && d.shots.length === shotTemplates.length && d.shots.every(x => x && shotKeys.every(k => typeof x[k] === typeof shotTemplates[0][k]))))
      && (s.extraFeatures === undefined || (Array.isArray(s.extraFeatures) && s.extraFeatures.every(f => f && typeof f.id === "string" && typeof f.title === "string" && typeof f.selected === "boolean") && new Set(s.extraFeatures.map(f => f.id)).size === s.extraFeatures.length))
      && (s.featureShotDrafts === undefined || (Array.isArray(s.featureShotDrafts) && s.featureShotDrafts.every(x => x && shotKeys.every(k => typeof x[k] === typeof shotTemplates[0][k]) && ["prompt", "editing", "caption"].every(k => x[k] === undefined || typeof x[k] === "string"))))
      && (s.sceneData === undefined || validSceneData(s.sceneData))
      && Array.isArray(s.files) && s.files.every(f => typeof f.name === "string" && Number.isFinite(f.size))
      && Array.isArray(s.selected) && s.selected.every(id => features.some(f => f.id === id))
      && Array.isArray(s.steps) && s.steps.length > 0 && s.steps.length <= 20 && s.steps.every(x => typeof x.id === "string" && typeof x.title === "string")
      && Array.isArray(s.shots) && s.shots.length === shotTemplates.length && s.shots.every(x => x && shotKeys.every(k => typeof x[k] === typeof shotTemplates[0][k]) && ["prompt", "editing", "caption"].every(k => x[k] === undefined || typeof x[k] === "string"))
      && Number.isInteger(s.shot) && s.shot >= 0 && (s.presentation === "features" || s.shot < 6) && Number.isInteger(s.clip) && s.clip >= 0 && s.clip < 6
      && Array.isArray(s.feedback) && s.feedback.every(x => ["id", "target", "text", "at"].every(k => typeof x[k] === "string"));
  }
  try {
    const stored = localStorage.getItem(STORAGE);
    if (stored) { const parsed = JSON.parse(stored); if (!validState(parsed)) throw new Error("草稿格式不兼容"); state = parsed; }
  } catch (error) { loadError = `无法读取浏览器草稿：${error.message}。未覆盖原内容；请先下载原草稿或明确重置。`; }
  // Update only unchanged sample titles; keep user edits and submitted feedback intact.
  const previousShotTitles = ["先看空白起点", "把需求变成结构", "给业务一个全貌", "让一条新需求进来", "回到记录，核对结果", "结果进入业务视野"];
  if (!loadError) {
    state.shots.forEach((shot, i) => {
      if (shot.narration === shotTemplates[i].narration) shot.narration = sampleNarration[i];
      if (shot.id !== shotTemplates[i].id || shot.title !== previousShotTitles[i]) return;
      const previousTarget = `片段 ${String(i + 1).padStart(2, "0")} · ${shot.title}`;
      shot.title = shotTemplates[i].title;
      if (state.feedbackTarget === previousTarget) state.feedbackTarget = `片段 ${String(i + 1).padStart(2, "0")} · ${shot.title}`;
    });
    // Older drafts remain editable rather than being replaced by a new business scenario.
    state.sceneData ??= sceneDefaults();
    state.storyUser ??= "";
    state.storyPain ??= "";
    state.storyOutcome ??= "";
    state.audienceAdditional ??= "";
    state.videoGoal ??= "";
    state.presentation ??= "features";
    state.extraFeatures ??= state.custom.trim() ? [{ id: "legacy-extra", title: state.custom, selected: true }] : [];
    state.featureShotDrafts ??= [];
    // Old choices never opt into automation; refreshing a demo requires explicit resume.
    state.mode ??= "step";
    state.automatic = ["running", "checking"].includes(state.automatic) ? "paused" : state.automatic || "idle";
    state.scriptView ??= "recording";
    state.narrationDrafts ??= [];
    state.scenarioShotDrafts ??= [];
    if (state.presentation === "features" && state.page === 2) state.page = 1;
  }
  const audienceText = () => [state.audience, state.audienceAdditional].filter(s => s?.trim()).join("；");
  function selectedFeatures() {
    return [...features.filter(f => state.selected.includes(f.id)), ...(state.extraFeatures || []).filter(f => f.selected && f.title.trim()).map(f => ({ ...f, proof: "用户补充功能，尚未核验。" }))];
  }
  function previousFeatureTemplate(f) {
    return { id: f.id, title: f.title, purpose: `单独介绍“${f.title}”，保留操作与验证结果。`, image: "", time: 0,
          narration: `说明${f.title}的用途，再展示一次操作及结果。`,
          before: "在授权产品环境中定位该功能的实际入口；尚未排练。",
          action: `打开${f.title}，执行一项可验证操作；具体步骤需根据实际产品补充。`,
          after: "展示与该操作对应的真实结果，不使用模拟成功状态。",
          highlight: "待排练后确定实际控件和结果区域。",
          camera: "先展示功能入口全景，再对准操作区域，保留上下文。",
          verify: f.proof, transition: "结果可读后，进入下一个所选功能。" };
  }
  function proposedFeaturePlan(f) {
    const plans = {
      build: {
        before: "真实 Agent 已连接；右边是无业务表的 Biz Table 测试应用。合成数据已准备但未写入。",
        prompt: "帮我搭一个小店业务工作台，管理商品、供应商、采购和销售订单，把相关信息关联起来。先建结构，不添加数据。",
        action: "1. 完整输入并发送一次，保留真实已发送消息。\n2. 如 Agent 要求结构确认，在同一实录中确认。\n3. 执行完成后打开商品表，并展开一个关联字段。",
        editing: "保留意图、发送、执行起点和实际结果；剪去中间长等待，必要时标“等待已缩短”。不能揭示预建成功画面。",
        after: "四张业务表可打开，商品与供应商、采购与商品、订单与商品均为真实关系字段。",
        highlight: "输入完成后短暂描边业务请求，发送时移除；结果稳定后才描边新表和关联标签。",
        camera: "先交代 Agent 与产品双栏；推近左侧完整句子；发送后回双栏；完成时推向右侧新表和关联。",
        narration: "给小店搭一个业务系统，不必从一张张空表开始。告诉 Agent 你要管理什么，它就能建立商品、供应商、采购和订单之间的关联。",
        caption: "输入时：描述业务\n结果出现后：建立关联结构",
        verify: "核对四张表、字段类型、关系方向和空记录状态。结构工具已真实排练，完整 Agent 宿主画面待补录。",
        transition: "保留同一应用及商品表，让合成业务数据进入。"
      },
      form: {
        before: "销售订单表已经存在，本幕的新订单收集表单尚不存在。",
        prompt: "给现有销售订单表做一个新订单收集表单，让人填写商品、数量、联系人和日期。只使用测试环境已获准的访问范围，给我可分享的入口，不要发送给任何人。",
        action: "1. 发送表单创建要求并记录真实生成过程。\n2. 打开新表单和实际入口，只有获准时才发布。\n3. 在授权测试窗口填写一次合成数据。\n4. 按真实发布策略展示成功或待审核。",
        editing: "重点保留创建与连接；试填只留代表性输入和真实响应，不让普通填表吞掉结尾。",
        after: "新表单连接现有销售订单；访问范围没有扩大，结果按实际权限与审核策略进入。",
        highlight: "强调新表单与原订单表的关系，再短暂聚焦获准入口；不展示真实个人资料。",
        camera: "左边保留生成要求，右边先完整展示表单，再短暂聚焦入口；收尾回到完整业务应用。",
        narration: "有新的收集需求，再让 Agent 生成一张订单表单，连接已有业务，分享出去就能填写。从一句话搭建，到看数据、改视图、加入口，这个系统可以跟着你的业务继续生长。",
        caption: "搭建 · 看数据 · 改视图 · 加入口",
        verify: "字段绑定、访问策略和实际打开状态都要成功；排练发现订单编号默认值与关联字段发布存在版本限制，不能隐藏适配。",
        transition: "结束，不追加普通记录计数作为高潮。"
      },
      dashboard: {
        before: "已有合成业务数据，当前应用还没有本幕的小店业务概览。",
        prompt: "用当前应用的数据做一个小店业务概览：按品类统计商品记录数；按采购状态统计采购单数；按订单日期统计每天的销售订单记录数，不是商品数量之和。给出分类图、状态图和每日趋势。",
        action: "1. 发送经营问题并保留真实执行起点。\n2. 打开新生成的概览。\n3. 依次展示品类分布、采购状态和每日订单趋势。",
        editing: "保留至少一次图表从请求到出现的变化；删除加载空白，不用静态看板撑满旁白。",
        after: "三个承诺视角均存在并绑定同一批业务数据。",
        highlight: "图表出现并稳定后，短暂强调分类和趋势，不覆盖数值。",
        camera: "请求阶段保留左侧；结果阶段让看板成为主画面，先看整体，再依次引导两个关键区域。",
        narration: "想知道商品怎么分布、采购进行到哪一步、订单有什么变化，直接说出你关心的问题。Agent 把同一批数据组织成图表，业务全貌就清楚了。",
        caption: "业务问题 → 数据视图",
        verify: "内部核对按品类商品记录数、按采购状态采购单数和按日期订单记录数；不把计数测试读成口播。",
        transition: "保持同一个看板，继续提出订单状态的修改要求。"
      },
      import: {
        before: "上一幕的关联表已经建立，但四张业务表没有记录。",
        prompt: "把附件里的演示商品、供应商、采购和销售订单放进对应的表，按业务编号建立关联。库存快照直接采用附件值，不计算或扣减库存。",
        action: "1. 通过宿主实际支持的资料入口附上合成数据。\n2. 发送指令；如出现导入预览或确认，保留一次真实确认。\n3. 打开商品与一笔订单，展示内容和商品关联。",
        editing: "压缩重复写入与等待，只保留首个实际变化和最终丰富状态。若实际走的是记录写入，不把它说成文件导入。",
        after: "同一批业务数据进入刚建立的结构，采购和订单指向真实商品记录。",
        highlight: "只有真实记录出现后才使用短暂的数据进入强调；不得画假行。",
        camera: "从双栏移向右侧表格，随着实际记录出现逐步拉开，保留表名与数据内容。",
        narration: "再把业务数据放进来。商品、采购和订单不再各放一处，而是在同一套结构里连起来。",
        caption: "数据进入，业务连接起来",
        verify: "按供应商编号、商品编号和订单编号核对原值与关系；库存只是快照，不宣称自动扣减。",
        transition: "数据保留在同一个应用，接着提出经营问题。"
      },
      workflow: {
        before: "上一幕生成的小店业务概览保持打开，原有三个视角可辨认。",
        prompt: "在这个概览里加一个按订单状态分组的视图，让我看清哪些待确认、哪些待发货。保留现在的其他图表。",
        action: "1. 不离开当前业务上下文，输入并发送变更要求。\n2. 记录真实执行与同一个看板的变化。\n3. 对照原图表仍在，新状态视角已经加入。",
        editing: "前后保持相同机位突出真实变化；缩短等待但保留执行因果，不用静态前后截图替代操作。",
        after: "同一个概览保留原内容，并出现订单状态视角。",
        highlight: "新视角真实出现后才描边；旧图表不同时闪烁。",
        camera: "先展示完整修改句；回到同一看板，以原图表为定位锚点，再推向新增区域。",
        narration: "看完还想追一下订单进展？再补一句话，按状态加一个视图。Agent 修改的就是眼前这套看板，不必从头再搭。",
        caption: "不只生成，还能继续改",
        verify: "核对同一看板身份、原图表与数据绑定仍在，新视角符合状态分组。",
        transition: "继续使用现有销售订单表，提出新表单需求。"
      },
      teams: {
        before: "本片不进入 Teams；该能力需要另一个已授权租户和独立验收。",
        prompt: "",
        action: "不录制。",
        editing: "无。",
        after: "无。",
        highlight: "无。",
        camera: "无。",
        narration: "",
        caption: "本片省略",
        verify: "不能把文档支持写成当前环境已验证。",
        transition: "无。"
      }
    };
    return plans[f.id] || {
      before: `先说明“${f.title}”的实际产品入口与操作前状态。`,
      prompt: "", action: "", after: "", highlight: "", camera: "",
      narration: "", caption: "", editing: "",
      verify: "该功能由用户补充，资料不足，不能编造具体指令或产品结果。补充用途和操作示例后再规划。",
      transition: "核对本项结果后，切到下一功能。"
    };
  }
  function featureShots() {
    return selectedFeatures().map(f => {
      let shot = state.featureShotDrafts.find(s => s.id === f.id);
      const old = previousFeatureTemplate(f);
      const proposal = proposedFeaturePlan(f);
      if (!shot) {
        shot = { ...old, ...proposal, planVersion: 3 };
        state.featureShotDrafts.push(shot);
      } else if (!shot.planVersion) {
        // Replace only untouched generic defaults, never the user's rewritten direction.
        for (const [key, value] of Object.entries(proposal)) {
          if (shot[key] === undefined || shot[key] === old[key]) shot[key] = value;
        }
        shot.planVersion = 3;
      }
      return shot;
    });
  }
  const activeShots = () => state.presentation === "features" ? featureShots() : state.shots;
  function narrationDraft() {
    const id = state.presentation === "features" ? "features" : `scenario-${state.scenario}`;
    let draft = state.narrationDrafts.find(d => d.id === id);
    if (!draft) {
      draft = { id, opening: state.presentation === "features" ? "把业务意图交给连接的 Agent，让它建立关联表、组织成数据视图，再持续修改同一个业务应用。" : `围绕${state.storyTitle}，展示业务意图怎样变成可持续修改的应用。`, closing: state.presentation === "features" ? "从搭建、放入数据、生成与修改视图，到增加新的收集入口，同一个业务应用会随着需求继续生长。" : "让同一个业务应用从结构开始，随着真实需求持续扩展。" };
      state.narrationDrafts.push(draft);
    }
    return draft;
  }
  function clearAutomaticTimer() {
    clearTimeout(autoTimer);
    autoTimer = undefined;
    autoEpoch++;
  }
  function pauseAutomatic() {
    clearAutomaticTimer();
  }
  function goalField() {
    return field("视频目标", "videoGoal", state.videoGoal || "", true, 'placeholder="例如：向 LT 汇报 Biz Table 项目，时长约 1 分钟。"');
  }
  function keepScenarioDraft() {
    const draft = { id: state.scenario, title: state.storyTitle, context: state.storyContext, user: state.storyUser, pain: state.storyPain, outcome: state.storyOutcome, steps: structuredClone(state.steps) };
    const index = state.sceneData.drafts.findIndex(d => d.id === draft.id);
    if (index === -1) state.sceneData.drafts.push(draft);
    else state.sceneData.drafts[index] = draft;
    state.scenarioShotDrafts ??= [];
    const savedShots = state.scenarioShotDrafts.find(d => d.id === state.scenario);
    if (savedShots) savedShots.shots = structuredClone(state.shots);
    else state.scenarioShotDrafts.push({ id: state.scenario, shots: structuredClone(state.shots) });
  }
  function chooseScenario(id) {
    if (id === state.scenario) return;
    const candidate = scenarios.find(s => s.id === id);
    const stored = state.sceneData.drafts.find(d => d.id === id) || state.sceneData.customScenarios.find(d => d.id === id);
    if (!candidate && !stored) { notify("未找到场景，请刷新后重试。"); return; }
    keepScenarioDraft();
    const persona = candidate && state.sceneData.personas.find(p => p.id === candidate.persona);
    const draft = stored || { id, title: candidate.title, context: candidate.text, user: persona.user, pain: persona.pain, outcome: candidate.outcome, steps: scenarioSteps(candidate) };
    state.scenario = id; state.storyTitle = draft.title; state.storyContext = draft.context;
    state.shots = structuredClone(state.scenarioShotDrafts.find(d => d.id === id)?.shots || defaults().shots);
    state.storyUser = draft.user; state.storyPain = draft.pain; state.storyOutcome = draft.outcome;
    state.steps = structuredClone(draft.steps); state.stale = true; save(); render();
  }
  function rankedScenarios() {
    const score = s => (state.sceneData.focus === s.persona ? 100 : 0)
      + s.flow.filter(step => state.selected.includes(step.feature)).length
      - new Set(s.flow.filter(step => !state.selected.includes(step.feature)).map(step => step.feature)).size * 10;
    return [...scenarios].sort((a, b) => score(b) - score(a));
  }
  function notify(message) {
    const node = document.getElementById("notice");
    node.textContent = message; node.classList.add("visible");
    clearTimeout(noticeTimer); noticeTimer = setTimeout(() => node.classList.remove("visible"), 4500);
  }
  function save() {
    if (loadError) { notify("原草稿读取失败，请先下载或重置，避免覆盖。"); return; }
    keepScenarioDraft();
    try {
      state.savedAt = new Date().toISOString();
      localStorage.setItem(STORAGE, JSON.stringify(state)); saveError = "";
    } catch (error) { saveError = `保存失败：${error.message}。请下载草稿。`; notify(saveError); }
  }
  const button = (label, action, cls = "primary", extra = "") => `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
  const field = (label, key, value, multiline = false, extra = "") => `<label class="field">${label}${multiline ? `<textarea data-field="${key}" maxlength="2000" ${extra}>${escape(value)}</textarea>` : `<input data-field="${key}" maxlength="1000" value="${escape(value)}" ${extra}>`}</label>`;
  const chip = (text, color = "") => `<span class="pill ${color}">${text}</span>`;
  function navigation() {
    let forward;
    if (!state.sample) forward = button("下一步：等待分析", "next", "primary", "disabled");
    else if (state.page === 4) forward = button("下载草稿 ↓", "export");
    else {
      const nextLabel = state.page === 1
        ? state.presentation === "features" ? "下一步：分镜脚本" : "下一步：选择场景"
        : state.page === 2 ? "下一步：分镜脚本" : "下一步：效果与修改";
      forward = button(`${state.mode === "step" ? "确认并继续：" + nextLabel.replace("下一步：", "") : nextLabel} ${svg("arrow")}`, "next", "primary", state.page === 3 && state.presentation === "features" && !selectedFeatures().length ? "disabled" : "");
    }
    return `<div class="page-navigation"><nav class="page-actions" aria-label="步骤操作">${button("← 上一步", "back", "secondary")}${forward}</nav><span class="small muted">本地草稿 · 保存不代表审批</span></div>`;
  }
  function heading(title, subtitle) { return `<div class="page-head"><div class="page-heading"><h1>${title}</h1><p>${subtitle}</p></div></div>`; }
  function studioHome() {
    return `<section class="studio-home">
      <div class="studio-intro"><div class="studio-index"><span>01 / 产品与目标</span><span>STUDIO EDITION — B</span></div>
      <h1><span>制作产品</span><span>介绍视频<span class="title-period" aria-hidden="true"></span></span></h1>
      <p class="studio-description">提供链接和视频目标，选择要展示的功能。<br>按业务场景或逐个功能组织视频。</p>
      <form id="source-form" class="source-box"><div class="input-heading"><label for="source">产品链接 / 介绍</label><span>INPUT 01</span></div><textarea id="source" aria-label="产品链接或介绍" data-field="source" maxlength="6000" placeholder="产品网站、GitHub Repo、文档链接或产品介绍">${escape(state.source)}</textarea>
      <div class="file-chips">${state.files.map((f, i) => `<button type="button" data-action="remove-file" data-index="${i}" aria-label="移除 ${escape(f.name)}">${escape(f.name)} ×</button>`).join("")}</div>
      <div class="goal-input">${goalField()}</div><div class="source-actions"><label class="attach">${svg("paper")} 添加资料<input id="files" type="file" multiple aria-label="添加资料"></label><button type="submit" class="primary" name="production-mode" value="step">分步骤成片 ${svg("arrow")}</button></div></form>
      <p class="home-meta">UI 原型。附件仅保存名称和大小，不读取内容。</p></div>
      <div class="studio-art"><div class="studio-art-top"><span>PRODUCTSHOT</span><span>DESIGN STUDY / 02</span></div><img src="/studio-poster.svg" alt="原创胶片环装饰插画，非产品界面或生成成果" width="720" height="860"><div class="studio-art-bottom"><span>资料 → 场景 → 分镜 → 视频</span><span>↗</span></div></div>
      </section><section class="studio-directory" aria-label="工作台页面"><div><span class="directory-label">WORKSPACE INDEX</span><h2>工作流程</h2></div>${mainPages.slice(1).map((page, i) => `<button data-action="page" data-index="${page}"><span class="directory-number">0${i + 2}</span><strong>${pages[page]}</strong><span class="directory-arrow">↗</span></button>`).join("")}</section>`;
  }
  function home() {
    return `<section class="home"><div>
      <h1 class="home-title">${neo ? "<span>制作产品介绍视频</span>" : "制作产品介绍视频"}</h1><p class="home-description">提供链接和视频目标，选择要展示的功能。<br>按业务场景或逐个功能组织视频。</p>
      <form id="source-form" class="source-box"><div class="source-heading"><label class="source-label" for="source">产品 / 参考视频链接</label><label class="attach">${svg("paper")} 添加资料<input id="files" type="file" multiple aria-label="添加资料"></label></div><textarea id="source" aria-label="产品链接或介绍" data-field="source" maxlength="6000" placeholder="产品网站、GitHub Repo、参考视频或文档链接">${escape(state.source)}</textarea>
      <div class="file-chips">${state.files.map((f, i) => `<button type="button" data-action="remove-file" data-index="${i}" aria-label="移除 ${escape(f.name)}">${escape(f.name)} ×</button>`).join("")}</div>
      <div class="goal-input">${goalField()}</div><div class="source-actions intake-start"><button type="submit" class="primary" name="production-mode" value="oneclick">一键成片 ${svg("arrow")}</button><button type="submit" class="secondary" name="production-mode" value="step">分步骤成片 ${svg("arrow")}</button></div></form>
      <p class="home-meta">UI 体验版 · 资料不会上传 · 附件仅保存名称与大小，不读取内容</p>
      </div><div class="editorial" aria-label="从产品资料到故事和视频的装饰插画，非产品画面" role="img">
      <div class="art-window"><div class="art-bar"><i></i><i></i><i></i><span>产品资料</span></div><div class="art-body"><span class="eyebrow">功能列表</span><div class="art-lines"><i></i><i></i></div><div class="art-blocks"><i>${svg("table")}</i><i>${svg("form")}</i><i>${svg("chart")}</i></div></div></div>
      <div class="art-card script"><span class="eyebrow">分镜脚本</span><span>01 &nbsp; 起始画面</span><span>02 &nbsp; 操作步骤</span><span>03 &nbsp; 结果验证</span></div>
      <div class="art-card film"><span class="eyebrow">视频预览</span><div class="film-scene"><span class="film-play">▷</span></div><span class="small">查看片段与修改意见</span></div></div></section>
      `;
  }
  function pending() {
    return `${heading("产品分析", "资料已保存到本地。分析功能需要连接 Agent，当前尚未接入。")}
      <div class="empty-panel"><div class="tile-icon lavender">${svg("link")}</div><h2>资料已保存，分析尚未开始</h2><p>${escape(state.source || "已添加资料附件（仅文件名）")}</p>${button("连接 Agent · 尚未接入", "connect", "secondary")}</div>`;
  }
  function featurePage() {
    return `${heading("功能选择", "勾选功能，补充未列出的内容，再选择介绍方式。")}
      <section class="feature-selection"><div class="section-label"><strong>全部已整理功能 · ${features.length} 项示例</strong><span class="small muted">${selectedFeatures().length} 项已选</span></div>
      <p class="readiness-note">新版 Skill 不再按“现成素材最好拍”决定能力优先级。默认保留完整链路：建立关联结构 → 数据进入 → 生成视图 → 对话修改同一视图 → 生成连接现有数据的表单；各项分别标明排练与补拍状态。</p>
      <div class="feature-rows">${features.map(f => `<div class="feature-row ${state.selected.includes(f.id) ? "selected" : ""}"><label><input type="checkbox" data-feature="${f.id}" aria-label="${f.title}" ${state.selected.includes(f.id) ? "checked" : ""}><strong>${f.title}</strong><span>${f.text}<small class="feature-readiness">${recordingReadiness[f.id].label}</small></span></label><details><summary>依据与限制</summary><p>${f.proof}</p></details></div>`).join("")}</div>
      <div class="extra-features"><div class="section-label"><strong>补充功能</strong><span class="small muted">逐项添加 · 待核验</span></div>
      ${state.extraFeatures.map((f, i) => `<div class="extra-feature-row"><input type="checkbox" data-extra-check="${f.id}" aria-label="选择补充功能 ${i + 1}" ${f.selected ? "checked" : ""}><input data-extra="${f.id}" aria-label="补充功能 ${i + 1}" value="${escape(f.title)}" maxlength="1000" placeholder="填写功能名称或说明">${button("×", "remove-extra", "icon-button", `data-id="${f.id}" aria-label="删除补充功能 ${i + 1}"`)}</div>`).join("")}
      ${button("＋ 添加功能", "add-extra", "secondary")}</div></section>
      <fieldset class="presentation-choice"><legend>介绍方式</legend>
      <label class="presentation-option ${state.presentation === "features" ? "selected" : ""}"><input type="radio" name="presentation" value="features" ${state.presentation === "features" ? "checked" : ""}><span><strong>逐个功能介绍</strong><small>默认方式，直接编辑所选功能的分镜。</small></span></label>
      <label class="presentation-option scenario-presentation ${state.presentation === "scenario" ? "selected" : ""}"><input type="radio" name="presentation" value="scenario" ${state.presentation === "scenario" ? "checked" : ""}><span><strong>用场景介绍</strong><small>将功能放进具体业务系统，先选场景，再编排分镜。</small>
      <span class="scenario-teaser"><span class="small muted">新版场景建议</span><span class="scenario-example-chips">${rankedScenarios().map(s => `<span class="pill">${s.title}</span>`).join("")}</span><small>先比较谁从“创建并持续修改业务应用”中受益，再给出三种具体任务；继续后可查看完整建议或添加自己的场景。</small></span></span></label>
      </fieldset>`;
  }
  function storyPage() {
    const data = state.sceneData;
    const ranked = rankedScenarios();
    const isLegacy = !scenarios.some(s => s.id === state.scenario) && !data.customScenarios.some(s => s.id === state.scenario);
    const current = scenarios.find(s => s.id === state.scenario);
    const missing = current ? [...new Set(current.flow.map(step => step.feature))].filter(id => !state.selected.includes(id)) : [];
    return `${heading("场景与大纲", `视频目标：${escape(state.videoGoal || "待补充")}。根据产品使用者、痛点和已选功能，组织具体业务场景。`)}<p class="optional-step">功能选择 / 可选环节：场景故事</p>
      <details class="persona-analysis compact-analysis"><summary>产品人群与痛点 · 查看分析依据</summary>
      <p class="analysis-note">根据新版 Skill 对“业务意图 → 关联结构 → 数据视图 → 持续修改 → 新入口”的机制分析整理；不是客户调研或市场规模结论。当前未接 Agent，以下为可编辑分析结果。</p>
      <div class="persona-grid">${data.personas.map((p, i) => `<article class="persona-card"><span class="pill ${["sage", "lavender", "blue"][i]}">人群 0${i + 1}</span>
        <label class="field">产品使用者<input data-persona="${i}" data-key="user" maxlength="300" value="${escape(p.user)}"></label>
        <label class="field">主要痛点<textarea data-persona="${i}" data-key="pain" maxlength="1000">${escape(p.pain)}</textarea></label>
        <p class="persona-basis">推断依据：${escape(p.basis)}</p></article>`).join("")}</div>
      <div class="analysis-controls"><label class="field persona-focus">优先考虑的人群<select id="persona-focus" data-field="personaFocus"><option value="all" ${data.focus === "all" ? "selected" : ""}>全部人群</option>${data.personas.map(p => `<option value="${p.id}" ${data.focus === p.id ? "selected" : ""}>${escape(p.user)}</option>`).join("")}</select></label>${button("更新示例建议", "refresh-scenarios", "secondary")}</div></details>
      ${state.extraFeatures.some(f => f.selected && f.title.trim()) ? `<div class="hint">补充功能尚未核验，不计入预置场景的功能匹配。</div>` : ""}
      <div class="scenario-grid compact-scenarios">${ranked.map((s, i) => {
        const persona = data.personas.find(p => p.id === s.persona);
        const required = [...new Set(s.flow.map(step => step.feature))];
        const missing = required.filter(id => !state.selected.includes(id));
        return `<article class="scenario compact-scenario ${state.scenario === s.id ? "selected" : ""}" data-scenario-card="${s.id}">
          <span class="pill ${i === 0 ? "sage" : i === 1 ? "lavender" : "blue"}">${missing.length ? "需补充功能" : i === 0 ? "优先建议 · 待验证" : "备选场景 · 待验证"}</span>
          <span class="scenario-number">0${i + 1}</span><h3>${s.title}</h3>
          <p class="scenario-user">${escape(persona.user)}</p>
          ${button(state.scenario === s.id ? "已选场景" : "选择此场景", "scenario", "secondary", `data-id="${s.id}" aria-pressed="${state.scenario === s.id}"`)}
        </article>`;
      }).join("")}</div>
      <section class="custom-scenarios compact-custom" aria-label="自定义场景">
        <div class="saved-scenarios">${data.customScenarios.map(s => {
          const draft = data.drafts.find(d => d.id === s.id) || s;
          return `<button class="saved-scenario ${state.scenario === s.id ? "selected" : ""}" data-action="scenario" data-id="${s.id}" aria-pressed="${state.scenario === s.id}"><strong>${escape(draft.title)}</strong><span>${escape(draft.user)}</span><span class="pill peach">自定义 · 待验证</span></button>`;
        }).join("")}</div>
        <details class="custom-scenario-editor"><summary>＋ 添加自己的场景</summary><form id="custom-scenario-form" novalidate>
          <div class="custom-fields">${field("场景名称", "scene.title", data.customInput.title, false, 'placeholder="例如：维修工单管理系统"')}
          ${field("产品使用者", "scene.user", data.customInput.user, false, 'placeholder="例如：物业维修主管与维修人员"')}
          ${field("主要痛点", "scene.pain", data.customInput.pain, true, 'placeholder="目前哪里有问题"')}
          ${field("场景故事", "scene.story", data.customInput.story, true, 'placeholder="谁在什么情况下，使用这些功能完成什么任务"')}</div>
          ${field("业务步骤（每行一步，可稍后补充）", "scene.steps", data.customInput.steps, true, 'placeholder="建立工单与人员表&#10;住户通过表单报修&#10;核对工单记录&#10;查看工单状态分布"')}
          <p class="small muted">仅保存你的描述，不自动补写分析或生成分镜。</p><button class="primary" type="submit">保存并选择场景</button>
        </form></details>
      </section>
      ${isLegacy ? '<div class="hint">当前保留的是旧版场景草稿，未自动替换。可选择上方业务场景；旧草稿会保留在本地。</div>' : ""}
      <div class="outline-panel selected-scenario-panel"><div class="outline-intro"><h3>场景详情与大纲</h3><span class="pill lavender">编辑、增删、排序</span><p class="small" style="margin-top:18px">切换时保留各场景的草稿。分镜和参考视频不会自动更新。</p>
      ${data.drafts.length > 1 ? `<label class="field" style="margin-top:18px">已保存的场景草稿<select id="saved-scenario"><option value="">选择草稿</option>${data.drafts.map(d => `<option value="${escape(d.id)}" ${state.scenario === d.id ? "selected" : ""}>${escape(d.title || "未命名场景")}</option>`).join("")}</select></label>` : ""}</div><div>
      ${field("场景名称", "storyTitle", state.storyTitle)}
      <div class="current-scenario-fields">${field("产品使用者", "storyUser", state.storyUser)}${field("主要痛点", "storyPain", state.storyPain, true)}</div>
      <div class="outline-description">${field("场景故事", "storyContext", state.storyContext, true)}${field("预期业务结果", "storyOutcome", state.storyOutcome, true)}</div>
      <h3 class="scenario-outline-title">功能串联与演示大纲</h3>
      <div class="outline-rows">${state.steps.map((s, i) => {
        const plannedStep = current?.flow.find((step, index) => s.id === `${current.id}-${index}`);
        const feature = plannedStep && features.find(f => f.id === plannedStep.feature);
        return `<div class="outline-step"><div class="outline-row"><span class="count">${String(i + 1).padStart(2, "0")}</span><input aria-label="步骤 ${i + 1}" data-step="${i}" maxlength="300" value="${escape(s.title)}"><div class="row-actions">${button("↑", "step-up", "icon-button", `data-index="${i}" aria-label="上移步骤 ${i + 1}" ${i === 0 ? "disabled" : ""}`)}${button("↓", "step-down", "icon-button", `data-index="${i}" aria-label="下移步骤 ${i + 1}" ${i === state.steps.length - 1 ? "disabled" : ""}`)}${button("×", "step-delete", "icon-button", `data-index="${i}" aria-label="删除步骤 ${i + 1}" ${state.steps.length === 1 ? "disabled" : ""}`)}</div></div><small class="step-feature">${feature ? `${feature.title} · ${state.selected.includes(feature.id) ? "已选" : "未选"}` : "功能映射待补充"}</small></div>`;
      }).join("")}</div>
      ${button("＋ 添加步骤", "step-add", "text-button")}
      ${current ? `<div class="selected-scenario-basis"><p>建议依据：${current.reason}</p><p>${missing.length ? `未选功能：${missing.map(id => features.find(f => f.id === id).title).join("、")}，不会自动勾选。` : "相关功能已选，具体业务配置仍需验证。"}</p><p>${current.condition}</p></div>` : '<p class="small muted">自定义或历史场景的功能适配待核验。</p>'}
      </div></div>`;
  }
  function recordingReference(shot) {
    const references = {
      build: ["empty.png", "旧实录中的空白应用", "只可参考产品空白状态；不含 Agent 宿主，不代表本次小店结构指令已执行。"],
      import: ["structure.png", "旧实录中的表结构", "只可参考真实产品界面；不是本稿的数据进入过程。"],
      dashboard: ["after.png", "旧实录中的看板", "只可参考看板界面；不是本稿从经营问题生成的新概览。"],
      workflow: ["after.png", "旧实录中的看板结果", "旧素材没有录到通过对话修改同一看板，不能作为本幕证明。"],
      form: ["form.png", "旧实录中的已填写表单", "旧素材只录到使用预置表单，没有录到从现有订单生成新表单。"]
    };
    const template = shotTemplates.find(s => s.id === shot.id);
    const reference = state.sample && (state.presentation === "features" ? references[shot.id] : template && [
      template.image, template.title, "旧实录参考，不是当前小店场景的新画面；修改脚本不会修改图片。Agent 创建与修改过程未入镜。"
    ]);
    return `<figure class="shot-reference">${reference && mediaAvailable
      ? `<div class="screen"><img src="/demo-assets/${reference[0]}" alt="Biz Table 已有实录参考：${reference[1]}"></div><figcaption><strong>已有实录参考 · ${reference[1]}</strong><p>${reference[2]}</p><a href="/demo-assets/${reference[0]}" target="_blank" rel="noopener">查看原图 ↗</a></figcaption>`
      : `<div class="screen"><div class="media-empty">${svg("film")}<strong>${reference ? "本地参考素材未连接" : "此功能暂无匹配画面"}</strong><p>未开始录制，不会自动生成截图。</p></div></div>`}</figure>
      <p class="recording-status">脚本草稿 · Agent 未连接 · 未执行新录制</p>`;
  }
  function sampleNarrationReference() {
    return `<details class="sample-narration"><summary>旧参考视频音轨 · 六段原文</summary><p>旧实录重新配音；Edge TTS · 晓晓（zh-CN-XiaoxiaoNeural）。这不是新版 Skill 五项能力脚本的音轨，也不是当前草稿的新成片。</p>${sampleNarrationCues.map(cue => `<article><small>${cue.start}–${cue.end} 秒</small><p>${cue.text}</p></article>`).join("")}</details>`;
  }
  function scriptPage() {
    const shots = activeShots();
    if (!shots.length) return `${heading("分镜脚本", "逐个功能介绍")}<div class="empty-panel"><p>请先选择或补充功能。</p>${button("返回功能选择", "page", "secondary", 'data-index="1"')}</div>`;
    state.shot = Math.min(state.shot, shots.length - 1);
    const s = shots[state.shot];
    const shotField = (label, key, multiline = true) => field(label, `shot.${key}`, s[key], multiline, `data-script-id="${escape(s.id)}"`);
    const draft = narrationDraft();
    return `${heading("分镜脚本", "逐幕编辑画面、这一幕的讲解和录制细节。讲解说清产品价值，操作说明留给执行者。")}
      ${state.presentation === "features" ? `<div class="editing-note">新版 Skill 逐功能脚本 · ${shots.length} 项能力沿同一个小店业务应用展开。真实 MCP 操作已完成排练，但 Agent 宿主与产品同框画面仍待补录。视频目标：${escape(state.videoGoal)}</div>` : state.stale ? '<div class="editing-note">当前场景使用新版 Skill 的统一分镜草稿；旧实录图片只作界面参考，不能替代新场景的真实操作。</div>' : ""}
      <details class="narrative-framing"><summary>开场与收束 · 可选</summary><div>${field("开场 · 为什么需要它", "narrative.opening", draft.opening, true)}${field("收束 · 产品带来的价值", "narrative.closing", draft.closing, true)}</div><p>保留此分支已有文字；编辑不会改写各幕讲解、操作说明或现有视频。</p></details>
      <div class="script-layout"><nav class="shot-list" aria-label="分镜列表">${shots.map((shot, i) => `<button class="shot-item ${state.shot === i ? "selected" : ""}" data-action="shot" data-index="${i}" aria-pressed="${state.shot === i}"><span class="shot-index">${String(i + 1).padStart(2, "0")}</span><span><strong>${escape(shot.title)}</strong><small>${state.presentation === "features" ? "功能分镜草稿" : "本地实录参考"}</small></span></button>`).join("")}</nav>
      <section class="shot-workspace" data-script-id="${escape(s.id)}"><div class="panel-header"><strong>分镜 · 第 ${String(state.shot + 1).padStart(2, "0")} 幕</strong><span class="pill sage">${state.presentation === "features" ? "功能分镜草稿" : "场景分镜草稿"}</span></div>${recordingReference(s)}<div class="shot-copy">${shotField("镜头名称", "title", false)}<p style="margin-top:12px">${escape(s.purpose)}</p>${shotField("这一幕的讲解", "narration")}${shotField("屏幕文案与出现时机", "caption")}<div class="beats"><span>建立起点</span>→<span>实际操作</span>→<span>核对结果</span></div><p class="small" style="margin-top:14px">改文字不会修改参考图片或现有视频。此处先确认拍法。</p></div></section>
      <aside class="detail-panel"><div class="panel-header"><strong>录制脚本 · 执行细节</strong>${svg("film")}</div><div class="detail-fields">${[["起始画面", "before"], ["具体指令 / 填写内容", "prompt"], ["操作顺序", "action"], ["剪辑与等待处理", "editing"], ["结束画面", "after"], ["高亮区域", "highlight"], ["镜头与取景", "camera"]].map(([label, key]) => shotField(label, key)).join("")}</div><details><summary>验证与转场</summary><div style="padding-top:14px">${shotField("成功证据", "verify")}${shotField("转场", "transition")}</div></details></aside></div>`;
  }
  function reviewPage() {
    return `${heading("效果与修改", "查看根据新版 Skill 生成的概念成片，并按故事片段提出修改。")}
      <div class="review-layout"><section><div class="video-wrap">${mediaAvailable ? '<video id="preview-video" controls preload="metadata" poster="/demo-assets/after.png" src="/demo-assets/video.mp4" aria-label="Biz Table 新版 Skill 概念成片"></video>' : '<div class="media-empty">未提供本地实录</div>'}</div>
      <div class="video-meta"><span>新版 Skill 概念成片 · Edge TTS · 51.2 秒</span>${mediaAvailable ? '<a href="/demo-assets/video.mp4" download="biztable-weekend-launch-concept.mp4">下载新版视频 ↓</a>' : "<span>素材未连接</span>"}</div>
      <div class="section-label"><strong>故事片段</strong><span class="small muted">左侧用户意图为生成画面，右侧包含真实排练结果</span></div>
      <div class="clips">${state.shots.map((s, i) => `<button class="clip ${state.clip === i ? "active" : ""}" data-action="clip" data-index="${i}" aria-label="选择片段 ${i + 1} ${escape(s.title)}" aria-pressed="${state.clip === i}"><div class="clip-thumb">${mediaAvailable ? `<img src="/demo-assets/${escape(shotTemplates[i].image)}" alt="">` : ""}</div><span>${String(i + 1).padStart(2, "0")} ${escape(s.title)}<br><small>${Math.floor(shotTemplates[i].time / 60)}:${String(Math.floor(shotTemplates[i].time % 60)).padStart(2, "0")}</small></span></button>`).join("")}</div>
      <div class="review-boundary">这是根据新版 Scenario 与分镜实时生成的概念成片：故事、用户意图界面和转场为生成内容，右侧产品画面包含真实排练结果。它用于展示 Skill 的叙事与导演能力，不宣称是完整真实 Agent 执行录屏。</div>
      </section><aside><form id="feedback-form" class="review-note"><h3>修改意见</h3><label class="field">修改范围<select data-field="feedbackTarget" id="feedback-target">${[...state.shots.map((s, i) => `片段 ${String(i + 1).padStart(2, "0")} · ${s.title}`), "整支视频", "场景与故事", "旁白与字幕", "片尾与结尾", "其他内容"].map(v => `<option ${state.feedbackTarget === v ? "selected" : ""} value="${escape(v)}">${escape(v)}</option>`).join("")}</select></label>
      ${field("修改内容", "feedbackText", state.feedbackText, true, 'placeholder="例如：提交成功画面延长 2 秒，结尾切回看板。" required')}
      <button class="primary" type="submit">保存修改意见 ${svg("arrow")}</button><p class="small" style="margin-top:10px">仅保存到本地 · 未发送给 Agent</p></form>
      <div class="feedback-list" aria-label="已保存的修改意见">${state.feedback.map(f => `<div class="feedback-item">${chip("待处理 · 本地", "peach")}<div class="small" style="margin-top:6px">${escape(f.target)}</div><p>${escape(f.text)}</p><button data-action="delete-feedback" data-id="${f.id}">移除</button></div>`).join("")}</div></aside></div>`;
  }
  function render() {
    clearAutomaticTimer();
    // Preserve the live canvas and its handlers while rebuilding the page shell.
    const spatialStage = variant === "spatial" ? document.querySelector(".spatial-stage") : null;
    spatialStage?.remove();
    document.title = `${pages[state.page]} · ProductShot`;
    document.documentElement.dataset.page = String(state.page);
    const content = state.page === 0 ? (studio ? studioHome() : home()) : !state.sample ? pending() : [null, featurePage, storyPage, scriptPage, reviewPage][state.page]();
    document.getElementById("app").innerHTML = `<header class="topbar"><div style="display:flex;align-items:center;gap:18px"><button class="brand" data-action="home" aria-label="ProductShot 首页">${brandIcon}ProductShot</button><span class="prototype-label">产品视频工作台</span></div><div class="top-right"><span class="small muted">${state.sample ? "示例预览" : "UI PREVIEW"}</span><button class="agent-button" data-action="connect"><span class="agent-dot"></span>连接 Agent ↗</button></div></header>
      <nav class="steps" aria-label="制作流程">${mainPages.map((page, i) => { const active = state.page === page || (state.page === 2 && page === 1); return `${i ? '<span class="step-line"></span>' : ""}<button data-action="page" data-index="${page}" class="step ${active ? "active" : state.page > page ? "past" : ""}" ${active ? 'aria-current="step"' : ""}><span class="number">${i + 1}</span>${pages[page]}</button>`; }).join("")}</nav>
      ${loadError ? `<div class="error-banner" role="alert">${escape(loadError)} ${button("下载原草稿", "export-raw", "secondary")} ${button("重置损坏草稿", "reset-storage", "secondary")}</div>` : ""}
      ${saveError ? `<div class="error-banner" role="alert">${escape(saveError)} ${button("下载草稿", "export", "secondary")}</div>` : ""}
      <main>${content}${state.page ? `<div class="page-foot">${navigation()}</div>` : ""}</main><footer class="global-foot"><span>ProductShot · UI 原型</span><span>Agent 未连接 · 草稿保存在本地</span></footer>`;
    if (spatialStage) (state.page === 0 ? document.querySelector(".home") : document.body).append(spatialStage);
    document.querySelectorAll("img").forEach(img => img.addEventListener("error", () => {
      const replacement = document.createElement("div"); replacement.className = "media-empty"; replacement.textContent = "参考图片不可用"; img.replaceWith(replacement);
      mediaAvailable = false;
    }));
    const video = document.getElementById("preview-video");
    if (video) video.addEventListener("error", () => {
      pauseAutomatic(); mediaAvailable = false; save();
      video.replaceWith(Object.assign(document.createElement("p"), { className: "media-empty", textContent: "参考视频加载失败；没有生成替代画面。" }));
      document.querySelector(".video-meta").textContent = "示例素材不可用 · 检查本地服务后刷新";
      notify("参考视频加载失败。请检查本地素材服务；没有生成替代画面。");
    });
  }
  function go(page) {
    pauseAutomatic();
    if (page === 2 && state.presentation === "features") { notify("逐个功能介绍已跳过场景故事；可在功能页切换介绍方式。"); return; }
    state.page = page;
    if (page === 3) { const shots = activeShots(); state.shot = Math.min(state.shot, Math.max(0, shots.length - 1)); }
    save(); render(); window.scrollTo({ top: 0, behavior: "instant" });
  }
  function next() {
    if (!state.sample) { notify("尚未接通分析。请先加载明确标注的示例，或返回填写资料。"); return; }
    if (state.page === 1 && !state.videoGoal.trim()) { notify("请先在首页填写视频目标。"); return; }
    if (state.page === 1 && !selectedFeatures().length) { notify("请至少选择或补充一个功能。"); return; }
    if (state.page === 1 && state.extraFeatures.some(f => f.selected && !f.title.trim())) { notify("请填写已勾选的补充功能，或删除空行。"); return; }
    if (state.page === 2 && (!state.storyTitle.trim() || !state.storyUser.trim() || !state.storyPain.trim() || !state.storyContext.trim() || state.steps.some(s => !s.title.trim()))) { notify("请补充场景名称、产品使用者、痛点、故事和业务步骤。"); return; }
    go(state.page === 1 && state.presentation === "features" ? 3 : Math.min(4, state.page + 1));
  }
  function download(data, filename, raw = false) {
    const url = URL.createObjectURL(new Blob([raw ? data : JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  document.addEventListener("input", event => {
    const el = event.target;
    if (el.matches("input,textarea,select")) pauseAutomatic();
    if (el.dataset.field) {
      const key = el.dataset.field;
      if (key.startsWith("shot.")) {
        const current = activeShots().find(s => s.id === el.dataset.scriptId);
        if (!current) return;
        if (state.presentation !== "features" && key === "shot.title" && state.feedbackTarget === `片段 ${String(state.shot + 1).padStart(2, "0")} · ${current.title}`) {
          state.feedbackTarget = `片段 ${String(state.shot + 1).padStart(2, "0")} · ${el.value}`;
        }
        current[key.slice(5)] = el.value;
        if (key === "shot.title") document.querySelector(".shot-item.selected strong").textContent = el.value;
      }
      else if (key.startsWith("narrative.")) narrationDraft()[key.slice(10)] = el.value;
      else if (key.startsWith("scene.")) state.sceneData.customInput[key.slice(6)] = el.value;
      else if (key === "personaFocus") return;
      else state[key] = el.value;
      if (key === "source") { state.sample = false; state.automatic = "idle"; }
      if (["videoGoal", "custom", "audience", "audienceAdditional", "storyTitle", "storyContext", "storyUser", "storyPain", "storyOutcome"].includes(key)) state.stale = true;
      save();
    } else if (el.dataset.step !== undefined) { state.steps[Number(el.dataset.step)].title = el.value; state.stale = true; save(); }
    else if (el.dataset.extra !== undefined) { state.extraFeatures.find(f => f.id === el.dataset.extra).title = el.value; state.stale = true; save(); }
    else if (el.dataset.persona !== undefined) {
      state.sceneData.personas[Number(el.dataset.persona)][el.dataset.key] = el.value;
      state.stale = true; save();
    }
  });
  document.addEventListener("focusin", event => {
    if (event.target.matches("input,textarea,select") && !event.target.matches('[name="production-mode"]')) pauseAutomatic();
  });
  document.addEventListener("change", event => {
    const el = event.target;
    pauseAutomatic();
    if (el.name === "presentation") { state.presentation = el.value; state.shot = 0; state.stale = true; save(); render(); return; }
    if (el.dataset.extraCheck) { state.extraFeatures.find(f => f.id === el.dataset.extraCheck).selected = el.checked; state.stale = true; save(); render(); return; }
    if (el.id === "persona-focus") { state.sceneData.focus = el.value; save(); render(); return; }
    if (el.id === "saved-scenario" && el.value) { chooseScenario(el.value); return; }
    if (el.dataset.feature) {
      state.selected = el.checked ? [...new Set([...state.selected, el.dataset.feature])] : state.selected.filter(id => id !== el.dataset.feature);
      state.stale = true; save(); render();
    }
    if (el.id === "files") {
      const additions = Array.from(el.files, f => ({ name: f.name, size: f.size }));
      if (state.files.length + additions.length > 10) { notify("原型最多添加 10 个资料名称。"); el.value = ""; return; }
      state.files.push(...additions); state.sample = false; state.automatic = "idle"; save(); render(); notify("已添加文件名称；原型没有读取或上传文件。");
    }
  });
  document.addEventListener("submit", event => {
    if (event.target.id === "source-form") {
      event.preventDefault();
      if (!state.source.trim() && !state.files.length) { notify("先放一个链接、一段介绍，或添加一份资料。"); document.getElementById("source").focus(); return; }
      if (!state.videoGoal.trim()) { notify("请简单说明视频用途，可附大致时长。"); document.querySelector('[data-field="videoGoal"]').focus(); return; }
      if (event.submitter?.name === "production-mode") state.mode = event.submitter.value;
      state.sample = !state.files.length && state.source.trim().replace(/\/$/, "") === DEFAULT_SOURCE.replace(/\/$/, "");
      if (state.sample && state.mode === "oneclick") {
        state.selected = recommendedFeatures();
        state.presentation = "features";
        state.extraFeatures.forEach(feature => { feature.selected = false; });
        state.shot = 0;
        state.stale = true;
      }
      if (state.sample && state.mode === "oneclick") {
        state.automatic = "done";
        go(4);
        notify("一键成片已直接进入效果与修改；中间步骤不展示。");
      } else {
        state.automatic = "idle";
        go(1);
        if (state.sample) notify("已进入分步骤模式；按功能选择、分镜脚本和效果与修改继续。");
      }
    } else if (event.target.id === "custom-scenario-form") {
      event.preventDefault();
      const input = state.sceneData.customInput;
      if (["title", "user", "pain", "story"].some(k => !input[k].trim())) { notify("请填写场景名称、产品使用者、痛点和故事。"); return; }
      const lines = input.steps.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (lines.length > 20) { notify("最多填写 20 个业务步骤。"); return; }
      if (state.sceneData.customScenarios.length >= 20) { notify("最多保存 20 个自定义场景。"); return; }
      const id = "custom-" + crypto.randomUUID();
      state.sceneData.customScenarios.push({ id, title: input.title.trim(), user: input.user.trim(), pain: input.pain.trim(), context: input.story.trim(), outcome: "", steps: (lines.length ? lines : [""]).map(title => ({ id: crypto.randomUUID(), title })) });
      state.sceneData.customInput = newScenarioInput();
      chooseScenario(id);
      notify("自定义场景已保存。可在下方编辑大纲，功能适配仍待验证。");
    } else if (event.target.id === "feedback-form") {
      event.preventDefault();
      if (!state.feedbackText.trim()) { notify("请先写下修改意见。"); return; }
      state.feedback.unshift({ id: crypto.randomUUID(), target: state.feedbackTarget, text: state.feedbackText.trim(), at: new Date().toISOString() });
      state.feedbackText = ""; save(); render(); notify("修改意见已保存到本地，未发送给 Agent。视频未修改。");
    }
  });
  document.addEventListener("click", event => {
    if (event.target.closest(".narrative-framing summary")) pauseAutomatic();
    const card = event.target.closest(".feature-card");
    if (card && !event.target.closest("input,details")) { card.querySelector("input").click(); return; }
    const el = event.target.closest("[data-action]");
    if (!el || el.disabled) return;
    const a = el.dataset.action, i = Number(el.dataset.index);
    if (!["export", "export-raw"].includes(a)) pauseAutomatic();
    if (a === "connect") document.getElementById("connection").showModal();
    else if (a === "close-dialog") document.getElementById("connection").close();
    else if (a === "page") go(i);
    else if (a === "home") go(0);
    else if (a === "back") go(state.page === 3 && state.presentation === "features" ? 1 : Math.max(0, state.page - 1));
    else if (a === "next") next();
    else if (a === "add-extra") {
      const id = "extra-" + crypto.randomUUID();
      state.extraFeatures.push({ id, title: "", selected: true }); state.stale = true; save(); render();
      document.querySelector(`[data-extra="${id}"]`).focus();
    }
    else if (a === "remove-extra") { state.extraFeatures = state.extraFeatures.filter(f => f.id !== el.dataset.id); state.stale = true; save(); render(); }
    else if (a === "remove-file") { state.files.splice(i, 1); save(); render(); }
    else if (a === "audience") { state.audience = state.audience === el.dataset.value ? "" : el.dataset.value; state.stale = true; save(); render(); }
    else if (a === "clear-audience") { state.audience = ""; state.stale = true; save(); render(); }
    else if (a === "refresh-scenarios") { save(); render(); notify("已按编辑的人群、痛点和已选功能更新示例展示；未调用 Agent。"); }
    else if (a === "scenario") {
      chooseScenario(el.dataset.id);
    } else if (a === "step-add") {
      if (state.steps.length >= 20) { notify("最多 20 个步骤。"); return; }
      state.steps.push({ id: crypto.randomUUID(), title: "" }); state.stale = true; save(); render();
      document.querySelector(`[data-step="${state.steps.length - 1}"]`).focus();
    } else if (a === "step-delete") { state.steps.splice(i, 1); state.stale = true; save(); render(); }
    else if (a === "step-up" || a === "step-down") {
      const target = i + (a === "step-up" ? -1 : 1);
      [state.steps[i], state.steps[target]] = [state.steps[target], state.steps[i]]; state.stale = true; save(); render();
    } else if (a === "shot") { state.shot = i; save(); render(); }
    else if (a === "clip") {
      state.clip = i; state.feedbackTarget = `片段 ${String(i + 1).padStart(2, "0")} · ${state.shots[i].title}`; save();
      document.getElementById("feedback-target").value = state.feedbackTarget;
      document.querySelectorAll(".clip").forEach((c, index) => { c.classList.toggle("active", index === i); c.setAttribute("aria-pressed", String(index === i)); });
      const v = document.getElementById("preview-video");
      if (v) { if (v.readyState >= 1) v.currentTime = shotTemplates[i].time; else v.addEventListener("loadedmetadata", () => { v.currentTime = shotTemplates[state.clip].time; }, { once: true }); }
      else notify("片段已选中；当前没有可播放的实录素材。");
    } else if (a === "delete-feedback") { state.feedback = state.feedback.filter(f => f.id !== el.dataset.id); save(); render(); }
    else if (a === "export") download({ format: "productshot-ui-prototype", ...state, note: "UI 示例草稿，不是导演项目审批或已生成视频。" }, "productshot-ui-draft.json");
    else if (a === "export-raw") {
      try { download(localStorage.getItem(STORAGE) || "", "productshot-unread-draft.json", true); } catch (error) { notify("原草稿无法读取：" + error.message); }
    } else if (a === "reset-storage" && window.confirm("清除损坏的 UI 草稿？不会修改导演项目或视频。")) {
      try { localStorage.removeItem(STORAGE); loadError = ""; state = defaults(); render(); } catch (error) { notify("重置失败：" + error.message); }
    }
  });
  window.addEventListener("storage", event => {
    if (event.key === STORAGE) { clearAutomaticTimer(); state.automatic = "paused"; loadError = "此草稿在另一个标签页发生变化。为避免覆盖已暂停保存；请下载当前草稿后刷新读取最新版本。"; render(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pauseAutomatic(); });
  window.addEventListener("pagehide", pauseAutomatic);
  render();
  fetch("/demo-assets/status", { cache: "no-store" }).then(async response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json(); mediaAvailable = data.available === true; mediaChecked = true;
    if (state.page >= 3 && !document.activeElement?.matches("input,textarea,select")) render();
  }).catch(() => { mediaAvailable = false; mediaChecked = true; if (state.page >= 3) notify("参考素材服务未连接，已保留空素材状态。"); });
})();
