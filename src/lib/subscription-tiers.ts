// Stripe product & price mapping for all subscription tiers
export const TIERS = {
  basic: {
    product_id: "prod_UIdCcTO8mnHZRz",
    price_id: "price_1TK1w5Lc6GfbZtLI0TgcaD3d",
    name: "Basic",
    price: "$4.99",
    period: "/mo",
  },
  premium: {
    product_id: "prod_UIdBBDQKQQctKl",
    price_id: "price_1TK1ewLc6GfbZtLILli58Oja",
    name: "Premium",
    price: "$9.99",
    period: "/mo",
  },
  premium_annual: {
    product_id: "prod_UIdDsmw9ltoGDS",
    price_id: "price_1TK1xFLc6GfbZtLI1sUoI16j",
    name: "Premium Annual",
    price: "$99",
    period: "/yr",
  },
  enterprise: {
    product_id: "prod_UIdD3v5wOkTb7s",
    price_id: "price_1TK1wtLc6GfbZtLIXW7gotda",
    name: "Enterprise",
    price: "$49.99",
    period: "/mo",
  },
} as const;

export type TierKey = keyof typeof TIERS;

export function getTierByProductId(productId: string): TierKey | null {
  for (const [key, tier] of Object.entries(TIERS)) {
    if (tier.product_id === productId) return key as TierKey;
  }
  return null;
}
