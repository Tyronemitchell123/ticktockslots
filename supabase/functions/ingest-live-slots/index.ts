import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.0/cors";

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

const WEATHER_CITIES = [
  { name: "London, UK", region: "UK", lat: 51.51, lon: -0.13 },
  { name: "Manchester, UK", region: "UK", lat: 53.48, lon: -2.24 },
  { name: "Birmingham, UK", region: "UK", lat: 52.49, lon: -1.89 },
  { name: "Edinburgh, UK", region: "UK", lat: 55.95, lon: -3.19 },
  { name: "New York, NY", region: "North America", lat: 40.71, lon: -74.01 },
  { name: "Paris, FR", region: "Europe", lat: 48.86, lon: 2.35 },
  { name: "Tokyo, JP", region: "Asia Pacific", lat: 35.68, lon: 139.69 },
  { name: "Dubai, AE", region: "Middle East", lat: 25.28, lon: 55.30 },
  { name: "São Paulo, BR", region: "Latin America", lat: -23.55, lon: -46.63 },
  { name: "Cape Town, ZA", region: "Africa", lat: -33.93, lon: 18.42 },
  { name: "Sydney, AU", region: "Asia Pacific", lat: -33.87, lon: 151.21 },
  { name: "Berlin, DE", region: "Europe", lat: 52.52, lon: 13.41 },
];

const AIRPORT_CODES: Record<string, string> = {
  "United States": "US", "United Kingdom": "UK", "France": "FR", "Germany": "DE",
  "Japan": "JP", "Australia": "AU", "Canada": "CA", "Switzerland": "CH",
  "Netherlands": "NL", "Spain": "ES", "Italy": "IT", "Brazil": "BR",
  "United Arab Emirates": "AE", "Singapore": "SG", "South Korea": "KR",
};

const countryToRegion = (country: string): string => {
  if (["United States", "Canada"].includes(country)) return "North America";
  if (["United Kingdom"].includes(country)) return "UK";
  if (["France", "Germany", "Netherlands", "Spain", "Italy", "Switzerland"].includes(country)) return "Europe";
  if (["Japan", "Australia", "Singapore", "South Korea", "China"].includes(country)) return "Asia Pacific";
  if (["United Arab Emirates", "Saudi Arabia", "Qatar"].includes(country)) return "Middle East";
  if (["Brazil", "Argentina", "Mexico", "Colombia"].includes(country)) return "Latin America";
  if (["South Africa", "Kenya", "Nigeria"].includes(country)) return "Africa";
  return "Europe";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const slots: Array<{
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
  }> = [];

  // 1) Weather-driven slots
  try {
    const selected = [...WEATHER_CITIES].sort(() => Math.random() - 0.5).slice(0, 4);
    const weatherPromises = selected.map(async (city) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m`
      );
      if (!res.ok) { await res.text(); return null; }
      const data: WeatherData = await res.json();
      const code = data.current.weather_code;
      const temp = data.current.temperature_2m;
      const isBadWeather = code >= 51;
      const isExtreme = temp > 38 || temp < -5;

      if (!isBadWeather && !isExtreme) return null;

      const merchants = [
        { name: `Wellness Studio ${city.name.split(",")[0]}`, vertical: "Beauty", base: 120 },
        { name: `${city.name.split(",")[0]} Day Spa`, vertical: "Beauty", base: 180 },
        { name: `FitLife ${city.name.split(",")[0]}`, vertical: "Fitness", base: 45 },
        { name: `Dr. Cancel ${city.name.split(",")[0]}`, vertical: "Health", base: 280 },
      ];
      const m = merchants[Math.floor(Math.random() * merchants.length)];
      const discount = isBadWeather ? 0.45 + Math.random() * 0.2 : 0.3 + Math.random() * 0.15;
      const weatherDesc = code >= 80 ? "Storm" : code >= 71 ? "Snow" : code >= 51 ? "Rain" : "Extreme temp";

      return {
        merchant_name: m.name,
        vertical: m.vertical,
        location: city.name,
        region: city.region,
        time_description: `${weatherDesc} cancellation — ${temp.toFixed(0)}°C`,
        original_price: m.base,
        current_price: Math.round(m.base * (1 - discount)),
        urgency: code >= 80 ? "critical" : code >= 61 ? "high" : "medium",
        time_left: Math.floor(60 + Math.random() * 300),
        is_live: true,
        source: "Open-Meteo Weather",
        expires_at: new Date(Date.now() + 3600000).toISOString(),
      };
    });
    const results = await Promise.allSettled(weatherPromises);
    for (const r of results) {
      if (r.status === "fulfilled" && r.value) slots.push(r.value);
    }
  } catch (e) {
    console.warn("Weather fetch error:", e);
  }

  // 2) Flight-based slots
  try {
    const res = await fetch(
      "https://opensky-network.org/api/states/all?lamin=45&lamax=55&lomin=-5&lomax=15"
    );
    if (res.ok) {
      const data = await res.json();
      if (data.states) {
        const airborne = (data.states as unknown[][])
          .filter((s) => !s[8] && s[1] && s[2])
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);

        const destinations = ["LHR", "CDG", "JFK", "DXB", "NRT", "SFO", "MIA", "FCO"];
        for (const state of airborne) {
          const callsign = (state[1] as string).trim();
          const country = state[2] as string;
          const altitude = state[13] as number | null;
          const velocity = state[9] as number | null;
          const code = AIRPORT_CODES[country] || country.slice(0, 2).toUpperCase();
          const dest = destinations[Math.floor(Math.random() * destinations.length)];
          const basePrice = 8000 + Math.floor(Math.random() * 18000);
          const discount = 0.5 + Math.random() * 0.25;

          slots.push({
            merchant_name: `${callsign} Empty Leg`,
            vertical: "Aviation",
            location: `${code} → ${dest}`,
            region: countryToRegion(country),
            time_description: `Live — ${altitude ? Math.round(altitude).toLocaleString() + "ft" : "Airborne"} · ${velocity ? Math.round(velocity * 3.6) + "km/h" : ""}`,
            original_price: basePrice,
            current_price: Math.round(basePrice * (1 - discount)),
            urgency: Math.random() > 0.5 ? "critical" : "high",
            time_left: Math.floor(30 + Math.random() * 180),
            is_live: true,
            source: "OpenSky Network",
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          });
        }
      }
    } else {
      await res.text();
    }
  } catch (e) {
    console.warn("OpenSky fetch error:", e);
  }

  // 3) Mark old live slots as expired, then insert new ones
  await supabase
    .from("slots")
    .update({ is_live: false })
    .lt("expires_at", new Date().toISOString());

  let inserted = 0;
  if (slots.length > 0) {
    const { error, data } = await supabase.from("slots").insert(slots).select();
    if (error) {
      console.error("Insert error:", error);
    } else {
      inserted = data?.length ?? 0;
    }
  }

  return new Response(
    JSON.stringify({ success: true, fetched: slots.length, inserted, timestamp: new Date().toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
});
