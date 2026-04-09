import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import {
  TrendingUp, Clock, Shield, CreditCard, BarChart3, Users,
  ArrowRight, CheckCircle2, Zap, Store,
} from "lucide-react";

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Recover Lost Revenue",
    description: "Turn last-minute cancellations into instant income instead of empty time slots costing you money.",
  },
  {
    icon: Clock,
    title: "Fill Slots in Seconds",
    description: "Our real-time marketplace connects your available slots with thousands of deal-hungry consumers.",
  },
  {
    icon: Users,
    title: "Reach New Customers",
    description: "Expose your business to a fresh audience who discover you through discounted first visits — then return at full price.",
  },
  {
    icon: Shield,
    title: "Trust Score System",
    description: "Our built-in trust scoring reduces no-shows and protects your business from unreliable bookings.",
  },
  {
    icon: CreditCard,
    title: "Upfront Payments",
    description: "Customers pay at the time of booking. No invoicing, no chasing — money hits your Stripe account automatically.",
  },
  {
    icon: BarChart3,
    title: "Revenue Dashboard",
    description: "Track earnings, slot fill rates, and commission breakdowns in a dedicated merchant analytics panel.",
  },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Register Your Business", desc: "Create your merchant profile and connect your Stripe account in under 5 minutes." },
  { step: "2", title: "Post Cancelled Slots", desc: "List any last-minute availability with your preferred discount percentage." },
  { step: "3", title: "Get Paid Instantly", desc: "Customers claim and pay upfront. You receive 70% of each sale automatically." },
];

const PRICING_FEATURES = [
  "No monthly fees or subscriptions",
  "No setup costs",
  "Only pay when a slot is claimed",
  "70/30 revenue split (you keep 70%)",
  "Instant payouts via Stripe Connect",
  "Cancel or pause anytime",
];

const ForBusiness = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="For Businesses — TickTock Slots"
        description="Turn cancelled appointments into revenue. Join TickTock Slots and fill last-minute availability with paying customers."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Store className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">For Businesses</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-tight tracking-tight">
            Stop Losing Money on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Empty Slots
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Every cancelled appointment is lost revenue. TickTock Slots fills your last-minute availability
            with paying customers — automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="hero"
              size="lg"
              className="text-base px-8 py-6 rounded-xl"
              onClick={() => navigate("/merchant/register")}
            >
              <Zap className="w-5 h-5" />
              Register Your Business
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-xl border-border/50"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-primary uppercase tracking-widest font-medium mb-3">Why Join</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything you need to fill empty slots
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-primary uppercase tracking-widest font-medium mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Live in 5 minutes
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm text-primary uppercase tracking-widest font-medium mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Zero upfront cost. Pay only when you earn.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              We only make money when you make money. Simple as that.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-card p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-5xl md:text-6xl font-black text-foreground">
                70<span className="text-primary">%</span>
              </div>
              <p className="text-muted-foreground mt-2 text-lg">You keep 70% of every sale</p>
              <p className="text-sm text-muted-foreground mt-1">30% platform fee covers payment processing, marketing, and support</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {PRICING_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="hero"
                size="lg"
                className="text-base px-10 py-6 rounded-xl"
                onClick={() => navigate("/merchant/register")}
              >
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to stop losing money?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join hundreds of businesses already recovering revenue from cancelled appointments.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="text-base px-10 py-6 rounded-xl"
            onClick={() => navigate("/merchant/register")}
          >
            Register Your Business
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForBusiness;
