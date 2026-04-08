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
  TrendingUp, Activity, Shield, Zap, Store, CheckCircle2, XCircle, Pencil, Save, X,
  CalendarPlus, Mail,
} from "lucide-react";
import { toast } from "sonner";
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
  const [merchants, setMerchants] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Merchant editing
  const [editingMerchant, setEditingMerchant] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [addingMerchant, setAddingMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState({ name: "", location: "", region: "", vertical: "", contact_email: "" });

  // New slot form
  const [newSlot, setNewSlot] = useState({
    merchant_name: "", vertical: "", location: "", region: "", time_description: "",
    original_price: "", current_price: "", urgency: "medium" as "critical" | "high" | "medium",
    expires_at: "",
  });

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
      const [profilesRes, bookingsRes, slotsRes, merchantsRes] = await Promise.all([
        isAdmin ? supabase.from("profiles").select("*").limit(50) : Promise.resolve({ data: [] }),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("slots").select("*").order("created_at", { ascending: false }).limit(100),
        isAdmin ? supabase.from("merchants").select("*").order("created_at", { ascending: false }).limit(100) : Promise.resolve({ data: [] }),
      ]);
      setUsers(profilesRes.data || []);
      setBookings(bookingsRes.data || []);
      setSlots(slotsRes.data || []);
      setMerchants(merchantsRes.data || []);
      setStatsLoading(false);
    };
    fetchAdminData();
  }, [user, isAdmin, adminLoading]);

  const refreshMerchants = async () => {
    const { data } = await supabase.from("merchants").select("*").order("created_at", { ascending: false }).limit(100);
    if (data) setMerchants(data);
  };

  const toggleVerify = async (id: string, current: boolean) => {
    await supabase.from("merchants").update({ is_verified: !current }).eq("id", id);
    refreshMerchants();
  };

  const startEdit = (m: any) => {
    setEditingMerchant(m.id);
    setEditForm({ name: m.name, location: m.location, region: m.region, vertical: m.vertical, contact_email: m.contact_email || "" });
  };

  const saveEdit = async (id: string) => {
    await supabase.from("merchants").update(editForm).eq("id", id);
    setEditingMerchant(null);
    refreshMerchants();
  };

  const deleteMerchant = async (id: string) => {
    await supabase.from("merchants").delete().eq("id", id);
    refreshMerchants();
  };

  const addMerchant = async () => {
    if (!newMerchant.name || !newMerchant.location || !newMerchant.region || !newMerchant.vertical) return;
    await supabase.from("merchants").insert(newMerchant);
    setNewMerchant({ name: "", location: "", region: "", vertical: "", contact_email: "" });
    setAddingMerchant(false);
    refreshMerchants();
  };

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
                <TabsTrigger value="merchants"><Store className="w-4 h-4 mr-1" />Merchants</TabsTrigger>
                <TabsTrigger value="slots"><CalendarPlus className="w-4 h-4 mr-1" />Add Slot</TabsTrigger>
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

          {/* Merchants Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="merchants" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      Merchant Profiles
                    </CardTitle>
                    <CardDescription>{merchants.length} merchants · {merchants.filter((m: any) => m.is_verified).length} verified</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setAddingMerchant(true)} disabled={addingMerchant}>
                    <Plus className="w-4 h-4 mr-1" /> Add Merchant
                  </Button>
                </CardHeader>
                <CardContent>
                  {addingMerchant && (
                    <div className="mb-4 p-4 border border-border rounded-lg bg-muted/20 space-y-3">
                      <p className="text-sm font-medium text-foreground">New Merchant</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Input placeholder="Name" value={newMerchant.name} onChange={e => setNewMerchant(p => ({ ...p, name: e.target.value }))} />
                        <Input placeholder="Location" value={newMerchant.location} onChange={e => setNewMerchant(p => ({ ...p, location: e.target.value }))} />
                        <Select value={newMerchant.region} onValueChange={v => setNewMerchant(p => ({ ...p, region: v }))}>
                          <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                          <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={newMerchant.vertical} onValueChange={v => setNewMerchant(p => ({ ...p, vertical: v }))}>
                          <SelectTrigger><SelectValue placeholder="Vertical" /></SelectTrigger>
                          <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                        </Select>
                        <Input placeholder="Email" value={newMerchant.contact_email} onChange={e => setNewMerchant(p => ({ ...p, contact_email: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addMerchant}><Plus className="w-4 h-4 mr-1" /> Create</Button>
                        <Button size="sm" variant="ghost" onClick={() => setAddingMerchant(false)}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                      </div>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Vertical</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {merchants.map((m: any) => (
                        <TableRow key={m.id}>
                          {editingMerchant === m.id ? (
                            <>
                              <TableCell><Input className="h-8 text-xs" value={editForm.name} onChange={e => setEditForm((p: any) => ({ ...p, name: e.target.value }))} /></TableCell>
                              <TableCell>
                                <Select value={editForm.vertical} onValueChange={v => setEditForm((p: any) => ({ ...p, vertical: v }))}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Input className="h-8 text-xs" value={editForm.location} onChange={e => setEditForm((p: any) => ({ ...p, location: e.target.value }))} /></TableCell>
                              <TableCell>
                                <Select value={editForm.region} onValueChange={v => setEditForm((p: any) => ({ ...p, region: v }))}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell><Input className="h-8 text-xs" value={editForm.contact_email} onChange={e => setEditForm((p: any) => ({ ...p, contact_email: e.target.value }))} /></TableCell>
                              <TableCell>
                                <Badge variant={m.is_verified ? "default" : "secondary"}>{m.is_verified ? "Verified" : "Pending"}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(m.id)}><Save className="w-3.5 h-3.5 text-primary" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingMerchant(null)}><X className="w-3.5 h-3.5" /></Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-medium">{m.name}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{m.vertical}</Badge></TableCell>
                              <TableCell className="text-xs text-muted-foreground">{m.location}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{m.region}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{m.contact_email || "—"}</TableCell>
                              <TableCell>
                                <Badge variant={m.is_verified ? "default" : "secondary"} className="cursor-pointer" onClick={() => toggleVerify(m.id, m.is_verified)}>
                                  {m.is_verified ? <><CheckCircle2 className="w-3 h-3 mr-1" />Verified</> : <><XCircle className="w-3 h-3 mr-1" />Pending</>}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(m)}><Pencil className="w-3.5 h-3.5" /></Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMerchant(m.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                      {merchants.length === 0 && (
                        <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No merchants yet. Add one above!</TableCell></TableRow>
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
          {/* Add Cancelled Slot Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="slots">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarPlus className="w-4 h-4 text-primary" />
                    Add Cancelled Slot
                  </CardTitle>
                  <CardDescription>Manually input a new cancelled booking slot for the marketplace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Merchant Name *" value={newSlot.merchant_name} onChange={e => setNewSlot(p => ({ ...p, merchant_name: e.target.value }))} />
                    <Select value={newSlot.vertical} onValueChange={v => setNewSlot(p => ({ ...p, vertical: v }))}>
                      <SelectTrigger><SelectValue placeholder="Vertical *" /></SelectTrigger>
                      <SelectContent>{VERTICALS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Location *" value={newSlot.location} onChange={e => setNewSlot(p => ({ ...p, location: e.target.value }))} />
                    <Select value={newSlot.region} onValueChange={v => setNewSlot(p => ({ ...p, region: v }))}>
                      <SelectTrigger><SelectValue placeholder="Region *" /></SelectTrigger>
                      <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder="Time Description (e.g. '2:30 PM Today')" value={newSlot.time_description} onChange={e => setNewSlot(p => ({ ...p, time_description: e.target.value }))} />
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Expires At *</label>
                      <Input type="datetime-local" value={newSlot.expires_at} onChange={e => setNewSlot(p => ({ ...p, expires_at: e.target.value }))} min={new Date().toISOString().slice(0, 16)} />
                    </div>
                    <Input type="number" placeholder="Original Price (£) *" value={newSlot.original_price} onChange={e => setNewSlot(p => ({ ...p, original_price: e.target.value }))} />
                    <Input type="number" placeholder="Discounted Price (£) *" value={newSlot.current_price} onChange={e => setNewSlot(p => ({ ...p, current_price: e.target.value }))} />
                    <Select value={newSlot.urgency} onValueChange={(v: any) => setNewSlot(p => ({ ...p, urgency: v }))}>
                      <SelectTrigger><SelectValue placeholder="Urgency" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">🔥 Critical</SelectItem>
                        <SelectItem value="high">⚡ High</SelectItem>
                        <SelectItem value="medium">📌 Medium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full md:w-auto"
                    onClick={async () => {
                      const { merchant_name, vertical, location, region, time_description, original_price, current_price, urgency, expires_at } = newSlot;
                      if (!merchant_name || !vertical || !location || !region || !time_description || !original_price || !current_price || !expires_at) {
                        toast.error("Please fill in all required fields");
                        return;
                      }
                      const expiresDate = new Date(expires_at);
                      if (expiresDate <= new Date()) {
                        toast.error("Expiry time must be in the future");
                        return;
                      }
                      const timeLeftSeconds = Math.round((expiresDate.getTime() - Date.now()) / 1000);
                      const { error } = await supabase.from("slots").insert({
                        merchant_name,
                        vertical,
                        location,
                        region,
                        time_description,
                        original_price: parseFloat(original_price),
                        current_price: parseFloat(current_price),
                        urgency,
                        expires_at: expiresDate.toISOString(),
                        time_left: timeLeftSeconds,
                        is_live: true,
                        source: "admin",
                      });
                      if (error) {
                        toast.error("Failed to add slot: " + error.message);
                      } else {
                        toast.success("Slot added! It will appear in the live feed instantly via real-time.");
                        setNewSlot({ merchant_name: "", vertical: "", location: "", region: "", time_description: "", original_price: "", current_price: "", urgency: "medium", expires_at: "" });
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Publish Slot
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

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
