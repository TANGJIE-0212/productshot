"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { formatDuration } from "@/lib/utils";

export default function PreviewPage() {
  const router = useRouter();
  const { storyboard, setStep, setRenderedVideoUrl, renderedVideoUrl } =
    useAppStore();
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [error, setError] = useState("");

  if (!storyboard) {
    router.push("/");
    return null;
  }

  const handleRender = async () => {
    setRendering(true);
    setRenderProgress(0);
    setError("");
    setStep("rendering");

    // Estimated progress; the render API returns only when encoding finishes.
    const progressInterval = setInterval(() => {
      setRenderProgress((p) => Math.min(95, p + Math.random() * 5));
    }, 800);

    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyboard }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.videoUrl) {
        throw new Error(data.error || "渲染失败");
      }

      setRenderProgress(100);
      setRenderedVideoUrl(data.videoUrl);
      setStep("done");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "未知错误";
      setError(message);
      setStep("preview");
    } finally {
      clearInterval(progressInterval);
      setRendering(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/storyboard")}
              className="mb-2 text-sm text-white/40 hover:text-white/70"
            >
              ← 返回编辑
            </button>
            <h1 className="text-2xl font-bold">{storyboard.title}</h1>
          </div>
          <div className="text-right text-sm text-white/40">
            <p>
              {storyboard.scenes.length} 个场景 ·{" "}
              {formatDuration(storyboard.totalDurationInSeconds)}
            </p>
            <p>
              {storyboard.width}×{storyboard.height} · {storyboard.fps}fps
            </p>
          </div>
        </div>

        {/* Storyboard summary */}
        <div className="mb-8 rounded-2xl border border-white/5 bg-white/2 p-6">
          <h3 className="mb-4 text-sm font-semibold text-white/50">
            分镜概览
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {storyboard.scenes.map((scene, i) => (
              <div
                key={scene.id}
                className="rounded-xl border border-white/5 bg-white/3 p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-white/30">
                    #{i + 1}
                  </span>
                  <span className="text-xs text-white/20">
                    {scene.durationInSeconds}s
                  </span>
                </div>
                <p className="text-sm text-white/60 line-clamp-2">
                  {scene.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Render section */}
        {!renderedVideoUrl ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/2 p-10 text-center">
            {!rendering ? (
              <>
                <div className="mb-4 text-5xl">🎬</div>
                <h2 className="mb-2 text-xl font-bold">准备渲染视频</h2>
                <p className="mb-8 text-sm text-white/40">
                  确认分镜脚本无误后，点击下方按钮开始渲染
                </p>
                <button
                  onClick={handleRender}
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-12 py-4 text-lg font-semibold text-white transition-all hover:opacity-90"
                >
                  开始渲染
                </button>
                {error && (
                  <p className="mt-4 text-sm text-red-400">{error}</p>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/10">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                </div>
                <h2 className="mb-2 text-xl font-bold">正在渲染视频</h2>
                <p className="mb-6 text-sm text-white/40">
                  使用 Remotion 渲染中，请耐心等待...
                </p>
                <div className="h-2 w-80 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-700"
                    style={{ width: `${renderProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-white/30">
                  预计 {Math.round(renderProgress)}%
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-white/5 bg-white/2 p-10 text-center">
            <div className="mb-4 text-5xl">🎉</div>
            <h2 className="mb-2 text-xl font-bold">视频渲染完成！</h2>
            <p className="mb-6 text-sm text-white/40">
              您的产品介绍视频已完成渲染
            </p>

            {/* Video player */}
            <div className="mb-6 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10">
              <video
                src={renderedVideoUrl}
                controls
                className="w-full"
                autoPlay
              />
            </div>

            <div className="flex gap-4">
              <a
                href={renderedVideoUrl}
                download
                className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90"
              >
                ⬇ 下载视频
              </a>
              <button
                onClick={() => router.push("/")}
                className="rounded-xl border border-white/10 bg-white/5 px-8 py-3 text-base font-medium transition-all hover:bg-white/10"
              >
                创建新视频
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
