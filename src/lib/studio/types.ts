import { z } from "zod";

export const STUDIO_FPS = 30;
export const STUDIO_WIDTH = 1280;
export const STUDIO_HEIGHT = 720;

const text = (max: number) => z.string().max(max);
const required = (max: number) => z.string().trim().min(1).max(max);
export const boxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
});
export const stepSchema = z.object({
  id: z.string().uuid(),
  title: required(100),
  purpose: text(500),
  action: z.enum(["click", "type", "scroll", "wait"]),
  selector: text(500),
  value: text(2000),
  holdSeconds: z.number().min(0.5).max(15),
  expectedSelector: text(500),
  expectedText: text(500),
}).superRefine((step, ctx) => {
  if ((step.action === "click" || step.action === "type") && !step.selector.trim()) {
    ctx.addIssue({ code: "custom", message: "Click/type requires a selector", path: ["selector"] });
  }
  if (step.action === "scroll" && (!Number.isFinite(Number(step.value)) || Math.abs(Number(step.value)) > 3000)) {
    ctx.addIssue({ code: "custom", message: "Scroll must be between -3000 and 3000 pixels", path: ["value"] });
  }
});
export const briefSchema = z.object({
  url: text(2000),
  audience: text(300),
  goal: text(2000),
  mustShow: text(2000),
  notes: text(4000),
});
export const eventSchema = z.object({
  stepId: z.string().uuid(),
  title: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  box: boxSchema.nullable(),
  verified: z.boolean(),
});
export const cursorSchema = z.object({
  time: z.number().nonnegative(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  click: z.boolean(),
});
export const recordingSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  duration: z.number().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  createdAt: z.string(),
  planHash: z.string(),
  events: z.array(eventSchema),
  cursor: z.array(cursorSchema),
});
export const clipSchema = z.object({
  id: z.string().uuid(),
  recordingId: z.string().uuid(),
  title: required(100),
  in: z.number().nonnegative(),
  out: z.number().positive(),
  speed: z.number().min(0.5).max(3),
  zoom: z.number().min(1).max(2.5),
  focusX: z.number().min(0).max(1),
  focusY: z.number().min(0).max(1),
  highlight: boxSchema.nullable(),
  showCursor: z.boolean(),
  caption: text(120),
}).refine((clip) => clip.out - clip.in >= 0.2, { message: "A clip must be at least 0.2 seconds", path: ["out"] });
export const outputSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  revision: z.number().int(),
  createdAt: z.string(),
  approvedAt: z.string().nullable(),
});
export const projectSchema = z.object({
  version: z.literal(1),
  id: z.string().uuid(),
  revision: z.number().int().nonnegative(),
  name: required(100),
  brief: briefSchema,
  steps: z.array(stepSchema).max(24),
  approvedPlanHash: z.string().nullable(),
  recordings: z.array(recordingSchema).max(50),
  clips: z.array(clipSchema).max(100),
  outputs: z.array(outputSchema).max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
}).superRefine((project, ctx) => {
  for (const key of ["steps", "recordings", "clips", "outputs"] as const) {
    if (new Set(project[key].map((item) => item.id)).size !== project[key].length) {
      ctx.addIssue({ code: "custom", message: `Duplicate ${key} IDs`, path: [key] });
    }
  }
  project.clips.forEach((clip, i) => {
    const recording = project.recordings.find((r) => r.id === clip.recordingId);
    if (!recording || clip.out > recording.duration + 0.001) {
      ctx.addIssue({ code: "custom", message: "Clip exceeds its source recording", path: ["clips", i] });
    }
  });
});

export type StudioProject = z.infer<typeof projectSchema>;
export type StudioStep = z.infer<typeof stepSchema>;
export type StudioClip = z.infer<typeof clipSchema>;
export type StudioRecording = z.infer<typeof recordingSchema>;
export type StudioBox = z.infer<typeof boxSchema>;
export type StudioOutput = z.infer<typeof outputSchema>;
export interface StudioInspection {
  url: string;
  title: string;
  text: string;
  elements: { selector: string; tag: string; text: string; type: string }[];
}
export interface StudioJob {
  id: string;
  projectId: string;
  type: "rehearse" | "record" | "render";
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  progress: number;
  message: string;
  error?: string;
  createdAt: string;
}
export interface StudioResponse {
  project?: StudioProject;
  projects?: { id: string; name: string; updatedAt: string }[];
  job?: StudioJob;
  inspection?: StudioInspection;
  error?: string;
  aiAvailable?: boolean;
}

export function newStudioProject(): StudioProject {
  const now = new Date().toISOString();
  return {
    version: 1, id: crypto.randomUUID(), revision: 0,
    name: "Untitled demo",
    brief: { url: "", audience: "", goal: "", mustShow: "", notes: "" },
    steps: [], approvedPlanHash: null, recordings: [], clips: [], outputs: [],
    createdAt: now, updatedAt: now,
  };
}

export function clipFrames(clip: StudioClip): number {
  return Math.max(1, Math.ceil((clip.out - clip.in) / clip.speed * STUDIO_FPS));
}

export function studioFrames(project: StudioProject): number {
  return Math.max(1, project.clips.reduce((total, clip) => total + clipFrames(clip), 0));
}
