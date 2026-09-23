"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import type { WebsiteAnalysis, StoryboardResponse } from "@/lib/types";
import { STORYBOARD_STYLES } from "@/lib/constants";
import { extractDomain } from "@/lib/utils";

function AnalyzeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";

  const {
    setUrl,
    setAnalysis,
    setStoryboard,
    setStep,
    setError,
  } = useAppStore();

  const [phase, setPhase] = useState<
    "analyzing" | "select-style" | "generating" | "error"
  >("analyzing");
  const [analysisData, setAnalysisData] = useState<WebsiteAnalysis | null>(
    null
  );
  const [selectedStyle, setSelectedStyle] = useState<string>(
    "hook-feature-cta"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);

  // Phase 1: Analyze the website
  useEffect(() => {
    if (!url) {
      router.push("/");
      return;
    }

    setUrl(url);
    setStep("analyzing");

    const analyze = async () => {
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((p) => Math.min(p + Math.random() * 15, 90));
        }, 500);

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        clearInterval(progressInterval);

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "分析失败");
        }

        setProgress(100);
        setAnalysisData(data.data);
        setAnalysis(data.data);
        setPhase("select-style");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "未知错误";
        setErrorMsg(message);
        setError(message);
        setPhase("error");
      }
    };

    analyze();
  }, [url]);

  // Phase 3: Generate storyboard
  const handleGenerate = async () => {
    if (!analysisData) return;
    setPhase("generating");

    try {
      const res = await fetch("/api/storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: analysisData,
          style: selectedStyle,
          durationTarget:
            STORYBOARD_STYLES.find((s) => s.id === selectedStyle)?.duration ||
            60,
        }),
      });

      const data: StoryboardResponse = await res.json();
      if (!data.success || !data.data) {
        throw new Error(data.error || "生成失败");
      }

      setStoryboard(data.data);
      setStep("storyboard");
      router.push("/storyboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "未知错误";
      setErrorMsg(message);
      setPhase("error");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
      {/* Analyzing Phase */}
      {phase === "analyzing" && (
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/10">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
          <h2 className="mb-3 text-2xl font-bold">正在分析网站</h2>
          <p className="mb-8 text-white/50">
            {extractDomain(url)}
          </p>

          {/* Progress bar */}
          <div className="h-1.5 w-80 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-6 space-y-2 text-sm text-white/30">
            {progress < 30 && <p>📸 正在截取页面截图...</p>}
            {progress >= 30 && progress < 60 && <p>🎨 正在分析设计元素...</p>}
            {progress >= 60 && progress < 90 && <p>📝 正在提取功能信息...</p>}
            {progress >= 90 && <p>✅ 分析即将完成...</p>}
          </div>
        </div>
      )}

      {/* Style Selection Phase */}
      {phase === "select-style" && analysisData && (
        <div className="w-full max-w-4xl">
          {/* Analysis Summary */}
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">分析完成</h2>
            <p className="text-white/50">
              {analysisData.title} · 发现{" "}
              {analysisData.features.length} 个功能亮点 ·{" "}
              {analysisData.screenshots.length} 张截图
            </p>
          </div>

          {/* Analysis preview cards */}
          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {analysisData.screenshots.slice(0, 4).map((screenshot) => (
              <div
                key={screenshot.id}
                className="overflow-hidden rounded-xl border border-white/5 bg-white/3"
              >
                <img
                  src={screenshot.url}
                  alt={screenshot.label}
                  className="aspect-video w-full object-cover object-top"
                />
                <div className="p-2 text-center text-xs text-white/40">
                  {screenshot.label}
                </div>
              </div>
            ))}
          </div>

          {/* Color palette */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <span className="text-sm text-white/30">品牌色：</span>
            {Object.entries(analysisData.colors)
              .filter(([k]) => k !== "gradientColors")
              .map(([key, color]) => (
                <div
                  key={key}
                  className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/3 px-3 py-1.5"
                >
                  <div
                    className="h-4 w-4 rounded"
                    style={{ background: color as string }}
                  />
                  <span className="text-xs text-white/50">{key}</span>
                </div>
              ))}
          </div>

          {/* Style selection */}
          <h3 className="mb-4 text-center text-xl font-semibold">
            选择视频风格
          </h3>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STORYBOARD_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`card-hover rounded-2xl border p-6 text-left transition-all ${
                  selectedStyle === style.id
                    ? "border-brand-500/50 bg-brand-500/10"
                    : "border-white/5 bg-white/3 hover:border-white/10"
                }`}
              >
                <div className="mb-2 text-lg font-semibold">{style.label}</div>
                <p className="mb-3 text-sm text-white/40">
                  {style.description}
                </p>
                <div className="text-xs text-white/30">
                  约 {style.duration}s
                </div>
              </button>
            ))}
          </div>

          {/* Generate button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-12 py-4 text-lg font-semibold text-white transition-all hover:opacity-90"
            >
              🎬 生成分镜脚本
            </button>
          </div>
        </div>
      )}

      {/* Generating Phase */}
      {phase === "generating" && (
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 text-6xl animate-bounce">🎬</div>
          <h2 className="mb-3 text-2xl font-bold">正在生成分镜脚本</h2>
          <p className="text-white/50">
            AI正在为您创建专业的产品介绍视频分镜...
          </p>
        </div>
      )}

      {/* Error Phase */}
      {phase === "error" && (
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 text-5xl">😵</div>
          <h2 className="mb-3 text-2xl font-bold">出错了</h2>
          <p className="mb-6 text-white/50">{errorMsg}</p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium transition-all hover:bg-white/10"
            >
              返回首页
            </button>
            <button
              onClick={() => {
                setPhase("analyzing");
                setProgress(0);
                window.location.reload();
              }}
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-500"
            >
              重试
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}
