"use client";

import type { Scene } from "@/lib/types";
import { SCENE_TYPE_LABELS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";

interface SceneCardProps {
  scene: Scene;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDurationChange: (duration: number) => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<Scene>) => void;
}

export function SceneCard({
  scene,
  index,
  isActive,
  onClick,
  onDurationChange,
  onRemove,
}: SceneCardProps) {
  const typeLabel = SCENE_TYPE_LABELS[scene.type] || scene.type;

  // Extract displayable props
  const displayProps = getDisplayProps(scene);

  return (
    <div
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl border p-5 transition-all ${
        isActive
          ? "border-brand-500/40 bg-brand-500/5 ring-1 ring-brand-500/20"
          : "border-white/5 bg-white/2 hover:border-white/10 hover:bg-white/4"
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Left: Scene info */}
        <div className="flex items-start gap-4">
          {/* Scene number */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              isActive
                ? "bg-brand-500/20 text-brand-400"
                : "bg-white/5 text-white/30"
            }`}
          >
            {index + 1}
          </div>

          <div>
            {/* Type badge + label */}
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs text-white/40">{typeLabel}</span>
              <span className="text-xs text-white/20">·</span>
              <span className="text-xs text-white/30">
                {scene.transition.type !== "none"
                  ? `${scene.transition.type} 转场`
                  : "直切"}
              </span>
            </div>

            <h3 className="mb-2 text-base font-semibold">{scene.label}</h3>

            {/* Scene-specific props preview */}
            <div className="flex flex-wrap gap-2">
              {displayProps.map((prop, i) => (
                <span
                  key={i}
                  className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/40"
                >
                  {prop}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Duration control + actions */}
        <div className="flex items-center gap-3">
          {/* Duration slider */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2}
              max={15}
              step={0.5}
              value={scene.durationInSeconds}
              onChange={(e) => onDurationChange(parseFloat(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-white/10 accent-brand-500"
            />
            <span className="w-10 text-right text-sm font-mono text-white/50">
              {formatDuration(scene.durationInSeconds)}
            </span>
          </div>

          {/* Remove button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/20 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded content when active */}
      {isActive && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/30">场景类型</span>
              <p className="mt-1 text-white/70">{typeLabel}</p>
            </div>
            <div>
              <span className="text-white/30">持续时间</span>
              <p className="mt-1 text-white/70">
                {scene.durationInSeconds}s (
                {Math.ceil(scene.durationInSeconds * 30)} 帧)
              </p>
            </div>
            <div>
              <span className="text-white/30">转场效果</span>
              <p className="mt-1 text-white/70">
                {scene.transition.type}{" "}
                {scene.transition.direction
                  ? `(${scene.transition.direction})`
                  : ""}
              </p>
            </div>
            <div>
              <span className="text-white/30">转场时长</span>
              <p className="mt-1 text-white/70">
                {scene.transition.durationInFrames} 帧
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDisplayProps(scene: Scene): string[] {
  const props = scene.sceneProps.props as unknown as Record<string, unknown>;
  const tags: string[] = [];

  if (typeof props.title === "string") tags.push(props.title);
  if (typeof props.subtitle === "string") tags.push(props.subtitle.slice(0, 30));
  if (typeof props.ctaText === "string") tags.push(`CTA: ${props.ctaText}`);
  if (typeof props.iconEmoji === "string") tags.push(props.iconEmoji);
  if (typeof props.animationStyle === "string")
    tags.push(`动效: ${props.animationStyle}`);
  if (typeof props.position === "string")
    tags.push(`位置: ${props.position}`);
  if (Array.isArray(props.lines))
    tags.push(`${props.lines.length} 行文字`);
  if (Array.isArray(props.stats))
    tags.push(`${props.stats.length} 个数据`);
  if (props.scrollAnimation === true) tags.push("滚动动画");

  return tags.slice(0, 5);
}
