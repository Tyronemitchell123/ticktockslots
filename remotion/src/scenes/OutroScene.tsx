import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Dramatic scale-from-2x reveal
  const titleSpring = spring({ frame, fps, config: { damping: 15, stiffness: 60 } });
  const titleScale = interpolate(titleSpring, [0, 1], [2, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleBlur = interpolate(titleSpring, [0, 1], [12, 0]);

  // Radial pulse
  const pulseScale = interpolate(frame, [0, 90], [0.3, 2.5], { extrapolateRight: "clamp" });
  const pulseOpacity = interpolate(frame, [0, 20, 60, 90], [0, 0.2, 0.15, 0], { extrapolateRight: "clamp" });

  // Tagline
  const tagSpring = spring({ frame: frame - 18, fps, config: { damping: 20 } });
  const tagOpacity = interpolate(tagSpring, [0, 1], [0, 1]);
  const tagY = interpolate(tagSpring, [0, 1], [20, 0]);

  const stats = [
    { value: "$2.4M", label: "Recovered Daily", color: "#fbbf24" },
    { value: "120s", label: "Avg Fill Time", color: "#60a5fa" },
    { value: "847t", label: "CO₂ Saved", color: "#4ade80" },
  ];

  // Gentle float on final hold
  const gentleFloat = Math.sin(frame * 0.04) * 4;

  return (
    <AbsoluteFill style={{ fontFamily, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Radial pulse */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 500, height: 500,
        transform: `translate(-50%, -50%) scale(${pulseScale})`,
        opacity: pulseOpacity, borderRadius: "50%",
        border: "1px solid rgba(96,165,250,0.3)",
        boxShadow: "0 0 60px rgba(96,165,250,0.1)",
      }} />

      <div style={{ textAlign: "center", transform: `translateY(${gentleFloat}px)` }}>
        {/* Title with scale-from-2x */}
        <div style={{
          fontSize: 100, fontWeight: 900, letterSpacing: -4, lineHeight: 1.05,
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          filter: `blur(${titleBlur}px)`,
        }}>
          <span style={{ color: "#ffffff" }}>Zero </span>
          <span style={{
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Dead Air.</span>
        </div>

        <div style={{
          fontSize: 24, color: "#94a3b8", marginTop: 24,
          opacity: tagOpacity, transform: `translateY(${tagY}px)`, letterSpacing: 2,
        }}>
          Every sector. Every slot. Filled.
        </div>

        {/* Stats strip with animated dividers */}
        <div style={{
          display: "flex", gap: 0, marginTop: 60, justifyContent: "center", alignItems: "center",
        }}>
          {stats.map((s, i) => {
            const sSpring = spring({ frame: frame - 22 - i * 7, fps, config: { damping: 14 } });
            const sOpacity = interpolate(sSpring, [0, 1], [0, 1]);
            const sY = interpolate(sSpring, [0, 1], [30, 0]);

            // Animated divider line
            const dividerH = interpolate(frame, [25 + i * 5, 45 + i * 5], [0, 50], {
              extrapolateLeft: "clamp", extrapolateRight: "clamp",
            });

            return (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div style={{
                    width: 1, height: dividerH, marginLeft: 40, marginRight: 40,
                    background: "linear-gradient(to bottom, transparent, rgba(148,163,184,0.4), transparent)",
                  }} />
                )}
                <div style={{
                  opacity: sOpacity, transform: `translateY(${sY}px)`,
                  textAlign: "center" as const,
                }}>
                  <div style={{
                    fontSize: 48, fontWeight: 900, color: s.color,
                    fontVariantNumeric: "tabular-nums" as const,
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: 13, color: "#64748b", letterSpacing: 3,
                    textTransform: "uppercase" as const, marginTop: 8,
                  }}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
