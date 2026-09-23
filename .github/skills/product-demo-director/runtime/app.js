(() => {
  "use strict";
  const tokenKey = "productshot-director-token";
  const token = location.hash.slice(1) || sessionStorage.getItem(tokenKey) || "";
  sessionStorage.setItem(tokenKey, token);
  if (location.hash) history.replaceState(null, "", location.pathname);
  let project, tab = "discovery", dirty = false, draft = null, remoteChanged = false, busy = false, feedbackDraft = "", notice = "";
  const names = { discovery: "产品理解", selection: "功能与观众", outline: "场景大纲", storyboard: "故事与分镜", review: "成果与审阅" };
  const keys = Object.keys(names);
  const pages = { selection: ["Features & Audience", "功能与受众"], outline: ["Scenario & Outline", "场景与大纲"], storyboard: ["Story & Shots", "故事与分镜"], review: ["Preview & Review", "成果与审阅"] };
  const answers = new Map();
  const activePage = () => tab === "discovery" ? "selection" : tab;
  const effectiveTab = (key) => key === "selection" && !approved("discovery") ? "discovery" : key;
  const directions = { before: "起始状态", actions: "操作顺序", highlight: "高亮什么", camera: "镜头从哪里到哪里", motion: "动效与来源", after: "结束状态", hold: "停留到什么条件", transition: "如何衔接下一镜", verify: "成功证据", mustKeep: "必须保留" };
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (s) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
  const button = (action, label, disabled = false, cls = "") => `<button type="button" data-action="${action}" class="${cls}" ${disabled ? "disabled" : ""}>${label}</button>`;
  const textField = (label, value, path, multiline = false) => `<label>${label}${multiline ? `<textarea data-path="${path}" maxlength="2000" rows="3">${esc(value)}</textarea>` : `<input data-path="${path}" maxlength="1000" value="${esc(value)}">`}</label>`;
  const approved = (key) => !!project.approvals[key];
  function ready(key) { return keys.slice(0, keys.indexOf(key)).every(approved); }
  function prepare() {
    draft = structuredClone(project.documents[tab] || (tab === "selection" ? { capabilityIds: [], additional: "", scope: "related", audience: "" } : null));
    dirty = false; remoteChanged = false;
  }
  async function api(route, data) {
    const response = await fetch(route, { method: data ? "POST" : "GET", headers: { "X-Director-Token": token, ...(data ? { "Content-Type": "application/json" } : {}) }, body: data ? JSON.stringify(data) : undefined, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
    return result;
  }
  function status(key) {
    if (!project.documents[key]) return "待生成";
    if (!ready(key)) return "上游已变更";
    return approved(key) ? "已确认" : "待确认";
  }
  function documentContent() {
    if (!ready(tab)) return `<div class="empty"><h2>先确认上一阶段</h2><p>下游草稿会保留，但不会因为已有内容就自动视为已批准。请返回前一阶段核对。</p>${draft ? '<p>Agent 可用 read 命令读取保留的草稿，按新的决定修订。</p>' : ""}</div>`;
    if (tab === "discovery") {
      if (!draft) return waiting("Agent 正在理解产品", "先读取授权的代码或网页，再发布有依据的能力清单。这里不会填入虚构功能。");
      return `<h2>我理解到的产品能力</h2><p class="lead">${esc(draft.summary)}</p><p class="source">依据版本：${esc(draft.sourceRevision)}</p><div class="capabilities">${draft.capabilities.map((c) => `<article><span class="badge">${esc(({ "source-verified": "源码有依据 · 未实测", "runtime-verified": "有运行验证", documented: "文档说明", "needs-confirmation": "待核验" })[c.confidence])}</span><h3>${esc(c.title)}</h3><p>${esc(c.proof)}</p><details><summary>依据与边界</summary><ul>${c.evidence.map((e) => `<li>${esc(e)}</li>`).join("")}</ul><p>${esc(c.limitations)}</p></details></article>`).join("")}</div>`;
    }
    if (tab === "selection") return `<h2>这次想展示什么，给谁看？</h2><p class="lead">这里保存对话里确定的选择，也可以直接修改。新增能力会先交给 Agent 核实。</p><details class="product-evidence"><summary>产品理解与证据</summary><p>${esc(project.documents.discovery.summary)}</p><p class="source">${esc(project.source)}</p>${button("discovery", "查看完整能力依据")}</details><div class="picks">${project.documents.discovery.capabilities.map((c) => `<label class="pick"><input type="checkbox" data-capability="${c.id}" ${draft.capabilityIds.includes(c.id) ? "checked" : ""}><span><b>${esc(c.title)}</b><small>${esc(c.proof)}</small></span></label>`).join("")}</div>
      ${textField("也可以补充 AI 没找到的能力", draft.additional, "additional", true)}<label>展示范围<select data-path="scope">${[["single", "聚焦一个功能"], ["related", "几个相关功能"], ["whole", "产品整体"]].map(([id, label]) => `<option value="${id}" ${draft.scope === id ? "selected" : ""}>${label}</option>`).join("")}</select></label>${textField("观众与背景（不是产品用户画像）", draft.audience, "audience", true)}`;
    if (tab === "outline") {
      if (!draft) return waiting("还没有大纲", "功能与观众确认后，Agent 会提出合适的场景。选定的方案在这里变成简单列表，不需要截图或时长。");
      return `<h2>在哪个场景里，先做什么，再做什么。</h2><p class="lead">在左边比较 Agent 提出的不同方案。这里是当前选定的大纲，不是所有备选方案的拼接。</p>${draft.scenarios.map((scene, i) => `<section class="scenario">${textField("场景", scene.title, `scenarios.${i}.title`)}${textField("场景背景", scene.context, `scenarios.${i}.context`)}<ol>${scene.steps.map((step, j) => `<li>${textField("步骤名称", step.title, `scenarios.${i}.steps.${j}.title`)}${textField("要说明什么", step.purpose, `scenarios.${i}.steps.${j}.purpose`)}<div class="step-actions"><button data-action="step-up" data-scene="${i}" data-step="${j}" ${j === 0 ? "disabled" : ""}>上移</button><button data-action="step-down" data-scene="${i}" data-step="${j}" ${j === scene.steps.length - 1 ? "disabled" : ""}>下移</button><button data-action="step-delete" data-scene="${i}" data-step="${j}" ${scene.steps.length <= 1 ? "disabled" : ""}>删除</button></div></li>`).join("")}</ol><button data-action="step-add" data-scene="${i}">＋ 添加步骤</button>${textField("最后希望观众理解什么", scene.outcome, `scenarios.${i}.outcome`, true)}<button data-action="scenario-delete" data-scene="${i}" ${draft.scenarios.length <= 1 ? "disabled" : ""}>移除此场景</button></section>`).join("")}${button("scenario-add", "＋ 写一个自己的场景", draft.scenarios.length >= 8)}`;
    }
    if (tab === "storyboard") {
      if (!draft) return waiting("等待逐镜拍摄说明", "一个大纲步骤可以有多个镜头：例如打开表单、填写字段、点击确认。Agent 将基于确认的大纲补齐拍法。");
      const steps = project.documents.outline.scenarios.flatMap((s) => s.steps);
      return `<h2>从业务步骤，到每一镜的拍法。</h2><p class="lead">不要求填写秒数。排练后再确定操作时间与声音同步。</p>${steps.map((step) => `<section class="scenario"><h3>${esc(step.title)}</h3>${draft.shots.map((shot, i) => shot.stepId !== step.id ? "" : `<details class="shot"><summary>${esc(shot.title)} <span>${esc(shot.sourceType)}</span></summary>${textField("镜头名称", shot.title, `shots.${i}.title`)}${textField("表达目的", shot.purpose, `shots.${i}.purpose`, true)}<div class="direction-grid">${Object.entries(directions).map(([key, label]) => textField(label, shot.direction[key], `shots.${i}.direction.${key}`, true)).join("")}</div><p class="source">证据：${esc(shot.evidence.join("；"))}</p></details>`).join("")}</section>`).join("")}`;
    }
    if (!draft) return waiting("尚无制作成果", "Skill 先完成拍摄方案。只有实际制作、验证过的文件才能进入这里；不会用模拟进度或占位视频冒充完成。");
    return `<h2>实际交付记录</h2><p>${esc(draft.summary)}</p>${draft.artifacts.map((a) => `<article class="artifact"><h3>${esc(a.label)}</h3><code>${esc(a.path)}</code><p>${esc(a.validation)}</p><small>SHA-256：${esc(a.sha256)}</small></article>`).join("")}<p class="source">${esc(draft.limitations)}</p>${textField("审阅意见 · 也可以在左边要求 Agent 修改", draft.notes || "", "notes", true)}<p class="source">审阅意见保存后需重新确认。修改意见不代表视频已重制；实际文件由制作工具生成后重新发布。当前未接播放器或自动录制服务。</p>`;
  }
  function waiting(title, message) { return `<div class="empty"><span class="empty-mark">···</span><h2>${title}</h2><p>${message}</p></div>`; }
  function questionStale(item) {
    return project.events.some((e) => e.revision > item.basedOnRevision && (e.type === "approve" || (e.type === "publish" && e.changed)));
  }
  function conversation() {
    const messages = [...(project.conversation || [])];
    const linked = new Set(messages.map((m) => m.requestId).filter(Boolean));
    for (const request of project.requests) {
      if (!linked.has(request.id)) messages.push({ id: request.id, role: "user", stage: request.stage, text: request.text, requestId: request.id, at: request.createdAt });
      if (request.resolution) messages.push({ id: `${request.id}-resolution`, role: "agent", stage: request.stage, kind: "message", text: request.resolution, at: request.resolvedAt });
    }
    messages.sort((a, b) => a.at.localeCompare(b.at));
    return messages.map((item) => {
      const request = project.requests.find((r) => r.id === item.requestId);
      const question = item.role === "agent" && item.kind !== "message";
      const stale = question && questionStale(item);
      const closed = item.answeredAt || item.superseded || stale;
      const current = answers.get(item.id) || { choiceIds: [], text: "" };
      return `<article class="message ${item.role}"><div class="message-meta"><b>${item.role === "agent" ? "Director" : "你"}</b><small>${esc(names[item.stage])}${request ? ` · ${request.status === "open" ? "等待 Agent 读取" : "已处理"}` : ""}</small></div><p>${esc(item.text)}</p>${question ? `<fieldset class="question" data-question="${esc(item.id)}" ${closed || busy ? "disabled" : ""}><legend>${item.kind === "multiple" ? "可多选，也可以补充自己的想法" : "选一个方向，或直接填写你的想法"}</legend>${item.choices.map((c) => `<label class="choice"><input type="${item.kind === "multiple" ? "checkbox" : "radio"}" name="q-${esc(item.id)}" value="${esc(c.id)}" ${current.choiceIds.includes(c.id) ? "checked" : ""}><span>${esc(c.label)}${c.description ? `<small>${esc(c.description)}</small>` : ""}</span></label>`).join("")}<textarea data-answer-text="${esc(item.id)}" aria-label="自己的想法" maxlength="2000" placeholder="都不合适？写下你的想法。">${esc(current.text)}</textarea><button data-action="answer" data-question="${esc(item.id)}" ${closed || busy ? "disabled" : ""}>${item.answeredAt ? "回答已保存" : item.superseded ? "已由新问题替代" : stale ? "内容已变化，等待 Agent 更新问题" : "发送我的选择"}</button></fieldset>` : ""}</article>`;
    }).join("") || '<div class="conversation-empty"><p>把产品链接或 Repo 发给 Agent。</p><small>先理解产品，再帮你选择展示内容。这里会保留真实的问题、选项和你的回答。</small></div>';
  }
  function render() {
    if (!project) return;
    const oldScroll = document.querySelector(".conversation")?.scrollTop;
    const editable = ["selection", "outline", "storyboard", "review"].includes(tab) && draft && ready(tab);
    document.getElementById("app").innerHTML = `<header class="top"><a href="#" aria-label="ProductShot"><b><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M11 5H5v6m16-6h6v6M5 21v6h6m16-6v6h-6" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="m13 10 10 6-10 6z" fill="currentColor"/></svg></b> ProductShot</a><div>${esc(project.name)}<small>本地真实项目 · revision ${project.revision}</small></div><span class="private"><i></i> 仅限本机 · 无模型 API</span></header>
      <div class="layout"><aside><div class="director-title"><span>✎</span><div><h3>一起，把产品讲清楚。</h3><small>PRODUCT DEMO DIRECTOR</small></div></div><details class="skill-intro"><summary>这个 Skill 怎么工作？ <span>4 个步骤</span></summary><p>给我产品链接或 Repo。我先理解产品，和你确定功能与受众，再提出场景大纲、细化每一镜，最后记录实际成果和审阅意见。</p><p>你可以持续对话，也可以在右侧编辑。已确认的内容会保存为同一份项目。</p><img src="/brand-story.svg" width="280" height="150" alt=""><small>品牌插画只属于工作台，不会进入你的产品视频。</small></details><details class="source-box"><summary>产品来源</summary><p>${esc(project.source)}</p><small>可在下方补充网址、Repo 或访问限制；由 Agent 核实后更新。</small></details><div class="conversation requests" aria-label="Agent 对话记录">${conversation()}</div><form id="feedback"><label for="feedback-text">继续对话 · ${names[tab]}</label><textarea id="feedback-text" maxlength="2000" placeholder="粘贴链接、补充功能，或者告诉我哪里要改…">${esc(feedbackDraft)}</textarea><div class="composer-actions"><small>本地保存 · 当前 Agent 接续</small><button ${busy ? "disabled" : ""}>发送 <span aria-hidden="true">↑</span></button></div><p class="connection-note">尚未接入自动聊天服务。发送后，请在当前 Agent 会话说“读取项目继续”；回复会同步到这里。</p></form></aside>
      <main><nav aria-label="项目阶段">${Object.entries(pages).map(([key, labels], i) => `<button data-action="tab" data-tab="${key}" class="${activePage() === key ? "active" : ""}" aria-current="${activePage() === key ? "step" : "false"}"><em>0${i + 1}</em><span>${labels[0]}<small>${labels[1]} · ${status(effectiveTab(key))}</small></span></button>`).join("")}</nav><div class="document-body"><div id="notice" role="status" class="notice ${notice || remoteChanged ? "" : "hidden"}">${esc(remoteChanged ? "Agent 已发布新版本；你的未保存编辑仍在。请先下载草稿，再重新加载合并，不能覆盖新版本。" : notice)}</div>
      <div class="document-heading"><span>${names[tab]} / ${status(tab)}</span><div>${button("refresh", "读取最新版本", busy)}${button("download", dirty ? "下载未保存草稿" : "下载项目", busy)}</div></div>${documentContent()}
      <footer><span id="save-state">${dirty ? "有未保存编辑" : approved(tab) ? "此版本已确认" : "当前为草稿，确认后推进下一阶段"}</span><div>${editable ? button("save", "保存修改", busy, "secondary") : ""}${draft && ready(tab) ? button("approve", approved(tab) ? "再次确认此版本" : tab === "discovery" ? "理解无误，选择展示重点" : "确认此阶段", busy, "primary") : ""}</div></footer></div></main></div><div class="shell-footer"><span>ProductShot / A story worth showing.</span><span>对话推动创作，工作台保存每一个决定。</span></div>`;
    const thread = document.querySelector(".conversation");
    thread.scrollTop = oldScroll ?? thread.scrollHeight;
  }
  function changed() { dirty = true; const state = document.getElementById("save-state"); if (state) state.textContent = "有未保存编辑，尚未修改已确认版本"; }
  function readInputs() {
    document.querySelectorAll("[data-path]").forEach((el) => {
      const parts = el.dataset.path.split(".");
      let target = draft;
      for (const part of parts.slice(0, -1)) target = target[part];
      target[parts.at(-1)] = el.value;
    });
    if (tab === "selection") draft.capabilityIds = [...document.querySelectorAll("[data-capability]:checked")].map((el) => el.dataset.capability);
  }
  async function action(data) {
    if (busy) return;
    busy = true;
    try {
      project = await api("/api/action", { revision: project.revision, ...data });
      if (data.action === "approve" && tab !== "review") tab = keys[keys.indexOf(tab) + 1];
      prepare(); notice = "已保存到项目，Agent 与网页读取的是同一份数据。";
    } catch (error) { notice = error.message; }
    finally { busy = false; render(); }
  }
  async function refresh(discard = false) {
    const next = await api("/api/project");
    if (project && next.revision !== project.revision && dirty && !discard) {
      remoteChanged = true;
      const n = document.getElementById("notice"); if (n) { n.classList.remove("hidden"); n.textContent = "项目已有新版本；你的草稿保留中。请下载草稿后读取最新版本，避免覆盖。"; }
      return;
    }
    if (!project || next.revision !== project.revision || discard) { project = next; prepare(); render(); }
  }
  document.addEventListener("input", (event) => {
    if (event.target.id === "feedback-text") { feedbackDraft = event.target.value; return; }
    if (event.target.matches("[data-path],[data-capability]")) { readInputs(); changed(); }
    if (event.target.closest("[data-question]")) rememberAnswer(event.target.closest("[data-question]"));
  });
  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-path],[data-capability]")) { readInputs(); changed(); }
    if (event.target.closest("[data-question]")) rememberAnswer(event.target.closest("[data-question]"));
  });
  function rememberAnswer(field) {
    answers.set(field.dataset.question, { choiceIds: [...field.querySelectorAll("input:checked")].map((el) => el.value), text: field.querySelector("textarea").value });
  }
  async function sendConversation(data) {
    if (busy) return;
    busy = true;
    try {
      project = await api("/api/action", { revision: project.revision, ...data });
      if (data.action === "request") feedbackDraft = "";
      else answers.delete(data.questionId);
      notice = "回答已保存，等待当前 Agent 读取；未自动调用模型。";
    } catch (error) { notice = error.message; }
    finally { busy = false; render(); }
    const thread = document.querySelector(".conversation");
    thread.scrollTop = thread.scrollHeight;
  }
  document.addEventListener("click", async (event) => {
    const el = event.target.closest("[data-action]");
    if (!el || el.disabled || busy) return;
    const a = el.dataset.action;
    try {
      if (a === "tab" || a === "discovery") {
        if (dirty && !confirm("有未保存的修改。离开会丢弃草稿，是否继续？")) return;
        tab = a === "discovery" ? "discovery" : effectiveTab(el.dataset.tab); prepare(); notice = ""; render();
      } else if (a === "refresh") {
        if (dirty && !confirm("读取新版本会丢弃未保存草稿。建议先下载；是否继续？")) return;
        await refresh(true);
      } else if (a === "download") {
        readInputs();
        const payload = dirty ? { format: "productshot-stage-draft", stage: tab, basedOnRevision: project.revision, data: draft } : project;
        const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
        const link = document.createElement("a"); link.href = url; link.download = dirty ? `${tab}-draft.json` : "director-project.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (a === "save") {
        readInputs(); await action({ action: "publish", stage: tab, data: draft });
      } else if (a === "approve") {
        if (dirty) { notice = "请先保存修改，再确认这个版本。"; render(); return; }
        if (!confirm(`确认“${names[tab]}”当前版本？这不授予录制、产品写入、付费生成或公开发布权限。`)) return;
        await action({ action: "approve", stage: tab, note: "用户在本地项目页明确确认当前文档版本。" });
      } else if (a === "answer") {
        const answer = answers.get(el.dataset.question) || { choiceIds: [], text: "" };
        await sendConversation({ action: "answer", questionId: el.dataset.question, ...answer });
      } else if (a === "scenario-add" || a === "scenario-delete") {
        readInputs();
        if (a === "scenario-add") {
          if (draft.scenarios.length >= 8 || draft.scenarios.flatMap((s) => s.steps).length >= 24) throw new Error("最多 8 个场景、24 个步骤");
          draft.scenarios.push({ id: crypto.randomUUID(), title: "", context: "", outcome: "", steps: [{ id: crypto.randomUUID(), title: "", purpose: "" }] });
        } else draft.scenarios.splice(Number(el.dataset.scene), 1);
        changed(); render();
      } else if (a.startsWith("step-")) {
        readInputs();
        const steps = draft.scenarios[Number(el.dataset.scene)].steps, index = Number(el.dataset.step);
        if (a === "step-add") {
          if (draft.scenarios.flatMap((s) => s.steps).length >= 24) throw new Error("最多 24 个步骤");
          steps.push({ id: crypto.randomUUID(), title: "新步骤", purpose: "请补充这个步骤要证明什么。" });
        } else if (a === "step-delete") steps.splice(index, 1);
        else { const next = index + (a === "step-up" ? -1 : 1); [steps[index], steps[next]] = [steps[next], steps[index]]; }
        changed(); render();
      }
    } catch (error) { notice = error.message; render(); }
  });
  document.addEventListener("submit", async (event) => {
    if (event.target.id !== "feedback") return;
    event.preventDefault();
    if (busy) return;
    if (!feedbackDraft.trim()) { notice = "请填写反馈。"; render(); return; }
    // Conversation writes preserve the unsaved right-hand document.
    await sendConversation({ action: "request", stage: tab, text: feedbackDraft.trim(), target: "" });
  });
  window.addEventListener("beforeunload", (event) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } });
  refresh().catch((error) => { document.getElementById("app").textContent = `无法打开项目：${error.message}。请使用 director serve 输出的完整本地链接。`; });
  setInterval(() => { if (!busy && project && !document.hidden) refresh().catch((error) => {
    notice = `同步失败：${error.message}`;
    const n = document.getElementById("notice"); if (n) { n.textContent = notice; n.classList.remove("hidden"); }
  }); }, 2500);
})();
