import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingDown } from "lucide-react";

interface Slot {
  id: string;
  merchant: string;
  vertical: string;
  location: string;
  time: string;
  originalPrice: number;
  currentPrice: number;
  urgency: "critical" | "high" | "medium";
  timeLeft: number;
}

const MOCK_SLOTS: Slot[] = [
  { id: "1", merchant: "Luxe Hair Studio", vertical: "Beauty", location: "Manhattan, NY", time: "2:30 PM Today", originalPrice: 180, currentPrice: 89, urgency: "critical", timeLeft: 23 },
  { id: "2", merchant: "Atlantic Charter", vertical: "Aviation", location: "TEB → MIA", time: "5:00 PM Today", originalPrice: 14500, currentPrice: 4200, urgency: "high", timeLeft: 67 },
  { id: "3", merchant: "Dr. Sarah Chen", vertical: "Health", location: "Beverly Hills, CA", time: "11:00 AM Tomorrow", originalPrice: 350, currentPrice: 175, urgency: "medium", timeLeft: 180 },
  { id: "4", merchant: "Noma Restaurant", vertical: "Dining", location: "Copenhagen, DK", time: "8:30 PM Today", originalPrice: 450, currentPrice: 280, urgency: "critical", timeLeft: 12 },
  { id: "5", merchant: "Port of Rotterdam", vertical: "Logistics", location: "Berth 7-B", time: "06:00 AM Wed", originalPrice: 8200, currentPrice: 3900, urgency: "high", timeLeft: 340 },
  { id: "6", merchant: "SoulCycle Tribeca", vertical: "Fitness", location: "New York, NY", time: "7:00 AM Tomorrow", originalPrice: 38, currentPrice: 15, urgency: "medium", timeLeft: 420 },
];

const urgencyColors = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-secondary/20 text-secondary border-secondary/30",
  medium: "bg-primary/20 text-primary border-primary/30",
};

const LiveSlotsFeed = () => {
  const [slots, setSlots] = useState(MOCK_SLOTS);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlots((prev) =>
        prev.map((s) => ({
          ...s,
          timeLeft: Math.max(0, s.timeLeft - 1),
        }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Live Slots</h2>
            <p className="text-muted-foreground">Real-time cancellations across all verticals</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" />
            <span className="text-sm text-muted-foreground font-mono">LIVE</span>
          </div>
        </div>

        <div className="grid gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="glass rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-primary">
                    {slot.vertical[0]}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {slot.merchant}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className={urgencyColors[slot.urgency]}>
                  {slot.urgency === "critical" ? "🔥" : slot.urgency === "high" ? "⚡" : "📌"} {slot.timeLeft}s left
                </Badge>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground line-through">${slot.originalPrice.toLocaleString()}</div>
                  <div className="text-lg font-bold text-secondary flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    ${slot.currentPrice.toLocaleString()}
                  </div>
                </div>

                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors glow-blue">
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveSlotsFeed;
