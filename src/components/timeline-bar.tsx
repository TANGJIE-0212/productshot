"use client";

import type { Scene } from "@/lib/types";
import { SCENE_TYPE_LABELS } from "@/lib/constants";

interface TimelineBarProps {
  scenes: Scene[];
  activeSceneId: string | null;
  onSceneClick: (id: string) => void;
}

export function TimelineBar({
  scenes,
  activeSceneId,
  onSceneClick,
}: TimelineBarProps) {
  const totalDuration = scenes.reduce((sum, s) => sum + s.durationInSeconds, 0);

  // Color mapping for scene types
  const sceneColors: Record<string, string> = {
    hero: "bg-purple-500",
    browser: "bg-blue-500",
    feature: "bg-emerald-500",
    textReveal: "bg-amber-500",
    stats: "bg-cyan-500",
    comparison: "bg-orange-500",
    outro: "bg-rose-500",
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/2 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-white/30">
        <span>时间轴</span>
        <span>{totalDuration.toFixed(1)}s 总时长</span>
      </div>

      {/* Timeline bar */}
      <div className="flex h-12 gap-0.5 overflow-hidden rounded-lg">
        {scenes.map((scene) => {
          const widthPercent =
            (scene.durationInSeconds / totalDuration) * 100;
          const isActive = scene.id === activeSceneId;
          const colorClass = sceneColors[scene.type] || "bg-gray-500";

          return (
            <button
              key={scene.id}
              onClick={() => onSceneClick(scene.id)}
              style={{ width: `${widthPercent}%` }}
              className={`relative flex items-center justify-center transition-all ${colorClass} ${
                isActive
                  ? "opacity-100 ring-2 ring-white/50 ring-offset-1 ring-offset-[var(--bg-primary)]"
                  : "opacity-40 hover:opacity-70"
              }`}
              title={`${scene.label} (${scene.durationInSeconds}s)`}
            >
              {widthPercent > 8 && (
                <span className="truncate px-1 text-[10px] font-medium text-white">
                  {scene.durationInSeconds}s
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {Object.entries(sceneColors).map(([type, colorClass]) => {
          const hasType = scenes.some((s) => s.type === type);
          if (!hasType) return null;
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm ${colorClass}`} />
              <span className="text-[10px] text-white/30">
                {SCENE_TYPE_LABELS[type] || type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
