import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";

import { HeroScene } from "./scenes/HeroScene";
import { BrowserScene } from "./scenes/BrowserScene";
import { FeatureScene } from "./scenes/FeatureScene";
import { TextRevealScene } from "./scenes/TextRevealScene";
import { StatsScene } from "./scenes/StatsScene";
import { OutroScene } from "./scenes/OutroScene";

import type {
  Scene,
  HeroSceneProps,
  BrowserSceneProps,
  FeatureSceneProps,
  TextRevealSceneProps,
  StatsSceneProps,
  OutroSceneProps,
  SceneTransition,
} from "@/lib/types";

export type ProductVideoProps = {
  scenes: Scene[];
  fps: number;
  width?: number;
  height?: number;
};

// Use fade as the common return type to keep TS happy
const getTransitionPresentation = (transition: SceneTransition): ReturnType<typeof fade> => {
  switch (transition.type) {
    case "slide":
      return slide({ direction: transition.direction || "from-right" }) as unknown as ReturnType<typeof fade>;
    case "wipe":
      return wipe({ direction: (transition.direction || "from-left") as "from-left" | "from-right" | "from-top" | "from-bottom" }) as unknown as ReturnType<typeof fade>;
    case "flip":
      return flip({ direction: transition.direction || "from-right" }) as unknown as ReturnType<typeof fade>;
    case "fade":
    default:
      return fade();
  }
};

function renderScene(scene: Scene) {
  const { sceneProps } = scene;

  switch (sceneProps.type) {
    case "hero":
      return <HeroScene {...(sceneProps.props as HeroSceneProps)} />;
    case "browser":
      return <BrowserScene {...(sceneProps.props as BrowserSceneProps)} />;
    case "feature":
      return <FeatureScene {...(sceneProps.props as FeatureSceneProps)} />;
    case "textReveal":
      return <TextRevealScene {...(sceneProps.props as TextRevealSceneProps)} />;
    case "stats":
      return <StatsScene {...(sceneProps.props as StatsSceneProps)} />;
    case "outro":
      return <OutroScene {...(sceneProps.props as OutroSceneProps)} />;
    default:
      return (
        <AbsoluteFill
          style={{
            background: "#0f0f23",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 48,
          }}
        >
          Unknown Scene
        </AbsoluteFill>
      );
  }
}

export const ProductVideo: React.FC<ProductVideoProps> = ({ scenes, fps }) => {
  if (!scenes || scenes.length === 0) {
    return (
      <AbsoluteFill
        style={{
          background: "#0f0f23",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 48,
        }}
      >
        No scenes configured
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      <TransitionSeries>
        {scenes.map((scene, index) => {
          const durationInFrames = Math.ceil(scene.durationInSeconds * fps);
          const hasTransition =
            index > 0 &&
            scene.transition &&
            scene.transition.type !== "none" &&
            scene.transition.durationInFrames > 0;

          return [
            hasTransition ? (
              <TransitionSeries.Transition
                key={`transition-${scene.id}`}
                presentation={getTransitionPresentation(scene.transition)}
                timing={linearTiming({
                  durationInFrames: scene.transition.durationInFrames,
                })}
              />
            ) : null,
            <TransitionSeries.Sequence
              key={scene.id}
              durationInFrames={durationInFrames}
            >
              {renderScene(scene)}
            </TransitionSeries.Sequence>,
          ];
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
