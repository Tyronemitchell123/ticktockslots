import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();

  // Slow rotating gradient
  const rotation = interpolate(frame, [0, 540], [0, 60]);
  const pulse = Math.sin(frame * 0.03) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{ backgroundColor: "#05080f" }}>
      {/* Deep radial gradient that slowly shifts */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.01) * 15}% ${40 + Math.cos(frame * 0.008) * 10}%, rgba(59,130,246,${0.12 * pulse}), transparent 60%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at ${70 + Math.cos(frame * 0.012) * 20}% ${60 + Math.sin(frame * 0.009) * 15}%, rgba(234,179,8,0.06), transparent 50%)`,
        }}
      />

      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
          transform: `perspective(800px) rotateX(${rotation * 0.1}deg)`,
        }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => {
        const x = ((i * 167 + frame * (0.3 + i * 0.05)) % 1920);
        const y = ((i * 211 + frame * (0.2 + i * 0.03)) % 1080);
        const size = 2 + (i % 3) * 1.5;
        const opacity = 0.15 + Math.sin(frame * 0.05 + i) * 0.1;
        const color = i % 3 === 0 ? "59,130,246" : i % 3 === 1 ? "234,179,8" : "148,163,184";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: `rgba(${color},${opacity})`,
              boxShadow: `0 0 ${size * 4}px rgba(${color},${opacity * 0.5})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
