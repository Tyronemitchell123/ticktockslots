import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingDown, Globe, ChevronDown } from "lucide-react";
import SlotDetailModal from "./SlotDetailModal";

interface Slot {
  id: string;
  merchant: string;
  vertical: string;
  location: string;
  region: string;
  time: string;
  originalPrice: number;
  currentPrice: number;
  urgency: "critical" | "high" | "medium";
  timeLeft: number;
}

const MOCK_SLOTS: Slot[] = [
  { id: "1", merchant: "Luxe Hair Studio", vertical: "Beauty", location: "Manhattan, NY", region: "North America", time: "2:30 PM Today", originalPrice: 180, currentPrice: 89, urgency: "critical", timeLeft: 23 },
  { id: "2", merchant: "Atlantic Charter", vertical: "Aviation", location: "TEB → MIA", region: "North America", time: "5:00 PM Today", originalPrice: 14500, currentPrice: 4200, urgency: "high", timeLeft: 67 },
  { id: "3", merchant: "Dr. Sarah Chen", vertical: "Health", location: "Beverly Hills, CA", region: "North America", time: "11:00 AM Tomorrow", originalPrice: 350, currentPrice: 175, urgency: "medium", timeLeft: 180 },
  { id: "4", merchant: "Noma Restaurant", vertical: "Dining", location: "Copenhagen, DK", region: "Europe", time: "8:30 PM Today", originalPrice: 450, currentPrice: 280, urgency: "critical", timeLeft: 12 },
  { id: "5", merchant: "Port of Rotterdam", vertical: "Logistics", location: "Rotterdam, NL", region: "Europe", time: "06:00 AM Wed", originalPrice: 8200, currentPrice: 3900, urgency: "high", timeLeft: 340 },
  { id: "6", merchant: "SoulCycle Tribeca", vertical: "Fitness", location: "New York, NY", region: "North America", time: "7:00 AM Tomorrow", originalPrice: 38, currentPrice: 15, urgency: "medium", timeLeft: 420 },
  { id: "7", merchant: "Mandarin Spa", vertical: "Beauty", location: "Hong Kong, HK", region: "Asia Pacific", time: "4:00 PM Today", originalPrice: 320, currentPrice: 160, urgency: "high", timeLeft: 95 },
  { id: "8", merchant: "Emirates Jet", vertical: "Aviation", location: "DXB → LHR", region: "Middle East", time: "9:00 PM Today", originalPrice: 22000, currentPrice: 7800, urgency: "critical", timeLeft: 45 },
  { id: "9", merchant: "São Paulo Medical", vertical: "Health", location: "São Paulo, BR", region: "Latin America", time: "3:00 PM Tomorrow", originalPrice: 280, currentPrice: 120, urgency: "medium", timeLeft: 600 },
  { id: "10", merchant: "Le Jules Verne", vertical: "Dining", location: "Paris, FR", region: "Europe", time: "7:30 PM Today", originalPrice: 520, currentPrice: 310, urgency: "high", timeLeft: 130 },
  { id: "11", merchant: "Bondi Fitness", vertical: "Fitness", location: "Sydney, AU", region: "Asia Pacific", time: "6:00 AM Tomorrow", originalPrice: 45, currentPrice: 18, urgency: "medium", timeLeft: 510 },
  { id: "12", merchant: "Mombasa Port", vertical: "Logistics", location: "Mombasa, KE", region: "Africa", time: "08:00 AM Thu", originalPrice: 5400, currentPrice: 2200, urgency: "high", timeLeft: 720 },
  { id: "13", merchant: "Harley Street Clinic", vertical: "Health", location: "London, UK", region: "UK", time: "10:30 AM Tomorrow", originalPrice: 400, currentPrice: 195, urgency: "high", timeLeft: 150 },
  { id: "14", merchant: "Sketch Restaurant", vertical: "Dining", location: "Mayfair, London", region: "UK", time: "8:00 PM Today", originalPrice: 380, currentPrice: 210, urgency: "critical", timeLeft: 35 },
  { id: "15", merchant: "Third Space Gym", vertical: "Fitness", location: "Soho, London", region: "UK", time: "6:30 AM Tomorrow", originalPrice: 55, currentPrice: 22, urgency: "medium", timeLeft: 480 },
];

const REGIONS = [
  { id: "all", label: "🌍 All Regions", flag: "" },
  { id: "North America", label: "North America", flag: "🇺🇸" },
  { id: "UK", label: "UK / London", flag: "🇬🇧" },
  { id: "Europe", label: "Europe", flag: "🇪🇺" },
  { id: "Asia Pacific", label: "Asia Pacific", flag: "🌏" },
  { id: "Middle East", label: "Middle East", flag: "🕌" },
  { id: "Latin America", label: "Latin America", flag: "🌎" },
  { id: "Africa", label: "Africa", flag: "🌍" },
];

const urgencyColors = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-secondary/20 text-secondary border-secondary/30",
  medium: "bg-primary/20 text-primary border-primary/30",
};

const LiveSlotsFeed = () => {
  const [slots, setSlots] = useState(MOCK_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlots((prev) =>
        prev.map((s) => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredSlots = useMemo(
    () => selectedRegion === "all" ? slots : slots.filter((s) => s.region === selectedRegion),
    [slots, selectedRegion]
  );

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: slots.length };
    slots.forEach((s) => { counts[s.region] = (counts[s.region] || 0) + 1; });
    return counts;
  }, [slots]);

  const currentRegion = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];

  const handleClaim = (slot: Slot) => {
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1920&q=80"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Live Slots</h2>
            <p className="text-muted-foreground">Real-time cancellations across all verticals</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" />
            <span className="text-sm text-muted-foreground font-mono">LIVE</span>
          </div>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          {/* Region Dropdown (mobile + desktop trigger) */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="sm:hidden w-full glass rounded-xl px-4 py-3 flex items-center justify-between text-sm text-foreground"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                {currentRegion.flag} {currentRegion.label}
                <Badge variant="outline" className="text-[10px] ml-1">{regionCounts[selectedRegion] || 0}</Badge>
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mobile dropdown */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30 sm:hidden" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 z-40 mt-1 glass rounded-xl border border-border/50 py-1 sm:hidden">
                  {REGIONS.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => { setSelectedRegion(region.id); setDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                        selectedRegion === region.id ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {region.flag} {region.label}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{regionCounts[region.id] || 0}</Badge>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop pill selector */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <Globe className="w-4 h-4 text-primary mr-1" />
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedRegion === region.id
                    ? "bg-primary text-primary-foreground glow-blue"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {region.flag} {region.label}
                <span className="ml-1.5 opacity-70">({regionCounts[region.id] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Slots list */}
        <div className="grid gap-4">
          {filteredSlots.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center">
              <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No live slots in this region right now.</p>
              <button onClick={() => setSelectedRegion("all")} className="text-primary text-sm mt-2 hover:underline">
                View all regions →
              </button>
            </div>
          ) : (
            filteredSlots.map((slot) => (
              <div
                key={slot.id}
                className="glass rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-primary/30 transition-colors group cursor-pointer animate-fade-in"
                onClick={() => handleClaim(slot)}
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
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">{slot.region}</Badge>
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

                  <button
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors glow-blue"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaim(slot);
                    }}
                  >
                    Claim
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <SlotDetailModal
        slot={selectedSlot}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
};

export default LiveSlotsFeed;
