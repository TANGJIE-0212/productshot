import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
} from "remotion";
import type { BrowserSceneProps } from "@/lib/types";

const BROWSER_PADDING = 80;
const TITLE_BAR_HEIGHT = 44;
const BROWSER_RADIUS = 12;

export const BrowserScene: React.FC<BrowserSceneProps> = ({
  screenshotUrl,
  browserUrl,
  scrollAnimation,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  // Browser entrance animation
  const enterProgress = spring({
    frame,
    fps,
    config: { damping: 200 },
  });
  const browserScale = interpolate(enterProgress, [0, 1], [0.85, 1]);
  const browserY = interpolate(enterProgress, [0, 1], [80, 0]);
  const browserOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Shadow grows with entrance
  const shadowBlur = interpolate(enterProgress, [0, 1], [10, 40]);

  // Scroll animation
  const scrollOffset = scrollAnimation
    ? interpolate(
        frame,
        [1.5 * fps, durationInFrames - 0.5 * fps],
        [0, -400],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 0;

  const browserWidth = width - BROWSER_PADDING * 2;
  const browserHeight = height - BROWSER_PADDING * 2 - 40;

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0f0f23, #1a1a3e, #0f0f23)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Browser Frame */}
      <div
        style={{
          transform: `translateY(${browserY}px) scale(${browserScale})`,
          opacity: browserOpacity,
          width: browserWidth,
          height: browserHeight,
          borderRadius: BROWSER_RADIUS,
          overflow: "hidden",
          background: "#1e1e2e",
          boxShadow: `0 ${shadowBlur / 2}px ${shadowBlur}px rgba(0,0,0,0.5)`,
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: TITLE_BAR_HEIGHT,
            background: "#2a2a3c",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 16,
            gap: 8,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 8, marginRight: 12 }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
              <div
                key={color}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: color,
                }}
              />
            ))}
          </div>

          {/* URL Bar */}
          <div
            style={{
              flex: 1,
              height: 28,
              background: "#1a1a2e",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <span style={{ fontSize: 12, color: "#4ade80" }}>🔒</span>
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.5)",
                marginLeft: 8,
                fontFamily: "monospace",
              }}
            >
              {browserUrl}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            height: browserHeight - TITLE_BAR_HEIGHT,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {screenshotUrl && (
            <Img
              src={screenshotUrl}
              style={{
                width: "100%",
                position: "absolute",
                top: scrollOffset,
                left: 0,
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
