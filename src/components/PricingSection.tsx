import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    description: "Priority access to every cancellation",
    icon: Crown,
    features: [
      "Instant push notifications (T+0)",
      "Reduced booking fees",
      "\"Perfect Afternoon\" auto-bundles",
      "Priority Trust Score boost",
      "Exclusive Unicorn Slots",
    ],
    cta: "Start Free Trial",
    variant: "hero" as const,
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
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
    cta: "Contact Sales",
    variant: "gold" as const,
    highlight: false,
  },
];

const PricingSection = () => {
  const { user, subscribed } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
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

  const handleTierClick = (tierName: string) => {
    if (tierName === "Enterprise") {
      navigate("/contact");
    } else if (tierName === "Premium") {
      if (subscribed) {
        handleManageSubscription();
      } else {
        handleCheckout();
      }
    } else {
      navigate("/auth");
    }
  };

  return (
    <section id="pricing" className="relative py-24 px-4 overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1920&q=80"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, <span className="gradient-text-blue">Transparent</span> Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pay for priority. Everyone saves.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`glass rounded-2xl p-8 relative ${tier.highlight ? "border-primary/50 glow-blue scale-105" : ""} transition-all`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                    {subscribed ? "Your Plan" : "Most Popular"}
                  </span>
                </div>
              )}

              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <tier.icon className="w-6 h-6 text-primary" />
              </div>

              <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-black text-foreground">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
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
                disabled={tier.name === "Premium" && checkoutLoading}
                onClick={() => handleTierClick(tier.name)}
              >
                {tier.name === "Premium" && checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {tier.name === "Premium" && subscribed ? "Manage Subscription" : tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
