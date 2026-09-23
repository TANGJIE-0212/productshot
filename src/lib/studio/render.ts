import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { projectSchema, studioFrames, STUDIO_FPS, type StudioProject } from "./types";

const run = promisify(execFile);

export async function renderStudio(
  project: StudioProject,
  mediaBaseUrl: string,
  outputPath: string,
  signal: AbortSignal,
): Promise<void> {
  projectSchema.parse(project);
  if (!project.clips.length) throw new Error("Add recorded clips before exporting.");
  if (studioFrames(project) > STUDIO_FPS * 300) throw new Error("Exports are limited to five minutes.");
  const origin = new URL(mediaBaseUrl);
  if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname)) {
    throw new Error("Studio rendering requires a loopback media server.");
  }
  for (const recording of project.recordings) {
    if (!recording.url.startsWith(`/api/studio/media/${project.id}/`)) {
      throw new Error("A recording is outside the current project.");
    }
  }
  const jobDir = path.join(process.cwd(), ".render", `studio-${randomUUID()}`);
  const propsPath = path.join(jobDir, "props.json");
  const publicDir = path.join(jobDir, "public");
  await fs.mkdir(publicDir, { recursive: true });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  try {
    await fs.writeFile(propsPath, JSON.stringify({ project, mediaBaseUrl: origin.origin }));
    const cli = path.join(process.cwd(), "node_modules", "@remotion", "cli", "remotion-cli.js");
    await run(process.execPath, [
      cli, "render", path.join(process.cwd(), "src", "remotion", "index.ts"),
      "DemoVideo", outputPath, `--props=${propsPath}`, `--public-dir=${publicDir}`,
      "--codec=h264", "--pixel-format=yuv420p", "--concurrency=2", "--log=error",
    ], { cwd: process.cwd(), timeout: 300000, maxBuffer: 4 * 1024 * 1024, windowsHide: true, signal });
    const { stdout } = await run("ffprobe", [
      "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height",
      "-of", "json", outputPath,
    ], { windowsHide: true, signal, timeout: 15000 });
    const result: { format: { duration: string }; streams: { codec_type: string; codec_name: string; width?: number; height?: number }[] } = JSON.parse(stdout);
    const video = result.streams.find((stream) => stream.codec_type === "video");
    if (!video || video.codec_name !== "h264" || video.width !== 1280 || video.height !== 720) {
      throw new Error("Export failed codec or dimension validation.");
    }
    if (Math.abs(Number(result.format.duration) - studioFrames(project) / STUDIO_FPS) > 0.15) {
      throw new Error("Export duration does not match the approved timeline.");
    }
  } catch (error) {
    await fs.rm(outputPath, { force: true });
    if (error instanceof Error && "stderr" in error && typeof error.stderr === "string") {
      throw new Error(`Export failed: ${error.stderr.slice(-2000) || error.message}`);
    }
    throw error;
  } finally {
    await fs.rm(jobDir, { recursive: true, force: true });
  }
}
