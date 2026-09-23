"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidUrl } from "@/lib/utils";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Auto-add https:// if missing
    let finalUrl = url.trim();
    if (finalUrl && !finalUrl.startsWith("http")) {
      finalUrl = `https://${finalUrl}`;
    }

    if (!isValidUrl(finalUrl)) {
      setError("请输入有效的网址，例如 https://example.com");
      return;
    }

    // Navigate to analyze page with URL
    const encoded = encodeURIComponent(finalUrl);
    router.push(`/analyze?url=${encoded}`);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
          ✨ AI 驱动 · 一键生成产品介绍视频
        </div>

        {/* Heading */}
        <h1 className="mb-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          <span className="gradient-text">输入网址</span>
          <br />
          生成产品视频
        </h1>

        <p className="mb-12 max-w-xl text-lg text-white/50 leading-relaxed">
          输入您的产品网址，我们将自动分析网站内容、截取页面截图，
          并为您生成专业的产品介绍视频分镜脚本。
        </p>

        {/* URL Input Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
          <div className="glow group relative flex items-center rounded-2xl border border-white/10 bg-white/5 p-2 transition-all focus-within:border-brand-500/50 focus-within:bg-white/8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-white/30">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError("");
              }}
              placeholder="输入产品网址，例如 vercel.com"
              className="h-12 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/25"
              autoFocus
            />
            <button
              type="submit"
              disabled={!url.trim()}
              className="h-12 shrink-0 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 text-base font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              开始分析
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </form>

        {/* Quick examples */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-white/30">快速尝试：</span>
          {["linear.app", "notion.so", "figma.com", "stripe.com"].map(
            (example) => (
              <button
                key={example}
                onClick={() => setUrl(example)}
                className="rounded-lg border border-white/8 bg-white/3 px-3 py-1.5 text-sm text-white/50 transition-all hover:border-white/15 hover:text-white/80"
              >
                {example}
              </button>
            )
          )}
        </div>

        {/* Features grid */}
        <div className="mt-20 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: "🔍",
              title: "智能分析",
              desc: "自动获取网站截图、颜色、功能等关键信息",
            },
            {
              icon: "🎬",
              title: "AI分镜",
              desc: "基于优秀案例，自动生成专业视频分镜脚本",
            },
            {
              icon: "🎨",
              title: "可视化编辑",
              desc: "拖拽调整分镜顺序、时长、转场等效果",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/5 bg-white/3 p-6 text-left"
            >
              <div className="mb-3 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-white/40">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
