import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { captureWorkflow, inspectTarget, probeMedia, validateTarget } from "./capture";
import { projectSchema, type StudioJob, type StudioProject, type StudioResponse } from "./types";

export class StudioError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

const uuid = z.string().uuid();
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const mediaPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webm|mp4)$/i;
const root = path.join(process.cwd(), ".studio");
const projectsRoot = path.join(root, "projects");
const jobsRoot = path.join(root, "jobs");
type Entry = { job: StudioJob; controller: AbortController; committing?: boolean };
type Registry = {
  jobs: Map<string, Entry>;
  locks: Set<string>;
  active: string | null;
  initialized?: Promise<void>;
};
const shared = globalThis as typeof globalThis & { __localStudioRegistry?: Registry };
const registry: Registry = shared.__localStudioRegistry ??= { jobs: new Map(), locks: new Set(), active: null };

export function projectDirectory(id: string) {
  if (!idPattern.test(id)) throw new StudioError("Invalid project ID.");
  return path.join(projectsRoot, id);
}

async function atomicJSON(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const staging = `${file}.${randomUUID()}.pending`;
  try {
    await fs.writeFile(staging, JSON.stringify(value, null, 2), { flag: "wx" });
    await fs.rename(staging, file);
  } finally {
    await fs.rm(staging, { force: true });
  }
}

async function persistJob(job: StudioJob) {
  await atomicJSON(path.join(jobsRoot, `${job.id}.json`), job);
}

async function initialize() {
  registry.initialized ??= (async () => {
    await fs.mkdir(projectsRoot, { recursive: true });
    await fs.mkdir(jobsRoot, { recursive: true });
    for (const file of await fs.readdir(jobsRoot)) {
      if (!idPattern.test(file.replace(/\.json$/, "")) || !file.endsWith(".json")) continue;
      const job: StudioJob = JSON.parse(await fs.readFile(path.join(jobsRoot, file), "utf8"));
      if (!idPattern.test(job.id) || !idPattern.test(job.projectId)) continue;
      if (job.status === "queued" || job.status === "running") {
        job.status = "failed";
        job.error = "The server restarted during this job. No result was promoted; inspect the product before repeating real writes.";
        job.message = job.error;
        await persistJob(job);
      }
      registry.jobs.set(job.id, { job, controller: new AbortController() });
    }
  })();
  await registry.initialized;
}

export async function readProject(id: string): Promise<StudioProject> {
  const file = path.join(projectDirectory(id), "project.json");
  try {
    return projectSchema.parse(JSON.parse(await fs.readFile(file, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new StudioError("Project not found.", 404);
    throw error;
  }
}

async function writeProject(project: StudioProject) {
  projectSchema.parse(project);
  await atomicJSON(path.join(projectDirectory(project.id), "project.json"), project);
}

function hashPlan(project: StudioProject) {
  return createHash("sha256").update(JSON.stringify({ brief: project.brief, steps: project.steps })).digest("hex");
}

function revised(project: StudioProject): StudioProject {
  return { ...project, revision: project.revision + 1, updatedAt: new Date().toISOString() };
}

function checkRevision(project: StudioProject, revision: number) {
  if (project.revision !== revision) throw new StudioError("Project changed. Reload it before trying again.", 409);
}

function lock(id: string) {
  if (registry.locks.has(id)) throw new StudioError("This project is busy. Wait for its job or cancel it.", 409);
  registry.locks.add(id);
}

export function localOrigin(request: Request): string {
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new StudioError("Cross-site access is not permitted.", 403);
  const host = request.headers.get("host");
  if (!host || /[\/\\@,\s]/.test(host)) throw new StudioError("Studio is available only on loopback hosts.", 403);
  let origin: URL;
  try { origin = new URL(`${new URL(request.url).protocol}//${host}`); } catch { throw new StudioError("Invalid local host.", 403); }
  if (!["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname.toLowerCase()) ||
    !["http:", "https:"].includes(origin.protocol)) {
    throw new StudioError("Studio is local-only. Open it at localhost or 127.0.0.1.", 403);
  }
  const supplied = request.headers.get("origin");
  if (supplied && supplied !== origin.origin) throw new StudioError("The request must use the same local origin.", 403);
  return origin.origin;
}

export async function getStudio(search: URLSearchParams): Promise<StudioResponse> {
  await initialize();
  if (search.has("job")) {
    const id = uuid.parse(search.get("job"));
    const entry = registry.jobs.get(id);
    if (!entry) throw new StudioError("Job not found.", 404);
    return { job: { ...entry.job } };
  }
  if (search.has("id")) return { project: await readProject(uuid.parse(search.get("id"))) };
  const ids = (await fs.readdir(projectsRoot, { withFileTypes: true })).filter((item) => item.isDirectory() && idPattern.test(item.name));
  const projects = await Promise.all(ids.map(async ({ name }) => {
    const project = await readProject(name);
    return { id: project.id, name: project.name, updatedAt: project.updatedAt };
  }));
  return { projects: projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), aiAvailable: false };
}

const versioned = { id: uuid, revision: z.number().int().nonnegative() };
const commandSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), project: projectSchema }),
  z.object({ action: z.literal("inspect"), ...versioned }),
  z.object({ action: z.literal("approve"), ...versioned }),
  z.object({ action: z.literal("rehearse"), ...versioned, authorized: z.literal(true) }),
  z.object({ action: z.literal("record"), ...versioned, authorized: z.literal(true) }),
  z.object({ action: z.literal("render"), ...versioned, authorized: z.literal(true) }),
  z.object({ action: z.literal("cancel"), jobId: uuid }),
  z.object({ action: z.literal("approve-output"), ...versioned, outputId: uuid }),
]);

async function saveProject(incoming: StudioProject): Promise<StudioProject> {
  lock(incoming.id);
  try {
    let existing: StudioProject | undefined;
    try { existing = await readProject(incoming.id); } catch (error) {
      if (!(error instanceof StudioError && error.status === 404)) throw error;
    }
    if (existing) {
      checkRevision(existing, incoming.revision);
      if (JSON.stringify(incoming.recordings) !== JSON.stringify(existing.recordings) ||
        JSON.stringify(incoming.outputs) !== JSON.stringify(existing.outputs) ||
        incoming.approvedPlanHash !== existing.approvedPlanHash) {
        throw new StudioError("Recordings, outputs and approval are server-owned; reload the project.", 409);
      }
    } else if (incoming.revision !== 0 || incoming.recordings.length || incoming.outputs.length || incoming.approvedPlanHash) {
      throw new StudioError("A new project must have revision zero and no server-owned assets.", 409);
    }
    if (incoming.brief.url.trim()) {
      try { await validateTarget(incoming.brief.url); } catch (error) { throw new StudioError(error instanceof Error ? error.message : String(error)); }
    }
    const now = new Date().toISOString();
    const result = revised({
      ...incoming,
      recordings: existing?.recordings ?? [],
      outputs: existing?.outputs ?? [],
      approvedPlanHash: existing && hashPlan(existing) === hashPlan(incoming) ? existing.approvedPlanHash : null,
      createdAt: existing?.createdAt ?? now,
    });
    await writeProject(result);
    return result;
  } finally { registry.locks.delete(incoming.id); }
}

export async function mutateStudio(input: unknown, origin: string): Promise<StudioResponse> {
  await initialize();
  const command = commandSchema.parse(input);
  if (command.action === "save") return { project: await saveProject(command.project) };
  if (command.action === "cancel") {
    const entry = registry.jobs.get(command.jobId);
    if (!entry) throw new StudioError("Job not found.", 404);
    if (entry.job.status === "queued" || entry.job.status === "running") {
      if (entry.committing) throw new StudioError("Verified media is being committed; this job can no longer be cancelled.", 409);
      entry.job.message = "Cancelling; closing the browser/renderer before releasing the project…";
      entry.controller.abort(new Error("Cancelled by user. Product actions already performed cannot be undone."));
    }
    return { job: { ...entry.job } };
  }
  lock(command.id);
  let jobOwnsLock = false;
  try {
    const project = await readProject(command.id);
    checkRevision(project, command.revision);
    if (command.action === "approve-output") {
      const output = project.outputs.find((item) => item.id === command.outputId);
      if (!output) throw new StudioError("Output not found.", 404);
      output.approvedAt = new Date().toISOString();
      const result = revised(project);
      await writeProject(result);
      return { project: result };
    }
    if (command.action === "approve") {
      if (!project.steps.length) throw new StudioError("Add at least one step before approving.");
      try { await validateTarget(project.brief.url); } catch (error) { throw new StudioError(error instanceof Error ? error.message : String(error)); }
      const estimate = project.steps.reduce((sum, step) => sum + step.holdSeconds +
        (step.action === "type" ? step.value.length * 0.035 : 0) + 1, 0);
      if (estimate > 165) throw new StudioError("This workflow exceeds the three-minute capture budget. Shorten text or holds.");
      const result = revised({ ...project, approvedPlanHash: hashPlan(project) });
      await writeProject(result);
      return { project: result };
    }
    if (registry.active) throw new StudioError("Another inspection/capture/render is running. Only one browser job is allowed.", 409);
    if (command.action === "inspect") {
      registry.active = `inspect:${project.id}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new Error("Inspection timed out after 45 seconds.")), 45_000);
      try {
        try { await validateTarget(project.brief.url); } catch (error) { throw new StudioError(error instanceof Error ? error.message : String(error)); }
        return { inspection: await inspectTarget(project, controller.signal) };
      } finally {
        clearTimeout(timer);
        registry.active = null;
      }
    }
    if (project.approvedPlanHash !== hashPlan(project)) throw new StudioError("Approve the current brief and steps first.", 409);
    if (!project.steps.length) throw new StudioError("The approved workflow has no steps.");
    if (command.action === "record" && (project.recordings.length >= 50 || project.clips.length + project.steps.length > 100)) {
      throw new StudioError("Project asset limit reached. Create another project.");
    }
    if (command.action === "render" && (!project.clips.length || project.outputs.length >= 100)) {
      throw new StudioError("Render requires clips and fewer than 100 existing outputs.");
    }
    const job: StudioJob = {
      id: randomUUID(), projectId: project.id, type: command.action, status: "queued",
      progress: 0, message: "Queued. Fresh browser session; no automatic retry of product writes.",
      createdAt: new Date().toISOString(),
    };
    const entry = { job, controller: new AbortController() };
    registry.active = job.id;
    registry.jobs.set(job.id, entry);
    try { await persistJob(job); } catch (error) {
      registry.active = null;
      registry.jobs.delete(job.id);
      throw error;
    }
    jobOwnsLock = true;
    void runJob(entry, project, origin);
    return { job: { ...job } };
  } finally {
    if (!jobOwnsLock) registry.locks.delete(command.id);
  }
}

async function runJob(entry: Entry, project: StudioProject, origin: string) {
  const { job, controller } = entry;
  const mediaId = randomUUID();
  const extension = job.type === "render" ? "mp4" : "webm";
  const filename = `${mediaId}.${extension}`;
  const file = path.join(projectDirectory(project.id), filename);
  const mediaUrl = `/api/studio/media/${project.id}/${filename}`;
  let promoted = false;
  let captureTimer: ReturnType<typeof setTimeout> | undefined;
  const timer = setTimeout(() => controller.abort(new Error("Job exceeded the five-minute hard limit.")), 300_000);
  const commit = async (result: StudioProject) => {
    controller.signal.throwIfAborted();
    entry.committing = true;
    clearTimeout(timer);
    if (captureTimer) clearTimeout(captureTimer);
    job.message = "Committing verified media…";
    await writeProject(result);
    promoted = true;
  };
  try {
    job.status = "running";
    job.message = job.type === "render" ? "Rendering the approved recording timeline…" : "Opening a fresh isolated browser. This workflow may write real product data.";
    await persistJob(job);
    controller.signal.throwIfAborted();
    if (job.type === "render") {
      const { renderStudio } = await import("./render");
      await renderStudio(project, origin, file, controller.signal);
      controller.signal.throwIfAborted();
      const media = await probeMedia(file, controller.signal);
      if (media.width !== 1280 || media.height !== 720) throw new Error("Rendered video dimensions must be 1280×720.");
      const result = revised({
        ...project,
        outputs: [...project.outputs, { id: mediaId, url: mediaUrl, revision: project.revision, createdAt: new Date().toISOString(), approvedAt: null }],
      });
      await commit(result);
    } else {
      captureTimer = setTimeout(() => controller.abort(new Error("Capture exceeded the three-minute hard limit.")), 180_000);
      const capture = await captureWorkflow(project, job.type === "record" ? file : null, controller.signal, (progress, message) => {
        job.progress = progress;
        job.message = message;
      });
      controller.signal.throwIfAborted();
      if (capture) {
        const recording = {
          id: mediaId, url: mediaUrl, createdAt: new Date().toISOString(),
          planHash: project.approvedPlanHash!, ...capture,
        };
        const clips = capture.events.map((event) => ({
          id: randomUUID(), recordingId: mediaId, title: event.title,
          in: event.start, out: event.end, speed: 1,
          zoom: event.box ? 1.35 : 1,
          focusX: event.box ? event.box.x + event.box.width / 2 : 0.5,
          focusY: event.box ? event.box.y + event.box.height / 2 : 0.5,
          highlight: event.box, showCursor: true, caption: event.title,
        }));
        await commit(revised({ ...project, recordings: [...project.recordings, recording], clips: [...project.clips, ...clips] }));
      }
    }
    job.status = "succeeded";
    job.progress = 1;
    job.message = job.type === "rehearse" ? "Rehearsal passed all expectations. Real product writes may have occurred; recording will repeat them." :
      job.type === "record" ? "Recording verified and saved. Review the clips before export." : "MP4 rendered. Review and explicitly approve the output.";
  } catch (error) {
    job.status = controller.signal.aborted && String(controller.signal.reason).includes("Cancelled by user") ? "cancelled" : "failed";
    job.error = (controller.signal.aborted ? controller.signal.reason : error) instanceof Error ?
      ((controller.signal.aborted ? controller.signal.reason : error) as Error).message : String(error);
    job.message = job.error || "Job failed.";
    console.error(`Studio ${job.type} ${job.id}:`, error);
  } finally {
    clearTimeout(timer);
    if (captureTimer) clearTimeout(captureTimer);
    if (!promoted && job.type !== "rehearse") {
      try { await fs.rm(file, { force: true }); } catch (error) {
        console.error("Studio incomplete media cleanup:", error);
        job.error = `${job.error ?? ""} Incomplete media cleanup failed; the file is not accessible through the media API.`;
      }
    }
    try { await persistJob(job); } catch (error) { console.error("Studio final job persistence:", error); }
    registry.locks.delete(project.id);
    if (registry.active === job.id) registry.active = null;
  }
}

export async function authorizedMedia(projectId: string, filename: string): Promise<string> {
  if (!mediaPattern.test(filename)) throw new StudioError("Media not found.", 404);
  const project = await readProject(projectId);
  const url = `/api/studio/media/${projectId}/${filename}`;
  if (![...project.recordings, ...project.outputs].some((item) => item.url === url)) {
    throw new StudioError("Media not found.", 404);
  }
  return path.join(projectDirectory(projectId), filename);
}

export function studioFailure(error: unknown): Response {
  const status = error instanceof StudioError ? error.status : error instanceof z.ZodError ? 400 : 500;
  const message = error instanceof z.ZodError ? error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ").slice(0, 1500) :
    error instanceof Error ? error.message : "Unexpected studio error.";
  if (status >= 500) console.error("Studio API:", error);
  return Response.json({ error: message } satisfies StudioResponse, { status, headers: { "Cache-Control": "no-store" } });
}
