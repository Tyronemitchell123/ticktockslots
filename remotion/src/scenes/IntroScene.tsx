import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  const subtitleSpring = spring({ frame: frame - 12, fps, config: { damping: 20 } });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleSpring, [0, 1], [30, 0]);

  const lineWidth = interpolate(frame, [20, 50], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const badgeSpring = spring({ frame: frame - 25, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ fontFamily, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        {/* Badge */}
        <div style={{
          opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
          marginBottom: 30,
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 999,
            border: "1px solid rgba(59,130,246,0.4)",
            backgroundColor: "rgba(59,130,246,0.12)",
            fontSize: 14, fontWeight: 700, color: "#93bbfc",
            letterSpacing: 3, textTransform: "uppercase" as const,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#4ade80" }} />
            LIVE • ALL VERTICALS
          </span>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 90, fontWeight: 900, color: "#ffffff",
          lineHeight: 1, opacity: titleOpacity,
          transform: `translateY(${titleY}px)`, letterSpacing: -3,
        }}>
          Every Empty Slot
        </div>
        <div style={{
          fontSize: 90, fontWeight: 900, lineHeight: 1.1,
          opacity: titleOpacity, transform: `translateY(${titleY}px)`,
          background: "linear-gradient(135deg, #60a5fa, #93c5fd, #60a5fa)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: -3,
        }}>
          Is Lost Revenue
        </div>

        {/* Accent line */}
        <div style={{
          width: lineWidth, height: 3,
          background: "linear-gradient(90deg, transparent, #60a5fa, #fbbf24, transparent)",
          margin: "30px auto", borderRadius: 2,
        }} />

        {/* Subtitle */}
        <div style={{
          fontSize: 26, color: "#b0bec5", opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`, fontWeight: 400, letterSpacing: 1,
        }}>
          The Global Liquidity Engine for Perishable Inventory
        </div>
      </div>
    </AbsoluteFill>
  );
};
