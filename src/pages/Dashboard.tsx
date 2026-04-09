import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedSlots } from "@/hooks/use-saved-slots";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingBag, TrendingDown, Shield, Heart, Clock, MapPin,
  CheckCircle2, XCircle, AlertTriangle, ArrowRight, CreditCard
} from "lucide-react";
import { formatPrice } from "@/lib/currency";

interface Booking {
  id: string;
  status: string;
  paid_amount: number | null;
  paid_upfront: boolean;
  created_at: string;
  slot: {
    merchant_name: string;
    vertical: string;
    location: string;
    original_price: number;
    current_price: number;
  } | null;
}

interface TrustScore {
  score: number;
  total_bookings: number;
  completed_bookings: number;
  cancellations: number;
  no_shows: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedSlots, loading: savedLoading } = useSavedSlots();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trust, setTrust] = useState<TrustScore | null>(null);
  const [loading, setLoading] = useState(true);
  const currency = detectCurrency();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [bookingsRes, trustRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, status, paid_amount, paid_upfront, created_at, slot:slots(merchant_name, vertical, location, original_price, current_price)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("user_trust_scores")
          .select("score, total_bookings, completed_bookings, cancellations, no_shows")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);
      if (bookingsRes.data) setBookings(bookingsRes.data as any);
      if (trustRes.data) setTrust(trustRes.data);
      setLoading(false);
    };
    load();
  }, [user]);

  const totalSavings = bookings.reduce((sum, b) => {
    if (!b.slot) return sum;
    return sum + (b.slot.original_price - b.slot.current_price);
  }, 0);

  const statusIcon = (status: string) => {
    switch (status) {
      case "confirmed": case "paid": case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-destructive" />;
      case "no_show": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const trustColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-12 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your bookings, savings and reputation.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingDown className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{formatPriceInCurrency(totalSavings, currency)}</p>
              <p className="text-xs text-muted-foreground">Total Saved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className={`w-8 h-8 mx-auto mb-2 ${trust ? trustColor(trust.score) : "text-muted-foreground"}`} />
              <p className={`text-2xl font-bold ${trust ? trustColor(trust.score) : "text-foreground"}`}>
                {trust ? trust.score : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Trust Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="w-8 h-8 mx-auto text-rose-500 mb-2" />
              <p className="text-2xl font-bold text-foreground">{savedSlots.length}</p>
              <p className="text-xs text-muted-foreground">Saved Slots</p>
            </CardContent>
          </Card>
        </div>

        {/* Trust breakdown */}
        {trust && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Trust Score Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <p className="text-xl font-bold text-foreground">{trust.completed_bookings}</p>
                  <p className="text-muted-foreground">Completed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{trust.total_bookings}</p>
                  <p className="text-muted-foreground">Total</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-500">{trust.cancellations}</p>
                  <p className="text-muted-foreground">Cancellations</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive">{trust.no_shows}</p>
                  <p className="text-muted-foreground">No Shows</p>
                </div>
              </div>
              {trust.score < 60 && (
                <p className="mt-4 text-sm text-amber-600 bg-amber-500/10 rounded-md p-3">
                  ⚠️ Your trust score is below 60. Upfront payment is required for all bookings until your score improves.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/#slots")} className="text-xs gap-1">
              Browse Slots <ArrowRight className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No bookings yet. <button onClick={() => navigate("/#slots")} className="text-primary underline">Find a deal</button>
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 10).map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {statusIcon(b.status)}
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {b.slot?.merchant_name || "Unknown Merchant"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {b.slot?.location || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={b.status === "paid" ? "default" : b.status === "confirmed" ? "secondary" : "outline"} className="text-xs">
                        {b.paid_upfront && <CreditCard className="w-3 h-3 mr-1" />}
                        {b.status}
                      </Badge>
                      {b.slot && (
                        <p className="text-xs text-emerald-500 mt-1">
                          Saved {formatPriceInCurrency(b.slot.original_price - b.slot.current_price, currency)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved / Wishlist */}
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Heart className="w-5 h-5 text-rose-500" /> Wishlist</CardTitle></CardHeader>
          <CardContent>
            {savedLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : savedSlots.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No saved slots. Tap the ❤️ on any slot to add it here.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedSlots.slice(0, 8).map((s) => {
                  const d = s.slot_data as any;
                  return (
                    <div key={s.slot_id} className="rounded-lg border border-border bg-card p-3">
                      <p className="font-medium text-sm text-foreground truncate">{d.merchant}</p>
                      <p className="text-xs text-muted-foreground">{d.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">{d.vertical}</Badge>
                        <div className="text-xs">
                          <span className="line-through text-muted-foreground mr-1">
                            {formatPriceInCurrency(d.originalPrice, currency)}
                          </span>
                          <span className="font-bold text-emerald-500">
                            {formatPriceInCurrency(d.currentPrice, currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
