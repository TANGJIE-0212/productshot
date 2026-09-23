import { Composition } from "remotion";
import { ProductVideo } from "./ProductVideo";
import type { Scene } from "@/lib/types";
import { VIDEO_CONFIG } from "@/lib/constants";
import { getVideoDurationInFrames } from "@/lib/video-duration";
import { DemoVideoEntry } from "./DemoVideo";
import { newStudioProject, projectSchema, studioFrames, STUDIO_FPS, STUDIO_WIDTH, STUDIO_HEIGHT } from "@/lib/studio/types";

// Default demo scenes for Remotion Studio preview
const demoScenes: Scene[] = [
  {
    id: "demo-hero",
    type: "hero",
    label: "开场",
    durationInSeconds: 5,
    sceneProps: {
      type: "hero",
      props: {
        title: "ProductShot",
        subtitle: "AI驱动的产品介绍视频生成器",
        gradientColors: ["#4c6ef5", "#748ffc"],
      },
    },
    transition: { type: "none", durationInFrames: 0 },
  },
  {
    id: "demo-text",
    type: "textReveal",
    label: "功能介绍",
    durationInSeconds: 5,
    sceneProps: {
      type: "textReveal",
      props: {
        lines: ["🚀 自动分析网站", "🎬 智能生成分镜", "✨ 一键渲染视频"],
        fontSize: 56,
        color: "#ffffff",
        animationStyle: "slide",
        backgroundColor: "#0f0f23",
      },
    },
    transition: { type: "fade", durationInFrames: 15 },
  },
  {
    id: "demo-outro",
    type: "outro",
    label: "结尾",
    durationInSeconds: 5,
    sceneProps: {
      type: "outro",
      props: {
        ctaText: "立即体验",
        productUrl: "productshot.app",
        gradientColors: ["#4c6ef5", "#748ffc"],
      },
    },
    transition: { type: "wipe", direction: "from-bottom", durationInFrames: 20 },
  },
];

const totalFrames = getVideoDurationInFrames(demoScenes, VIDEO_CONFIG.fps);

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="ProductVideo"
      component={ProductVideo}
      durationInFrames={totalFrames}
      fps={VIDEO_CONFIG.fps}
      width={VIDEO_CONFIG.width}
      height={VIDEO_CONFIG.height}
      defaultProps={{
        scenes: demoScenes,
        fps: VIDEO_CONFIG.fps,
        width: VIDEO_CONFIG.width,
        height: VIDEO_CONFIG.height,
      }}
      calculateMetadata={({ props }) => ({
        durationInFrames: getVideoDurationInFrames(props.scenes, props.fps),
        fps: props.fps,
        width: props.width ?? VIDEO_CONFIG.width,
        height: props.height ?? VIDEO_CONFIG.height,
      })}
    />
    <Composition
      id="DemoVideo"
      component={DemoVideoEntry}
      durationInFrames={1}
      fps={STUDIO_FPS}
      width={STUDIO_WIDTH}
      height={STUDIO_HEIGHT}
      defaultProps={{ project: newStudioProject(), mediaBaseUrl: "" }}
      calculateMetadata={({ props }) => ({
        durationInFrames: studioFrames(projectSchema.parse(props.project)),
        fps: STUDIO_FPS,
        width: STUDIO_WIDTH,
        height: STUDIO_HEIGHT,
      })}
    />
    </>
  );
};
