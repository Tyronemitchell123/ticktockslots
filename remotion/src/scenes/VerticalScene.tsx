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
  const layout = index % 3; // 0=A, 1=B, 2=C

  // Ken Burns
  const scale = interpolate(frame, [0, 65], [1.05, 1.18], { extrapolateRight: "clamp" });
  const panX = interpolate(frame, [0, 65], [0, index % 2 === 0 ? -25 : 25], { extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, 65], [0, index % 2 === 0 ? -12 : 12], { extrapolateRight: "clamp" });

  // Stat counter
  const statNum = parseFloat(stat.replace(/[^0-9.]/g, ""));
  const statPrefix = stat.startsWith("$") ? "$" : "";
  const statSuffix = stat.replace(/[0-9.$]/g, "");
  const countProgress = interpolate(frame, [10, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const displayNum = (statNum * countProgress).toFixed(statNum % 1 === 0 ? 0 : 1);

  // Common animations
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  const statSpring = spring({ frame: frame - 8, fps, config: { damping: 16 } });
  const statOpacity = interpolate(statSpring, [0, 1], [0, 1]);
  const statScale = interpolate(statSpring, [0, 1], [0.8, 1]);

  const descSpring = spring({ frame: frame - 18, fps, config: { damping: 20 } });
  const descOpacity = interpolate(descSpring, [0, 1], [0, 1]);

  // Underline reveal for sector label
  const underlineW = interpolate(frame, [5, 35], [0, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const floatY = Math.sin(frame * 0.06) * 6;

  // Bottom progress dots
  const totalDots = 10;
  const dots = (
    <div style={{
      position: "absolute", bottom: 50, left: "50%",
      transform: "translateX(-50%)", display: "flex", gap: 6,
    }}>
      {Array.from({ length: totalDots }).map((_, i) => (
        <div key={i} style={{
          width: i === index ? 32 : 6, height: 4, borderRadius: 2,
          backgroundColor: i === index ? accentColor : "rgba(148,163,184,0.3)",
          transition: "none",
        }} />
      ))}
    </div>
  );

  // Sector label with underline
  const sectorLabel = (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: accentColor,
        letterSpacing: 4, textTransform: "uppercase" as const,
      }}>
        SECTOR {String(index + 1).padStart(2, "0")}
      </div>
      <div style={{
        width: underlineW, height: 2, marginTop: 6,
        background: `linear-gradient(90deg, ${accentColor}, transparent)`,
      }} />
    </div>
  );

  // ===== LAYOUT A: Full-bleed image left, text right with accent bar =====
  if (layout === 0) {
    return (
      <AbsoluteFill style={{ fontFamily }}>
        {/* Image fills left 65% */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "65%", height: "100%", overflow: "hidden" }}>
          <Img src={staticFile(image)} style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
            opacity: 0.65,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, rgba(6,13,31,0.2) 0%, rgba(6,13,31,0.8) 100%)",
          }} />
        </div>

        {/* Accent vertical bar */}
        <div style={{
          position: "absolute", left: "63%", top: "15%", width: 4, height: "70%",
          background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
          opacity: interpolate(frame, [5, 25], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }} />

        {/* Right content area */}
        <div style={{
          position: "absolute", right: 0, top: 0, width: "35%", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "0 60px 0 40px",
        }}>
          {sectorLabel}
          <div style={{
            fontSize: 56, marginBottom: 16, transform: `translateY(${floatY}px)`,
            opacity: titleOpacity,
          }}>{icon}</div>
          <div style={{
            fontSize: 54, fontWeight: 900, color: "#fff", lineHeight: 1.05,
            letterSpacing: -2, whiteSpace: "pre-line" as const,
            opacity: titleOpacity, transform: `translateY(${titleY}px)`,
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}>{title}</div>
          <div style={{
            fontSize: 80, fontWeight: 900, color: accentColor, lineHeight: 1,
            letterSpacing: -3, marginTop: 20,
            opacity: statOpacity, transform: `scale(${statScale})`, transformOrigin: "left",
            textShadow: `0 0 40px rgba(${accentRgb},0.3)`,
          }}>{statPrefix}{displayNum}{statSuffix}</div>
          <div style={{
            fontSize: 13, color: "#94a3b8", letterSpacing: 3,
            textTransform: "uppercase" as const, marginTop: 8,
          }}>{statLabel}</div>
          <div style={{
            fontSize: 18, color: "#cbd5e1", opacity: descOpacity,
            marginTop: 20, lineHeight: 1.5,
          }}>{description}</div>
        </div>
        {dots}
      </AbsoluteFill>
    );
  }

  // ===== LAYOUT B: Centered dramatic — big stat, full bg with vignette =====
  if (layout === 1) {
    return (
      <AbsoluteFill style={{ fontFamily }}>
        {/* Full background image with heavy vignette */}
        <AbsoluteFill>
          <Img src={staticFile(image)} style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
            opacity: 0.5,
          }} />
        </AbsoluteFill>
        <AbsoluteFill style={{
          background: "radial-gradient(ellipse at center, rgba(6,13,31,0.4) 0%, rgba(6,13,31,0.85) 70%, rgba(6,13,31,0.95) 100%)",
        }} />

        {/* Centered content */}
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{icon}</div>
              {sectorLabel}
              <div style={{
                fontSize: 48, fontWeight: 900, color: "#fff",
                lineHeight: 1.05, letterSpacing: -2, whiteSpace: "pre-line" as const,
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              }}>{title}</div>
            </div>

            {/* Giant stat */}
            <div style={{
              fontSize: 160, fontWeight: 900, color: accentColor,
              lineHeight: 1, letterSpacing: -6, marginTop: 20,
              opacity: statOpacity, transform: `scale(${statScale})`,
              textShadow: `0 0 60px rgba(${accentRgb},0.4)`,
              fontVariantNumeric: "tabular-nums" as const,
            }}>
              {statPrefix}{displayNum}{statSuffix}
            </div>
            <div style={{
              fontSize: 16, color: "#94a3b8", letterSpacing: 4,
              textTransform: "uppercase" as const, marginTop: 8,
            }}>{statLabel}</div>

            <div style={{
              fontSize: 20, color: "#cbd5e1", opacity: descOpacity,
              marginTop: 30, maxWidth: 600, lineHeight: 1.5,
            }}>{description}</div>
          </div>
        </AbsoluteFill>
        {dots}
      </AbsoluteFill>
    );
  }

  // ===== LAYOUT C: Split diagonal — clip-path divide =====
  const clipProgress = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clipAngle = interpolate(clipProgress, [0, 1], [100, 55]);

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {/* Image side (left diagonal) */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden",
        clipPath: `polygon(0 0, ${clipAngle}% 0, ${clipAngle - 10}% 100%, 0 100%)`,
      }}>
        <Img src={staticFile(image)} style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
          opacity: 0.65,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(6,13,31,0.3), rgba(6,13,31,0.7))",
        }} />
      </div>

      {/* Diagonal accent slash */}
      <div style={{
        position: "absolute", top: 0, left: `${clipAngle - 6}%`,
        width: 4, height: "100%",
        background: `linear-gradient(to bottom, transparent, ${accentColor}, transparent)`,
        transform: "skewX(-8deg)",
        opacity: interpolate(frame, [10, 30], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }} />

      {/* Content side (right) */}
      <div style={{
        position: "absolute", right: 0, top: 0,
        width: "48%", height: "100%",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 80px",
      }}>
        {sectorLabel}
        <div style={{
          fontSize: 48, marginBottom: 12, transform: `translateY(${floatY}px)`,
          opacity: titleOpacity,
        }}>{icon}</div>
        <div style={{
          fontSize: 60, fontWeight: 900, color: "#fff",
          lineHeight: 1.05, letterSpacing: -2, whiteSpace: "pre-line" as const,
          opacity: titleOpacity, transform: `translateY(${titleY}px)`,
          textShadow: "0 2px 20px rgba(0,0,0,0.5)",
        }}>{title}</div>
        <div style={{
          fontSize: 100, fontWeight: 900, color: accentColor,
          lineHeight: 1, letterSpacing: -4, marginTop: 16,
          opacity: statOpacity, transform: `scale(${statScale})`, transformOrigin: "left",
          textShadow: `0 0 40px rgba(${accentRgb},0.3)`,
          fontVariantNumeric: "tabular-nums" as const,
        }}>{statPrefix}{displayNum}{statSuffix}</div>
        <div style={{
          fontSize: 13, color: "#94a3b8", letterSpacing: 3,
          textTransform: "uppercase" as const, marginTop: 8,
        }}>{statLabel}</div>
        <div style={{
          fontSize: 18, color: "#cbd5e1", opacity: descOpacity,
          marginTop: 20, lineHeight: 1.5, maxWidth: 450,
        }}>{description}</div>
      </div>
      {dots}
    </AbsoluteFill>
  );
};
