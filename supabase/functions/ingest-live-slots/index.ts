import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.0/cors";

const WEATHER_CITIES = [
  { name: "London, UK", region: "UK", lat: 51.51, lon: -0.13 },
  { name: "Manchester, UK", region: "UK", lat: 53.48, lon: -2.24 },
  { name: "New York, NY", region: "North America", lat: 40.71, lon: -74.01 },
  { name: "Paris, FR", region: "Europe", lat: 48.86, lon: 2.35 },
  { name: "Tokyo, JP", region: "Asia Pacific", lat: 35.68, lon: 139.69 },
  { name: "Dubai, AE", region: "Middle East", lat: 25.28, lon: 55.30 },
  { name: "Sydney, AU", region: "Asia Pacific", lat: -33.87, lon: 151.21 },
  { name: "Berlin, DE", region: "Europe", lat: 52.52, lon: 13.41 },
];

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

async function fetchWithTimeout(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWeatherSlots(): Promise<SlotRow[]> {
  const slots: SlotRow[] = [];
  const selected = [...WEATHER_CITIES].sort(() => Math.random() - 0.5).slice(0, 3);

  for (const city of selected) {
    try {
      const res = await fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m`
      );
      if (!res.ok) { await res.text(); continue; }
      const data = await res.json();
      const code = data.current.weather_code;
      const temp = data.current.temperature_2m;

      // Generate slot for any weather condition (weather data is always interesting)
      const merchants = [
        { name: `Wellness Studio ${city.name.split(",")[0]}`, vertical: "Beauty", base: 120 },
        { name: `${city.name.split(",")[0]} Day Spa`, vertical: "Beauty", base: 180 },
        { name: `FitLife ${city.name.split(",")[0]}`, vertical: "Fitness", base: 45 },
      ];
      const m = merchants[Math.floor(Math.random() * merchants.length)];
      const isBadWeather = code >= 51;
      const discount = isBadWeather ? 0.45 + Math.random() * 0.2 : 0.2 + Math.random() * 0.15;
      const weatherDesc = code >= 80 ? "Storm" : code >= 71 ? "Snow" : code >= 51 ? "Rain" : code >= 45 ? "Fog" : `${temp.toFixed(0)}°C`;

      slots.push({
        merchant_name: m.name,
        vertical: m.vertical,
        location: city.name,
        region: city.region,
        time_description: `Weather: ${weatherDesc} — cancellation slot`,
        original_price: m.base,
        current_price: Math.round(m.base * (1 - discount)),
        urgency: isBadWeather ? "critical" : code >= 45 ? "high" : "medium",
        time_left: Math.floor(60 + Math.random() * 300),
        is_live: true,
        source: "Open-Meteo Weather",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      });
    } catch (e) {
      console.warn(`Weather fetch failed for ${city.name}:`, e);
    }
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

  // Fetch weather slots (OpenSky often rate-limits, so we focus on weather)
  const slots = await fetchWeatherSlots();

  console.log(`Fetched ${slots.length} slots from APIs`);

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
    JSON.stringify({ success: true, fetched: slots.length, inserted, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
