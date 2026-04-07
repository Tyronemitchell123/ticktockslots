import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PriceAlertMatch {
  alertId: string;
  slotId: string;
  merchantName: string;
  vertical: string;
  region: string;
  currentPrice: number;
  originalPrice: number;
  maxPrice: number;
  timeDescription: string;
  matchedAt: Date;
}

export function usePriceAlertMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<PriceAlertMatch[]>([]);

  const fetchMatches = useCallback(async () => {
    if (!user) { setMatches([]); return; }

    const { data: alerts } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (!alerts || alerts.length === 0) { setMatches([]); return; }

    const { data: slots } = await supabase
      .from("slots")
      .select("*")
      .eq("is_live", true);

    if (!slots) { setMatches([]); return; }

    const matched: PriceAlertMatch[] = [];
    for (const alert of alerts) {
      for (const slot of slots) {
        const verticalMatch = !alert.vertical || slot.vertical.toLowerCase() === alert.vertical.toLowerCase();
        const regionMatch = !alert.region || slot.region.toLowerCase() === alert.region.toLowerCase();
        const priceMatch = slot.current_price <= alert.max_price;
        if (verticalMatch && regionMatch && priceMatch) {
          matched.push({
            alertId: alert.id,
            slotId: slot.id,
            merchantName: slot.merchant_name,
            vertical: slot.vertical,
            region: slot.region,
            currentPrice: slot.current_price,
            originalPrice: slot.original_price,
            maxPrice: alert.max_price,
            timeDescription: slot.time_description,
            matchedAt: new Date(slot.created_at),
          });
        }
      }
    }
    setMatches(matched);
  }, [user]);

  useEffect(() => {
    fetchMatches();

    // Re-check when slots change via realtime
    const channel = supabase
      .channel("price-alert-matches")
      .on("postgres_changes", { event: "*", schema: "public", table: "slots" }, () => fetchMatches())
      .on("postgres_changes", { event: "*", schema: "public", table: "price_alerts" }, () => fetchMatches())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchMatches]);

  return matches;
}
