import { Wifi, Zap, CheckCircle, DollarSign } from "lucide-react";

const steps = [
  {
    icon: Wifi,
    title: "Cancellation Detected",
    description: "We ingest real-time signals from 200+ booking platforms, port authorities, and charter APIs worldwide.",
    accent: "primary",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Our Slot Engine normalizes data and pushes to Premium subscribers within milliseconds.",
    accent: "secondary",
  },
  {
    icon: CheckCircle,
    title: "Claim & Confirm",
    description: "One tap to claim. Trust Score verification and instant payment processing.",
    accent: "primary",
  },
  {
    icon: DollarSign,
    title: "Revenue Recovered",
    description: "Merchants recover lost revenue. Users get premium services at a fraction of the cost.",
    accent: "secondary",
  },
];

const HowItWorks = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How the <span className="gradient-text-blue">Slot Engine</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From cancellation to recovery in under 120 seconds
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-border/50 z-0" />
              )}
              <div className="glass rounded-2xl p-6 text-center relative z-10 hover:border-primary/30 transition-all">
                <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${step.accent === "primary" ? "bg-primary/10" : "bg-secondary/10"}`}>
                  <step.icon className={`w-7 h-7 ${step.accent === "primary" ? "text-primary" : "text-secondary"}`} />
                </div>
                <div className="text-xs font-mono text-muted-foreground mb-2 uppercase tracking-widest">
                  Step {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
