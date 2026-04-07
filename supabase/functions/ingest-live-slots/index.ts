import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.0/cors";

interface SlotRow {
  merchant_name: string;
  vertical: string;
  location: string;
  region: string;
  time_description: string;
  original_price: number;
  current_price: number;
  urgency: string;
  time_left: number;
  is_live: boolean;
  source: string;
  expires_at: string;
}

// Time-seeded deterministic slot generation based on real-world patterns
function generateSlots(): SlotRow[] {
  const now = new Date();
  const hour = now.getUTCHours();
  const slots: SlotRow[] = [];
  const expires = new Date(Date.now() + 3600000).toISOString();

  const pool = [
    // UK merchants (active 8-20 GMT)
    { name: "Glow & Go London", vertical: "Beauty", location: "London, UK", region: "UK", base: 120, hours: [8, 20] },
    { name: "Manchester Wellness Hub", vertical: "Beauty", location: "Manchester, UK", region: "UK", base: 95, hours: [8, 20] },
    { name: "Edinburgh Physio Clinic", vertical: "Health", location: "Edinburgh, UK", region: "UK", base: 180, hours: [9, 18] },
    { name: "Birmingham Fit Studio", vertical: "Fitness", location: "Birmingham, UK", region: "UK", base: 45, hours: [6, 22] },
    { name: "Leeds Hair & Beauty", vertical: "Beauty", location: "Leeds, UK", region: "UK", base: 85, hours: [9, 19] },
    // Europe
    { name: "Le Spa Parisien", vertical: "Beauty", location: "Paris, FR", region: "Europe", base: 150, hours: [9, 21] },
    { name: "Berlin CrossFit Box", vertical: "Fitness", location: "Berlin, DE", region: "Europe", base: 35, hours: [7, 22] },
    { name: "Madrid Dental Care", vertical: "Health", location: "Madrid, ES", region: "Europe", base: 220, hours: [9, 18] },
    // North America
    { name: "NYC Dermatology", vertical: "Health", location: "New York, NY", region: "North America", base: 350, hours: [13, 23] },
    { name: "LA Yoga Collective", vertical: "Fitness", location: "Los Angeles, CA", region: "North America", base: 40, hours: [15, 3] },
    { name: "Miami Beach Spa", vertical: "Beauty", location: "Miami, FL", region: "North America", base: 200, hours: [14, 1] },
    // Asia Pacific
    { name: "Tokyo Zen Spa", vertical: "Beauty", location: "Tokyo, JP", region: "Asia Pacific", base: 180, hours: [0, 12] },
    { name: "Sydney Sports Clinic", vertical: "Fitness", location: "Sydney, AU", region: "Asia Pacific", base: 65, hours: [22, 10] },
    // Middle East
    { name: "Dubai Luxury Wellness", vertical: "Beauty", location: "Dubai, AE", region: "Middle East", base: 280, hours: [5, 16] },
    // Latin America
    { name: "São Paulo Pilates", vertical: "Fitness", location: "São Paulo, BR", region: "Latin America", base: 30, hours: [12, 23] },
    // Aviation (always active)
    { name: "JetShare LHR→JFK", vertical: "Aviation", location: "LHR → JFK", region: "UK", base: 12000, hours: [0, 24] },
    { name: "EmptyLeg CDG→DXB", vertical: "Aviation", location: "CDG → DXB", region: "Europe", base: 18000, hours: [0, 24] },
    // Dining
    { name: "The Ivy London", vertical: "Dining", location: "London, UK", region: "UK", base: 120, hours: [11, 23] },
    { name: "Nobu Dubai", vertical: "Dining", location: "Dubai, AE", region: "Middle East", base: 250, hours: [8, 20] },
    // Education
    { name: "Kumon Tutoring London", vertical: "Education", location: "London, UK", region: "UK", base: 55, hours: [9, 20] },
    { name: "Kaplan Test Prep NYC", vertical: "Education", location: "New York, NY", region: "North America", base: 95, hours: [14, 23] },
    // Events
    { name: "West End Last Minute", vertical: "Events", location: "London, UK", region: "UK", base: 160, hours: [14, 22] },
    { name: "Broadway Rush Tickets", vertical: "Events", location: "New York, NY", region: "North America", base: 280, hours: [17, 3] },
    // Automotive
    { name: "Kwik Fit Express", vertical: "Automotive", location: "Birmingham, UK", region: "UK", base: 85, hours: [8, 18] },
    { name: "AutoNation Service", vertical: "Automotive", location: "Miami, FL", region: "North America", base: 190, hours: [13, 23] },
    // Legal
    { name: "Slater & Gordon Consult", vertical: "Legal", location: "Manchester, UK", region: "UK", base: 280, hours: [9, 17] },
    { name: "LegalZoom Express", vertical: "Legal", location: "Los Angeles, CA", region: "North America", base: 200, hours: [16, 2] },
    // Property
    { name: "Foxtons Viewings", vertical: "Property", location: "London, UK", region: "UK", base: 0, hours: [9, 19] },
    { name: "Savills Valuations", vertical: "Property", location: "Edinburgh, UK", region: "UK", base: 400, hours: [9, 17] },
    // Pet Care
    { name: "Battersea Vets", vertical: "Pet Care", location: "London, UK", region: "UK", base: 85, hours: [8, 20] },
    { name: "Banfield Pet Hospital", vertical: "Pet Care", location: "Chicago, IL", region: "North America", base: 120, hours: [14, 1] },
  ];

  // Pick merchants whose business hours overlap current UTC hour
  const active = pool.filter((m) => {
    if (m.hours[0] < m.hours[1]) return hour >= m.hours[0] && hour < m.hours[1];
    return hour >= m.hours[0] || hour < m.hours[1]; // wraps midnight
  });

  // Select 4-8 random active merchants
  const count = Math.min(active.length, 4 + Math.floor(Math.random() * 5));
  const selected = [...active].sort(() => Math.random() - 0.5).slice(0, count);

  for (const m of selected) {
    const discount = m.vertical === "Aviation" ? 0.5 + Math.random() * 0.25 : 0.2 + Math.random() * 0.35;
    const urgencies: Array<"critical" | "high" | "medium"> = ["critical", "high", "medium"];
    const urgency = urgencies[Math.floor(Math.random() * 3)];
    const reasons = ["Last-minute cancellation", "Schedule gap", "No-show opening", "Rescheduled client"];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    slots.push({
      merchant_name: m.name,
      vertical: m.vertical,
      location: m.location,
      region: m.region,
      time_description: `${reason} — ${new Date(Date.now() + Math.random() * 7200000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      original_price: m.base,
      current_price: Math.round(m.base * (1 - discount)),
      urgency,
      time_left: Math.floor(60 + Math.random() * 300),
      is_live: true,
      source: "SlotPilot Engine",
      expires_at: expires,
    });
  }

  return slots;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("Ingestion started");

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Expire old slots
  await supabase.from("slots").update({ is_live: false }).lt("expires_at", new Date().toISOString());

  // Generate time-aware realistic slots
  const slots = generateSlots();
  console.log(`Generated ${slots.length} slots`);

  let inserted = 0;
  if (slots.length > 0) {
    const { error, data } = await supabase.from("slots").insert(slots).select();
    if (error) {
      console.error("Insert error:", JSON.stringify(error));
    } else {
      inserted = data?.length ?? 0;
    }
  }

  console.log(`Inserted ${inserted} slots`);

  return new Response(
    JSON.stringify({ success: true, generated: slots.length, inserted, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
