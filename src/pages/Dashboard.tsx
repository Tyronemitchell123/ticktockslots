import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap, ArrowLeft, Brain, Key, Calendar, CreditCard, TrendingUp,
  Copy, Eye, EyeOff, Trash2, Plus, RefreshCw, CheckCircle2,
  AlertTriangle, BarChart3, Activity, Cpu, Target, Bot, ShoppingBag, Clock, MapPin, Heart,
} from "lucide-react";
import { getApiKeys, createApiKey, revokeApiKey, deleteApiKey, type ApiKey } from "@/lib/api-keys";
import { generateInsights, generateDemandForecast, generateWeeklyRevenue, generateSectorBreakdown, generateFillRateTimeline, getAutomationStatus, type AiInsight } from "@/lib/ai-engine";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getConnections, connectCalendar, disconnectCalendar, getRecentEvents, type CalendarConnection } from "@/lib/calendar-sync";
import { useSavedSlots } from "@/hooks/use-saved-slots";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [automationStatus, setAutomationStatus] = useState(getAutomationStatus());
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);
  const [calendarEmail, setCalendarEmail] = useState("");
  const [calendarProvider, setCalendarProvider] = useState<"google" | "outlook" | "calendly">("google");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [forecast, setForecast] = useState(generateDemandForecast());
  const [weeklyRevenue, setWeeklyRevenue] = useState(generateWeeklyRevenue());
  const [sectorData, setSectorData] = useState(generateSectorBreakdown());
  const [fillRate, setFillRate] = useState(generateFillRateTimeline());

  interface BookingWithSlot {
    id: string;
    status: string;
    paid_upfront: boolean;
    paid_amount: number | null;
    created_at: string;
    source?: string;
    slots: {
      merchant_name: string;
      vertical: string;
      location: string;
      time_description: string;
      current_price: number;
      original_price: number;
    } | null;
  }
  const [bookings, setBookings] = useState<BookingWithSlot[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const { savedSlots, loading: savedLoading, toggleSave } = useSavedSlots();

  useEffect(() => {
    setApiKeys(getApiKeys());
    setInsights(generateInsights());
    setCalendars(getConnections());

    // Fetch user bookings
    if (user) {
      setBookingsLoading(true);
      supabase
        .from("bookings")
        .select("id, status, paid_upfront, paid_amount, created_at, source, slots(merchant_name, vertical, location, time_description, current_price, original_price)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setBookings((data as unknown as BookingWithSlot[]) || []);
          setBookingsLoading(false);
        });
    }

    // Live data refresh every 3 seconds
    const interval = setInterval(() => {
      setAutomationStatus(getAutomationStatus());
      setForecast(generateDemandForecast());
      setWeeklyRevenue(generateWeeklyRevenue());
      setSectorData(generateSectorBreakdown());
      setFillRate(generateFillRateTimeline());
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    createApiKey(newKeyName.trim());
    setApiKeys(getApiKeys());
    setNewKeyName("");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConnectCalendar = () => {
    if (!calendarEmail.trim()) return;
    connectCalendar(calendarProvider, calendarEmail.trim());
    setCalendars(getConnections());
    setCalendarEmail("");
  };

  const events = getRecentEvents();

  const insightTypeConfig = {
    prediction: { icon: <TrendingUp className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10" },
    optimization: { icon: <Target className="w-4 h-4" />, color: "text-secondary", bg: "bg-secondary/10" },
    match: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-green-400", bg: "bg-green-400/10" },
    anomaly: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-destructive", bg: "bg-destructive/10" },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="glass border-b border-border/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Command Center</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-400/10 text-green-400 border-green-400/30">
            <Activity className="w-3 h-3 mr-1" /> All Systems Operational
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Slots Auto-Filled", value: automationStatus.slotsAutoFilled.toLocaleString(), icon: <Bot className="w-5 h-5 text-primary" />, sub: "Today" },
            { label: "Revenue Optimized", value: `$${(automationStatus.revenueOptimized / 1e6).toFixed(1)}M`, icon: <TrendingUp className="w-5 h-5 text-secondary" />, sub: "This month" },
            { label: "AI Matches", value: automationStatus.matchesMade.toLocaleString(), icon: <Target className="w-5 h-5 text-green-400" />, sub: "Perfect matches" },
            { label: "Prediction Accuracy", value: `${(automationStatus.predictionsAccuracy * 100).toFixed(1)}%`, icon: <Brain className="w-5 h-5 text-purple-400" />, sub: "Last 30 days" },
          ].map((card, i) => (
            <div key={i} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</span>
                {card.icon}
              </div>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Auto-Claim Weekly Digest */}
        {(() => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const autoClaimedBookings = bookings.filter(
            (b) => (b as any).source === "auto-claim" && new Date(b.created_at) >= weekAgo
          );
          const totalSavings = autoClaimedBookings.reduce((sum, b) => {
            const slot = b.slots;
            return sum + (slot ? slot.original_price - slot.current_price : 0);
          }, 0);
          if (autoClaimedBookings.length === 0) return null;
          return (
            <div className="glass rounded-xl p-5 mb-8 border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Auto-Claim Weekly Digest</h3>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-purple-400">{autoClaimedBookings.length}</p>
                  <p className="text-xs text-muted-foreground">Slots auto-claimed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">£{totalSavings.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Total saved</p>
                </div>
              </div>
            </div>
          );
        })()}

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="bookings"><ShoppingBag className="w-4 h-4 mr-1" /> My Bookings</TabsTrigger>
            <TabsTrigger value="saved"><Heart className="w-4 h-4 mr-1" /> Saved Slots</TabsTrigger>
            <TabsTrigger value="ai"><Brain className="w-4 h-4 mr-1" /> AI Engine</TabsTrigger>
            <TabsTrigger value="api"><Key className="w-4 h-4 mr-1" /> API Keys</TabsTrigger>
            <TabsTrigger value="calendar"><Calendar className="w-4 h-4 mr-1" /> Calendar Sync</TabsTrigger>
            <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-1" /> Payments</TabsTrigger>
          </TabsList>

          {/* ===== MY BOOKINGS TAB ===== */}
          <TabsContent value="bookings" className="space-y-4">
            {bookingsLoading ? (
              <div className="glass rounded-xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Loading your bookings…</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No bookings yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Browse live slots and claim your first deal.</p>
                <Button variant="hero" size="sm" onClick={() => navigate("/#slots")}>Browse Slots</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
                    confirmed: { label: "Confirmed", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
                    paid: { label: "Paid Upfront", color: "text-secondary", bg: "bg-secondary/10 border-secondary/30" },
                    completed: { label: "Completed", color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
                    cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
                    pending: { label: "Pending", color: "text-muted-foreground", bg: "bg-muted/50 border-border/30" },
                  };
                  const sc = statusConfig[b.status] || statusConfig.pending;
                  const slot = b.slots;
                  const saved = slot ? slot.original_price - slot.current_price : 0;

                  return (
                    <div key={b.id} className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-foreground truncate">{slot?.merchant_name || "Unknown"}</h4>
                          <Badge variant="outline" className={`text-xs ${sc.bg}`}>
                            <span className={sc.color}>{sc.label}</span>
                          </Badge>
                          {b.paid_upfront && (
                            <Badge variant="outline" className="text-xs bg-secondary/10 border-secondary/30">
                              <span className="text-secondary">💳 Upfront</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {slot && (
                            <>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{slot.location}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.time_description}</span>
                              <span>{slot.vertical}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {slot && saved > 0 && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground line-through">£{slot.original_price.toFixed(0)}</div>
                            <div className="text-lg font-bold text-secondary">£{slot.current_price.toFixed(0)}</div>
                            <div className="text-xs text-green-400 font-medium">Saved £{saved.toFixed(0)}</div>
                          </div>
                        )}
                        <div className="text-right text-xs text-muted-foreground">
                          {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== SAVED SLOTS TAB ===== */}
          <TabsContent value="saved" className="space-y-4">
            {savedLoading ? (
              <div className="glass rounded-xl p-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Loading saved slots…</p>
              </div>
            ) : savedSlots.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <Heart className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-1">No saved slots</h3>
                <p className="text-muted-foreground text-sm mb-4">Tap the heart icon on any slot to save it for later.</p>
                <Button variant="hero" size="sm" onClick={() => navigate("/#slots")}>Browse Slots</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {savedSlots.map((saved) => {
                  const s = saved.slot_data as any;
                  const discount = s.originalPrice > 0 ? Math.round(((s.originalPrice - s.currentPrice) / s.originalPrice) * 100) : 0;
                  return (
                    <div key={saved.slot_id} className="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">{s.vertical?.[0] || "?"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{s.merchant}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                          <span>{s.vertical}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Saved {new Date(saved.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {discount > 0 && (
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground line-through">£{s.originalPrice}</div>
                            <div className="text-lg font-bold text-secondary">£{s.currentPrice}</div>
                            <div className="text-xs text-green-400 font-medium">-{discount}%</div>
                          </div>
                        )}
                        <button
                          onClick={() => toggleSave(saved.slot_id, s)}
                          className="p-2 rounded-lg glass text-red-400 hover:text-red-300 transition-colors"
                          title="Remove from wishlist"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                        <Button variant="hero" size="sm" onClick={() => navigate("/#slots")}>
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== AI ENGINE TAB ===== */}
          <TabsContent value="ai" className="space-y-6">
            {/* Active Models */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" /> Active AI Models
              </h3>
              <div className="flex flex-wrap gap-2">
                {automationStatus.activeModels.map((model, i) => (
                  <Badge key={i} variant="outline" className="bg-primary/10 text-primary border-primary/30 py-1.5 px-3">
                    <Activity className="w-3 h-3 mr-1 animate-countdown" /> {model}
                  </Badge>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-secondary" /> Live AI Insights
              </h3>
              <div className="space-y-3">
                {insights.map((insight) => {
                  const config = insightTypeConfig[insight.type];
                  return (
                    <div key={insight.id} className="glass rounded-lg p-4 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0 ${config.color}`}>
                            {config.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-green-400 font-medium">{insight.impact}</span>
                              <span className="text-xs text-muted-foreground">Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                        {insight.action && (
                          <Button variant="outline" size="sm" className="text-xs shrink-0">
                            {insight.action}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Demand Forecast — Area Chart */}
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Demand Forecast (Live)
                  <span className="ml-auto flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" /><span className="text-[10px] text-muted-foreground font-mono">LIVE</span></span>
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={forecast}>
                    <defs>
                      <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(45, 96%, 57%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(45, 96%, 57%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                    <XAxis dataKey="hour" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 95%)" }} />
                    <Area type="monotone" dataKey="predicted" stroke="hsl(217, 91%, 60%)" fill="url(#gradPredicted)" strokeWidth={2} animationDuration={800} />
                    <Area type="monotone" dataKey="actual" stroke="hsl(45, 96%, 57%)" fill="url(#gradActual)" strokeWidth={2} animationDuration={800} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 15%, 55%)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Recovery — Bar Chart */}
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" /> Weekly Revenue Recovery
                  <span className="ml-auto flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" /><span className="text-[10px] text-muted-foreground font-mono">LIVE</span></span>
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                    <XAxis dataKey="day" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 95%)" }} formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} />
                    <Bar dataKey="recovered" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} animationDuration={800} name="Recovered" />
                    <Bar dataKey="optimized" fill="hsl(45, 96%, 57%)" radius={[4, 4, 0, 0]} animationDuration={800} name="AI Optimized" />
                    <Bar dataKey="lost" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} animationDuration={800} name="Lost" />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 15%, 55%)" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Breakdown — Pie Chart */}
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" /> Sector Breakdown (Live)
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={sectorData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={800}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 95%)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Fill Rate Timeline — Line Chart */}
              <div className="glass rounded-xl p-6 animate-fade-in">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" /> Fill Rate vs Target
                  <span className="ml-auto flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-countdown" /><span className="text-[10px] text-muted-foreground font-mono">LIVE</span></span>
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={fillRate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                    <XAxis dataKey="hour" tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8, fontSize: 12, color: "hsl(210, 20%, 95%)" }} formatter={(value: number) => [`${value}%`, undefined]} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(280, 70%, 55%)" strokeWidth={2.5} dot={{ fill: "hsl(280, 70%, 55%)", r: 3 }} animationDuration={800} name="Fill Rate" />
                    <Line type="monotone" dataKey="target" stroke="hsl(0, 84%, 60%)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} animationDuration={800} name="Target (85%)" />
                    <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 15%, 55%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* ===== API KEYS TAB ===== */}
          <TabsContent value="api" className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">API Keys</h3>
              <p className="text-sm text-muted-foreground mb-6">Generate free API keys to access the TickTock Slots API. Free tier: 100 requests/day.</p>

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Key name (e.g. My App)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Generate Key
                </Button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No API keys yet. Generate one above to get started.</div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className={`glass rounded-lg p-4 ${!key.active ? "opacity-50" : ""}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground">{key.name}</span>
                            <Badge variant="outline" className="text-[10px]">{key.tier}</Badge>
                            {!key.active && <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">Revoked</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs font-mono text-muted-foreground">
                              {showKeys[key.id] ? key.key : key.key.slice(0, 12) + "••••••••••••••••••••"}
                            </code>
                            <button onClick={() => setShowKeys((p) => ({ ...p, [key.id]: !p[key.id] }))} className="text-muted-foreground hover:text-foreground">
                              {showKeys[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button onClick={() => handleCopyKey(key.key)} className="text-muted-foreground hover:text-foreground">
                              {copiedKey === key.key ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{key.requestsToday}/{key.requestsLimit} today</div>
                        </div>
                        <div className="flex gap-1">
                          {key.active && (
                            <Button variant="ghost" size="sm" onClick={() => { revokeApiKey(key.id); setApiKeys(getApiKeys()); }}>
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => { deleteApiKey(key.id); setApiKeys(getApiKeys()); }} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* API Docs preview */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Quick Start</h3>
              <pre className="bg-muted rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto">
{`curl -X GET https://api.ticktockslots.io/v1/slots \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# Response
{
  "slots": [
    {
      "id": "se-000001",
      "merchant": "Luxe Hair Studio",
      "vertical": "Beauty",
      "price": 89,
      "original_price": 180,
      "urgency": "critical",
      "expires_in": 23
    }
  ],
  "meta": { "total": 847, "page": 1 }
}`}
              </pre>
            </div>
          </TabsContent>

          {/* ===== CALENDAR SYNC TAB ===== */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Calendar Connections</h3>
              <p className="text-sm text-muted-foreground mb-6">Connect your calendars to auto-detect cancellations and list slots.</p>

              <div className="flex gap-3 mb-6">
                <select
                  value={calendarProvider}
                  onChange={(e) => setCalendarProvider(e.target.value as "google" | "outlook" | "calendly")}
                  className="bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="google">Google Calendar</option>
                  <option value="outlook">Outlook</option>
                  <option value="calendly">Calendly</option>
                </select>
                <input
                  type="email"
                  placeholder="Email address"
                  value={calendarEmail}
                  onChange={(e) => setCalendarEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnectCalendar()}
                  className="flex-1 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button onClick={handleConnectCalendar} disabled={!calendarEmail.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Connect
                </Button>
              </div>

              {calendars.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No calendars connected. Add one above.</div>
              ) : (
                <div className="space-y-3">
                  {calendars.map((cal) => (
                    <div key={cal.id} className="glass rounded-lg p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                          {cal.provider === "google" ? "📅" : cal.provider === "outlook" ? "📧" : "🗓️"}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground capitalize">{cal.provider}</div>
                          <div className="text-xs text-muted-foreground">{cal.email}</div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <div>{cal.eventsTracked} events tracked</div>
                        <div className="text-green-400">{cal.cancellationsDetected} cancellations detected</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { disconnectCalendar(cal.id); setCalendars(getConnections()); }} className="text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Events */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Calendar Events</h3>
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className={`glass rounded-lg p-3 flex items-center justify-between gap-3 ${event.cancellationDetected ? "border-destructive/30" : ""}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-sm">
                        {event.source === "google" ? "📅" : event.source === "outlook" ? "📧" : "🗓️"}
                      </span>
                      <div>
                        <div className="text-sm text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={
                      event.status === "cancelled"
                        ? "bg-destructive/10 text-destructive border-destructive/30"
                        : event.status === "tentative"
                        ? "bg-secondary/10 text-secondary border-secondary/30"
                        : "bg-green-400/10 text-green-400 border-green-400/30"
                    }>
                      {event.cancellationDetected && "🔔 "}
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ===== PAYMENTS TAB ===== */}
          <TabsContent value="payments" className="space-y-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Payment & Billing</h3>
              <p className="text-sm text-muted-foreground mb-6">Manage subscriptions and payment methods for claiming premium slots.</p>

              {/* Current Plan */}
              <div className="glass rounded-xl p-5 mb-6 border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-foreground font-semibold">Explorer Plan</h4>
                    <p className="text-xs text-muted-foreground">Free — access to delayed feed</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/30">Current</Badge>
                </div>
                <Button variant="hero" className="w-full">
                  <Zap className="w-4 h-4 mr-1" /> Upgrade to Premium — $9.99/mo
                </Button>
              </div>

              {/* Payment Methods */}
              <h4 className="text-sm font-semibold text-foreground mb-3">Payment Methods</h4>
              <div className="glass rounded-lg p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No payment method on file</span>
                </div>
                <Button variant="outline" size="sm">Add Card</Button>
              </div>

              {/* Transaction History */}
              <h4 className="text-sm font-semibold text-foreground mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {[
                  { id: "TXN-001", desc: "Luxe Hair Studio — Slot Claim", amount: 89, date: "Today 2:34 PM", status: "completed" },
                  { id: "TXN-002", desc: "Atlantic Charter — Empty Leg", amount: 4200, date: "Today 11:20 AM", status: "completed" },
                  { id: "TXN-003", desc: "Noma Restaurant — Table", amount: 280, date: "Yesterday 7:15 PM", status: "refunded" },
                ].map((txn) => (
                  <div key={txn.id} className="glass rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-foreground">{txn.desc}</div>
                      <div className="text-xs text-muted-foreground">{txn.id} · {txn.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">${txn.amount.toLocaleString()}</div>
                      <Badge variant="outline" className={txn.status === "completed" ? "text-green-400 border-green-400/30" : "text-secondary border-secondary/30"}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
