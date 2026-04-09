import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Authenticate admin user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Admin access required");

    const { merchant_id } = await req.json();
    if (!merchant_id) throw new Error("merchant_id is required");

    // Get merchant with Stripe account
    const { data: merchant, error: merchantError } = await supabase
      .from("merchants")
      .select("*")
      .eq("id", merchant_id)
      .single();
    if (merchantError || !merchant) throw new Error("Merchant not found");
    if (!merchant.stripe_account_id) throw new Error("Merchant has no Stripe Connect account");
    if (!merchant.stripe_onboarding_complete) throw new Error("Merchant onboarding not complete");

    // Get all pending commissions for this merchant
    const { data: commissions, error: commError } = await supabase
      .from("commissions")
      .select("*")
      .eq("merchant_id", merchant_id)
      .eq("status", "pending");
    if (commError) throw new Error(`Failed to fetch commissions: ${commError.message}`);
    if (!commissions || commissions.length === 0) throw new Error("No pending commissions");

    const totalPayout = commissions.reduce((sum: number, c: any) => sum + Number(c.merchant_payout), 0);
    const commissionIds = commissions.map((c: any) => c.id);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Create Stripe transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(totalPayout * 100), // Convert to cents
      currency: "gbp",
      destination: merchant.stripe_account_id,
      description: `Payout for ${commissions.length} booking(s) - ${merchant.name}`,
    });

    // Create payout record
    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .insert({
        merchant_id,
        amount: totalPayout,
        commission_ids: commissionIds,
        status: "paid",
        stripe_payout_id: transfer.id,
      })
      .select()
      .single();
    if (payoutError) throw new Error(`Failed to create payout record: ${payoutError.message}`);

    // Mark commissions as paid
    for (const id of commissionIds) {
      await supabase
        .from("commissions")
        .update({ status: "paid", stripe_transfer_id: transfer.id })
        .eq("id", id);
    }

    return new Response(
      JSON.stringify({
        payout_id: payout.id,
        transfer_id: transfer.id,
        amount: totalPayout,
        commissions_paid: commissionIds.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
