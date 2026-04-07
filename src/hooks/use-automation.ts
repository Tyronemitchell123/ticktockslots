import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PriceAlert {
  id: string;
  vertical: string | null;
  region: string | null;
  max_price: number;
  is_active: boolean;
  created_at: string;
}

export interface AutoClaimRule {
  id: string;
  vertical: string | null;
  region: string | null;
  max_price: number;
  is_active: boolean;
  created_at: string;
}

export function useAutomation() {
  const { user } = useAuth();
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [autoClaimRules, setAutoClaimRules] = useState<AutoClaimRule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [alertsRes, rulesRes] = await Promise.all([
      supabase.from("price_alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("auto_claim_rules").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (alertsRes.data) setPriceAlerts(alertsRes.data as PriceAlert[]);
    if (rulesRes.data) setAutoClaimRules(rulesRes.data as AutoClaimRule[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPriceAlert = async (alert: { vertical?: string; region?: string; max_price: number }) => {
    if (!user) return;
    const { error } = await supabase.from("price_alerts").insert({
      user_id: user.id,
      vertical: alert.vertical || null,
      region: alert.region || null,
      max_price: alert.max_price,
    });
    if (error) toast.error("Failed to create alert");
    else { toast.success("Price alert created"); fetchAll(); }
  };

  const toggleAlert = async (id: string, is_active: boolean) => {
    await supabase.from("price_alerts").update({ is_active }).eq("id", id);
    fetchAll();
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("price_alerts").delete().eq("id", id);
    toast.success("Alert deleted");
    fetchAll();
  };

  const addAutoClaimRule = async (rule: { vertical?: string; region?: string; max_price: number }) => {
    if (!user) return;
    const { error } = await supabase.from("auto_claim_rules").insert({
      user_id: user.id,
      vertical: rule.vertical || null,
      region: rule.region || null,
      max_price: rule.max_price,
    });
    if (error) toast.error("Failed to create rule");
    else { toast.success("Auto-claim rule created"); fetchAll(); }
  };

  const toggleRule = async (id: string, is_active: boolean) => {
    await supabase.from("auto_claim_rules").update({ is_active }).eq("id", id);
    fetchAll();
  };

  const deleteRule = async (id: string) => {
    await supabase.from("auto_claim_rules").delete().eq("id", id);
    toast.success("Rule deleted");
    fetchAll();
  };

  return {
    priceAlerts, autoClaimRules, loading,
    addPriceAlert, toggleAlert, deleteAlert,
    addAutoClaimRule, toggleRule, deleteRule,
  };
}
