import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";
import { useAutomation } from "@/hooks/use-automation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, Users, ShoppingBag, BarChart3, Bell, Bot, Trash2, Plus,
  TrendingUp, Activity, Shield, Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const VERTICALS = ["Beauty", "Dining", "Aviation", "Hotels", "Events", "Wellness", "Sports"];
const REGIONS = ["London", "Manchester", "Birmingham", "Edinburgh", "Bristol", "Leeds"];

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  // Admin data
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Automation
  const {
    priceAlerts, autoClaimRules, loading: autoLoading,
    addPriceAlert, toggleAlert, deleteAlert,
    addAutoClaimRule, toggleRule, deleteRule,
  } = useAutomation();

  // Alert form
  const [alertVertical, setAlertVertical] = useState("");
  const [alertRegion, setAlertRegion] = useState("");
  const [alertMaxPrice, setAlertMaxPrice] = useState("");

  // Rule form
  const [ruleVertical, setRuleVertical] = useState("");
  const [ruleRegion, setRuleRegion] = useState("");
  const [ruleMaxPrice, setRuleMaxPrice] = useState("");

  useEffect(() => {
    if (!user || adminLoading) return;

    const fetchAdminData = async () => {
      setStatsLoading(true);
      const [profilesRes, bookingsRes, slotsRes] = await Promise.all([
        isAdmin ? supabase.from("profiles").select("*").limit(50) : Promise.resolve({ data: [] }),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("slots").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      setUsers(profilesRes.data || []);
      setBookings(bookingsRes.data || []);
      setSlots(slotsRes.data || []);
      setStatsLoading(false);
    };
    fetchAdminData();
  }, [user, isAdmin, adminLoading]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.paid_amount || 0), 0);
  const liveSlots = slots.filter((s) => s.is_live).length;
  const completedBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {isAdmin && <Shield className="w-6 h-6 text-primary" />}
              {isAdmin ? "Admin Panel" : "Automation Hub"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Manage users, bookings, metrics & automation" : "Set up price alerts and auto-claim rules"}
            </p>
          </div>
        </div>

        <Tabs defaultValue={isAdmin ? "overview" : "alerts"} className="space-y-6">
          <TabsList className="bg-muted/50">
            {isAdmin && (
              <>
                <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" />Overview</TabsTrigger>
                <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" />Users</TabsTrigger>
                <TabsTrigger value="bookings"><ShoppingBag className="w-4 h-4 mr-1" />Bookings</TabsTrigger>
              </>
            )}
            <TabsTrigger value="alerts"><Bell className="w-4 h-4 mr-1" />Price Alerts</TabsTrigger>
            <TabsTrigger value="autoclaim"><Bot className="w-4 h-4 mr-1" />Auto-Claim</TabsTrigger>
          </TabsList>

          {/* Overview Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <MetricCard icon={Users} label="Total Users" value={users.length} />
                <MetricCard icon={ShoppingBag} label="Total Bookings" value={bookings.length} />
                <MetricCard icon={Activity} label="Live Slots" value={liveSlots} />
                <MetricCard icon={TrendingUp} label="Revenue" value={`£${totalRevenue.toLocaleString()}`} />
              </div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Booking Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["pending", "confirmed", "completed", "cancelled"].map((status) => {
                      const count = bookings.filter((b) => b.status === status).length;
                      return (
                        <div key={status} className="text-center p-3 bg-muted/30 rounded-lg">
                          <p className="text-2xl font-bold text-foreground">{count}</p>
                          <p className="text-xs text-muted-foreground capitalize">{status}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Users Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="users">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Registered Users</CardTitle>
                  <CardDescription>Last 50 profiles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                          <TableCell>{u.phone || "—"}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {new Date(u.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No users yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Bookings Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="bookings">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slot ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs">{b.slot_id.slice(0, 8)}…</TableCell>
                          <TableCell>
                            <Badge variant={b.status === "confirmed" || b.status === "completed" ? "default" : "secondary"}>
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{b.paid_amount ? `£${b.paid_amount}` : "—"}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {new Date(b.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {bookings.length === 0 && (
                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No bookings yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Price Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Create Price Alert
                </CardTitle>
                <CardDescription>Get notified when a slot drops below your max price</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Select value={alertVertical} onValueChange={setAlertVertical}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Any Vertical" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {VERTICALS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={alertRegion} onValueChange={setAlertRegion}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Any Region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number" placeholder="Max price (£)" className="w-36"
                    value={alertMaxPrice} onChange={(e) => setAlertMaxPrice(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (!alertMaxPrice) return;
                      addPriceAlert({
                        vertical: alertVertical && alertVertical !== "any" ? alertVertical : undefined,
                        region: alertRegion && alertRegion !== "any" ? alertRegion : undefined,
                        max_price: parseFloat(alertMaxPrice),
                      });
                      setAlertMaxPrice("");
                    }}
                    disabled={!alertMaxPrice}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Alert
                  </Button>
                </div>
              </CardContent>
            </Card>

            {priceAlerts.map((a) => (
              <Card key={a.id} className="bg-card border-border">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={a.is_active} onCheckedChange={(v) => toggleAlert(a.id, v)} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {a.vertical || "Any vertical"} · {a.region || "Any region"} · Under £{a.max_price}
                      </p>
                      <p className="text-xs text-muted-foreground">Created {new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteAlert(a.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {priceAlerts.length === 0 && !autoLoading && (
              <p className="text-center text-muted-foreground text-sm py-8">No price alerts yet. Create one above!</p>
            )}
          </TabsContent>

          {/* Auto-Claim Tab */}
          <TabsContent value="autoclaim" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  Create Auto-Claim Rule
                </CardTitle>
                <CardDescription>Automatically book slots matching your criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Select value={ruleVertical} onValueChange={setRuleVertical}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Any Vertical" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {VERTICALS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={ruleRegion} onValueChange={setRuleRegion}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Any Region" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number" placeholder="Max price (£)" className="w-36"
                    value={ruleMaxPrice} onChange={(e) => setRuleMaxPrice(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (!ruleMaxPrice) return;
                      addAutoClaimRule({
                        vertical: ruleVertical && ruleVertical !== "any" ? ruleVertical : undefined,
                        region: ruleRegion && ruleRegion !== "any" ? ruleRegion : undefined,
                        max_price: parseFloat(ruleMaxPrice),
                      });
                      setRuleMaxPrice("");
                    }}
                    disabled={!ruleMaxPrice}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Rule
                  </Button>
                </div>
              </CardContent>
            </Card>

            {autoClaimRules.map((r) => (
              <Card key={r.id} className="bg-card border-border">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch checked={r.is_active} onCheckedChange={(v) => toggleRule(r.id, v)} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.vertical || "Any vertical"} · {r.region || "Any region"} · Under £{r.max_price}
                      </p>
                      <p className="text-xs text-muted-foreground">Created {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(r.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {autoClaimRules.length === 0 && !autoLoading && (
              <p className="text-center text-muted-foreground text-sm py-8">No auto-claim rules yet. Create one above!</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <Card className="bg-card border-border">
    <CardContent className="pt-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Admin;
