export const VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

export const SCENE_DEFAULTS = {
  hero: { durationInSeconds: 5 },
  browser: { durationInSeconds: 7 },
  feature: { durationInSeconds: 6 },
  textReveal: { durationInSeconds: 4 },
  stats: { durationInSeconds: 5 },
  comparison: { durationInSeconds: 6 },
  outro: { durationInSeconds: 5 },
} as const;

export const TRANSITION_DEFAULTS = {
  fade: { durationInFrames: 15 },
  slide: { durationInFrames: 20 },
  wipe: { durationInFrames: 20 },
  flip: { durationInFrames: 25 },
  none: { durationInFrames: 0 },
} as const;

export const STORYBOARD_STYLES = [
  {
    id: "hook-feature-cta",
    label: "Hook → 功能展示 → CTA",
    description: "最常用的产品视频结构：吸引注意 → 展示功能 → 行动号召",
    duration: 60,
  },
  {
    id: "problem-solution",
    label: "问题 → 解决方案",
    description: "讲故事式结构：提出痛点 → 展示产品如何解决",
    duration: 60,
  },
  {
    id: "quick-showcase",
    label: "快速展示",
    description: "简短有力的产品展示，适合社交媒体",
    duration: 30,
  },
] as const;

export const SCENE_TYPE_LABELS: Record<string, string> = {
  hero: "🎬 开场",
  browser: "🖥️ 浏览器展示",
  feature: "✨ 功能亮点",
  textReveal: "📝 文字动效",
  stats: "📊 数据展示",
  comparison: "⚖️ 对比",
  outro: "🎯 结尾CTA",
};
