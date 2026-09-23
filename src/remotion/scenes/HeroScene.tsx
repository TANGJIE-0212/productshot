import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import type { HeroSceneProps } from "@/lib/types";

export const HeroScene: React.FC<HeroSceneProps> = ({
  title,
  subtitle,
  gradientColors,
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gradient background animation
  const gradientAngle = interpolate(frame, [0, 3 * fps], [135, 180], {
    extrapolateRight: "clamp",
  });

  // Logo animation
  const logoScale = spring({ frame, fps, config: { damping: 200 } });
  const logoOpacity = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleY = interpolate(
    spring({ frame: frame - 0.3 * fps, fps, config: { damping: 200 } }),
    [0, 1],
    [60, 0]
  );
  const titleOpacity = interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle animation
  const subtitleY = interpolate(
    spring({ frame: frame - 0.6 * fps, fps, config: { damping: 200 } }),
    [0, 1],
    [40, 0]
  );
  const subtitleOpacity = interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Decorative particles
  const particles = Array.from({ length: 6 }, (_, i) => {
    const delay = i * 0.15 * fps;
    const particleOpacity = interpolate(
      frame,
      [delay, delay + 0.5 * fps, delay + 2 * fps],
      [0, 0.6, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const particleY = interpolate(frame, [delay, delay + 2 * fps], [0, -100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return { opacity: particleOpacity, y: particleY, x: 200 + i * 300 };
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Decorative particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 12 + i * 4,
            height: 12 + i * 4,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            left: p.x,
            top: 600 + p.y,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Logo */}
      {logoUrl && (
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            marginBottom: 40,
          }}
        >
          <Img
            src={logoUrl}
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      )}

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          fontSize: 72,
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          maxWidth: 1400,
          lineHeight: 1.2,
          textShadow: "0 4px 20px rgba(0,0,0,0.2)",
          letterSpacing: -1,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
          fontSize: 36,
          fontWeight: 400,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          maxWidth: 1000,
          marginTop: 24,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
