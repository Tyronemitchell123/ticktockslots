// Demo API Key Management System
export interface ApiKey {
  id: string;
  key: string;
  name: string;
  tier: "free" | "premium" | "enterprise";
  createdAt: Date;
  lastUsed: Date | null;
  requestsToday: number;
  requestsLimit: number;
  active: boolean;
}

const STORAGE_KEY = "slotengine_api_keys";

function generateKey(tier: string): string {
  const prefix = tier === "free" ? "se_free" : tier === "premium" ? "se_prem" : "se_ent";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = `${prefix}_`;
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

const tierLimits = { free: 100, premium: 10000, enterprise: 100000 };

export function getApiKeys(): ApiKey[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map((k: ApiKey) => ({ ...k, createdAt: new Date(k.createdAt), lastUsed: k.lastUsed ? new Date(k.lastUsed) : null }));
  } catch {}
  return [];
}

export function createApiKey(name: string, tier: "free" | "premium" | "enterprise" = "free"): ApiKey {
  const keys = getApiKeys();
  const newKey: ApiKey = {
    id: crypto.randomUUID(),
    key: generateKey(tier),
    name,
    tier,
    createdAt: new Date(),
    lastUsed: null,
    requestsToday: 0,
    requestsLimit: tierLimits[tier],
    active: true,
  };
  keys.push(newKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  return newKey;
}

export function revokeApiKey(id: string) {
  const keys = getApiKeys().map((k) => k.id === id ? { ...k, active: false } : k);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function deleteApiKey(id: string) {
  const keys = getApiKeys().filter((k) => k.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}
