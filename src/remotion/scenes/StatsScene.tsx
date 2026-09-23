import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { StatsSceneProps } from "@/lib/types";

export const StatsScene: React.FC<StatsSceneProps> = ({
  stats,
  backgroundColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: backgroundColor || "linear-gradient(135deg, #0f0f23, #1a1a3e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 80,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {stats.map((stat, i) => {
          const delay = i * 0.3 * fps;
          const entrance = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 150 },
          });
          const scale = interpolate(entrance, [0, 1], [0.5, 1]);
          const opacity = interpolate(
            frame,
            [delay, delay + 0.4 * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Counter animation
          const numericValue = parseFloat(stat.value.replace(/[^0-9.]/g, ""));
          const prefix = stat.value.match(/^[^0-9]*/)?.[0] || "";
          const suffix = stat.value.match(/[^0-9]*$/)?.[0] || "";
          const countProgress = interpolate(
            frame,
            [delay, delay + 1.5 * fps],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          const displayValue = isNaN(numericValue)
            ? stat.value
            : `${prefix}${Math.round(numericValue * countProgress)}${suffix}`;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                transform: `scale(${scale})`,
                opacity,
              }}
            >
              <div style={{ fontSize: 48 }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#ffffff",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {displayValue}
              </div>
              <div
                style={{
                  fontSize: 24,
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
