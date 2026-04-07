import { AbsoluteFill, useCurrentFrame } from "remotion";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = Math.sin(frame * 0.03) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{ backgroundColor: "#060d1f" }}>
      {/* Radial gradients */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at ${50 + Math.sin(frame * 0.01) * 15}% ${40 + Math.cos(frame * 0.008) * 10}%, rgba(59,130,246,${0.18 * pulse}), transparent 60%)`,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at ${70 + Math.cos(frame * 0.012) * 20}% ${60 + Math.sin(frame * 0.009) * 15}%, rgba(234,179,8,0.10), transparent 50%)`,
      }} />

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.05,
        backgroundImage: `linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
      }} />

      {/* Diagonal light streaks */}
      {[0, 1, 2].map((i) => {
        const speed = 0.4 + i * 0.15;
        const x = ((frame * speed + i * 700) % 2400) - 400;
        const streakOpacity = 0.04 + Math.sin(frame * 0.02 + i * 2) * 0.02;
        return (
          <div key={`streak-${i}`} style={{
            position: "absolute", top: -200, left: x,
            width: 2, height: 1500,
            background: `linear-gradient(to bottom, transparent, rgba(96,165,250,${streakOpacity}), transparent)`,
            transform: "rotate(25deg)",
          }} />
        );
      })}

      {/* Floating particles — 20 with size variation */}
      {[...Array(20)].map((_, i) => {
        const x = ((i * 167 + frame * (0.25 + i * 0.04)) % 1920);
        const y = ((i * 211 + frame * (0.15 + i * 0.025)) % 1080);
        const size = 1.5 + (i % 5) * 1.2;
        const opacity = 0.2 + Math.sin(frame * 0.05 + i) * 0.1;
        const color = i % 4 === 0 ? "59,130,246" : i % 4 === 1 ? "234,179,8" : i % 4 === 2 ? "148,163,184" : "96,165,250";
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: size, height: size, borderRadius: "50%",
            backgroundColor: `rgba(${color},${opacity})`,
            boxShadow: `0 0 ${size * 3}px rgba(${color},${opacity * 0.4})`,
          }} />
        );
      })}

      {/* Subtle noise texture overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
      }} />
    </AbsoluteFill>
  );
};
