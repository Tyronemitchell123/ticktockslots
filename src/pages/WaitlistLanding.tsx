import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ticktockLogo from "@/assets/ticktock-logo.png";
import logoRevealAsset from "@/assets/ticktock-logo-reveal.mp4.asset.json";
import {
  Clock, Zap, Mail, CheckCircle2, Loader2, Users,
  Utensils, Plane, Hotel, Scissors, Dumbbell, Star,
} from "lucide-react";
import { toast } from "sonner";

const SECTORS = [
  { icon: Scissors, label: "Beauty & Spa" },
  { icon: Utensils, label: "Fine Dining" },
  { icon: Plane, label: "Aviation" },
  { icon: Hotel, label: "Hotels" },
  { icon: Dumbbell, label: "Wellness" },
  { icon: Star, label: "Events" },
];

const WaitlistLanding = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Fetch subscriber count for social proof
    const fetchCount = async () => {
      const { count: total } = await supabase
        .from("subscribers" as any)
        .select("*", { count: "exact", head: true });
      setCount(total || 0);
    };
    fetchCount();
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from("subscribers" as any)
      .insert({ email: email.trim().toLowerCase(), source: "waitlist" } as any);
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already on the list!");
        setJoined(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }

    setJoined(true);
    setCount((c) => c + 1);
    toast.success("You're in! We'll notify you when we launch.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar-like header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={ticktockLogo} alt="TickTock Slots" className="w-12 h-12 rounded-lg" />
            <span className="font-bold text-lg text-foreground tracking-tight">TickTock Slots</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Coming Soon</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
              <Clock className="w-3 h-3" /> Early Access
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Premium last-minute deals platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight tracking-tight">
            Luxury Cancellations.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Unbeatable Prices.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            When premium bookings get cancelled, you get first access to 5-star restaurants, 
            luxury spas, and exclusive experiences — at up to 70% off.
          </p>

          {/* Signup form */}
          {joined ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">You're on the list!</h2>
              <p className="text-muted-foreground">
                We'll email you the moment we launch. Early members get priority access to the best deals.
              </p>
              {count > 1 && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  Join {count.toLocaleString()} others waiting for launch
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 bg-card border-border text-base"
                />
                <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 font-semibold">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" /> Join Waitlist
                    </>
                  )}
                </Button>
              </div>
              {count > 0 && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  {count.toLocaleString()} people already waiting
                </p>
              )}
              <p className="text-xs text-muted-foreground">Free to join • No spam • Unsubscribe anytime</p>
            </form>
          )}
        </div>

        {/* Sectors preview */}
        <div className="mt-20 max-w-3xl mx-auto w-full">
          <p className="text-center text-sm text-muted-foreground mb-6 uppercase tracking-widest font-medium">
            Sectors launching at go-live
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {SECTORS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/60 border border-border/50">
                <Icon className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works preview */}
        <div className="mt-20 max-w-2xl mx-auto w-full">
          <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-widest font-medium">
            How it works
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Merchants post", desc: "Businesses list their last-minute cancellations at discounted prices" },
              { step: "2", title: "You claim", desc: "Grab premium slots at up to 70% off before they expire" },
              { step: "3", title: "You save", desc: "Enjoy 5-star experiences at a fraction of the original price" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {step}
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 px-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} TickTock Slots. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default WaitlistLanding;
