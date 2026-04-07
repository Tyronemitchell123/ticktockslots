import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const titleScale = interpolate(titleSpring, [0, 1], [0.7, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  const tagSpring = spring({ frame: frame - 15, fps, config: { damping: 20 } });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [20, 0]);

  const stats = [
    { value: "$2.4M", label: "Recovered Daily" },
    { value: "120s", label: "Avg Fill Time" },
    { value: "847t", label: "CO₂ Saved" },
  ];

  return (
    <AbsoluteFill style={{ fontFamily, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 100, fontWeight: 900, letterSpacing: -4, lineHeight: 1.05,
          opacity: titleOpacity, transform: `scale(${titleScale})`,
        }}>
          <span style={{ color: "#ffffff" }}>Zero </span>
          <span style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Dead Air.</span>
        </div>

        <div style={{
          fontSize: 24, color: "#b0bec5", marginTop: 24,
          opacity: tagOpacity, transform: `translateY(${tagY}px)`, letterSpacing: 2,
        }}>
          Every sector. Every slot. Filled.
        </div>

        <div style={{ display: "flex", gap: 60, marginTop: 60, justifyContent: "center" }}>
          {stats.map((s, i) => {
            const sSpring = spring({ frame: frame - 20 - i * 6, fps, config: { damping: 15 } });
            return (
              <div key={i} style={{
                opacity: interpolate(sSpring, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(sSpring, [0, 1], [30, 0])}px)`,
                textAlign: "center" as const,
              }}>
                <div style={{
                  fontSize: 48, fontWeight: 900,
                  color: i === 0 ? "#fbbf24" : i === 1 ? "#60a5fa" : "#4ade80",
                  fontVariantNumeric: "tabular-nums" as const,
                }}>{s.value}</div>
                <div style={{
                  fontSize: 13, color: "#94a3b8", letterSpacing: 3,
                  textTransform: "uppercase" as const, marginTop: 8,
                }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
