import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.0/cors";

/**
 * Slot ingestion function — processes expiration and auto-claim matching.
 * Slots are created exclusively by registered merchants via the merchant portal.
 * No simulated/fake slots are generated.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("Ingestion started — expiration + auto-claim only");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Expire old slots
  const { count: expired } = await supabase
    .from("slots")
    .update({ is_live: false })
    .lt("expires_at", new Date().toISOString())
    .eq("is_live", true)
    .select("*", { count: "exact", head: true });

  console.log(`Expired ${expired ?? 0} slots`);

  // Fetch newly live slots (created in the last 2 minutes, still live) for auto-claim matching
  const twoMinAgo = new Date(Date.now() - 120_000).toISOString();
  const { data: recentSlots } = await supabase
    .from("slots")
    .select("*")
    .eq("is_live", true)
    .gte("created_at", twoMinAgo);

  let autoClaimed = 0;

  if (recentSlots && recentSlots.length > 0) {
    // Fetch all active auto-claim rules
    const { data: rules } = await supabase
      .from("auto_claim_rules")
      .select("*")
      .eq("is_active", true);

    if (rules && rules.length > 0) {
      for (const slot of recentSlots) {
        const matches = rules.filter((r: any) => {
          if (slot.current_price > r.max_price) return false;
          if (r.vertical && r.vertical.toLowerCase() !== slot.vertical.toLowerCase()) return false;
          if (r.region && r.region.toLowerCase() !== slot.region.toLowerCase()) return false;
          return true;
        });

        if (matches.length === 0) continue;

        const rule = matches[0];
        try {
          const { data: bookingId, error: claimError } = await supabase
            .rpc("claim_slot", { _slot_id: slot.id, _user_id: rule.user_id });

          if (claimError) {
            console.error(`Auto-claim failed for slot ${slot.id}:`, claimError.message);
            continue;
          }

          autoClaimed++;
          console.log(`Auto-claimed slot ${slot.id} for user ${rule.user_id} (booking ${bookingId})`);

          await supabase.from("bookings").update({ source: "auto-claim" }).eq("id", bookingId);

          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", rule.user_id)
            .single();

          const ruleParts = [];
          if (rule.vertical) ruleParts.push(rule.vertical);
          if (rule.region) ruleParts.push(rule.region);
          ruleParts.push(`Under £${rule.max_price}`);
          const ruleSummary = ruleParts.join(" • ");

          const savings = slot.original_price - slot.current_price;
          const savingsPercent = Math.round((savings / slot.original_price) * 100);

          const { data: { user: authUser } } = await supabase.auth.admin.getUserById(rule.user_id);

          if (authUser?.email) {
            await supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "auto-claim-confirmation",
                recipientEmail: authUser.email,
                idempotencyKey: `auto-claim-${bookingId}`,
                templateData: {
                  merchantName: slot.merchant_name,
                  vertical: slot.vertical,
                  location: slot.location,
                  time: slot.time_description,
                  originalPrice: `£${slot.original_price.toFixed(2)}`,
                  claimedPrice: `£${slot.current_price.toFixed(2)}`,
                  savings: `£${savings.toFixed(2)} (${savingsPercent}%)`,
                  bookingId,
                  ruleSummary,
                },
              },
            });
            console.log(`Auto-claim email sent to ${authUser.email}`);
          }
        } catch (err) {
          console.error(`Auto-claim error for slot ${slot.id}:`, err);
        }
      }
    }
  }

  console.log(`Auto-claimed ${autoClaimed} slots`);

  return new Response(
    JSON.stringify({ success: true, expired: expired ?? 0, autoClaimed, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
