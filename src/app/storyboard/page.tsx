"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { SCENE_TYPE_LABELS } from "@/lib/constants";
import { formatDuration } from "@/lib/utils";
import { SceneCard } from "@/components/scene-card";
import { TimelineBar } from "@/components/timeline-bar";
import { VideoPlayerPreview } from "@/components/video-player-preview";
import { useState } from "react";

export default function StoryboardPage() {
  const router = useRouter();
  const { storyboard, updateScene, removeScene, updateSceneDuration, setStep } =
    useAppStore();
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  if (!storyboard) {
    router.push("/");
    return null;
  }

  const handleProceedToRender = () => {
    setStep("preview");
    router.push("/preview");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Top bar */}
      <div className="sticky top-16 z-40 border-b border-white/5 bg-[var(--bg-primary)]/90 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              ← 返回
            </button>
            <div className="h-4 w-px bg-white/10" />
            <h1 className="text-sm font-medium">{storyboard.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-white/30">
              {storyboard.scenes.length} 个场景 ·{" "}
              {formatDuration(storyboard.totalDurationInSeconds)}
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
            >
              {showPreview ? "隐藏预览" : "👁️ 预览视频"}
            </button>
            <button
              onClick={handleProceedToRender}
              className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              🎬 生成视频
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-4xl">
            {/* Timeline Overview */}
            <TimelineBar
              scenes={storyboard.scenes}
              activeSceneId={activeSceneId}
              onSceneClick={setActiveSceneId}
            />

            {/* Scene Cards */}
            <div className="mt-8 space-y-4">
              {storyboard.scenes.map((scene, index) => (
                <SceneCard
                  key={scene.id}
                  scene={scene}
                  index={index}
                  isActive={scene.id === activeSceneId}
                  onClick={() => setActiveSceneId(scene.id)}
                  onDurationChange={(duration) =>
                    updateSceneDuration(scene.id, duration)
                  }
                  onRemove={() => removeScene(scene.id)}
                  onUpdate={(updates) => updateScene(scene.id, updates)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-[480px] shrink-0 border-l border-white/5 bg-[var(--bg-secondary)] p-4">
            <div className="sticky top-[7.5rem]">
              <h3 className="mb-4 text-sm font-semibold text-white/60">
                实时预览
              </h3>
              <VideoPlayerPreview storyboard={storyboard} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
