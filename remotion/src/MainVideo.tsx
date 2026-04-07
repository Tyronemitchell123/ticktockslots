import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { PersistentBackground } from "./components/PersistentBackground";
import { IntroScene } from "./scenes/IntroScene";
import { VerticalScene } from "./scenes/VerticalScene";
import { OutroScene } from "./scenes/OutroScene";

const verticals = [
  {
    icon: "✂️",
    title: "Beauty &\nWellness",
    stat: "43K",
    statLabel: "Slots Filled Daily",
    description: "Hair, spa, nails — cancelled slots filled in real-time across 50K+ salons.",
    accentColor: "#f472b6",
    accentRgb: "244,114,182",
    image: "images/beauty.jpg",
  },
  {
    icon: "🩺",
    title: "Healthcare",
    stat: "12K",
    statLabel: "Appointments Recovered",
    description: "Doctor visits, specialist consults, and therapy sessions recovered instantly.",
    accentColor: "#4ade80",
    accentRgb: "74,222,128",
    image: "images/healthcare.jpg",
  },
  {
    icon: "✈️",
    title: "Aviation",
    stat: "$14M",
    statLabel: "Recovered Monthly",
    description: "Private jet empty legs at up to 75% off across 200+ FBOs worldwide.",
    accentColor: "#60a5fa",
    accentRgb: "96,165,250",
    image: "images/aviation.jpg",
  },
  {
    icon: "🚢",
    title: "Maritime\n& Ports",
    stat: "$8M",
    statLabel: "Revenue Saved Monthly",
    description: "Docking windows, berth swaps, and container slot trading to avoid demurrage.",
    accentColor: "#38bdf8",
    accentRgb: "56,189,248",
    image: "images/maritime.jpg",
  },
  {
    icon: "🍽️",
    title: "Dining",
    stat: "8K",
    statLabel: "Tables Filled Daily",
    description: "Premium restaurant reservations at exclusive venues worldwide.",
    accentColor: "#eab308",
    accentRgb: "234,179,8",
    image: "images/dining.jpg",
  },
  {
    icon: "🚛",
    title: "Freight &\nTrucking",
    stat: "2.1K",
    statLabel: "Routes Optimized Daily",
    description: "Deadhead elimination. Fill empty return legs and reduce carbon output.",
    accentColor: "#f97316",
    accentRgb: "249,115,22",
    image: "images/freight.jpg",
  },
];

const TRANSITION_DURATION = 15;
const transitionConfig = springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION });
const slowFadeConfig = springTiming({ config: { damping: 200 }, durationInFrames: 22 });

const getTransition = (i: number) => {
  const transitions = [
    wipe({ direction: "from-left" }),
    slide({ direction: "from-right" }),
    fade(),
    flip(),
    wipe({ direction: "from-top" }),
    slide({ direction: "from-left" }),
  ];
  return transitions[i % transitions.length];
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        {/* Intro */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <IntroScene />
        </TransitionSeries.Sequence>

        {verticals.map((v, i) => (
          <>
            <TransitionSeries.Transition
              key={`t-${i}`}
              presentation={i === 0 ? wipe({ direction: "from-left" }) : getTransition(i)}
              timing={transitionConfig}
            />
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={65}>
              <VerticalScene {...v} index={i} />
            </TransitionSeries.Sequence>
          </>
        ))}

        {/* Outro with slower fade */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={slowFadeConfig}
        />
        <TransitionSeries.Sequence durationInFrames={90}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
