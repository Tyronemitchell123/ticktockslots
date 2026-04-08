import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, CreditCard, Crown, Loader2, ExternalLink, RefreshCw, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const Billing = () => {
  const navigate = useNavigate();
  const { user, subscribed, subscriptionEnd, subscriptionLoading, checkSubscription } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to open billing portal. Please try again.");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12 pt-24">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
            <p className="text-sm text-muted-foreground">Manage your plan, payment methods, and invoices</p>
          </div>
        </div>

        {/* Current Plan */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => checkSubscription()}
              disabled={subscriptionLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${subscriptionLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {subscriptionLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking subscription status…
            </div>
          ) : subscribed ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-secondary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">Premium</span>
                    <Badge className="bg-secondary/10 text-secondary border-secondary/30">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">$9.99/month — priority access, reduced fees, AI insights</p>
                </div>
              </div>

              {subscriptionEnd && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="w-4 h-4" />
                  Next billing date: {new Date(subscriptionEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}

              <Button
                variant="outline"
                className="w-full py-5 rounded-xl"
                onClick={handleManageSubscription}
                disabled={portalLoading}
              >
                {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                Manage Subscription & Payment Methods
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-foreground">Explorer</span>
                    <Badge variant="outline">Free</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Basic access with delayed notifications</p>
                </div>
              </div>

              <div className="glass rounded-xl p-4 border-primary/30">
                <h3 className="text-sm font-semibold text-foreground mb-2">Upgrade to Premium — $9.99/mo</h3>
                <ul className="text-xs text-muted-foreground space-y-1 mb-4">
                  <li>✓ Instant push notifications (T+0)</li>
                  <li>✓ Reduced booking fees</li>
                  <li>✓ "Perfect Afternoon" auto-bundles</li>
                  <li>✓ Priority Trust Score boost</li>
                  <li>✓ Exclusive Unicorn Slots</li>
                </ul>
                <Button
                  variant="hero"
                  className="w-full py-5 rounded-xl"
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                  Upgrade to Premium
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Billing Info */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Account Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Member since</span>
              <span className="text-foreground font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods & Invoices via Portal */}
        {subscribed && (
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Payment Methods & Invoices</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Update your card, view past invoices, or cancel your subscription through the secure billing portal.
            </p>
            <Button
              variant="outline"
              className="w-full py-5 rounded-xl"
              onClick={handleManageSubscription}
              disabled={portalLoading}
            >
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
              Open Billing Portal
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Billing;
