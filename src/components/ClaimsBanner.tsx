import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Claim {
  name: string;
  deal: string;
  savings: string;
  location: string;
  ago: string;
}

const MOCK_CLAIMS: Claim[] = [
  { name: "Sarah M.", deal: "Spa Treatment", savings: "£45", location: "London", ago: "2m ago" },
  { name: "James T.", deal: "Business Class Flight", savings: "$1,200", location: "New York", ago: "3m ago" },
  { name: "Priya K.", deal: "Wedding Venue", savings: "£2,800", location: "Manchester", ago: "5m ago" },
  { name: "Carlos R.", deal: "BMW 3 Series Lease", savings: "$4,500", location: "Miami", ago: "6m ago" },
  { name: "Emily W.", deal: "Gym Annual Pass", savings: "£180", location: "Bristol", ago: "8m ago" },
  { name: "David L.", deal: "Hotel Suite", savings: "$320", location: "Las Vegas", ago: "10m ago" },
  { name: "Aisha N.", deal: "Hair & Colour", savings: "£35", location: "Birmingham", ago: "11m ago" },
  { name: "Tom H.", deal: "MacBook Pro Refurb", savings: "$480", location: "San Francisco", ago: "12m ago" },
  { name: "Lisa P.", deal: "Maldives Holiday", savings: "£1,600", location: "Edinburgh", ago: "14m ago" },
  { name: "Raj S.", deal: "Dental Checkup", savings: "£90", location: "Leeds", ago: "15m ago" },
  { name: "Sophie B.", deal: "Restaurant Table", savings: "£55", location: "Paris", ago: "17m ago" },
  { name: "Mike D.", deal: "HelloFresh Box", savings: "$40", location: "Chicago", ago: "18m ago" },
  { name: "Hannah F.", deal: "PT Sessions x10", savings: "£200", location: "Glasgow", ago: "20m ago" },
  { name: "Alex C.", deal: "Samsung TV 65\"", savings: "$350", location: "Austin", ago: "22m ago" },
  { name: "Olivia J.", deal: "Luxury Villa Stay", savings: "€900", location: "Barcelona", ago: "24m ago" },
  { name: "Nathan W.", deal: "Catering Package", savings: "£750", location: "Cardiff", ago: "25m ago" },
];

const currencyByRegion: Record<string, string> = {
  UK: "£", US: "$", EU: "€",
};

const ClaimsBanner = () => {
  const [offset, setOffset] = useState(0);
  const [dbClaims, setDbClaims] = useState<Claim[]>([]);

  useEffect(() => {
    const fetchClaims = async () => {
      const { data, error } = await supabase.rpc("get_recent_claims", { claim_limit: 30 });
      if (!error && data && data.length > 0) {
        const mapped: Claim[] = data.map((row: any) => ({
          name: row.display_name || "User",
          deal: row.deal,
          savings: `${currencyByRegion[row.region] || "£"}${Number(row.savings).toLocaleString()}`,
          location: row.location,
          ago: formatDistanceToNow(new Date(row.created_at), { addSuffix: false }) + " ago",
        }));
        setDbClaims(mapped);
      }
    };
    fetchClaims();
  }, []);

  const claims = dbClaims.length > 0 ? dbClaims : MOCK_CLAIMS;

  useEffect(() => {
    const id = requestAnimationFrame(function tick() {
      setOffset((prev) => prev - 0.5);
      requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const items = useMemo(() => [...claims, ...claims], [claims]);
  const resetPoint = claims.length * 320;

  return (
    <section className="relative overflow-hidden border-y border-border/30 bg-muted/30 py-3">
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background to-transparent z-10" />

      <div
        className="flex gap-6 whitespace-nowrap will-change-transform"
        style={{ transform: `translateX(${offset % resetPoint}px)` }}
      >
        {items.map((c, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-3 rounded-full bg-background/80 border border-border/40 px-4 py-2 text-sm shrink-0"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {c.name.charAt(0)}
            </span>
            <span className="text-foreground font-medium">{c.name}</span>
            <span className="text-muted-foreground">claimed</span>
            <span className="text-foreground font-semibold">{c.deal}</span>
            <span className="text-green-400 font-bold">−{c.savings}</span>
            <span className="text-muted-foreground text-xs">• {c.location} • {c.ago}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ClaimsBanner;
