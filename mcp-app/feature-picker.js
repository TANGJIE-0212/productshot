import { App, applyDocumentTheme, applyHostStyleVariables } from "@modelcontextprotocol/ext-apps";
import { toolData } from "./tool-data.js";

const app = new App({ name: "ProductShot feature picker", version: "0.1.0" });
const element = (id) => document.getElementById(id);
const fields = element("fields");
const additional = element("additional");
let current, dirty = false, busy = false, connected = false, pendingMessage, discardPending = false;
const selected = new Set();
const errorText = (error) => error instanceof Error ? error.message : String(error);

function status(message, isError = false) {
  element("status").textContent = message;
  element("status").dataset.error = String(isError);
}

function controls() {
  const canCall = connected && Boolean(app.getHostCapabilities()?.serverTools);
  fields.disabled = busy || !canCall || !current;
  element("confirm").disabled = fields.disabled;
  element("reload").disabled = busy || !canCall || !current;
  element("reload").textContent = discardPending ? "确认丢弃草稿并读取" : "读取最新选择";
  element("retry").hidden = !pendingMessage;
  element("retry").disabled = busy;
  element("count").textContent = `已选 ${selected.size} 项 · 可多选`;
}

function render(data) {
  current = data;
  selected.clear();
  const initial = data.selection?.capabilityIds ?? data.recommendedIds;
  // Legacy whole-product selections expand to explicit choices without changing stored state.
  const initialIds = data.selection?.scope === "whole" ? data.capabilities.map((capability) => capability.id) : initial;
  initialIds.forEach((id) => selected.add(id));
  additional.value = data.selection?.additional ?? "";
  element("project").textContent = `${data.name} · revision ${data.revision}`;
  element("choices").replaceChildren();
  for (const capability of data.capabilities) {
    const card = document.createElement("section");
    card.className = "choice";
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.capability = capability.id;
    checkbox.checked = selected.has(capability.id);
    const description = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = capability.title;
    description.append(title);
    if (data.recommendedIds.includes(capability.id)) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = "推荐";
      description.append(badge);
    }
    const proof = document.createElement("p");
    proof.textContent = capability.proof;
    description.append(proof);
    label.append(checkbox, description);
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "证据与限制";
    const evidence = document.createElement("p");
    evidence.textContent = `${capability.confidence} · ${capability.limitations}\n${capability.evidence.join("\n")}`;
    details.append(summary, evidence);
    card.append(label, details);
    element("choices").append(card);
  }
  dirty = false;
  discardPending = false;
  controls();
}

fields.addEventListener("input", (event) => {
  const id = event.target.dataset.capability;
  if (id) event.target.checked ? selected.add(id) : selected.delete(id);
  dirty = true;
  discardPending = false;
  pendingMessage = undefined;
  controls();
  status("选择尚未确认。点击“确认并继续”后保存并交给 Agent。");
});

async function deliverMessage() {
  if (!app.getHostCapabilities()?.message?.text) {
    status("选择已保存，但宿主未声明支持 App 向对话发送文本。请在对话中说“继续”，Agent 可读取最新选择。", true);
    return;
  }
  try {
    const result = await app.sendMessage({ role: "user", content: [{ type: "text", text: pendingMessage }] });
    if (result.isError) throw new Error("宿主拒绝了继续对话的请求");
    pendingMessage = undefined;
    status("选择已保存，继续请求已交给宿主。如果消息出现在聊天输入框，请按发送继续；宿主不一定自动发送。");
  } catch (error) {
    status(`选择已保存，但未能通知 Agent：${errorText(error)}。可以重试通知，不会重复保存。`, true);
  }
}

element("confirm").addEventListener("click", async () => {
  if (busy || !current) return;
  if (!selected.size && !additional.value.trim()) {
    status("请至少选择一项功能，或补充你想展示的内容。", true);
    return;
  }
  busy = true;
  controls();
  status("正在保存选择…");
  try {
    const result = await app.callServerTool({
      name: "productshot_save_features",
      arguments: { revision: current.revision, capabilityIds: [...selected], additional: additional.value },
    });
    const data = toolData(result);
    render(data);
    const labels = data.capabilities.filter((capability) => data.selection.capabilityIds.includes(capability.id)).map((capability) => capability.title);
    pendingMessage = `ProductShot 项目 ${data.projectId} 已保存功能选择（revision ${data.revision}）：${labels.join("、") || "自定义功能"}。补充：${data.selection.additional || "无"}。请调用 productshot_read_project 读取最新版本，再推荐目标受众。这不是整个阶段的审批。`;
    await deliverMessage();
  } catch (error) {
    status(`未确认保存：${errorText(error)}。草稿已保留；如果版本冲突，请先读取最新选择。`, true);
  } finally {
    busy = false;
    controls();
  }
});

element("retry").addEventListener("click", async () => {
  if (busy || !pendingMessage) return;
  busy = true;
  controls();
  try { await deliverMessage(); }
  finally { busy = false; controls(); }
});

element("reload").addEventListener("click", async () => {
  if (busy || !current) return;
  if (dirty && !discardPending) {
    discardPending = true;
    controls();
    status("读取最新选择会替换尚未确认的修改。再次点击“确认丢弃草稿并读取”才会继续。", true);
    return;
  }
  busy = true;
  controls();
  try {
    const result = await app.callServerTool({ name: "productshot_open_feature_app", arguments: { recommendedIds: current.recommendedIds } });
    render(toolData(result));
    pendingMessage = undefined;
    status("已读取最新选择；请检查后确认。");
  } catch (error) {
    status(`读取失败：${errorText(error)}。当前草稿未改变。`, true);
  } finally {
    busy = false;
    controls();
  }
});

app.ontoolresult = (result) => {
  try {
    const data = toolData(result);
    if (current && (busy || dirty)) {
      if (!busy && data.revision > current.revision) status("项目有新版本；当前编辑未被覆盖，请读取最新选择后再确认。", true);
      return;
    }
    if (current && data.revision < current.revision) return;
    render(data);
    status(data.selection ? "已恢复保存的选择；推荐项不会覆盖你的决定。" : "推荐项已预选，尚未保存。可直接确认或自行调整。");
  } catch (error) {
    status(errorText(error), true);
  }
};
app.ontoolcancelled = () => { status("Agent 已取消本次工具调用；没有自动保存或确认。", true); };
app.onerror = (error) => status(`MCP App 通信错误：${errorText(error)}`, true);
function applyTheme(context) {
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
}
app.onhostcontextchanged = applyTheme;
try {
  await app.connect(undefined, { timeout: 15000 });
  connected = true;
  applyTheme(app.getHostContext());
  if (!app.getHostCapabilities()?.serverTools) status("宿主未提供 App 工具调用能力，无法在此保存。请在对话中完成选择。", true);
  controls();
} catch (error) {
  status(`无法连接 MCP Apps 宿主：${errorText(error)}。请从支持 MCP Apps 的 Agent 工具调用打开，而不是独立网页。`, true);
}
