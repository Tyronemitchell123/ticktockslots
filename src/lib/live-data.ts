// Live Data Service — fetches real data from free public APIs (no API keys required)

export interface LiveSlot {
  id: string;
  merchant: string;
  vertical: string;
  location: string;
  region: string;
  time: string;
  originalPrice: number;
  currentPrice: number;
  urgency: "critical" | "high" | "medium";
  timeLeft: number;
  isLive: true;
  source: string;
}

// ========== OPEN-METEO: Weather-driven wellness/beauty cancellations ==========

interface WeatherData {
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

const WEATHER_CITIES = [
  { name: "London, UK", region: "UK", lat: 51.51, lon: -0.13 },
  { name: "New York, NY", region: "North America", lat: 40.71, lon: -74.01 },
  { name: "Paris, FR", region: "Europe", lat: 48.86, lon: 2.35 },
  { name: "Tokyo, JP", region: "Asia Pacific", lat: 35.68, lon: 139.69 },
  { name: "Dubai, AE", region: "Middle East", lat: 25.28, lon: 55.30 },
  { name: "São Paulo, BR", region: "Latin America", lat: -23.55, lon: -46.63 },
  { name: "Cape Town, ZA", region: "Africa", lat: -33.93, lon: 18.42 },
  { name: "Sydney, AU", region: "Asia Pacific", lat: -33.87, lon: 151.21 },
  { name: "Manchester, UK", region: "UK", lat: 53.48, lon: -2.24 },
  { name: "Berlin, DE", region: "Europe", lat: 52.52, lon: 13.41 },
];

// Weather codes: 0-3 clear, 45-48 fog, 51-67 rain, 71-77 snow, 80+ showers/storms
const weatherToSlot = (city: typeof WEATHER_CITIES[0], weather: WeatherData): LiveSlot | null => {
  const code = weather.current.weather_code;
  const temp = weather.current.temperature_2m;
  const isBadWeather = code >= 51; // rain, snow, storms
  const isExtreme = temp > 38 || temp < -5;

  if (!isBadWeather && !isExtreme) return null;

  const merchants = [
    { name: `Wellness Studio ${city.name.split(",")[0]}`, vertical: "Beauty", base: 120 },
    { name: `${city.name.split(",")[0]} Day Spa`, vertical: "Beauty", base: 180 },
    { name: `FitLife ${city.name.split(",")[0]}`, vertical: "Fitness", base: 45 },
    { name: `Dr. Weather Cancel ${city.name.split(",")[0]}`, vertical: "Health", base: 280 },
  ];
  const m = merchants[Math.floor(Math.random() * merchants.length)];
  const discount = isBadWeather ? 0.45 + Math.random() * 0.2 : 0.3 + Math.random() * 0.15;

  const weatherDesc = code >= 80 ? "Storm" : code >= 71 ? "Snow" : code >= 51 ? "Rain" : isExtreme ? "Extreme temp" : "Bad weather";

  return {
    id: `weather-${city.name}-${Date.now()}`,
    merchant: m.name,
    vertical: m.vertical,
    location: city.name,
    region: city.region,
    time: `${weatherDesc} cancellation — ${temp.toFixed(0)}°C`,
    originalPrice: m.base,
    currentPrice: Math.round(m.base * (1 - discount)),
    urgency: code >= 80 ? "critical" : code >= 61 ? "high" : "medium",
    timeLeft: Math.floor(60 + Math.random() * 300),
    isLive: true,
    source: "Open-Meteo Weather",
  };
};

export async function fetchWeatherSlots(): Promise<LiveSlot[]> {
  const slots: LiveSlot[] = [];
  try {
    // Batch 3 random cities per call to avoid hammering the API
    const selected = [...WEATHER_CITIES].sort(() => Math.random() - 0.5).slice(0, 3);
    const promises = selected.map(async (city) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m`
      );
      if (!res.ok) return null;
      const data: WeatherData = await res.json();
      return weatherToSlot(city, data);
    });
    const results = await Promise.allSettled(promises);
    results.forEach((r) => {
      if (r.status === "fulfilled" && r.value) slots.push(r.value);
    });
  } catch (e) {
    console.warn("Weather API error:", e);
  }
  return slots;
}

// ========== OPENSKY: Real flights for aviation empty-leg slots ==========

interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  longitude: number | null;
  latitude: number | null;
  geo_altitude: number | null;
  velocity: number | null;
  on_ground: boolean;
}

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

export async function fetchFlightSlots(): Promise<LiveSlot[]> {
  const slots: LiveSlot[] = [];
  try {
    // Fetch flights over Europe (most active, reliable coverage)
    const res = await fetch(
      "https://opensky-network.org/api/states/all?lamin=45&lamax=55&lomin=-5&lomax=15"
    );
    if (!res.ok) return slots;
    const data = await res.json();
    if (!data.states) return slots;

    // Pick up to 4 random airborne flights
    const airborne = (data.states as unknown[][])
      .filter((s) => !s[8] && s[1] && s[2]) // not on ground, has callsign & country
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    airborne.forEach((state, i) => {
      const callsign = (state[1] as string).trim();
      const country = state[2] as string;
      const altitude = state[13] as number | null;
      const velocity = state[9] as number | null;
      const code = AIRPORT_CODES[country] || country.slice(0, 2).toUpperCase();
      const destinations = ["LHR", "CDG", "JFK", "DXB", "NRT", "SFO", "MIA", "FCO"];
      const dest = destinations[Math.floor(Math.random() * destinations.length)];
      const basePrice = 8000 + Math.floor(Math.random() * 18000);
      const discount = 0.5 + Math.random() * 0.25;

      slots.push({
        id: `flight-${callsign}-${Date.now()}-${i}`,
        merchant: `${callsign} Empty Leg`,
        vertical: "Aviation",
        location: `${code} → ${dest}`,
        region: countryToRegion(country),
        time: `Live — ${altitude ? Math.round(altitude).toLocaleString() + "ft" : "Airborne"} · ${velocity ? Math.round(velocity * 3.6) + "km/h" : ""}`,
        originalPrice: basePrice,
        currentPrice: Math.round(basePrice * (1 - discount)),
        urgency: Math.random() > 0.5 ? "critical" : "high",
        timeLeft: Math.floor(30 + Math.random() * 180),
        isLive: true,
        source: "OpenSky Network",
      });
    });
  } catch (e) {
    console.warn("OpenSky API error:", e);
  }
  return slots;
}

// ========== COMBINED: Fetch all live data ==========

export async function fetchAllLiveSlots(): Promise<LiveSlot[]> {
  const [weather, flights] = await Promise.allSettled([
    fetchWeatherSlots(),
    fetchFlightSlots(),
  ]);

  const slots: LiveSlot[] = [];
  if (weather.status === "fulfilled") slots.push(...weather.value);
  if (flights.status === "fulfilled") slots.push(...flights.value);
  return slots;
}
