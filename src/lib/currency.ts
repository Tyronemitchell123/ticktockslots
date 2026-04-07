// Currency system with real-time-ish exchange rates and region detection

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
];

// Base rates vs USD (approximate)
const BASE_RATES: Record<string, number> = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  JPY: 149.5,
  AED: 3.67,
  AUD: 1.53,
  BRL: 4.97,
  ZAR: 18.2,
  SGD: 1.34,
  CAD: 1.36,
  CHF: 0.88,
};

// Map region to default currency
const REGION_CURRENCY: Record<string, string> = {
  "North America": "USD",
  "UK": "GBP",
  "Europe": "EUR",
  "Asia Pacific": "JPY",
  "Middle East": "AED",
  "Latin America": "BRL",
  "Africa": "ZAR",
};

// Map specific location patterns to currencies
const LOCATION_CURRENCY: Array<{ pattern: string; currency: string }> = [
  { pattern: "UK", currency: "GBP" },
  { pattern: "London", currency: "GBP" },
  { pattern: "Manchester", currency: "GBP" },
  { pattern: "Birmingham", currency: "GBP" },
  { pattern: "Edinburgh", currency: "GBP" },
  { pattern: "Leeds", currency: "GBP" },
  { pattern: "Liverpool", currency: "GBP" },
  { pattern: "Glasgow", currency: "GBP" },
  { pattern: "Bristol", currency: "GBP" },
  { pattern: ", NY", currency: "USD" },
  { pattern: ", CA", currency: "USD" },
  { pattern: ", FL", currency: "USD" },
  { pattern: "NY", currency: "USD" },
  { pattern: ", FR", currency: "EUR" },
  { pattern: ", DE", currency: "EUR" },
  { pattern: ", ES", currency: "EUR" },
  { pattern: ", IT", currency: "EUR" },
  { pattern: ", NL", currency: "EUR" },
  { pattern: ", DK", currency: "EUR" },  // close enough
  { pattern: ", JP", currency: "JPY" },
  { pattern: ", AU", currency: "AUD" },
  { pattern: ", AE", currency: "AED" },
  { pattern: ", BR", currency: "BRL" },
  { pattern: ", ZA", currency: "ZAR" },
  { pattern: ", SG", currency: "SGD" },
  { pattern: ", CA", currency: "CAD" },
  { pattern: ", CH", currency: "CHF" },
  { pattern: "HK", currency: "USD" }, // HKD ≈ USD for display
  { pattern: "DXB", currency: "AED" },
  { pattern: "LHR", currency: "GBP" },
  { pattern: "CDG", currency: "EUR" },
  { pattern: "JFK", currency: "USD" },
  { pattern: "NRT", currency: "JPY" },
  { pattern: "SFO", currency: "USD" },
  { pattern: "MIA", currency: "USD" },
  { pattern: "FCO", currency: "EUR" },
  { pattern: "TEB", currency: "USD" },
];

/**
 * Detect the native currency for a slot based on its location and region.
 * Prices in the DB are stored in the slot's native currency.
 */
export function detectCurrency(location: string, region: string): string {
  // Check specific location patterns first
  for (const { pattern, currency } of LOCATION_CURRENCY) {
    if (location.includes(pattern)) return currency;
  }
  // Fall back to region
  return REGION_CURRENCY[region] || "USD";
}

/**
 * Convert an amount from one currency to another.
 */
export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const fromRate = BASE_RATES[from] || 1;
  const toRate = BASE_RATES[to] || 1;
  // Convert to USD first, then to target
  const usd = amount / fromRate;
  return usd * toRate;
}

/**
 * Format a price with the correct currency symbol.
 * Uses native locale formatting for proper decimal/grouping.
 */
export function formatPrice(amount: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return `$${amount.toLocaleString()}`;

  // JPY has no decimals
  const decimals = currencyCode === "JPY" ? 0 : amount >= 1000 ? 0 : 2;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Format price in a display currency (converting if needed).
 */
export function formatPriceInCurrency(
  amount: number,
  nativeCurrency: string,
  displayCurrency: string
): string {
  const converted = convertCurrency(amount, nativeCurrency, displayCurrency);
  return formatPrice(converted, displayCurrency);
}
