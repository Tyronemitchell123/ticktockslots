import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingDown, Globe, ChevronDown, Search, X as XIcon } from "lucide-react";
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
  { id: "16", merchant: "King Street Barbers", vertical: "Beauty", location: "Manchester, UK", region: "UK", time: "1:00 PM Today", originalPrice: 65, currentPrice: 28, urgency: "critical", timeLeft: 18 },
  { id: "17", merchant: "Hawksmoor Manchester", vertical: "Dining", location: "Deansgate, Manchester", region: "UK", time: "7:00 PM Today", originalPrice: 290, currentPrice: 145, urgency: "high", timeLeft: 110 },
  { id: "18", merchant: "The Edgbaston Clinic", vertical: "Health", location: "Birmingham, UK", region: "UK", time: "9:00 AM Tomorrow", originalPrice: 320, currentPrice: 155, urgency: "medium", timeLeft: 390 },
  { id: "19", merchant: "Pure Gym Jewellery Qtr", vertical: "Fitness", location: "Birmingham, UK", region: "UK", time: "5:30 AM Tomorrow", originalPrice: 30, currentPrice: 12, urgency: "medium", timeLeft: 540 },
  { id: "20", merchant: "Timberyard Restaurant", vertical: "Dining", location: "Edinburgh, UK", region: "UK", time: "8:30 PM Today", originalPrice: 340, currentPrice: 180, urgency: "critical", timeLeft: 28 },
  { id: "21", merchant: "Edinburgh Dermatology", vertical: "Health", location: "New Town, Edinburgh", region: "UK", time: "2:00 PM Tomorrow", originalPrice: 275, currentPrice: 130, urgency: "high", timeLeft: 260 },
  { id: "22", merchant: "NetJets UK", vertical: "Aviation", location: "MAN → EDI", region: "UK", time: "4:00 PM Today", originalPrice: 8500, currentPrice: 2900, urgency: "high", timeLeft: 85 },
  { id: "59", merchant: "Ox Restaurant", vertical: "Dining", location: "Belfast, UK", region: "UK", time: "7:30 PM Today", originalPrice: 260, currentPrice: 130, urgency: "high", timeLeft: 95 },
  { id: "60", merchant: "Cowshed Spa", vertical: "Beauty", location: "Bristol, UK", region: "UK", time: "12:00 PM Today", originalPrice: 120, currentPrice: 52, urgency: "critical", timeLeft: 15 },
  { id: "61", merchant: "David Lloyd Leeds", vertical: "Fitness", location: "Leeds, UK", region: "UK", time: "6:00 AM Tomorrow", originalPrice: 48, currentPrice: 19, urgency: "medium", timeLeft: 500 },
  { id: "62", merchant: "The Ivy Glasgow", vertical: "Dining", location: "Glasgow, UK", region: "UK", time: "8:00 PM Today", originalPrice: 310, currentPrice: 165, urgency: "critical", timeLeft: 38 },
  { id: "63", merchant: "Spire Hospital", vertical: "Health", location: "Cardiff, UK", region: "UK", time: "11:00 AM Tomorrow", originalPrice: 340, currentPrice: 160, urgency: "medium", timeLeft: 350 },
  { id: "64", merchant: "Raby Hunt", vertical: "Dining", location: "Darlington, UK", region: "UK", time: "7:00 PM Today", originalPrice: 420, currentPrice: 220, urgency: "high", timeLeft: 125 },
  { id: "65", merchant: "Rudding Park Spa", vertical: "Beauty", location: "Harrogate, UK", region: "UK", time: "10:00 AM Tomorrow", originalPrice: 180, currentPrice: 78, urgency: "medium", timeLeft: 410 },
  { id: "66", merchant: "Nuffield Health", vertical: "Health", location: "Nottingham, UK", region: "UK", time: "3:00 PM Today", originalPrice: 280, currentPrice: 135, urgency: "high", timeLeft: 80 },
  { id: "67", merchant: "The Orangery Bath", vertical: "Dining", location: "Bath, UK", region: "UK", time: "1:00 PM Today", originalPrice: 230, currentPrice: 110, urgency: "critical", timeLeft: 22 },
  { id: "68", merchant: "VistaJet UK", vertical: "Aviation", location: "LHR → GLA", region: "UK", time: "3:30 PM Today", originalPrice: 7200, currentPrice: 2500, urgency: "high", timeLeft: 60 },
  { id: "69", merchant: "Port of Felixstowe", vertical: "Logistics", location: "Felixstowe, UK", region: "UK", time: "06:00 AM Wed", originalPrice: 5800, currentPrice: 2600, urgency: "high", timeLeft: 640 },
  { id: "70", merchant: "F45 Liverpool", vertical: "Fitness", location: "Liverpool, UK", region: "UK", time: "7:00 AM Tomorrow", originalPrice: 32, currentPrice: 13, urgency: "medium", timeLeft: 470 },
  { id: "71", merchant: "Moor Hall", vertical: "Dining", location: "Aughton, Lancashire", region: "UK", time: "8:30 PM Today", originalPrice: 480, currentPrice: 250, urgency: "critical", timeLeft: 19 },
  { id: "72", merchant: "Skin Clinic Cambridge", vertical: "Beauty", location: "Cambridge, UK", region: "UK", time: "2:30 PM Tomorrow", originalPrice: 150, currentPrice: 65, urgency: "medium", timeLeft: 430 },
  { id: "73", merchant: "Bupa Dental Oxford", vertical: "Health", location: "Oxford, UK", region: "UK", time: "4:00 PM Today", originalPrice: 220, currentPrice: 100, urgency: "high", timeLeft: 70 },
  // North America
  { id: "23", merchant: "Drybar Chicago", vertical: "Beauty", location: "Chicago, IL", region: "North America", time: "3:00 PM Today", originalPrice: 95, currentPrice: 42, urgency: "high", timeLeft: 75 },
  { id: "24", merchant: "Wheels Up", vertical: "Aviation", location: "LAX → SFO", region: "North America", time: "6:00 PM Today", originalPrice: 9800, currentPrice: 3400, urgency: "critical", timeLeft: 40 },
  { id: "25", merchant: "Mayo Clinic Express", vertical: "Health", location: "Rochester, MN", region: "North America", time: "9:00 AM Tomorrow", originalPrice: 500, currentPrice: 240, urgency: "medium", timeLeft: 320 },
  { id: "26", merchant: "Canlis Restaurant", vertical: "Dining", location: "Seattle, WA", region: "North America", time: "7:30 PM Today", originalPrice: 420, currentPrice: 220, urgency: "high", timeLeft: 100 },
  { id: "27", merchant: "Barry's Miami", vertical: "Fitness", location: "Miami Beach, FL", region: "North America", time: "8:00 AM Tomorrow", originalPrice: 42, currentPrice: 18, urgency: "medium", timeLeft: 450 },
  { id: "28", merchant: "Port of Vancouver", vertical: "Logistics", location: "Vancouver, BC", region: "North America", time: "05:00 AM Wed", originalPrice: 7100, currentPrice: 3200, urgency: "high", timeLeft: 580 },
  { id: "29", merchant: "Ossington Dental", vertical: "Health", location: "Toronto, ON", region: "North America", time: "2:00 PM Today", originalPrice: 290, currentPrice: 140, urgency: "critical", timeLeft: 30 },
  // Europe
  { id: "30", merchant: "Dolder Grand Spa", vertical: "Beauty", location: "Zürich, CH", region: "Europe", time: "11:00 AM Today", originalPrice: 380, currentPrice: 190, urgency: "high", timeLeft: 120 },
  { id: "31", merchant: "Ristorante Cracco", vertical: "Dining", location: "Milan, IT", region: "Europe", time: "9:00 PM Today", originalPrice: 480, currentPrice: 260, urgency: "critical", timeLeft: 22 },
  { id: "32", merchant: "CrossFit Eixample", vertical: "Fitness", location: "Barcelona, ES", region: "Europe", time: "7:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 490 },
  { id: "33", merchant: "Charité Klinik", vertical: "Health", location: "Berlin, DE", region: "Europe", time: "10:00 AM Tomorrow", originalPrice: 310, currentPrice: 155, urgency: "medium", timeLeft: 380 },
  { id: "34", merchant: "VistaJet Europe", vertical: "Aviation", location: "FCO → CDG", region: "Europe", time: "3:00 PM Today", originalPrice: 18000, currentPrice: 6200, urgency: "high", timeLeft: 90 },
  { id: "35", merchant: "Port of Hamburg", vertical: "Logistics", location: "Hamburg, DE", region: "Europe", time: "07:00 AM Thu", originalPrice: 6800, currentPrice: 3100, urgency: "high", timeLeft: 650 },
  // Asia Pacific
  { id: "36", merchant: "Sulwhasoo Spa", vertical: "Beauty", location: "Seoul, KR", region: "Asia Pacific", time: "2:00 PM Today", originalPrice: 280, currentPrice: 130, urgency: "high", timeLeft: 105 },
  { id: "37", merchant: "Narisawa Restaurant", vertical: "Dining", location: "Tokyo, JP", region: "Asia Pacific", time: "8:00 PM Today", originalPrice: 550, currentPrice: 290, urgency: "critical", timeLeft: 15 },
  { id: "38", merchant: "Apollo Clinic", vertical: "Health", location: "Mumbai, IN", region: "Asia Pacific", time: "11:30 AM Tomorrow", originalPrice: 180, currentPrice: 75, urgency: "medium", timeLeft: 440 },
  { id: "39", merchant: "F45 Training", vertical: "Fitness", location: "Singapore, SG", region: "Asia Pacific", time: "6:00 AM Tomorrow", originalPrice: 50, currentPrice: 20, urgency: "medium", timeLeft: 520 },
  { id: "40", merchant: "Cathay Pacific Jet", vertical: "Aviation", location: "HKG → NRT", region: "Asia Pacific", time: "5:00 PM Today", originalPrice: 16000, currentPrice: 5500, urgency: "high", timeLeft: 70 },
  { id: "41", merchant: "Port of Shanghai", vertical: "Logistics", location: "Shanghai, CN", region: "Asia Pacific", time: "06:00 AM Wed", originalPrice: 9200, currentPrice: 4100, urgency: "high", timeLeft: 600 },
  // Middle East
  { id: "42", merchant: "Talise Spa", vertical: "Beauty", location: "Dubai, AE", region: "Middle East", time: "3:00 PM Today", originalPrice: 450, currentPrice: 210, urgency: "high", timeLeft: 88 },
  { id: "43", merchant: "Zuma Dubai", vertical: "Dining", location: "DIFC, Dubai", region: "Middle East", time: "9:00 PM Today", originalPrice: 380, currentPrice: 195, urgency: "critical", timeLeft: 25 },
  { id: "44", merchant: "Cleveland Clinic AD", vertical: "Health", location: "Abu Dhabi, AE", region: "Middle East", time: "10:00 AM Tomorrow", originalPrice: 420, currentPrice: 200, urgency: "medium", timeLeft: 360 },
  { id: "45", merchant: "GoldGym Riyadh", vertical: "Fitness", location: "Riyadh, SA", region: "Middle East", time: "5:30 AM Tomorrow", originalPrice: 60, currentPrice: 25, urgency: "medium", timeLeft: 500 },
  { id: "46", merchant: "Jebel Ali Port", vertical: "Logistics", location: "Jebel Ali, AE", region: "Middle East", time: "04:00 AM Thu", originalPrice: 7500, currentPrice: 3400, urgency: "high", timeLeft: 680 },
  // Latin America
  { id: "47", merchant: "Salón Bó", vertical: "Beauty", location: "Mexico City, MX", region: "Latin America", time: "1:00 PM Today", originalPrice: 120, currentPrice: 55, urgency: "critical", timeLeft: 20 },
  { id: "48", merchant: "Don Julio Parrilla", vertical: "Dining", location: "Buenos Aires, AR", region: "Latin America", time: "9:30 PM Today", originalPrice: 310, currentPrice: 160, urgency: "high", timeLeft: 115 },
  { id: "49", merchant: "Hospital Israelita", vertical: "Health", location: "São Paulo, BR", region: "Latin America", time: "8:00 AM Tomorrow", originalPrice: 350, currentPrice: 165, urgency: "medium", timeLeft: 410 },
  { id: "50", merchant: "SmartFit Bogotá", vertical: "Fitness", location: "Bogotá, CO", region: "Latin America", time: "6:00 AM Tomorrow", originalPrice: 25, currentPrice: 10, urgency: "medium", timeLeft: 530 },
  { id: "51", merchant: "LATAM Charter", vertical: "Aviation", location: "GRU → EZE", region: "Latin America", time: "4:00 PM Today", originalPrice: 11000, currentPrice: 3800, urgency: "high", timeLeft: 80 },
  { id: "52", merchant: "Port of Santos", vertical: "Logistics", location: "Santos, BR", region: "Latin America", time: "06:00 AM Wed", originalPrice: 6200, currentPrice: 2800, urgency: "high", timeLeft: 620 },
  // Africa
  { id: "53", merchant: "Skin Renewal Clinic", vertical: "Beauty", location: "Cape Town, ZA", region: "Africa", time: "11:00 AM Today", originalPrice: 200, currentPrice: 85, urgency: "high", timeLeft: 100 },
  { id: "54", merchant: "La Colombe Restaurant", vertical: "Dining", location: "Constantia, Cape Town", region: "Africa", time: "7:00 PM Today", originalPrice: 340, currentPrice: 170, urgency: "critical", timeLeft: 32 },
  { id: "55", merchant: "Aga Khan Hospital", vertical: "Health", location: "Nairobi, KE", region: "Africa", time: "9:00 AM Tomorrow", originalPrice: 240, currentPrice: 105, urgency: "medium", timeLeft: 400 },
  { id: "56", merchant: "Planet Fitness Lagos", vertical: "Fitness", location: "Lagos, NG", region: "Africa", time: "6:00 AM Tomorrow", originalPrice: 35, currentPrice: 14, urgency: "medium", timeLeft: 510 },
  { id: "57", merchant: "ExecuJet Africa", vertical: "Aviation", location: "JNB → CPT", region: "Africa", time: "2:00 PM Today", originalPrice: 9500, currentPrice: 3200, urgency: "high", timeLeft: 65 },
  { id: "58", merchant: "Port of Durban", vertical: "Logistics", location: "Durban, ZA", region: "Africa", time: "05:00 AM Thu", originalPrice: 4800, currentPrice: 2100, urgency: "high", timeLeft: 700 },
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
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setSlots((prev) =>
        prev.map((s) => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredSlots = useMemo(() => {
    let result = selectedRegion === "all" ? slots : slots.filter((s) => s.region === selectedRegion);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.merchant.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.vertical.toLowerCase().includes(q) ||
          s.region.toLowerCase().includes(q)
      );
    }
    return result;
  }, [slots, selectedRegion, searchQuery]);

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

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search by merchant, city, or vertical..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border border-border/50 rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {searchQuery && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono">
              {filteredSlots.length} result{filteredSlots.length !== 1 ? "s" : ""}
            </div>
          )}
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
