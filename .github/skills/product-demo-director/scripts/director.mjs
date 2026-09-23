import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

const assets = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "runtime");
const stages = ["discovery", "selection", "outline", "storyboard", "review"];
const directionKeys = ["before", "actions", "highlight", "camera", "motion", "after", "hold", "transition", "verify", "mustKeep"];
const fail = (message, status = 400) => { const error = new Error(message); error.status = status; throw error; };
const object = (value, label) => { if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`); };
const text = (value, label, max = 2000) => { if (typeof value !== "string" || !value.trim() || value.length > max) fail(`${label}: expected nonempty text (max ${max})`); };
const list = (value, label, min = 1, max = 24) => { if (!Array.isArray(value) || value.length < min || value.length > max) fail(`${label}: expected ${min}–${max} items`); };
const ids = (items, label) => {
  for (const item of items) { object(item, label); if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(item.id)) fail(`${label}: invalid id`); }
  if (new Set(items.map((item) => item.id)).size !== items.length) fail(`${label}: duplicate id`);
};
const digest = (value) => createHash("sha256").update(JSON.stringify(value ?? null)).digest("hex");
const json = (filename) => JSON.parse(fs.readFileSync(filename, "utf8").replace(/^\uFEFF/, ""));
function validate(stage, data, project) {
  object(data, stage);
  if (stage === "discovery") {
    text(data.summary, "summary", 6000); text(data.sourceRevision, "sourceRevision", 200);
    list(data.capabilities, "capabilities", 1, 30); ids(data.capabilities, "capabilities");
    for (const c of data.capabilities) {
      text(c.title, "capability title", 150); text(c.proof, "proof"); text(c.limitations, "limitations");
      if (!["source-verified", "runtime-verified", "documented", "needs-confirmation"].includes(c.confidence)) fail("Invalid confidence");
      list(c.evidence, "evidence", 1, 20); c.evidence.forEach((e) => text(e, "evidence reference", 1000));
    }
  } else if (stage === "selection") {
    list(data.capabilityIds, "capabilityIds", 0, 30);
    const allowed = new Set(project.documents.discovery?.capabilities.map((c) => c.id) || []);
    if (data.capabilityIds.some((id) => !allowed.has(id)) || new Set(data.capabilityIds).size !== data.capabilityIds.length) fail("Unknown or duplicate capability");
    if (typeof data.additional !== "string" || data.additional.length > 2000) fail("Invalid additional capability text");
    if (typeof data.audience !== "string" || data.audience.length > 1000) fail("Invalid audience");
    if (!["single", "related", "whole"].includes(data.scope)) fail("Invalid scope");
    if (data.audienceOptions !== undefined) {
      list(data.audienceOptions, "audience options", 0, 8); ids(data.audienceOptions, "audience options");
      for (const option of data.audienceOptions) {
        text(option.label, "audience label", 300);
        text(option.reason, "audience recommendation reason", 1000);
      }
    }
  } else if (stage === "outline") {
    list(data.scenarios, "scenarios", 1, 8); ids(data.scenarios, "scenarios");
    const all = [];
    for (const scene of data.scenarios) {
      text(scene.title, "scenario title", 150); text(scene.context, "scenario context"); text(scene.outcome, "outcome");
      list(scene.steps, "steps", 1, 24); ids(scene.steps, "steps");
      for (const step of scene.steps) { text(step.title, "step title", 150); text(step.purpose, "step purpose"); all.push(step); }
    }
    ids(all, "all steps");
    if (all.length > 24) fail("At most 24 outline steps");
  } else if (stage === "storyboard") {
    list(data.shots, "shots", 1, 48); ids(data.shots, "shots");
    const steps = new Set(project.documents.outline?.scenarios.flatMap((s) => s.steps.map((step) => step.id)) || []);
    for (const shot of data.shots) {
      if (!steps.has(shot.stepId)) fail(`Unknown stepId: ${shot.stepId}`);
      text(shot.title, "shot title", 150); text(shot.purpose, "shot purpose");
      if (!["real-recording", "explanation", "generated-media", "mixed"].includes(shot.sourceType)) fail("Invalid shot source");
      object(shot.direction, "direction");
      for (const key of directionKeys) text(shot.direction[key], key);
      list(shot.evidence, "shot evidence", 1, 20); shot.evidence.forEach((e) => text(e, "evidence", 1000));
    }
    if ([...steps].some((id) => !data.shots.some((s) => s.stepId === id))) fail("Each outline step needs at least one shot");
  } else if (stage === "review") {
    text(data.summary, "review summary", 6000); text(data.limitations, "review limitations", 4000);
    list(data.artifacts, "artifacts", 1, 20);
    for (const artifact of data.artifacts) {
      text(artifact.label, "artifact label", 150); text(artifact.path, "artifact path", 1000);
      if (!path.isAbsolute(artifact.path) || !fs.statSync(artifact.path).isFile()) fail("Artifact must be an existing local file");
      text(artifact.validation, "artifact validation", 4000);
      if (artifact.sha256 !== createHash("sha256").update(fs.readFileSync(artifact.path)).digest("hex")) fail("Artifact checksum mismatch");
    }
    if (data.notes !== undefined && (typeof data.notes !== "string" || data.notes.length > 6000)) fail("Invalid review notes");
  } else fail("Unknown stage");
}
export function load(dir) {
  const state = json(path.join(dir, "project.json"));
  if (state.format !== "productshot-director-project" || state.version !== 1) fail("Unsupported project", 422);
  return state;
}
function atomic(filename, value) {
  const tmp = `${filename}.${randomUUID()}.tmp`;
  try { fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { flag: "wx" }); fs.renameSync(tmp, filename); }
  finally { fs.rmSync(tmp, { force: true }); }
}
function exclusive(dir, fn) {
  const lock = path.join(dir, ".write-lock");
  try { fs.mkdirSync(lock); } catch (error) { if (error.code === "EEXIST") fail("Project busy. Retry after the current write. If a writer crashed, verify no writer runs before removing .write-lock.", 409); throw error; }
  try { return fn(); } finally { fs.rmdirSync(lock); }
}
function approved(project, stage) {
  return project.documents[stage] && project.approvals[stage]?.hash === digest(project.documents[stage]);
}
function prerequisites(project, stage) {
  const index = stages.indexOf(stage);
  if (index > 0 && !project.documents.discovery) fail("Inspect the product before selecting features", 409);
  if (index > 1 && stages.slice(1, index).some((s) => !approved(project, s))) fail("Confirm all previous stages first", 409);
}
function mutate(dir, revision, actor, operation) {
  return exclusive(dir, () => {
    const project = load(dir);
    if (!Number.isInteger(revision) || project.revision !== revision) fail(`Revision conflict. Current: ${project.revision}. Read again before applying changes.`, 409);
    const result = operation(project);
    project.revision++;
    project.updatedAt = new Date().toISOString();
    project.events.push({ revision: project.revision, at: project.updatedAt, actor, ...result });
    atomic(path.join(dir, "history", `${String(project.revision).padStart(6, "0")}.json`), project);
    atomic(path.join(dir, "project.json"), project);
    return project;
  });
}
export function publish(dir, revision, stage, data, actor) {
  if (!stages.includes(stage)) fail("Unknown stage");
  return mutate(dir, revision, actor, (project) => {
    prerequisites(project, stage);
    validate(stage, data, project);
    if (actor === "browser" && !["selection", "outline", "storyboard", "review"].includes(stage)) fail("This stage is published by the Agent");
    if (actor === "browser" && stage === "review") {
      const { notes: previousNotes, ...previous } = project.documents.review || {};
      const { notes, ...next } = data;
      if (digest(previous) !== digest(next)) fail("Browser review edits may change notes only, not production evidence");
    }
    const changed = digest(project.documents[stage]) !== digest(data);
    project.documents[stage] = data;
    if (changed) {
      for (const key of stages.slice(stages.indexOf(stage))) delete project.approvals[key];
      // Retain downstream documents as stale drafts, never reinterpret them as approved.
      project.release = null;
    }
    return { type: "publish", stage, changed };
  });
}
function approve(dir, revision, stage, note, actor) {
  text(note, "approval note", 1000);
  return mutate(dir, revision, actor, (project) => {
    prerequisites(project, stage);
    validate(stage, project.documents[stage], project);
    if (stage === "selection") {
      const selection = project.documents.selection;
      if (selection.scope !== "whole" && !selection.capabilityIds.length && !selection.additional.trim()) fail("Select or add at least one capability");
      text(selection.audience, "Choose an audience before confirming this stage", 1000);
    }
    project.approvals[stage] = { hash: digest(project.documents[stage]), at: new Date().toISOString(), note, actor };
    if (stage === "review") project.release = structuredClone(project.documents.review);
    return { type: "approve", stage };
  });
}
function requestChange(dir, revision, request, actor) {
  object(request, "request");
  text(request.text, "feedback", 2000);
  if (!stages.includes(request.stage)) fail("Unknown feedback stage");
  return mutate(dir, revision, actor, (project) => {
    if (project.requests.length >= 500) fail("Request limit reached");
    const id = randomUUID();
    project.requests.push({ id, stage: request.stage, text: request.text, target: typeof request.target === "string" ? request.target.slice(0, 150) : "", status: "open", basedOnRevision: revision, createdAt: new Date().toISOString() });
    return { type: "request", stage: request.stage, requestId: id };
  });
}
const conversationContext = (project) => digest({ source: project.source, documents: project.documents, approvals: project.approvals });
function message(dir, revision, data) {
  object(data, "message"); text(data.text, "message text", 6000);
  if (!stages.includes(data.stage)) fail("Unknown conversation stage");
  if (!["message", "single", "multiple"].includes(data.kind)) fail("Invalid message kind");
  const choices = data.choices || [];
  list(choices, "choices", data.kind === "message" ? 0 : 1, 30); ids(choices, "choices");
  if (data.kind === "message" && choices.length) fail("Plain messages cannot contain choices");
  for (const choice of choices) {
    text(choice.label, "choice label", 300);
    if (choice.description !== undefined) text(choice.description, "choice description", 2000);
  }
  return mutate(dir, revision, "agent", (project) => {
    prerequisites(project, data.stage);
    project.conversation ||= [];
    if (project.conversation.length >= 500) fail("Conversation limit reached");
    // One active question prevents a later answer from silently revising an earlier decision.
    if (data.kind !== "message") for (const item of project.conversation) {
      if (item.role === "agent" && item.kind !== "message" && !item.answeredAt) item.superseded = true;
    }
    const item = { id: randomUUID(), role: "agent", stage: data.stage, kind: data.kind, text: data.text, choices, context: conversationContext(project), basedOnRevision: revision, at: new Date().toISOString() };
    project.conversation.push(item);
    return { type: "message", stage: data.stage, messageId: item.id };
  });
}
function answer(dir, revision, input, actor) {
  object(input, "answer");
  list(input.choiceIds, "choiceIds", 0, 30);
  if (typeof input.text !== "string" || input.text.length > 2000) fail("Invalid answer text");
  return mutate(dir, revision, actor, (project) => {
    const question = project.conversation?.find((m) => m.id === input.questionId && m.role === "agent" && m.kind !== "message");
    if (!question || question.answeredAt || question.superseded) fail("Question is no longer open", 409);
    if (question.context !== conversationContext(project)) fail("Project changed since this question. Ask the Agent to update its choices.", 409);
    const allowed = new Set(question.choices.map((c) => c.id));
    if (input.choiceIds.some((id) => !allowed.has(id)) || new Set(input.choiceIds).size !== input.choiceIds.length) fail("Unknown or duplicate choice");
    if (question.kind === "single" && input.choiceIds.length > 1) fail("Choose at most one option");
    if (!input.choiceIds.length && !input.text.trim()) fail("Select an option or write your own answer");
    if (project.requests.length >= 500 || project.conversation.length >= 500) fail("Conversation limit reached");
    const now = new Date().toISOString(), requestId = randomUUID();
    const labels = question.choices.filter((c) => input.choiceIds.includes(c.id)).map((c) => c.label);
    const response = [labels.join("、"), input.text.trim()].filter(Boolean).join("\n");
    question.answeredAt = now;
    project.conversation.push({ id: randomUUID(), role: "user", stage: question.stage, text: response, choiceIds: input.choiceIds, questionId: question.id, requestId, at: now });
    project.requests.push({ id: requestId, stage: question.stage, text: response, target: question.id, status: "open", basedOnRevision: revision, createdAt: now });
    return { type: "answer", stage: question.stage, requestId };
  });
}
export function initialize(dir, name, source) {
  text(name, "name", 150); text(source, "source", 2000);
  if (fs.existsSync(path.join(dir, "project.json"))) fail("Project already exists; refusing overwrite", 409);
  fs.mkdirSync(path.join(dir, "history"), { recursive: true });
  const now = new Date().toISOString();
  const project = { format: "productshot-director-project", version: 1, id: randomUUID(), name, source, revision: 0, createdAt: now, updatedAt: now, documents: {}, approvals: {}, requests: [], events: [], release: null };
  exclusive(dir, () => { if (fs.existsSync(path.join(dir, "project.json"))) fail("Project already exists"); atomic(path.join(dir, "history", "000000.json"), project); atomic(path.join(dir, "project.json"), project); });
  return project;
}
function safeEqual(a, b) {
  if (typeof a !== "string") return false;
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
async function serve(dir, port) {
  load(dir);
  const token = randomBytes(24).toString("hex");
  const origin = `http://127.0.0.1:${port}`;
  const send = (res, status, body, type = "application/json") => {
    res.writeHead(status, { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'" });
    res.end(type === "application/json" ? JSON.stringify(body) : body);
  };
  const server = http.createServer(async (req, res) => {
    try {
      if (req.headers.host !== `127.0.0.1:${port}`) fail("Loopback host only", 403);
      if (req.headers.origin && req.headers.origin !== origin) fail("Cross-origin request denied", 403);
      if (req.headers["sec-fetch-site"] === "cross-site") fail("Cross-site request denied", 403);
      const url = new URL(req.url, origin);
      if (req.method === "GET" && ["/", "/app.js", "/style.css", "/brand-story.svg"].includes(url.pathname)) {
        const files = { "/": ["index.html", "text/html"], "/app.js": ["app.js", "text/javascript"], "/style.css": ["style.css", "text/css"], "/brand-story.svg": ["brand-story.svg", "image/svg+xml"] };
        const [file, type] = files[url.pathname];
        send(res, 200, fs.readFileSync(path.join(assets, file)), type); return;
      }
      if (!safeEqual(req.headers["x-director-token"], token)) fail("Project access requires this session's local URL", 403);
      if (req.method === "GET" && url.pathname === "/api/project") { send(res, 200, load(dir)); return; }
      if (req.method !== "POST" || url.pathname !== "/api/action") fail("Not found", 404);
      if (!req.headers["content-type"]?.startsWith("application/json")) fail("JSON required", 415);
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 256 * 1024) fail("Request too large", 413); chunks.push(chunk); }
      const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      object(input, "action");
      let result;
      if (input.action === "publish") result = publish(dir, input.revision, input.stage, input.data, "browser");
      else if (input.action === "approve") result = approve(dir, input.revision, input.stage, input.note, "browser");
      else if (input.action === "request") result = requestChange(dir, input.revision, input, "browser");
      else if (input.action === "answer") result = answer(dir, input.revision, input, "browser");
      else fail("Unknown action");
      send(res, 200, result);
    } catch (error) {
      console.error(`${req.method} ${req.url}: ${error.message}`);
      const status = error.status || (error instanceof SyntaxError ? 400 : 500);
      send(res, status, { error: status === 500 ? "Local project operation failed. Check terminal logs." : error.message });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(port, "127.0.0.1", resolve); });
  console.log(JSON.stringify({ status: "listening", url: `${origin}/#${token}`, project: dir, note: "Open this result viewer in the host Agent's in-app browser. Keep conversation in the native Agent; read the project before continuing." }));
}

async function main() {
const [command, ...args] = process.argv.slice(2);
const options = {};
for (let i = 0; i < args.length; i += 2) {
  if (!args[i].startsWith("--") || args[i + 1] === undefined) fail("Expected --option value");
  options[args[i].slice(2)] = args[i + 1];
}
try {
  if (!command || command === "help") {
    console.log("director init --project <private-folder> --name <name> --source <repo-or-url>\ndirector read --project <folder>\ndirector publish --project <folder> --revision <n> --stage discovery|selection|outline|storyboard|review --input <json>\ndirector message --project <folder> --revision <n> --input <message-json>\ndirector answer --project <folder> --revision <n> --input <answer-json>\ndirector approve --project <folder> --revision <n> --stage <stage> --note <explicit-user-approval>\ndirector request --project <folder> --revision <n> --stage <stage> --text <feedback>\ndirector resolve --project <folder> --revision <n> --id <request-id> --note <resolution>\ndirector serve --project <folder> --port 3014");
  } else {
    if (!options.project) fail("--project is required");
    const dir = path.resolve(options.project);
    let result;
    if (command === "init") result = initialize(dir, options.name, options.source);
    else if (command === "read") result = load(dir);
    else if (command === "publish") result = publish(dir, Number(options.revision), options.stage, json(path.resolve(options.input)), "agent");
    else if (command === "message") result = message(dir, Number(options.revision), json(path.resolve(options.input)));
    else if (command === "answer") result = answer(dir, Number(options.revision), json(path.resolve(options.input)), "user-via-agent");
    else if (command === "approve") result = approve(dir, Number(options.revision), options.stage, options.note, "user-via-agent");
    else if (command === "request") result = requestChange(dir, Number(options.revision), { stage: options.stage, text: options.text }, "user-via-agent");
    else if (command === "resolve") result = mutate(dir, Number(options.revision), "agent", (project) => {
      text(options.note, "resolution", 2000);
      const request = project.requests.find((r) => r.id === options.id);
      if (!request || request.status !== "open") fail("No matching open request");
      request.status = "resolved"; request.resolution = options.note; request.resolvedAt = new Date().toISOString();
      return { type: "resolve", requestId: request.id };
    });
    else if (command === "serve") {
      const port = Number(options.port || 3014);
      if (!Number.isInteger(port) || port < 1024 || port > 65535) fail("Invalid port");
      await serve(dir, port);
    } else fail("Unknown command");
    if (result) console.log(JSON.stringify(result, null, 2));
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message, status: error.status || 500 }));
  process.exitCode = 1;
}
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
