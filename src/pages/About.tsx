import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Globe, Zap, TrendingUp, ShieldCheck } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">About TickTock Slots</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          We're building the global liquidity engine for perishable inventory — turning last-minute cancellations into opportunities.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="glass rounded-2xl p-8 border border-border/30">
            <Target className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Our Mission</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Every empty slot is lost revenue. We connect merchants with consumers in real time, ensuring no appointment, table, or seat goes to waste. Our AI-powered platform fills cancellations within seconds.
            </p>
          </div>
          <div className="glass rounded-2xl p-8 border border-border/30">
            <Globe className="w-8 h-8 text-secondary mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Global Scale</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Operating across 6 continents with merchants in beauty, aviation, healthcare, dining, logistics, and more. We process thousands of slots daily across every timezone.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-6">How We Got Here</h2>
        <div className="space-y-6 mb-16">
          {[
            { year: "2023", title: "Founded", desc: "Started with a single vertical — beauty salons in London — proving the model with 50 merchants." },
            { year: "2024", title: "Multi-Vertical Expansion", desc: "Expanded to aviation, healthcare, dining, and fitness. Launched across UK, Europe, and North America." },
            { year: "2025", title: "AI Engine Launch", desc: "Deployed our AI pricing engine, reducing average fill time to under 47 seconds." },
            { year: "2026", title: "Global Platform", desc: "Now live in 6 regions with 12+ verticals. $2.4M+ recovered daily for merchants worldwide." },
          ].map((item) => (
            <div key={item.year} className="flex gap-6 items-start">
              <div className="text-2xl font-mono font-bold text-primary shrink-0 w-16">{item.year}</div>
              <div className="glass rounded-xl p-5 border border-border/30 flex-1">
                <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-6">Our Values</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: <Zap className="w-6 h-6 text-primary" />, title: "Speed", desc: "Every second counts. We obsess over fill times and instant matching." },
            { icon: <TrendingUp className="w-6 h-6 text-secondary" />, title: "Sustainability", desc: "847 tonnes of CO₂ saved and counting. Less waste, better outcomes." },
            { icon: <ShieldCheck className="w-6 h-6 text-green-400" />, title: "Trust", desc: "Our trust score system ensures reliable users and verified merchants." },
          ].map((v) => (
            <div key={v.title} className="glass rounded-xl p-6 border border-border/30 text-center">
              <div className="flex justify-center mb-3">{v.icon}</div>
              <h4 className="font-semibold text-foreground mb-1">{v.title}</h4>
              <p className="text-xs text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
