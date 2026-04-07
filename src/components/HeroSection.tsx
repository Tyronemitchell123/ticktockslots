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
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80"
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlays — video visible on edges, text area has contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />

        {/* Text container with tight backdrop */}
        <div className="relative z-10 text-center px-4 mt-16 max-w-3xl mx-auto">
          {/* Tight frosted area just behind text */}
          <div className="absolute -inset-x-6 -inset-y-4 bg-background/50 rounded-2xl" style={{ filter: 'blur(50px)' }} />

          <div className="relative z-10">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-border/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" />
              <span className="text-sm font-medium text-foreground/80">
                <span className="text-foreground font-mono">{slotsLive.toLocaleString()}</span> slots live
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-4">
              <span className="text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Every Empty Slot</span>
              <br />
              <span className="gradient-text-blue drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">Is Lost Revenue</span>
            </h1>

            <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto mb-6 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]">
              The global liquidity engine for perishable inventory.
            </p>
          </div>
        </div>

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
      </div>
    </section>
  );
};

export default HeroSection;
