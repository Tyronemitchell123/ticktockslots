import { Scissors, Plane, Ship, Utensils, Stethoscope, Truck } from "lucide-react";

const sectors = [
  {
    icon: Scissors,
    title: "Beauty & Wellness",
    description: "Hair, spa, nails — cancelled slots filled in real-time across 50K+ salons.",
    stat: "43K slots/day",
  },
  {
    icon: Stethoscope,
    title: "Healthcare",
    description: "Doctor visits, specialist consults, and therapy sessions recovered instantly.",
    stat: "12K slots/day",
  },
  {
    icon: Utensils,
    title: "Dining",
    description: "Premium restaurant reservations at exclusive venues worldwide.",
    stat: "8K slots/day",
  },
  {
    icon: Plane,
    title: "Aviation",
    description: "Private jet empty legs at up to 75% off. TEB, VNY, OPF, and 200+ FBOs.",
    stat: "$14M recovered/mo",
  },
  {
    icon: Ship,
    title: "Maritime & Ports",
    description: "Docking windows, berth swaps, and container slot trading to avoid demurrage.",
    stat: "$8M recovered/mo",
  },
  {
    icon: Truck,
    title: "Freight & Trucking",
    description: "Deadhead elimination. Fill empty return legs and reduce carbon output.",
    stat: "2.1K routes/day",
  },
];

const SectorShowcase = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Every Sector. <span className="gradient-text-gold">Zero Dead Air.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From salon chairs to shipping berths — we fill what others waste
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {sectors.map((sector, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:border-primary/30 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <sector.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{sector.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{sector.description}</p>
              <div className="text-sm font-mono text-primary font-medium">{sector.stat}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectorShowcase;
