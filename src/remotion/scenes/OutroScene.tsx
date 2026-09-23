import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import type { OutroSceneProps } from "@/lib/types";

export const OutroScene: React.FC<OutroSceneProps> = ({
  ctaText,
  productUrl,
  logoUrl,
  gradientColors,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Gradient animation
  const gradientAngle = interpolate(frame, [0, durationInFrames], [135, 225], {
    extrapolateRight: "clamp",
  });

  // Logo entrance
  const logoEntrance = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const logoScale = interpolate(logoEntrance, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // CTA button entrance
  const ctaEntrance = spring({
    frame: frame - 0.4 * fps,
    fps,
    config: { damping: 12, stiffness: 150 },
  });
  const ctaScale = interpolate(ctaEntrance, [0, 1], [0.8, 1]);
  const ctaOpacity = interpolate(frame, [0.4 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA pulse effect
  const pulsePhase = (frame - 1.5 * fps) / fps;
  const pulseScale =
    frame > 1.5 * fps
      ? 1 + Math.sin(pulsePhase * Math.PI * 2) * 0.03
      : 1;

  // URL entrance
  const urlOpacity = interpolate(frame, [0.8 * fps, 1.2 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const urlY = interpolate(
    spring({ frame: frame - 0.8 * fps, fps, config: { damping: 200 } }),
    [0, 1],
    [20, 0]
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Logo */}
      {logoUrl && (
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        >
          <Img
            src={logoUrl}
            style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${ctaScale * pulseScale})`,
          opacity: ctaOpacity,
          background: "rgba(255,255,255,0.95)",
          color: gradientColors[0],
          fontSize: 40,
          fontWeight: 700,
          padding: "24px 80px",
          borderRadius: 60,
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          letterSpacing: 2,
        }}
      >
        {ctaText}
      </div>

      {/* URL */}
      <div
        style={{
          opacity: urlOpacity,
          transform: `translateY(${urlY}px)`,
          fontSize: 28,
          color: "rgba(255,255,255,0.8)",
          fontFamily: "monospace",
          letterSpacing: 1,
        }}
      >
        {productUrl}
      </div>
    </AbsoluteFill>
  );
};
