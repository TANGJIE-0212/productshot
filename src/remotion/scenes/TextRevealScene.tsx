import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { TextRevealSceneProps } from "@/lib/types";

export const TextRevealScene: React.FC<TextRevealSceneProps> = ({
  lines,
  fontSize,
  color,
  animationStyle,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor || "#0f0f23",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
        gap: 24,
      }}
    >
      {lines.map((line, i) => (
        <AnimatedLine
          key={i}
          text={line}
          index={i}
          frame={frame}
          fps={fps}
          fontSize={fontSize}
          color={color}
          style={animationStyle}
        />
      ))}
    </AbsoluteFill>
  );
};

const AnimatedLine: React.FC<{
  text: string;
  index: number;
  frame: number;
  fps: number;
  fontSize: number;
  color: string;
  style: "typewriter" | "fade" | "slide";
}> = ({ text, index, frame, fps, fontSize, color, style: animStyle }) => {
  const delay = index * 0.8 * fps;
  const localFrame = Math.max(0, frame - delay);

  if (animStyle === "typewriter") {
    const charsToShow = Math.floor(
      interpolate(localFrame, [0, text.length * 2], [0, text.length], {
        extrapolateRight: "clamp",
      })
    );
    const displayText = text.slice(0, charsToShow);
    const showCursor =
      localFrame < text.length * 2 + fps && Math.floor(frame / 15) % 2 === 0;

    return (
      <div
        style={{
          fontSize,
          fontWeight: 700,
          color,
          textAlign: "center",
          minHeight: fontSize * 1.4,
        }}
      >
        {displayText}
        {showCursor && (
          <span style={{ opacity: 0.8, marginLeft: 2 }}>|</span>
        )}
      </div>
    );
  }

  if (animStyle === "slide") {
    const progress = spring({
      frame: localFrame,
      fps,
      config: { damping: 200 },
    });
    const x = interpolate(progress, [0, 1], [100, 0]);
    const opacity = interpolate(localFrame, [0, 0.3 * fps], [0, 1], {
      extrapolateRight: "clamp",
    });

    return (
      <div
        style={{
          fontSize,
          fontWeight: 700,
          color,
          textAlign: "center",
          transform: `translateX(${x}px)`,
          opacity,
        }}
      >
        {text}
      </div>
    );
  }

  // Fade style
  const opacity = interpolate(localFrame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const scale = interpolate(
    spring({ frame: localFrame, fps, config: { damping: 200 } }),
    [0, 1],
    [0.95, 1]
  );

  return (
    <div
      style={{
        fontSize,
        fontWeight: 700,
        color,
        textAlign: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {text}
    </div>
  );
};
