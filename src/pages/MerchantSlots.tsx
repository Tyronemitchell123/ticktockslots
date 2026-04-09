import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Store, CalendarClock, Package } from "lucide-react";
import { formatPriceInCurrency } from "@/lib/currency";
import type { Tables } from "@/integrations/supabase/types";

const VERTICALS = ["Restaurants", "Hotels", "Spas", "Salons", "Fitness", "Entertainment", "Travel", "Healthcare"];
const URGENCY_OPTIONS: Array<{ value: Tables<"slots">["urgency"]; label: string }> = [
  { value: "medium", label: "Medium — hours left" },
  { value: "high", label: "High — under 1 hour" },
  { value: "critical", label: "Critical — minutes left" },
];

const MerchantSlots = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [merchant, setMerchant] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // New slot form
  const [timeDesc, setTimeDesc] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [location, setLocation] = useState("");
  const [urgency, setUrgency] = useState<Tables<"slots">["urgency"]>("medium");
  const [timeLeft, setTimeLeft] = useState("300");

  useEffect(() => {
    if (!user) return;
    fetchMerchant();
  }, [user]);

  useEffect(() => {
    if (merchant) fetchSlots();
  }, [merchant]);

  const fetchMerchant = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("merchants")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!data || error) {
      setLoading(false);
      return;
    }
    setMerchant(data);
    setLocation(data.location || "");
    setLoading(false);
  };

  const fetchSlots = async () => {
    const { data } = await supabase
      .from("slots")
      .select("*")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false });
    setSlots(data || []);
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeDesc || !originalPrice || !currentPrice) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    const op = parseFloat(originalPrice);
    const cp = parseFloat(currentPrice);
    if (isNaN(op) || isNaN(cp) || cp > op || cp <= 0) {
      toast({ title: "Invalid prices", description: "Discounted price must be less than original and greater than 0.", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { error } = await supabase.from("slots").insert({
      merchant_id: merchant.id,
      merchant_name: merchant.name,
      time_description: timeDesc,
      original_price: op,
      current_price: cp,
      location: location || merchant.location,
      region: merchant.region,
      vertical: merchant.vertical,
      urgency,
      time_left: parseInt(timeLeft) || 300,
      source: "merchant",
      is_live: true,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Slot Created!", description: "Your cancellation slot is now live." });
      setDialogOpen(false);
      resetForm();
      fetchSlots();
    }
    setCreating(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase.from("slots").update({ is_live: false }).eq("id", slotId);
    if (!error) {
      toast({ title: "Slot removed from live feed" });
      fetchSlots();
    }
  };

  const resetForm = () => {
    setTimeDesc("");
    setOriginalPrice("");
    setCurrentPrice("");
    setUrgency("medium");
    setTimeLeft("300");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>No Merchant Profile</CardTitle>
            <CardDescription>You need to register as a merchant first before you can post slots.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/merchant/register")} className="w-full">
              Register as Merchant
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const liveSlots = slots.filter((s) => s.is_live);
  const pastSlots = slots.filter((s) => !s.is_live);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{merchant.name}</h1>
            <p className="text-muted-foreground">Manage your cancellation slots</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Post Cancellation</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Post a Cancellation Slot</DialogTitle>
                <DialogDescription>Fill someone's cancelled appointment at a discounted rate.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSlot} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>What was cancelled? *</Label>
                  <Input value={timeDesc} onChange={(e) => setTimeDesc(e.target.value)} placeholder="e.g. Haircut & Blow-dry, 2pm today" required maxLength={255} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Original Price (£) *</Label>
                    <Input type="number" min="0.01" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="80.00" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Discounted Price (£) *</Label>
                    <Input type="number" min="0.01" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} placeholder="45.00" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder={merchant.location} maxLength={500} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Urgency</Label>
                    <Select value={urgency} onValueChange={(v) => setUrgency(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {URGENCY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time left (seconds)</Label>
                    <Input type="number" min="60" value={timeLeft} onChange={(e) => setTimeLeft(e.target.value)} />
                  </div>
                </div>
                {currentPrice && originalPrice && parseFloat(currentPrice) < parseFloat(originalPrice) && (
                  <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
                    💰 Customer saves {formatPriceInCurrency(parseFloat(originalPrice) - parseFloat(currentPrice))} ({Math.round((1 - parseFloat(currentPrice) / parseFloat(originalPrice)) * 100)}% off) — You earn {formatPriceInCurrency(parseFloat(currentPrice) * 0.7)} (70%)
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={creating}>
                  {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : "Post Live Slot"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 text-center">
              <CalendarClock className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{liveSlots.length}</p>
              <p className="text-xs text-muted-foreground">Live Slots</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{pastSlots.length}</p>
              <p className="text-xs text-muted-foreground">Filled / Expired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Store className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{slots.length}</p>
              <p className="text-xs text-muted-foreground">Total Posted</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="live">
          <TabsList className="mb-4">
            <TabsTrigger value="live">Live ({liveSlots.length})</TabsTrigger>
            <TabsTrigger value="past">Filled / Expired ({pastSlots.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="live">
            {liveSlots.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No live slots. Click "Post Cancellation" to add one.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slot</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Urgency</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {liveSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{slot.time_description}</p>
                            <p className="text-xs text-muted-foreground">{slot.location}</p>
                          </TableCell>
                          <TableCell>
                            <span className="line-through text-xs text-muted-foreground mr-1">{formatPriceInCurrency(slot.original_price)}</span>
                            <span className="font-semibold text-primary">{formatPriceInCurrency(slot.current_price)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={slot.urgency === "critical" ? "destructive" : slot.urgency === "high" ? "default" : "secondary"}>
                              {slot.urgency}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSlot(slot.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastSlots.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No past slots yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slot</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>
                            <p className="font-medium text-sm">{slot.time_description}</p>
                            <p className="text-xs text-muted-foreground">{slot.location}</p>
                          </TableCell>
                          <TableCell>{formatPriceInCurrency(slot.current_price)}</TableCell>
                          <TableCell><Badge variant="outline">Filled</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(slot.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => navigate("/merchant/earnings")} className="flex-1">
            View Earnings
          </Button>
          <Button variant="outline" onClick={() => navigate("/merchant/register")} className="flex-1">
            Account Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MerchantSlots;
