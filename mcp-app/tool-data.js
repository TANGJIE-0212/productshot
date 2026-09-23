import { z } from "zod";

const capability = z.object({
  id: z.string(),
  title: z.string(),
  proof: z.string(),
  confidence: z.string(),
  limitations: z.string(),
  evidence: z.array(z.string()),
});
const view = z.object({
  projectId: z.string(),
  name: z.string(),
  revision: z.number().int().nonnegative(),
  capabilities: z.array(capability),
  recommendedIds: z.array(z.string()),
  selection: z.object({
    capabilityIds: z.array(z.string()),
    additional: z.string(),
    scope: z.enum(["single", "related", "whole"]),
  }).passthrough().nullable(),
}).passthrough().superRefine((data, context) => {
  const ids = new Set(data.capabilities.map((item) => item.id));
  const groups = [data.recommendedIds, data.selection?.capabilityIds ?? []];
  if (ids.size !== data.capabilities.length || groups.some((group) =>
    new Set(group).size !== group.length || group.some((id) => !ids.has(id)))) {
    context.addIssue({ code: "custom", message: "Unknown or duplicate capability" });
  }
});

export function toolData(result) {
  if (result.isError) throw new Error(result.content?.filter((item) => item.type === "text").map((item) => item.text).join("\n") || "工具执行失败");
  if (result.structuredContent !== undefined) return validate(result.structuredContent);
  // Some Agent Host bridges forward only content, including the serialized JSON result.
  for (const block of result.content ?? []) {
    if (block.type !== "text" || !block.text.trimStart().startsWith("{")) continue;
    let candidate;
    try { candidate = JSON.parse(block.text); }
    catch (error) {
      if (error instanceof SyntaxError) continue;
      throw error;
    }
    if (candidate && Object.hasOwn(candidate, "projectId")) return validate(candidate);
  }
  throw new Error("宿主没有传递功能数据（structuredContent 或 JSON 文本）。请让 Agent 重新打开卡片。");
}

function validate(candidate) {
  const parsed = view.safeParse(candidate);
  if (!parsed.success) throw new Error("MCP 返回了无效的功能选择数据，请让 Agent 重新打开选择卡片。");
  return parsed.data;
}
