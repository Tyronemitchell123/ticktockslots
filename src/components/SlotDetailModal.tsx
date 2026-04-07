import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, TrendingDown, Shield, Zap, CheckCircle2, ArrowRight, Timer, Loader2 } from "lucide-react";
import { detectCurrency, formatPriceInCurrency } from "@/lib/currency";
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
};

type Step = "details" | "confirm" | "success";

const SlotDetailModal = ({ slot, open, onOpenChange, displayCurrency = "GBP" }: SlotDetailModalProps) => {
  const [step, setStep] = useState<Step>("details");
  const [liveCountdown, setLiveCountdown] = useState(0);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (slot) {
      setLiveCountdown(slot.timeLeft);
      setStep("details");
      setBookingId(null);
    }
  }, [slot]);

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

  const handleConfirm = () => {
    setStep("success");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass border-border/50 p-0 overflow-hidden">
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

              {/* CTA */}
              <Button
                variant="hero"
                className="w-full py-6 text-base rounded-xl"
                onClick={() => setStep("confirm")}
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
            </div>

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
                disabled={liveCountdown === 0}
              >
                <CheckCircle2 className="w-5 h-5" />
                Confirm & Pay
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
                <span className="font-mono text-foreground">SE-{slot.id.padStart(6, "0")}</span>
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
      </DialogContent>
    </Dialog>
  );
};

export default SlotDetailModal;
