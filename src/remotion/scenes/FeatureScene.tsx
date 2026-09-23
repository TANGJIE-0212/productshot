import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import type { FeatureSceneProps } from "@/lib/types";

export const FeatureScene: React.FC<FeatureSceneProps> = ({
  title,
  description,
  screenshotUrl,
  iconEmoji,
  position,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const isLeft = position === "left";

  // Text content animations
  const textEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const textX = interpolate(
    textEntrance,
    [0, 1],
    [isLeft ? -100 : 100, 0]
  );
  const textOpacity = interpolate(frame, [0, 0.4 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Icon bounce animation
  const iconScale = spring({
    frame: frame - 0.2 * fps,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Screenshot animation
  const imgEntrance = spring({
    frame: frame - 0.3 * fps,
    fps,
    config: { damping: 200 },
  });
  const imgScale = interpolate(imgEntrance, [0, 1], [0.9, 1]);
  const imgOpacity = interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Accent decoration line
  const lineWidth = interpolate(
    spring({ frame: frame - 0.5 * fps, fps, config: { damping: 200 } }),
    [0, 1],
    [0, 80]
  );

  const contentWidth = width / 2 - 80;

  const textContent = (
    <div
      style={{
        width: contentWidth,
        padding: 60,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        transform: `translateX(${textX}px)`,
        opacity: textOpacity,
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 24,
          transform: `scale(${iconScale})`,
        }}
      >
        {iconEmoji}
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          background: "linear-gradient(90deg, #4c6ef5, #748ffc)",
          borderRadius: 2,
          marginBottom: 24,
        }}
      />

      {/* Title */}
      <div
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.2,
          marginBottom: 16,
        }}
      >
        {title}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>
    </div>
  );

  const imageContent = (
    <div
      style={{
        width: contentWidth,
        padding: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${imgScale})`,
        opacity: imgOpacity,
      }}
    >
      {screenshotUrl && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Img
            src={screenshotUrl}
            style={{
              width: contentWidth - 80,
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f23, #1a1a3e)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {isLeft ? (
        <>
          {textContent}
          {imageContent}
        </>
      ) : (
        <>
          {imageContent}
          {textContent}
        </>
      )}
    </AbsoluteFill>
  );
};
