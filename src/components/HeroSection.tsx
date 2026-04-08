import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Clock, ArrowRight, ChevronDown } from "lucide-react";

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
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* === VIDEO HERO — full viewport === */}
      <div className="relative flex-1 flex items-center justify-center min-h-[70vh] md:min-h-[80vh]">
        {/* Video background — high visibility */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover brightness-150"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Subtle gradient for top/bottom blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/50" />
        </div>
      </div>

      {/* === STATS + CTA BAR — below the video === */}
      <div className="relative z-10 bg-background border-t border-border/20 px-4 py-8 md:py-10">
        <div className="max-w-5xl mx-auto">
          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-8">
            <div className="glass rounded-xl px-5 md:px-8 py-3 md:py-4 text-center min-w-[110px]">
              <div className="text-2xl md:text-4xl font-mono font-bold text-primary animate-countdown">
                {countdown}s
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-widest">Avg Fill Time</div>
            </div>
            <div className="glass rounded-xl px-5 md:px-8 py-3 md:py-4 text-center min-w-[110px]">
              <div className="text-2xl md:text-4xl font-mono font-bold text-secondary">
                $2.4M
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-widest">Recovered Today</div>
            </div>
            <div className="glass rounded-xl px-5 md:px-8 py-3 md:py-4 text-center min-w-[110px]">
              <div className="text-2xl md:text-4xl font-mono font-bold text-green-400">
                847t
              </div>
              <div className="text-[10px] md:text-xs text-muted-foreground mt-1 uppercase tracking-widest">CO₂ Saved</div>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="lg" className="text-base px-8 py-6 rounded-xl" onClick={() => document.getElementById("slots")?.scrollIntoView({ behavior: "smooth" })}>
              <Zap className="w-5 h-5" />
              Claim a Slot Now
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" className="text-base px-8 py-6 rounded-xl border-border/50" onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>
              <Clock className="w-5 h-5" />
              List Your Inventory
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
