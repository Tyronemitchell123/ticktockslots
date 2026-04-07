import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Horizontal scan lines sweep across before text
  const scanLine1 = interpolate(frame, [0, 25], [-1920, 1920], { extrapolateRight: "clamp" });
  const scanLine2 = interpolate(frame, [5, 30], [1920, -1920], { extrapolateRight: "clamp" });
  const scanOpacity = interpolate(frame, [0, 15, 25, 35], [0, 0.6, 0.6, 0], { extrapolateRight: "clamp" });

  // Per-word staggered reveal
  const words1 = ["Every", "Empty", "Slot"];
  const words2 = ["Is", "Lost", "Revenue"];

  const getWordStyle = (wordIndex: number, isSecondLine: boolean) => {
    const delay = (isSecondLine ? 3 : 0) + wordIndex * 4 + 12;
    const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 80 } });
    const scale = interpolate(s, [0, 1], [1.3, 1]);
    const opacity = interpolate(s, [0, 1], [0, 1]);
    const blur = interpolate(s, [0, 1], [8, 0]);
    return {
      display: "inline-block" as const,
      transform: `scale(${scale})`,
      opacity,
      filter: `blur(${blur}px)`,
      marginRight: 20,
    };
  };

  // Pulsing ring behind "Lost Revenue"
  const ringScale = interpolate(frame, [20, 90], [0.5, 1.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ringOpacity = interpolate(frame, [20, 40, 70, 90], [0, 0.25, 0.25, 0], { extrapolateRight: "clamp" });

  // Tagline character-by-character reveal
  const tagline = "The Global Liquidity Engine for Perishable Inventory";
  const tagDelay = 40;
  const charsVisible = Math.floor(interpolate(frame - tagDelay, [0, 50], [0, tagline.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

  // Accent line
  const lineWidth = interpolate(frame, [30, 55], [0, 500], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Scan lines */}
      <div style={{
        position: "absolute", top: "38%", left: 0, width: "100%", height: 2,
        background: "linear-gradient(90deg, transparent, #3b82f6, #60a5fa, transparent)",
        transform: `translateX(${scanLine1}px)`, opacity: scanOpacity,
      }} />
      <div style={{
        position: "absolute", top: "62%", left: 0, width: "100%", height: 1,
        background: "linear-gradient(90deg, transparent, #fbbf24, #f59e0b, transparent)",
        transform: `translateX(${scanLine2}px)`, opacity: scanOpacity,
      }} />

      {/* Pulsing ring */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        width: 600, height: 600,
        transform: `translate(-50%, -50%) scale(${ringScale})`,
        opacity: ringOpacity,
        borderRadius: "50%",
        border: "2px solid rgba(96,165,250,0.4)",
        boxShadow: "0 0 80px rgba(96,165,250,0.15)",
      }} />

      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Title line 1 */}
        <div style={{ fontSize: 90, fontWeight: 900, lineHeight: 1, letterSpacing: -3, color: "#ffffff" }}>
          {words1.map((word, i) => (
            <span key={i} style={getWordStyle(i, false)}>{word}</span>
          ))}
        </div>

        {/* Title line 2 — gradient text */}
        <div style={{ fontSize: 90, fontWeight: 900, lineHeight: 1.1, letterSpacing: -3 }}>
          {words2.map((word, i) => {
            const base = getWordStyle(i, true);
            return (
              <span key={i} style={{
                ...base,
                background: "linear-gradient(135deg, #60a5fa, #93c5fd, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{word}</span>
            );
          })}
        </div>

        {/* Accent line */}
        <div style={{
          width: lineWidth, height: 3, margin: "30px auto", borderRadius: 2,
          background: "linear-gradient(90deg, transparent, #60a5fa, #fbbf24, transparent)",
        }} />

        {/* Typewriter tagline */}
        <div style={{
          fontSize: 26, color: "#94a3b8", fontWeight: 400, letterSpacing: 1,
          height: 36, overflow: "hidden",
        }}>
          <span>{tagline.slice(0, charsVisible)}</span>
          <span style={{
            opacity: frame % 20 < 10 ? 1 : 0,
            color: "#60a5fa",
          }}>|</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
