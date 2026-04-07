import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["400", "700", "900"], subsets: ["latin"] });

interface VerticalSceneProps {
  icon: string;
  title: string;
  stat: string;
  statLabel: string;
  description: string;
  accentColor: string;
  accentRgb: string;
  index: number;
  image: string;
}

export const VerticalScene: React.FC<VerticalSceneProps> = ({
  icon, title, stat, statLabel, description, accentColor, accentRgb, index, image,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Ken Burns effect on background image - BRIGHTER
  const scale = interpolate(frame, [0, 65], [1.05, 1.15], { extrapolateRight: "clamp" });
  const panX = interpolate(frame, [0, 65], [0, index % 2 === 0 ? -20 : 20], { extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, 65], [0, index % 2 === 0 ? -10 : 10], { extrapolateRight: "clamp" });

  const leftSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const leftX = interpolate(leftSpring, [0, 1], [-120, 0]);
  const leftOpacity = interpolate(leftSpring, [0, 1], [0, 1]);

  const rightSpring = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const rightX = interpolate(rightSpring, [0, 1], [120, 0]);
  const rightOpacity = interpolate(rightSpring, [0, 1], [0, 1]);

  const descSpring = spring({ frame: frame - 16, fps, config: { damping: 20 } });
  const descOpacity = interpolate(descSpring, [0, 1], [0, 1]);

  const statNum = parseFloat(stat.replace(/[^0-9.]/g, ""));
  const statPrefix = stat.startsWith("$") ? "$" : "";
  const statSuffix = stat.replace(/[0-9.$]/g, "");
  const countProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayNum = (statNum * countProgress).toFixed(statNum % 1 === 0 ? 0 : 1);

  const lineHeight = interpolate(frame, [5, 40], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = Math.sin(frame * 0.06) * 8;

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* Background image - MUCH BRIGHTER (0.55 opacity) */}
      <AbsoluteFill>
        <Img
          src={staticFile(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
            opacity: 0.55,
          }}
        />
      </AbsoluteFill>

      {/* Lighter gradient overlay - more transparent to let image show */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, rgba(10,16,32,0.65) 0%, rgba(10,16,32,0.35) 50%, rgba(10,16,32,0.55) 100%)`,
        }}
      />

      {/* Colored accent glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(${accentRgb},0.15), transparent 70%)`,
        }}
      />

      {/* Content */}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 120, maxWidth: 1400, padding: "0 80px" }}>
          {/* Left side */}
          <div style={{
            opacity: leftOpacity,
            transform: `translateX(${leftX}px)`,
            flex: 1,
          }}>
            <div style={{ fontSize: 64, marginBottom: 24, transform: `translateY(${floatY}px)` }}>
              {icon}
            </div>
            <div style={{
              fontSize: 13, fontWeight: 700, color: accentColor,
              letterSpacing: 4, textTransform: "uppercase" as const, marginBottom: 16,
            }}>
              SECTOR {String(index + 1).padStart(2, "0")}
            </div>
            <div style={{
              fontSize: 72, fontWeight: 900, color: "#ffffff",
              lineHeight: 1.05, letterSpacing: -2, marginBottom: 20,
              whiteSpace: "pre-line" as const,
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            }}>
              {title}
            </div>
            <div style={{
              fontSize: 22, color: "#cbd5e1", opacity: descOpacity,
              maxWidth: 500, lineHeight: 1.5,
              textShadow: "0 1px 10px rgba(0,0,0,0.4)",
            }}>
              {description}
            </div>
          </div>

          {/* Decorative vertical line */}
          <div style={{
            width: 2, height: lineHeight,
            background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
          }} />

          {/* Right side - stat */}
          <div style={{
            opacity: rightOpacity, transform: `translateX(${rightX}px)`,
            textAlign: "right" as const,
          }}>
            <div style={{
              fontSize: 120, fontWeight: 900, color: accentColor,
              lineHeight: 1, fontVariantNumeric: "tabular-nums" as const, letterSpacing: -4,
              textShadow: `0 0 40px rgba(${accentRgb},0.3)`,
            }}>
              {statPrefix}{displayNum}{statSuffix}
            </div>
            <div style={{
              fontSize: 16, color: "#94a3b8", letterSpacing: 3,
              textTransform: "uppercase" as const, marginTop: 12,
            }}>
              {statLabel}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom accent bar */}
      <div style={{
        position: "absolute", bottom: 60, left: "50%",
        transform: "translateX(-50%)", display: "flex", gap: 8,
      }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            width: i === index ? 40 : 8, height: 4, borderRadius: 2,
            backgroundColor: i === index ? accentColor : "rgba(148,163,184,0.3)",
          }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
