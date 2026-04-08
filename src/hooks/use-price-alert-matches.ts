import { useState, useEffect, useCallback, useRef } from "react";
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

// Track which alert+slot combos we've already emailed to avoid duplicates
const emailedMatches = new Set<string>();

async function sendPriceAlertEmail(match: PriceAlertMatch, userEmail: string) {
  const key = `${match.alertId}-${match.slotId}`;
  if (emailedMatches.has(key)) return;
  emailedMatches.add(key);

  const savings = match.originalPrice - match.currentPrice;
  const savingsPct = Math.round((savings / match.originalPrice) * 100);

  try {
    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "price-alert-match",
        recipientEmail: userEmail,
        idempotencyKey: `price-alert-${match.alertId}-${match.slotId}`,
        templateData: {
          merchantName: match.merchantName,
          vertical: match.vertical,
          region: match.region,
          currentPrice: `£${match.currentPrice.toFixed(2)}`,
          originalPrice: `£${match.originalPrice.toFixed(2)}`,
          savings: `£${savings.toFixed(2)} (${savingsPct}%)`,
          timeDescription: match.timeDescription,
          alertMaxPrice: `£${match.maxPrice.toFixed(2)}`,
          slotUrl: `${window.location.origin}/dashboard`,
        },
      },
    });
  } catch (e) {
    console.error("Failed to send price alert email", e);
    // Remove from set so it can retry next cycle
    emailedMatches.delete(key);
  }
}

export function usePriceAlertMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<PriceAlertMatch[]>([]);
  const prevMatchKeys = useRef<Set<string>>(new Set());

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

    // Send emails only for NEW matches (not previously seen)
    if (user.email) {
      for (const m of matched) {
        const key = `${m.alertId}-${m.slotId}`;
        if (!prevMatchKeys.current.has(key)) {
          sendPriceAlertEmail(m, user.email);
        }
      }
    }

    // Update previous keys
    prevMatchKeys.current = new Set(matched.map(m => `${m.alertId}-${m.slotId}`));
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
