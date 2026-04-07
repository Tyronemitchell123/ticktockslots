import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Clock, TrendingDown, Shield, Zap, CheckCircle2, ArrowRight, Timer, Loader2, Star, MessageSquare, Navigation } from "lucide-react";
import { getVendorAddress, openMapLocation } from "@/lib/vendor-addresses";
import { detectCurrency, formatPriceInCurrency } from "@/lib/currency";
import { getSlotRating } from "@/lib/mock-reviews";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Slot {
  id: string;
  merchant: string;
  vertical: string;
  location: string;
  region?: string;
  time: string;
  originalPrice: number;
  currentPrice: number;
  urgency: "critical" | "high" | "medium";
  timeLeft: number;
}

interface SlotDetailModalProps {
  slot: Slot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayCurrency?: string;
}

const urgencyLabels = {
  critical: { label: "Critical — Expiring Soon", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
  high: { label: "High Priority", color: "text-secondary", bg: "bg-secondary/10 border-secondary/30" },
  medium: { label: "Standard", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
};

const verticalDetails: Record<string, { icon: string; category: string; trustBadge: string }> = {
  Beauty: { icon: "✂️", category: "Beauty & Wellness", trustBadge: "Verified Salon" },
  Aviation: { icon: "✈️", category: "Private Aviation", trustBadge: "FAA Certified" },
  Health: { icon: "🩺", category: "Healthcare", trustBadge: "Licensed Provider" },
  Dining: { icon: "🍽️", category: "Fine Dining", trustBadge: "Michelin Partner" },
  Logistics: { icon: "🚢", category: "Maritime & Ports", trustBadge: "Port Authority Verified" },
  Fitness: { icon: "💪", category: "Fitness & Wellness", trustBadge: "Certified Studio" },
  Education: { icon: "🎓", category: "Education & Tutoring", trustBadge: "Accredited Provider" },
  Events: { icon: "🎭", category: "Events & Entertainment", trustBadge: "Licensed Venue" },
  Automotive: { icon: "🚗", category: "Automotive Services", trustBadge: "Certified Garage" },
  Legal: { icon: "⚖️", category: "Legal Services", trustBadge: "Regulated Firm" },
  Property: { icon: "🏠", category: "Property & Viewings", trustBadge: "Registered Agent" },
  "Pet Care": { icon: "🐾", category: "Pet Care & Vets", trustBadge: "Licensed Practice" },
};

type Step = "details" | "confirm" | "success";

const SlotDetailModal = ({ slot, open, onOpenChange, displayCurrency = "GBP" }: SlotDetailModalProps) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<Step>("details");
  const [liveCountdown, setLiveCountdown] = useState(0);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [trustScore, setTrustScore] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const requiresUpfront = trustScore !== null && trustScore < 60;

  const handleOpenMap = async (address: string) => {
    const result = await openMapLocation(address);

    if (result === "opened") return;

    toast({
      title:
        result === "preview_copied"
          ? "Address copied for preview"
          : result === "copied"
            ? "Map link copied"
            : "Couldn't open map",
      description:
        result === "preview_copied"
          ? "Preview blocks third-party map sites, so the address and map link were copied to your clipboard instead."
          : result === "copied"
            ? "Popup blocking prevented opening the map, so the address and map link were copied instead."
            : `Copy this address manually: ${address}`,
      variant: result === "failed" ? "destructive" : undefined,
    });
  };

  useEffect(() => {
    if (slot) {
      setLiveCountdown(slot.timeLeft);
      setStep("details");
      setBookingId(null);
    }
  }, [slot]);

  // Fetch trust score when user is logged in and modal opens
  useEffect(() => {
    if (!user || !open) return;
    supabase
      .from("user_trust_scores")
      .select("score")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setTrustScore(data.score);
      });
  }, [user, open]);

  useEffect(() => {
    if (!open || step === "success") return;
    const timer = setInterval(() => {
      setLiveCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [open, step]);

  if (!slot) return null;

  const nativeCurrency = detectCurrency(slot.location, slot.region || "");
  const fmtOriginal = formatPriceInCurrency(slot.originalPrice, nativeCurrency, displayCurrency);
  const fmtCurrent = formatPriceInCurrency(slot.currentPrice, nativeCurrency, displayCurrency);
  const fmtSaved = formatPriceInCurrency(slot.originalPrice - slot.currentPrice, nativeCurrency, displayCurrency);

  const discount = Math.round((1 - slot.currentPrice / slot.originalPrice) * 100);
  const details = verticalDetails[slot.vertical] || { icon: "📋", category: slot.vertical, trustBadge: "Verified" };
  const urgency = urgencyLabels[slot.urgency];

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
  };

  const handleConfirm = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to book a slot.", variant: "destructive" });
      onOpenChange(false);
      navigate("/auth");
      return;
    }

    setBookingLoading(true);
    try {
      // Use atomic claim_slot function to prevent double-booking
      const { data, error } = await supabase.rpc("claim_slot", {
        _slot_id: slot.id,
        _user_id: user.id,
        _paid_amount: slot.currentPrice,
        _paid_upfront: requiresUpfront,
      });

      if (error) throw error;
      setBookingId(data);
      setStep("success");
      toast({ title: "🎉 Booking confirmed!", description: `You saved ${fmtSaved} on this slot.` });
    } catch (error: any) {
      const msg = error.message?.includes("no longer available")
        ? "This slot has already been claimed by another user."
        : error.message;
      toast({ title: "Booking failed", description: msg, variant: "destructive" });
    } finally {
      setBookingLoading(false);
    }
  };

  const modalContent = (
    <div className="max-h-[85vh] overflow-y-auto">
        {/* ===== STEP 1: Details ===== */}
        {step === "details" && (
          <div>
            {/* Header with urgency bar */}
            <div className={`px-6 py-3 flex items-center justify-between border-b border-border/30 ${slot.urgency === "critical" ? "bg-destructive/5" : "bg-muted/30"}`}>
              <Badge variant="outline" className={urgency.bg}>
                {slot.urgency === "critical" ? "🔥" : slot.urgency === "high" ? "⚡" : "📌"} {urgency.label}
              </Badge>
              <div className="flex items-center gap-2">
                <Timer className={`w-4 h-4 ${liveCountdown < 30 ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
                <span className={`font-mono text-lg font-bold ${liveCountdown < 30 ? "text-destructive" : "text-foreground"}`}>
                  {formatCountdown(liveCountdown)}
                </span>
              </div>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Merchant info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
                  {details.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{slot.merchant}</h3>
                  <p className="text-sm text-muted-foreground">{details.category}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">{details.trustBadge}</span>
                  </div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <div className="text-sm font-medium text-foreground">{slot.location}</div>
                  {(() => {
                    const address = getVendorAddress(slot.merchant);
                    return address ? (
                      <div className="mt-1.5">
                        <p className="text-[11px] text-muted-foreground leading-snug">{address}</p>
                        <button
                          type="button"
                          onClick={() => void handleOpenMap(address)}
                          className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          Open in Maps
                        </button>
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="glass rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-1">
                    <Clock className="w-3 h-3" /> Time
                  </div>
                  <div className="text-sm font-medium text-foreground">{slot.time}</div>
                </div>
              </div>

              {/* Pricing */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Original Price</span>
                  <span className="text-sm text-muted-foreground line-through">{fmtOriginal}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">SlotEngine Price</span>
                  <span className="text-2xl font-bold text-secondary flex items-center gap-1">
                    <TrendingDown className="w-5 h-5" />
                    {fmtCurrent}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <span className="text-sm font-medium text-green-400">You Save</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-400">{fmtSaved}</span>
                    <Badge className="bg-green-400/10 text-green-400 border-green-400/30 text-xs">-{discount}%</Badge>
                  </div>
                </div>
              </div>

              {/* Reviews & ratings */}
              {(() => {
                const rating = getSlotRating(slot.id, slot.vertical);
                return (
                  <div className="glass rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-4 h-4 ${s <= Math.round(rating.average) ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-foreground">{rating.average.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> {rating.count} reviews
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {rating.reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-t border-border/20 pt-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium text-foreground">{review.reviewer}</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-2.5 h-2.5 ${s <= review.rating ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`}
                                />
                              ))}
                              <span className="text-[10px] text-muted-foreground ml-1">{review.daysAgo}d ago</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Trust score warning */}
              {user && requiresUpfront && (
                <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-secondary/10 border border-secondary/30">
                  <Shield className="w-5 h-5 text-secondary shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-secondary">100% Upfront Payment Required</div>
                    <div className="text-xs text-muted-foreground">Your trust score ({trustScore}/100) is below 60. Full payment of {fmtCurrent} is required to claim this slot.</div>
                  </div>
                </div>
              )}

              {/* CTA */}
              {!user && (
                <p className="text-xs text-center text-muted-foreground">
                  You'll need to <button className="text-primary underline" onClick={() => { onOpenChange(false); navigate("/auth"); }}>sign in</button> to claim this slot.
                </p>
              )}
              <Button
                variant="hero"
                className="w-full py-6 text-base rounded-xl"
                onClick={() => user ? setStep("confirm") : navigate("/auth")}
                disabled={liveCountdown === 0}
              >
                {liveCountdown === 0 ? (
                  "Slot Expired"
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Claim This Slot
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Confirmation ===== */}
        {step === "confirm" && (
          <div className="px-6 py-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="text-xl">Confirm Booking</DialogTitle>
            </DialogHeader>

            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">{slot.merchant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">When</span>
                <span className="font-medium text-foreground">{slot.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Where</span>
                <span className="font-medium text-foreground">{slot.location}</span>
              </div>
              <div className="flex justify-between text-sm pt-3 border-t border-border/30">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-xl font-bold text-secondary">{fmtCurrent}</span>
              </div>
              {requiresUpfront && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-secondary font-medium">⚠️ Paid upfront</span>
                  <span className="text-secondary font-medium">100%</span>
                </div>
              )}
            </div>

            {/* Upfront payment notice */}
            {requiresUpfront && (
              <div className="flex items-center gap-3 rounded-lg px-4 py-3 bg-secondary/10 border border-secondary/30">
                <Shield className="w-5 h-5 text-secondary shrink-0" />
                <div>
                  <div className="text-sm font-medium text-secondary">Full Payment Required</div>
                  <div className="text-xs text-muted-foreground">Trust score {trustScore}/100 — payment of {fmtCurrent} will be charged immediately.</div>
                </div>
              </div>
            )}

            {/* Countdown warning */}
            <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${liveCountdown < 30 ? "bg-destructive/10 border border-destructive/30" : "bg-muted/30 border border-border/30"}`}>
              <Timer className={`w-5 h-5 ${liveCountdown < 30 ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
              <div>
                <div className={`text-sm font-medium ${liveCountdown < 30 ? "text-destructive" : "text-foreground"}`}>
                  {formatCountdown(liveCountdown)} remaining
                </div>
                <div className="text-xs text-muted-foreground">Slot will be released if not confirmed</div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 py-5" onClick={() => setStep("details")}>
                Back
              </Button>
              <Button
                variant="hero"
                className="flex-1 py-5"
                onClick={handleConfirm}
                disabled={liveCountdown === 0 || bookingLoading}
              >
                {bookingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {bookingLoading ? "Booking..." : requiresUpfront ? "Pay Now & Confirm" : "Confirm & Pay"}
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Success ===== */}
        {step === "success" && (
          <div className="px-6 py-10 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-green-400/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Slot Claimed!</h3>
              <p className="text-muted-foreground">
                Your booking at <span className="text-foreground font-medium">{slot.merchant}</span> is confirmed.
              </p>
            </div>
            <div className="glass rounded-xl p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking ID</span>
                <span className="font-mono text-foreground text-xs">{bookingId ? bookingId.slice(0, 8).toUpperCase() : slot.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">When</span>
                <span className="text-foreground">{slot.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You Saved</span>
                <span className="text-green-400 font-bold">{fmtSaved}</span>
              </div>
            </div>
            <Button className="w-full py-5" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="glass border-border/50 p-0 overflow-hidden">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{slot.merchant} slot details</DrawerTitle>
            <DrawerDescription>Review the location, pricing, and booking details for this available slot.</DrawerDescription>
          </DrawerHeader>
          {modalContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass border-border/50 p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{slot.merchant} slot details</DialogTitle>
          <DialogDescription>Review the location, pricing, and booking details for this available slot.</DialogDescription>
        </DialogHeader>
        {modalContent}
      </DialogContent>
    </Dialog>
  );
};

export default SlotDetailModal;
