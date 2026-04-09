import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const VERTICALS = ["Restaurants", "Hotels", "Spas", "Salons", "Fitness", "Entertainment", "Travel", "Healthcare"];
const REGIONS = ["London", "Manchester", "Birmingham", "Leeds", "Edinburgh", "Bristol", "Liverpool", "Glasgow"];

const MerchantRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [vertical, setVertical] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchMerchant();
  }, [user]);

  // Handle Stripe onboarding return
  useEffect(() => {
    if (searchParams.get("onboarded") === "true") {
      toast({ title: "Stripe Connected!", description: "Your Stripe account has been connected successfully." });
      fetchMerchant();
    }
    if (searchParams.get("refresh") === "true") {
      toast({ title: "Stripe Setup Incomplete", description: "Please complete your Stripe onboarding.", variant: "destructive" });
    }
  }, [searchParams]);

  const fetchMerchant = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!error && data) {
      setMerchant(data);
      setName(data.name);
      setLocation(data.location);
      setRegion(data.region);
      setVertical(data.vertical);
      setContactEmail(data.contact_email || "");
    }
    setLoading(false);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location || !region || !vertical) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase
      .from("merchants")
      .insert({
        name,
        location,
        region,
        vertical,
        contact_email: contactEmail || user!.email || null,
        user_id: user!.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setMerchant(data);
      toast({ title: "Profile Created!", description: "Now connect your Stripe account to start receiving payouts." });
    }
    setSubmitting(false);
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    const { data, error } = await supabase.functions.invoke("merchant-onboard");

    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || error?.message || "Failed to start Stripe onboarding", variant: "destructive" });
      setConnectingStripe(false);
      return;
    }

    if (data?.already_complete) {
      toast({ title: "Already Connected", description: "Your Stripe account is fully set up." });
      fetchMerchant();
      setConnectingStripe(false);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const step = !merchant ? 1 : !merchant.stripe_onboarding_complete ? 2 : 3;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Merchant Registration</h1>
          <p className="text-muted-foreground">Join TickTock Slots and start filling last-minute cancellations</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[
            { num: 1, label: "Create Profile", icon: Building2 },
            { num: 2, label: "Connect Stripe", icon: CreditCard },
            { num: 3, label: "Ready", icon: CheckCircle2 },
          ].map(({ num, label, icon: Icon }, i) => (
            <div key={num} className="flex items-center gap-2">
              {i > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                step === num ? "bg-primary text-primary-foreground" :
                step > num ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="h-4 w-4" />
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Create Profile */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Details
              </CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. The Grand Hotel" required maxLength={255} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vertical *</Label>
                    <Select value={vertical} onValueChange={setVertical}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {VERTICALS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Region *</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Address / Location *</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. 123 High Street, London" required maxLength={500} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input id="email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder={user?.email || "business@example.com"} maxLength={255} />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Merchant Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Connect Stripe */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Connect Stripe
              </CardTitle>
              <CardDescription>
                Connect your Stripe account to receive payouts. You'll earn 70% of each booking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="font-medium text-foreground">{merchant.name}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{merchant.vertical}</Badge>
                  <Badge variant="outline">{merchant.region}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{merchant.location}</p>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p>✓ Secure payments powered by Stripe</p>
                <p>✓ 70% revenue share on every booking</p>
                <p>✓ Automatic payouts to your bank account</p>
                <p>✓ Real-time earnings dashboard</p>
              </div>

              <Button onClick={handleConnectStripe} className="w-full" size="lg" disabled={connectingStripe}>
                {connectingStripe ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...</> : <><CreditCard className="mr-2 h-4 w-4" /> Connect with Stripe</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-5 w-5" />
                You're All Set!
              </CardTitle>
              <CardDescription>Your merchant account is fully set up and ready to receive bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="font-medium text-foreground">{merchant.name}</p>
                <div className="flex gap-2">
                  <Badge variant="secondary">{merchant.vertical}</Badge>
                  <Badge variant="outline">{merchant.region}</Badge>
                  <Badge className="bg-primary/20 text-primary">Stripe Connected</Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button onClick={() => navigate("/merchant/earnings")} className="w-full">
                  View Earnings Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MerchantRegister;
