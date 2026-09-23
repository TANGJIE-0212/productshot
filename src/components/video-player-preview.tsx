"use client";

import { useMemo } from "react";
import type { Storyboard } from "@/lib/types";

interface VideoPlayerPreviewProps {
  storyboard: Storyboard;
}

export function VideoPlayerPreview({ storyboard }: VideoPlayerPreviewProps) {
  // Dynamic import of Remotion Player to avoid SSR issues
  // In a real implementation, use @remotion/player
  const totalDuration = storyboard.totalDurationInSeconds;

  return (
    <div className="flex flex-col gap-4">
      {/* Video preview placeholder */}
      <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-black">
        <div className="flex h-full items-center justify-center text-sm text-white/30">
          <div className="text-center">
            <div className="mb-2 text-4xl">🎬</div>
            <p>视频预览</p>
            <p className="mt-1 text-xs text-white/20">
              生成视频后可在此预览
            </p>
          </div>
        </div>
      </div>

      {/* Scene list preview */}
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-white/40">场景流程</h4>
        {storyboard.scenes.map((scene, i) => (
          <div
            key={scene.id}
            className="flex items-center gap-3 rounded-lg bg-white/3 p-2.5 text-xs"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 text-white/30">
              {i + 1}
            </span>
            <span className="flex-1 truncate text-white/60">
              {scene.label}
            </span>
            <span className="shrink-0 text-white/30">
              {scene.durationInSeconds}s
            </span>
          </div>
        ))}
      </div>

      {/* Duration summary */}
      <div className="rounded-xl bg-white/3 p-3 text-center text-sm text-white/40">
        总时长: <span className="font-semibold text-white/70">{totalDuration.toFixed(1)}s</span>
        {" · "}
        {storyboard.scenes.length} 个场景
        {" · "}
        {storyboard.fps}fps
      </div>
    </div>
  );
}
