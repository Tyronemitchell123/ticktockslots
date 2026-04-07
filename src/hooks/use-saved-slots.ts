import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SavedSlotData {
  id: string;
  merchant: string;
  vertical: string;
  location: string;
  region: string;
  time: string;
  originalPrice: number;
  currentPrice: number;
  urgency: string;
}

export function useSavedSlots() {
  const { user } = useAuth();
  const [savedSlotIds, setSavedSlotIds] = useState<Set<string>>(new Set());
  const [savedSlots, setSavedSlots] = useState<Array<{ slot_id: string; slot_data: SavedSlotData; created_at: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!user) {
      setSavedSlotIds(new Set());
      setSavedSlots([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("saved_slots")
      .select("slot_id, slot_data, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setSavedSlotIds(new Set(data.map((d: any) => d.slot_id)));
      setSavedSlots(data as any);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = useCallback(async (slotId: string, slotData: SavedSlotData) => {
    if (!user) {
      toast.error("Sign in to save slots");
      return;
    }

    if (savedSlotIds.has(slotId)) {
      // Remove
      setSavedSlotIds((prev) => {
        const next = new Set(prev);
        next.delete(slotId);
        return next;
      });
      setSavedSlots((prev) => prev.filter((s) => s.slot_id !== slotId));
      await supabase.from("saved_slots").delete().eq("user_id", user.id).eq("slot_id", slotId);
      toast.success("Removed from wishlist");
    } else {
      // Save
      setSavedSlotIds((prev) => new Set(prev).add(slotId));
      setSavedSlots((prev) => [{ slot_id: slotId, slot_data: slotData, created_at: new Date().toISOString() }, ...prev]);
      await supabase.from("saved_slots").insert({
        user_id: user.id,
        slot_id: slotId,
        slot_data: slotData as any,
      });
      toast.success("Saved to wishlist");
    }
  }, [user, savedSlotIds]);

  return { savedSlotIds, savedSlots, loading, toggleSave, refetch: fetchSaved };
}
