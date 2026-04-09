import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, TrendingDown, Globe, ChevronDown, Search, X as XIcon, Radio, Wifi, ArrowLeftRight, Info, Star, CheckCircle2, Navigation, ArrowUpDown, Heart, Lock, Crown } from "lucide-react";
import SlotDetailModal from "./SlotDetailModal";
import { getVendorAddress, openMapLocation } from "@/lib/vendor-addresses";
import { supabase } from "@/integrations/supabase/client";
import { CURRENCIES, detectCurrency, formatPriceInCurrency } from "@/lib/currency";
import { getSlotRating } from "@/lib/mock-reviews";
import { useSavedSlots } from "@/hooks/use-saved-slots";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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
  isLive?: boolean;
  source?: string;
}

const MOCK_SLOTS: Slot[] = [];


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

const SLOT_DETAILS: Record<string, { description: string; includes: string[]; ideal: string }> = {
  Beauty: {
    description: "Premium beauty & grooming appointment released due to last-minute cancellation.",
    includes: ["Full service as originally booked", "Same stylist / therapist", "Premium products included", "No service downgrade"],
    ideal: "Perfect for walk-ins wanting salon-quality at a fraction of the price.",
  },
  Aviation: {
    description: "Private jet seat or charter leg available from repositioning or cancellation.",
    includes: ["Confirmed departure slot", "Full cabin crew service", "Luggage allowance included", "FBO lounge access"],
    ideal: "Ideal for flexible travellers who can depart on short notice.",
  },
  Health: {
    description: "Medical or specialist consultation slot freed up by a cancellation.",
    includes: ["Licensed practitioner", "Full consultation duration", "Follow-up notes provided", "Prescription if needed"],
    ideal: "Great for non-emergency appointments you've been waiting weeks for.",
  },
  Dining: {
    description: "Reserved table at a top restaurant now available due to a no-show or cancellation.",
    includes: ["Prime-time table", "Full à la carte menu access", "Sommelier service", "Original party size"],
    ideal: "Perfect for food lovers who want a last-minute fine dining experience.",
  },
  Logistics: {
    description: "Cargo berth or container slot released from a schedule change.",
    includes: ["Confirmed loading window", "Port handling included", "Documentation support", "Priority clearance"],
    ideal: "Ideal for shippers needing urgent capacity at reduced rates.",
  },
  Fitness: {
    description: "Class spot or personal training session freed up by a cancellation.",
    includes: ["Full class/session duration", "Equipment provided", "Certified instructor", "Shower & locker access"],
    ideal: "Great for fitness enthusiasts wanting premium sessions at drop-in prices.",
  },
  Education: {
    description: "Tutoring session or course slot available from a student cancellation.",
    includes: ["Qualified tutor/instructor", "Full session length", "Learning materials provided", "Progress tracking"],
    ideal: "Perfect for students needing extra help or test preparation.",
  },
  Events: {
    description: "Premium event ticket or VIP experience released at the last minute.",
    includes: ["Confirmed seat/entry", "Original ticket tier", "Venue amenities access", "Digital ticket delivery"],
    ideal: "Ideal for spontaneous plans — catch sold-out shows at a discount.",
  },
  Automotive: {
    description: "Vehicle service, MOT, or repair slot freed up by a cancellation.",
    includes: ["Certified technician", "Genuine/OEM parts", "Service report provided", "Warranty maintained"],
    ideal: "Great for drivers needing timely maintenance without the long wait.",
  },
  Legal: {
    description: "Legal consultation or advisory slot available from a rescheduled client.",
    includes: ["Qualified solicitor/attorney", "Full consultation time", "Confidential session", "Written summary if applicable"],
    ideal: "Perfect for getting timely legal advice at reduced consultation fees.",
  },
  Property: {
    description: "Property viewing or valuation appointment freed up by a cancellation.",
    includes: ["Accompanied viewing", "Agent expertise", "Property pack available", "Flexible scheduling"],
    ideal: "Ideal for buyers and renters wanting priority access to listings.",
  },
  "Pet Care": {
    description: "Vet appointment or grooming slot available from a cancellation.",
    includes: ["Licensed veterinarian/groomer", "Full appointment duration", "Health check included", "Treatment notes provided"],
    ideal: "Great for pet owners needing prompt care without emergency prices.",
  },
  Holiday: {
    description: "Last-minute holiday package or hotel room released at a massive discount.",
    includes: ["Confirmed accommodation", "Original package inclusions", "Flexible check-in", "Resort amenities access"],
    ideal: "Perfect for spontaneous travellers wanting luxury getaways at budget prices.",
  },
  Cars: {
    description: "Car deal, rental, or test drive slot freed up by a cancellation or price drop.",
    includes: ["Vehicle as listed", "Full insurance coverage", "Roadside assistance", "Flexible collection"],
    ideal: "Perfect for drivers wanting premium vehicles at heavily discounted rates.",
  },
  Tools: {
    description: "Tool hire, equipment rental, or workshop slot released from a cancellation.",
    includes: ["Equipment as specified", "Safety gear included", "Delivery available", "Usage guidance"],
    ideal: "Great for DIY enthusiasts and tradespeople needing gear at short notice.",
  },
  "Home & Garden": {
    description: "Home improvement or gardening service slot freed up by a rescheduled booking.",
    includes: ["Qualified professional", "Materials included", "Tidy-up afterwards", "Satisfaction guarantee"],
    ideal: "Ideal for homeowners wanting quality work without the usual wait.",
  },
  Technology: {
    description: "Tech repair, gadget deal, or setup service slot available from a cancellation.",
    includes: ["Certified technician", "Genuine parts", "Warranty maintained", "Data protection assured"],
    ideal: "Great for getting urgent tech issues resolved at reduced rates.",
  },
  Sports: {
    description: "Sports court, facility booking, or coaching session freed up by a no-show.",
    includes: ["Full session duration", "Equipment available", "Qualified coach", "Changing facilities"],
    ideal: "Perfect for athletes wanting premium facility time at drop-in prices.",
  },
  Cleaning: {
    description: "Professional cleaning service slot available from a last-minute cancellation.",
    includes: ["Vetted & insured cleaner", "All products supplied", "Full duration", "Satisfaction guarantee"],
    ideal: "Ideal for busy households needing a professional clean at short notice.",
  },
  Photography: {
    description: "Photography session or studio hire slot released from a rescheduled shoot.",
    includes: ["Professional photographer", "Studio/location access", "Basic editing included", "Digital delivery"],
    ideal: "Perfect for capturing special moments at a fraction of regular rates.",
  },
  Childcare: {
    description: "Nursery place, childminder, or activity session freed up by a cancellation.",
    includes: ["Registered provider", "Full session length", "Meals/snacks included", "Activity programme"],
    ideal: "Great for parents needing reliable childcare at short notice.",
  },
  Storage: {
    description: "Self-storage unit available from a lease cancellation or early exit.",
    includes: ["Secure unit", "24/7 access", "Insurance option", "Flexible contract"],
    ideal: "Ideal for anyone needing storage space without the usual premium.",
  },
  Wedding: {
    description: "Wedding venue, vendor, or service slot freed up by a postponement or cancellation.",
    includes: ["Confirmed date & venue", "Original package inclusions", "Dedicated coordinator", "Setup & teardown included"],
    ideal: "Perfect for couples wanting dream weddings at a fraction of the price.",
  },
  Gym: {
    description: "Gym membership, class package, or fitness pass freed up by a cancellation or early exit.",
    includes: ["Full membership benefits", "All facilities access", "Class bookings included", "Transferable pass"],
    ideal: "Perfect for fitness enthusiasts wanting premium gym access at a massive discount.",
  },
  Flights: {
    description: "Last-minute flight deal, upgrade, or flight + hotel bundle at a steep discount.",
    includes: ["Confirmed booking", "Full baggage allowance", "Seat selection included", "Flexible rebooking option"],
    ideal: "Perfect for spontaneous travellers wanting premium flights and bundles at budget prices.",
  },
  Luxury: {
    description: "Authenticated designer goods, luxury watches, and high-end fashion from sample sales and verified returns.",
    includes: ["Certificate of authenticity", "Original packaging", "Return guarantee", "Expert verification"],
    ideal: "Perfect for style-conscious shoppers wanting luxury brands at a fraction of retail.",
  },
  Food: {
    description: "Restaurant surplus, cancelled meal kits, and wholesale grocery clearance at massive savings.",
    includes: ["Quality guaranteed", "Same-day collection", "Full product details", "Freshness assured"],
    ideal: "Great for food lovers wanting premium groceries and meals at a fraction of the price.",
  },
  Electronics: {
    description: "Refurbished gadgets, open-box returns, and flash sales on top tech brands at steep discounts.",
    includes: ["Manufacturer warranty", "Full inspection report", "Original accessories", "Return guarantee"],
    ideal: "Perfect for tech enthusiasts wanting premium electronics without the premium price tag.",
  },
};

const SlotSkeleton = () => (
  <div className="glass rounded-xl p-5 animate-pulse">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-lg bg-muted" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded w-40" />
          <div className="h-3 bg-muted rounded w-60" />
          <div className="h-3 bg-muted rounded w-32" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="space-y-1 text-right">
          <div className="h-3 bg-muted rounded w-16 ml-auto" />
          <div className="h-5 bg-muted rounded w-20 ml-auto" />
        </div>
        <div className="h-9 w-16 bg-muted rounded-lg" />
      </div>
    </div>
  </div>
);

const UNICORN_IDS = new Set(["907", "920", "924", "930", "201", "300", "312", "800", "950", "700"]);

const isUnicornSlot = (slot: Slot) => UNICORN_IDS.has(slot.id) || (slot.originalPrice > 0 && ((slot.originalPrice - slot.currentPrice) / slot.originalPrice) > 0.55);

const LiveSlotsFeed = () => {
  const { savedSlotIds, toggleSave } = useSavedSlots();
  const { toast } = useToast();
  const { subscribed } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveCount, setLiveCount] = useState(0);
  const [displayCurrency, setDisplayCurrency] = useState("GBP");
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [selectedVertical, setSelectedVertical] = useState("all");
  const [verticalDropdownOpen, setVerticalDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"default" | "price" | "discount" | "timeLeft">("default");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleOpenMap = useCallback(async (address: string) => {
    const result = await openMapLocation(address);

    if (result === "opened") return;

    toast({
      title:
        result === "preview_copied"
          ? "Address copied for preview"
          : result === "copied"
            ? "Map link copied"
            : "Couldn't open map",
      description:
        result === "preview_copied"
          ? "Preview blocks third-party map sites, so the address and map link were copied to your clipboard instead."
          : result === "copied"
            ? "Popup blocking prevented opening the map, so the address and map link were copied instead."
            : `Copy this address manually: ${address}`,
      variant: result === "failed" ? "destructive" : undefined,
    });
  }, [toast]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSlots((prev) =>
        prev.map((s) => ({ ...s, timeLeft: Math.max(0, s.timeLeft - 1) }))
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live slots from database + trigger ingestion
  useEffect(() => {
    // Trigger edge function to ingest fresh slots (fire-and-forget)
    supabase.functions.invoke("ingest-live-slots", { method: "POST" }).catch(() => {});

    const loadFromDb = async () => {
      try {
        const { data, error } = await supabase
          .from("slots")
          .select("*")
          .eq("is_live", true)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) {
          console.warn("DB fetch error:", error);
          return;
        }

        if (data && data.length > 0) {
          const dbSlots: Slot[] = data.map((s) => ({
            id: s.id,
            merchant: s.merchant_name,
            vertical: s.vertical,
            location: s.location,
            region: s.region,
            time: s.time_description,
            originalPrice: Number(s.original_price),
            currentPrice: Number(s.current_price),
            urgency: s.urgency as "critical" | "high" | "medium",
            timeLeft: s.time_left,
            isLive: true,
            source: s.source,
          }));
          setSlots((prev) => {
            const mockOnly = prev.filter((s) => !s.isLive);
            return [...dbSlots, ...mockOnly];
          });
          setLiveCount(dbSlots.length);
        }
        setInitialLoading(false);
      } catch (e) {
        console.warn("Live data fetch failed:", e);
        setInitialLoading(false);
      }
    };
    loadFromDb();
    const interval = setInterval(loadFromDb, 15000);

    // Subscribe to realtime inserts and updates
    const channel = supabase
      .channel("live-slots")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "slots" }, (payload) => {
        const s = payload.new as any;
        const newSlot: Slot = {
          id: s.id,
          merchant: s.merchant_name,
          vertical: s.vertical,
          location: s.location,
          region: s.region,
          time: s.time_description,
          originalPrice: Number(s.original_price),
          currentPrice: Number(s.current_price),
          urgency: s.urgency,
          timeLeft: s.time_left,
          isLive: true,
          source: s.source,
        };
        setSlots((prev) => [newSlot, ...prev]);
        setLiveCount((prev) => prev + 1);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "slots" }, (payload) => {
        const s = payload.new as any;
        if (!s.is_live) {
          // Slot was claimed — remove from feed
          setSlots((prev) => prev.filter((slot) => slot.id !== s.id));
          setLiveCount((prev) => Math.max(0, prev - 1));
        }
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredSlots = useMemo(() => {
    let result = selectedRegion === "all" ? slots : slots.filter((s) => s.region === selectedRegion);
    if (selectedVertical !== "all") {
      result = result.filter((s) => s.vertical === selectedVertical);
    }
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
    if (sortBy === "price") {
      result = [...result].sort((a, b) => a.currentPrice - b.currentPrice);
    } else if (sortBy === "discount") {
      const disc = (s: Slot) => s.originalPrice > 0 ? ((s.originalPrice - s.currentPrice) / s.originalPrice) * 100 : 0;
      result = [...result].sort((a, b) => disc(b) - disc(a));
    } else if (sortBy === "timeLeft") {
      result = [...result].sort((a, b) => a.timeLeft - b.timeLeft);
    }
    return result;
  }, [slots, selectedRegion, selectedVertical, searchQuery, sortBy]);

  const verticals = useMemo(() => {
    const set = new Set(slots.map((s) => s.vertical));
    return ["all", ...Array.from(set).sort()];
  }, [slots]);

  const verticalCounts = useMemo(() => {
    const base = selectedRegion === "all" ? slots : slots.filter((s) => s.region === selectedRegion);
    const counts: Record<string, number> = { all: base.length };
    base.forEach((s) => { counts[s.vertical] = (counts[s.vertical] || 0) + 1; });
    return counts;
  }, [slots, selectedRegion]);

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: slots.length };
    slots.forEach((s) => { counts[s.region] = (counts[s.region] || 0) + 1; });
    return counts;
  }, [slots]);

  const currentRegion = REGIONS.find((r) => r.id === selectedRegion) || REGIONS[0];

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedRegion, selectedVertical, searchQuery, sortBy]);

  const visibleSlots = useMemo(() => filteredSlots.slice(0, visibleCount), [filteredSlots, visibleCount]);
  const hasMore = visibleCount < filteredSlots.length;

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount((prev) => prev + 20);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

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
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" />
              <span className="text-sm text-muted-foreground font-mono">LIVE</span>
            </div>
            {liveCount > 0 && (
              <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30 text-[10px] gap-1">
                <Wifi className="w-3 h-3" /> {liveCount} real-time
              </Badge>
            )}
            {/* Currency selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
                {CURRENCIES.find((c) => c.code === displayCurrency)?.flag}{" "}
                {displayCurrency}
                <ChevronDown className={`w-3 h-3 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 glass rounded-xl border border-border/50 shadow-xl z-50 py-1 max-h-64 overflow-y-auto">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setDisplayCurrency(c.code); setCurrencyDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-muted/50 transition-colors ${
                        displayCurrency === c.code ? "text-primary font-semibold" : "text-foreground"
                      }`}
                    >
                      <span>{c.flag}</span>
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground font-mono text-xs">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Sort selector */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-sm font-medium text-foreground hover:border-primary/30 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">
                  {sortBy === "default" ? "Sort" : sortBy === "price" ? "Price" : sortBy === "discount" ? "Discount" : "Time Left"}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {sortDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSortDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 glass rounded-xl border border-border/50 shadow-xl z-50 py-1">
                    {([
                      { value: "default", label: "Default" },
                      { value: "price", label: "Price (low → high)" },
                      { value: "discount", label: "Discount % (high)" },
                      { value: "timeLeft", label: "Ending soonest" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted/50 transition-colors ${
                          sortBy === opt.value ? "text-primary font-semibold" : "text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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

        {/* Vertical / Category Filter */}
        <div className="mb-6">
          {/* Mobile dropdown */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setVerticalDropdownOpen(!verticalDropdownOpen)}
              className="w-full glass rounded-xl px-4 py-3 flex items-center justify-between text-sm text-foreground"
            >
              <span className="flex items-center gap-2">
                🏷️ {selectedVertical === "all" ? "All Categories" : selectedVertical}
                <Badge variant="outline" className="text-[10px] ml-1">{verticalCounts[selectedVertical] || 0}</Badge>
              </span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${verticalDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {verticalDropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setVerticalDropdownOpen(false)} />
                <div className="absolute top-full left-0 right-0 z-40 mt-1 glass rounded-xl border border-border/50 py-1 max-h-64 overflow-y-auto">
                  {/* Pinned Holiday option */}
                  <button
                    onClick={() => { setSelectedVertical(selectedVertical === "Holiday" ? "all" : "Holiday"); setVerticalDropdownOpen(false); }}
                    className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                      selectedVertical === "Holiday" ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-400/70 hover:bg-emerald-500/5"
                    }`}
                  >
                    <span>🏝️ Holiday Deals</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-400/30 text-emerald-400">{verticalCounts["Holiday"] || 0}</Badge>
                  </button>
                  <div className="h-px bg-border/30 mx-3 my-1" />
                  {verticals.filter(v => v !== "Holiday").map((v) => (
                    <button
                      key={v}
                      onClick={() => { setSelectedVertical(v); setVerticalDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                        selectedVertical === v ? "text-primary bg-primary/5" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{v === "all" ? "All Categories" : v}</span>
                      <Badge variant="outline" className="text-[10px]">{verticalCounts[v] || 0}</Badge>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Desktop pill selector */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <span className="text-sm mr-1">🏷️</span>
            {/* Pinned Holiday quick-filter */}
            <button
              onClick={() => setSelectedVertical(selectedVertical === "Holiday" ? "all" : "Holiday")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedVertical === "Holiday"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_0_12px_-2px_rgba(16,185,129,0.5)]"
                  : "bg-gradient-to-r from-emerald-500/10 to-cyan-400/10 text-emerald-400 border border-emerald-400/30 hover:border-emerald-400/60 hover:shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]"
              }`}
            >
              🏝️ Holiday Deals
              <span className="opacity-80">({verticalCounts["Holiday"] || 0})</span>
            </button>
            <div className="w-px h-5 bg-border/40 mx-1" />
            {verticals.filter(v => v !== "Holiday").map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVertical(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedVertical === v
                    ? "bg-primary text-primary-foreground glow-blue"
                    : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
                }`}
              >
                {v === "all" ? "All" : v}
                <span className="ml-1.5 opacity-70">({verticalCounts[v] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {initialLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SlotSkeleton key={i} />)
          ) : filteredSlots.length === 0 ? (
            <div className="glass rounded-xl p-10 text-center">
              <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No live slots in this region right now.</p>
              <button onClick={() => setSelectedRegion("all")} className="text-primary text-sm mt-2 hover:underline">
                View all regions →
              </button>
            </div>
          ) : (
            visibleSlots.map((slot, idx) => {
              const details = SLOT_DETAILS[slot.vertical];
              const isExpanded = expandedSlotId === slot.id;
              const rating = getSlotRating(slot.id, slot.vertical);

              const isUnicorn = isUnicornSlot(slot);
              const isGated = isUnicorn && !subscribed;

              return (
                <div
                  key={`${slot.id}-${idx}`}
                  className={`glass rounded-xl overflow-hidden transition-colors group animate-fade-in ${
                    slot.vertical === "Holiday"
                      ? "border-emerald-400/30 hover:border-emerald-400/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                      : slot.vertical === "Wedding"
                        ? "border-pink-400/30 hover:border-pink-400/50 shadow-[0_0_15px_-3px_rgba(244,114,182,0.15)]"
                        : slot.vertical === "Cars"
                          ? "border-blue-400/30 hover:border-blue-400/50 shadow-[0_0_15px_-3px_rgba(96,165,250,0.15)]"
                          : slot.vertical === "Gym"
                            ? "border-orange-400/30 hover:border-orange-400/50 shadow-[0_0_15px_-3px_rgba(251,146,60,0.15)]"
                            : slot.vertical === "Flights"
                              ? "border-sky-400/30 hover:border-sky-400/50 shadow-[0_0_15px_-3px_rgba(56,189,248,0.15)]"
                              : slot.vertical === "Luxury"
                                ? "border-amber-400/30 hover:border-amber-400/50 shadow-[0_0_15px_-3px_rgba(251,191,36,0.2)]"
                                : slot.vertical === "Food"
                                   ? "border-lime-400/30 hover:border-lime-400/50 shadow-[0_0_15px_-3px_rgba(163,230,53,0.15)]"
                                   : slot.vertical === "Electronics"
                                     ? "border-cyan-400/30 hover:border-cyan-400/50 shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)]"
                                     : isGated ? "opacity-80" : "hover:border-primary/30"
                  }`}
                >
                  <div
                    className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => isGated ? navigate("/#pricing") : handleClaim(slot)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        slot.vertical === "Holiday"
                          ? "bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 ring-1 ring-emerald-400/30"
                          : slot.vertical === "Wedding"
                            ? "bg-gradient-to-br from-pink-500/20 to-rose-400/20 ring-1 ring-pink-400/30"
                            : slot.vertical === "Cars"
                              ? "bg-gradient-to-br from-blue-500/20 to-sky-400/20 ring-1 ring-blue-400/30"
                              : slot.vertical === "Gym"
                                ? "bg-gradient-to-br from-orange-500/20 to-amber-400/20 ring-1 ring-orange-400/30"
                                : slot.vertical === "Flights"
                                  ? "bg-gradient-to-br from-sky-500/20 to-indigo-400/20 ring-1 ring-sky-400/30"
                                  : slot.vertical === "Luxury"
                                    ? "bg-gradient-to-br from-amber-500/20 to-yellow-400/20 ring-1 ring-amber-400/30"
                                    : slot.vertical === "Food"
                                       ? "bg-gradient-to-br from-lime-500/20 to-green-400/20 ring-1 ring-lime-400/30"
                                       : slot.vertical === "Electronics"
                                         ? "bg-gradient-to-br from-cyan-500/20 to-teal-400/20 ring-1 ring-cyan-400/30"
                                         : isUnicorn
                                           ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                                           : "bg-muted"
                      }`}>
                        <span className="text-lg font-bold text-primary">
                          {slot.vertical === "Holiday" ? "🌴" : slot.vertical === "Wedding" ? "💒" : slot.vertical === "Cars" ? "🚘" : slot.vertical === "Gym" ? "🏋️" : slot.vertical === "Flights" ? "✈️" : slot.vertical === "Luxury" ? "💎" : slot.vertical === "Food" ? "🥗" : slot.vertical === "Electronics" ? "📱" : isUnicorn ? "🦄" : slot.vertical[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {slot.merchant}
                          </span>
                          {isUnicorn && (
                            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30 text-[9px] py-0 px-1.5">
                              🦄 Unicorn
                            </Badge>
                          )}
                          {slot.vertical === "Holiday" && (
                            <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-400/20 text-emerald-300 border-emerald-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                              🏝️ Holiday Steal
                            </Badge>
                          )}
                          {slot.vertical === "Wedding" && (
                            <Badge className="bg-gradient-to-r from-pink-500/20 to-rose-400/20 text-pink-300 border-pink-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                              💒 Wedding Deal
                            </Badge>
                          )}
                          {slot.vertical === "Cars" && (
                            <Badge className="bg-gradient-to-r from-blue-500/20 to-sky-400/20 text-blue-300 border-blue-400/30 text-[9px] py-0 px-1.5">
                              🚘 Car Deal
                            </Badge>
                          )}
                          {slot.vertical === "Gym" && (
                            <Badge className="bg-gradient-to-r from-orange-500/20 to-amber-400/20 text-orange-300 border-orange-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                              🏋️ Gym Pass
                            </Badge>
                          )}
                          {slot.vertical === "Flights" && (
                            <Badge className="bg-gradient-to-r from-sky-500/20 to-indigo-400/20 text-sky-300 border-sky-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                              ✈️ Flight Deal
                            </Badge>
                          )}
                          {slot.vertical === "Food" && (
                            <Badge className="bg-gradient-to-r from-lime-500/20 to-green-400/20 text-lime-300 border-lime-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                              🥗 Food Deal
                            </Badge>
                          )}
                          {slot.vertical === "Luxury" && (
                             <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-400/20 text-amber-300 border-amber-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                               💎 Luxury Deal
                             </Badge>
                           )}
                          {slot.vertical === "Electronics" && (
                             <Badge className="bg-gradient-to-r from-cyan-500/20 to-teal-400/20 text-cyan-300 border-cyan-400/30 text-[9px] py-0 px-1.5 animate-pulse">
                               📱 Tech Deal
                             </Badge>
                           )}
                          {slot.isLive && (
                            <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30 text-[9px] py-0 px-1.5 gap-0.5">
                              <Radio className="w-2.5 h-2.5 animate-countdown" /> {slot.source}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.time}</span>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">{slot.region}</Badge>
                        </div>
                        {(() => {
                          const address = getVendorAddress(slot.merchant);
                          return address ? (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-muted-foreground/70 truncate max-w-[260px]">{address}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleOpenMap(address);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:text-primary/80 transition-colors shrink-0"
                              >
                                <Navigation className="w-3 h-3" />
                                Map
                              </button>
                            </div>
                          ) : null;
                        })()}
                        {/* Star rating */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= Math.round(rating.average) ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium text-foreground">{rating.average.toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({rating.count} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full md:w-auto justify-between md:justify-end">
                      <Badge variant="outline" className={urgencyColors[slot.urgency]}>
                        {slot.urgency === "critical" ? "🔥" : slot.urgency === "high" ? "⚡" : "📌"} {slot.timeLeft}s left
                      </Badge>

                      {isGated ? (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground line-through blur-sm select-none">
                            {formatPriceInCurrency(slot.originalPrice, detectCurrency(slot.location, slot.region), displayCurrency)}
                          </div>
                          <div className="text-lg font-bold text-muted-foreground blur-sm select-none flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            {formatPriceInCurrency(slot.currentPrice, detectCurrency(slot.location, slot.region), displayCurrency)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground line-through">
                            {formatPriceInCurrency(slot.originalPrice, detectCurrency(slot.location, slot.region), displayCurrency)}
                          </div>
                          <div className="text-lg font-bold text-secondary flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            {formatPriceInCurrency(slot.currentPrice, detectCurrency(slot.location, slot.region), displayCurrency)}
                          </div>
                        </div>
                      )}

                      {/* Details toggle */}
                      <button
                        className="p-2 rounded-lg glass text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                        title="View details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedSlotId(isExpanded ? null : slot.id);
                        }}
                      >
                        <Info className="w-4 h-4" />
                        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {/* Save to wishlist */}
                      <button
                        className={`p-2 rounded-lg glass transition-colors ${
                          savedSlotIds.has(slot.id)
                            ? "text-red-400 hover:text-red-300"
                            : "text-muted-foreground hover:text-red-400 hover:border-red-400/30"
                        }`}
                        title={savedSlotIds.has(slot.id) ? "Remove from wishlist" : "Save to wishlist"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(slot.id, {
                            id: slot.id,
                            merchant: slot.merchant,
                            vertical: slot.vertical,
                            location: slot.location,
                            region: slot.region,
                            time: slot.time,
                            originalPrice: slot.originalPrice,
                            currentPrice: slot.currentPrice,
                            urgency: slot.urgency,
                          });
                        }}
                      >
                        <Heart className={`w-4 h-4 ${savedSlotIds.has(slot.id) ? "fill-current" : ""}`} />
                      </button>

                      {isGated ? (
                        <button
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white font-semibold text-sm hover:from-purple-500 hover:to-pink-500 transition-colors flex items-center gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/#pricing");
                          }}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Premium
                        </button>
                      ) : (
                        <button
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors glow-blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaim(slot);
                          }}
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable details dropdown */}
                  {isExpanded && details && (
                    <div className="border-t border-border/30 px-5 py-4 bg-muted/20 animate-fade-in space-y-3">
                      <p className="text-sm text-muted-foreground">{details.description}</p>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> What's Included
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {details.includes.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Star className="w-3 h-3 text-secondary shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-primary font-medium italic">{details.ideal}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {/* Load more sentinel + count indicator */}
          {filteredSlots.length > 0 && (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs text-muted-foreground font-mono">
                Showing {visibleSlots.length} of {filteredSlots.length} slots
              </p>
              {hasMore && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 20)}
                  className="px-6 py-2 rounded-lg glass text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Load more
                </button>
              )}
            </div>
          )}
          <div ref={loadMoreRef} className="h-1" />
        </div>
      </div>

      <SlotDetailModal
        slot={selectedSlot}
        open={modalOpen}
        onOpenChange={setModalOpen}
        displayCurrency={displayCurrency}
      />
    </section>
  );
};

export default LiveSlotsFeed;
