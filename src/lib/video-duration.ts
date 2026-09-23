import type { Scene } from "./types";

export function getVideoDurationInFrames(scenes: Scene[], fps: number): number {
  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error("视频帧率必须大于 0");
  }
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new Error("至少需要一个分镜");
  }

  const durations = scenes.map((scene) => {
    if (!Number.isFinite(scene?.durationInSeconds) || scene.durationInSeconds <= 0) {
      throw new Error("分镜时长必须大于 0");
    }
    return Math.ceil(scene.durationInSeconds * fps);
  });

  return scenes.reduce((total, scene, index) => {
    const transition = scene.transition;
    if (index === 0 || !transition || transition.type === "none") {
      return total + durations[index];
    }
    const overlap = transition.durationInFrames;
    if (
      !Number.isInteger(overlap) ||
      overlap < 0 ||
      overlap >= Math.min(durations[index - 1], durations[index])
    ) {
      throw new Error("转场帧数必须为非负整数，并小于相邻分镜时长");
    }
    return total + durations[index] - overlap;
  }, 0);
}
