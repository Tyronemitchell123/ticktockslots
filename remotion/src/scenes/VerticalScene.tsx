import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
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
}

export const VerticalScene: React.FC<VerticalSceneProps> = ({
  icon, title, stat, statLabel, description, accentColor, accentRgb, index,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Left side - icon + title
  const leftSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const leftX = interpolate(leftSpring, [0, 1], [-120, 0]);
  const leftOpacity = interpolate(leftSpring, [0, 1], [0, 1]);

  // Right side - stats
  const rightSpring = spring({ frame: frame - 8, fps, config: { damping: 18 } });
  const rightX = interpolate(rightSpring, [0, 1], [120, 0]);
  const rightOpacity = interpolate(rightSpring, [0, 1], [0, 1]);

  // Description
  const descSpring = spring({ frame: frame - 16, fps, config: { damping: 20 } });
  const descOpacity = interpolate(descSpring, [0, 1], [0, 1]);

  // Stat counter animation
  const statNum = parseFloat(stat.replace(/[^0-9.]/g, ""));
  const statSuffix = stat.replace(/[0-9.]/g, "");
  const countProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayNum = (statNum * countProgress).toFixed(statNum % 1 === 0 ? 0 : 1);

  // Decorative line
  const lineHeight = interpolate(frame, [5, 40], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Floating accent
  const floatY = Math.sin(frame * 0.06) * 8;

  return (
    <AbsoluteFill style={{ fontFamily, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 120, maxWidth: 1400 }}>
        {/* Left side */}
        <div style={{
          opacity: leftOpacity,
          transform: `translateX(${leftX}px)`,
          flex: 1,
        }}>
          {/* Icon */}
          <div style={{
            fontSize: 64,
            marginBottom: 24,
            transform: `translateY(${floatY}px)`,
          }}>
            {icon}
          </div>

          {/* Category label */}
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            SECTOR {String(index + 1).padStart(2, "0")}
          </div>

          {/* Title */}
          <div style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#f8fafc",
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 20,
          }}>
            {title}
          </div>

          {/* Description */}
          <div style={{
            fontSize: 22,
            color: "#94a3b8",
            opacity: descOpacity,
            maxWidth: 500,
            lineHeight: 1.5,
          }}>
            {description}
          </div>
        </div>

        {/* Decorative vertical line */}
        <div style={{
          width: 2,
          height: lineHeight,
          background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
        }} />

        {/* Right side - stat */}
        <div style={{
          opacity: rightOpacity,
          transform: `translateX(${rightX}px)`,
          textAlign: "right",
        }}>
          <div style={{
            fontSize: 120,
            fontWeight: 900,
            color: accentColor,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -4,
          }}>
            {displayNum}{statSuffix}
          </div>
          <div style={{
            fontSize: 16,
            color: "#64748b",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 12,
          }}>
            {statLabel}
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div style={{
        position: "absolute",
        bottom: 60,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
      }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{
            width: i === index ? 40 : 8,
            height: 4,
            borderRadius: 2,
            backgroundColor: i === index ? accentColor : "rgba(148,163,184,0.2)",
            transition: "none",
          }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
