import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2, Loader2, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { TIERS } from "@/lib/subscription-tiers";

const tiers = [
  {
    name: "Explorer",
    price: "Free",
    description: "Browse & claim from the public feed",
    icon: Zap,
    features: [
      "Access slots after 15-min delay",
      "Standard booking fees",
      "Basic Trust Score",
      "Email notifications",
    ],
    cta: "Get Started",
    variant: "outline" as const,
    highlight: false,
    priceId: null,
    tierKey: null,
  },
  {
    name: "Basic",
    price: "$4.99",
    period: "/mo",
    description: "Faster access with reduced fees",
    icon: Star,
    features: [
      "5-minute early access (T+5)",
      "Reduced booking fees",
      "Enhanced Trust Score",
      "Push notifications",
      "Holiday deals access",
    ],
    cta: "Subscribe",
    variant: "outline" as const,
    highlight: false,
    priceId: TIERS.basic.price_id,
    tierKey: "basic" as const,
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    annualPrice: "$99",
    annualPeriod: "/yr",
    description: "Priority access to every cancellation",
    icon: Crown,
    features: [
      "Instant push notifications (T+0)",
      "Reduced booking fees",
      "\"Perfect Afternoon\" auto-bundles",
      "Priority Trust Score boost",
      "Exclusive Unicorn Slots",
      "Premium Holiday steals",
    ],
    cta: "Start Free Trial",
    variant: "hero" as const,
    highlight: true,
    priceId: TIERS.premium.price_id,
    annualPriceId: TIERS.premium_annual.price_id,
    tierKey: "premium" as const,
  },
  {
    name: "Enterprise",
    price: "$49.99",
    period: "/mo",
    description: "For logistics, aviation & fleet operators",
    icon: Building2,
    features: [
      "API & webhook access",
      "Slot Swap trading desk",
      "Smart Escrow for high-value transactions",
      "Dedicated account manager",
      "Custom ESG reporting",
      "SLA-backed uptime",
    ],
    cta: "Subscribe",
    variant: "gold" as const,
    highlight: false,
    priceId: TIERS.enterprise.price_id,
    tierKey: "enterprise" as const,
  },
];

const PricingSection = () => {
  const { user, subscribed, subscriptionTier } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [annual, setAnnual] = useState(false);

  const handleCheckout = async (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to open subscription management.");
    }
  };

  const handleTierClick = (tier: typeof tiers[number]) => {
    if (!tier.priceId) {
      navigate("/auth");
      return;
    }
    if (subscribed && subscriptionTier === tier.tierKey) {
      handleManageSubscription();
      return;
    }
    const pid = annual && "annualPriceId" in tier && tier.annualPriceId
      ? tier.annualPriceId
      : tier.priceId;
    handleCheckout(pid);
  };

  const isCurrentPlan = (tier: typeof tiers[number]) =>
    subscribed && subscriptionTier === tier.tierKey;

  return (
    <section id="pricing" className="relative py-24 px-4 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1920&q=80"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, <span className="gradient-text-blue">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-6">
            Pay for priority. Everyone saves.
          </p>

          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 glass rounded-full px-4 py-2">
            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background transition-transform ${annual ? "translate-x-6" : ""}`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual <span className="text-primary text-xs">Save 17%</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {tiers.map((tier, i) => {
            const current = isCurrentPlan(tier);
            return (
              <div
                key={i}
                className={`glass rounded-2xl p-8 relative ${tier.highlight ? "border-primary/50 glow-blue lg:scale-105" : ""} transition-all`}
              >
                {(tier.highlight || current) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                      {current ? "Your Plan" : "Most Popular"}
                    </span>
                  </div>
                )}

                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <tier.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{tier.description}</p>

                <div className="mb-6">
                  {annual && "annualPrice" in tier && tier.annualPrice ? (
                    <>
                      <span className="text-4xl font-black text-foreground">{tier.annualPrice}</span>
                      <span className="text-muted-foreground">{tier.annualPeriod}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black text-foreground">{tier.price}</span>
                      {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                    </>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={tier.variant}
                  className="w-full rounded-xl py-5"
                  disabled={checkoutLoading !== null}
                  onClick={() => handleTierClick(tier)}
                >
                  {checkoutLoading === tier.priceId ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {current ? "Manage Subscription" : tier.cta}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
