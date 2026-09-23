import { NextRequest, NextResponse } from "next/server";
import type { RenderRequest, RenderResponse } from "@/lib/types";
import { execFile } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";
import { getVideoDurationInFrames } from "@/lib/video-duration";

export const runtime = "nodejs";
const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  try {
    const body: RenderRequest = await request.json();

    if (!body?.storyboard) {
      return NextResponse.json(
        {
          success: false,
          error: "Storyboard data is required",
        } satisfies RenderResponse,
        { status: 400 }
      );
    }

    const { storyboard } = body;

    try {
      getVideoDurationInFrames(storyboard.scenes, storyboard.fps);
      if (
        ![storyboard.width, storyboard.height].every(
          (value) => Number.isInteger(value) && value > 0 && value % 2 === 0
        )
      ) {
        throw new Error("视频宽高必须为正偶数");
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "分镜数据无效",
        } satisfies RenderResponse,
        { status: 400 }
      );
    }

    // Ensure output directory exists
    const outDir = path.join(process.cwd(), "public", "output");
    await fs.mkdir(outDir, { recursive: true });

    const jobId = randomUUID();
    const outputFileName = `product-video-${jobId}.mp4`;
    const outputPath = path.join(outDir, outputFileName);

    // Keep large screenshot props out of the public assets copied by Remotion.
    const jobsDir = path.join(process.cwd(), ".render");
    await fs.mkdir(jobsDir, { recursive: true });
    const propsPath = path.join(jobsDir, `props-${jobId}.json`);

    try {
      await fs.writeFile(
        propsPath,
        JSON.stringify({
          scenes: storyboard.scenes,
          fps: storyboard.fps,
          width: storyboard.width,
          height: storyboard.height,
        })
      );

      const entryPoint = path.join(process.cwd(), "src", "remotion", "index.ts");
      const cli = path.join(
        process.cwd(), "node_modules", "@remotion", "cli", "remotion-cli.js"
      );
      const args = [
        cli,
        "render",
        entryPoint,
        "ProductVideo",
        outputPath,
        `--props=${propsPath}`,
        "--codec=h264",
        "--pixel-format=yuv420p",
        "--concurrency=2",
        "--log=error",
      ];

      // Do not block Next.js: screenshot requests must remain responsive.
      await execFileAsync(process.execPath, args, {
        cwd: process.cwd(),
        timeout: 300000,
        maxBuffer: 4 * 1024 * 1024,
        windowsHide: true,
      });
      if ((await fs.stat(outputPath)).size === 0) {
        throw new Error("渲染器未生成有效的视频文件");
      }

      return NextResponse.json({
        success: true,
        videoUrl: `/output/${outputFileName}`,
      } satisfies RenderResponse);
    } catch (renderError: unknown) {
      const failure = renderError as Error & { stderr?: string; killed?: boolean };
      const message = failure.killed
        ? "渲染超时，请缩短分镜后重试"
        : (failure.stderr?.trim() || failure.message || "Render process failed")
            .slice(-3000);
      console.error("Remotion render error:", message);
      await fs.rm(outputPath, { force: true });

      return NextResponse.json(
        {
          success: false,
          error: `视频渲染失败: ${message}`,
        } satisfies RenderResponse,
        { status: 500 }
      );
    } finally {
      await fs.rm(propsPath, { force: true });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Render API error:", error);

    return NextResponse.json(
      { success: false, error: message } satisfies RenderResponse,
      { status: 500 }
    );
  }
}
