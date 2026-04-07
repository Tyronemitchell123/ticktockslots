import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Clock, ArrowRight } from "lucide-react";

const HeroSection = () => {
  const [countdown, setCountdown] = useState(47);
  const [slotsLive, setSlotsLive] = useState(2847);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 120 : prev - 1));
      setSlotsLive((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%/0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(45_96%_57%/0.06),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" />
          <span className="text-sm font-medium text-muted-foreground">
            <span className="text-foreground font-mono">{slotsLive.toLocaleString()}</span> slots live now
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6">
          <span className="text-foreground">Every Empty Slot</span>
          <br />
          <span className="gradient-text-blue">Is Lost Revenue</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          The global liquidity engine for cancelled appointments, empty legs, and perishable inventory.
          Fill slots in under 120 seconds.
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="glass rounded-xl px-6 py-4 text-center">
            <div className="text-3xl md:text-4xl font-mono font-bold text-primary animate-countdown">
              {countdown}s
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Avg Fill Time</div>
          </div>
          <div className="glass rounded-xl px-6 py-4 text-center">
            <div className="text-3xl md:text-4xl font-mono font-bold text-secondary">
              $2.4M
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">Recovered Today</div>
          </div>
          <div className="glass rounded-xl px-6 py-4 text-center">
            <div className="text-3xl md:text-4xl font-mono font-bold text-green-400">
              847t
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">CO₂ Saved</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-xl">
            <Zap className="w-5 h-5" />
            Claim a Slot Now
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl border-border/50">
            <Clock className="w-5 h-5" />
            List Your Inventory
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
