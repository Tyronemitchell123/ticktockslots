import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/contexts/AuthContext";
import { firecrawlApi } from "@/lib/api/firecrawl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Search, Globe, Mail, RefreshCw, ExternalLink, Loader2,
  Building2, UserPlus, Eye, Trash2, Send, MailPlus, CheckSquare
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

interface MerchantLead {
  id: string;
  business_name: string;
  website_url: string | null;
  contact_email: string | null;
  phone: string | null;
  vertical: string | null;
  region: string | null;
  location: string | null;
  description: string | null;
  logo_url: string | null;
  scraped_data: any;
  status: string;
  notes: string | null;
  outreach_sent_at: string | null;
  invitation_sent_at: string | null;
  invitation_opened_at: string | null;
  invitation_accepted_at: string | null;
  invitation_token: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  scraped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  invited: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  interested: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  converted: "bg-green-500/20 text-green-400 border-green-500/30",
  rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

const VERTICALS = ["Dining", "Spa & Wellness", "Events", "Travel", "Healthcare", "Fitness", "Beauty"];

export default function MerchantProspecting() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<MerchantLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState("London");
  const [searchVertical, setSearchVertical] = useState("Dining");
  const [searching, setSearching] = useState(false);
  const [scraping, setScraping] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<MerchantLead | null>(null);
  const [sendingOutreach, setSendingOutreach] = useState<string | null>(null);
  const [sendingInvitation, setSendingInvitation] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ sent: 0, total: 0 });

  useEffect(() => {
    if (!adminLoading && (!user || !isAdmin)) navigate("/dashboard");
  }, [adminLoading, isAdmin, user, navigate]);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("merchant_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) console.error("Failed to fetch leads", error);
    setLeads((data as MerchantLead[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchLeads();
  }, [isAdmin]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const query = searchQuery || `${searchVertical} businesses with cancellation slots near ${searchRegion}`;
      const result = await firecrawlApi.search(query, { limit: 10 });

      if (!result.success) {
        toast.error(result.error || "Search failed");
        return;
      }

      const searchData = result.data || result;
      const results = searchData?.data || searchData?.results || [];

      if (!results.length) {
        toast.info("No results found. Try a different query.");
        return;
      }

      let added = 0;
      for (const item of results) {
        if (!item.url) continue;
        const exists = leads.some((l) => l.website_url === item.url);
        if (exists) continue;

        const { error } = await supabase.from("merchant_leads").insert({
          business_name: item.title || new URL(item.url).hostname,
          website_url: item.url,
          description: item.description || null,
          vertical: searchVertical,
          region: searchRegion,
          status: "new",
          scraped_data: { search_result: item },
        });
        if (!error) added++;
      }

      toast.success(`Added ${added} new leads from search`);
      await fetchLeads();
    } catch (err) {
      toast.error("Search failed");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleScrape = async (lead: MerchantLead) => {
    if (!lead.website_url) {
      toast.error("No website URL to scrape");
      return;
    }
    setScraping(lead.id);
    try {
      const result = await firecrawlApi.scrape(lead.website_url, {
        formats: ["markdown", "links"],
      });

      if (!result.success) {
        toast.error(result.error || "Scrape failed");
        return;
      }

      const scraped = result.data || result;
      const markdown = scraped?.data?.markdown || scraped?.markdown || "";
      const metadata = scraped?.data?.metadata || scraped?.metadata || {};

      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = markdown.match(emailRegex) || [];
      const contactEmail = emails.find(
        (e: string) => !e.includes("example") && !e.includes("noreply") && !e.includes("@sentry")
      ) || emails[0] || null;

      const phoneRegex = /(?:\+44|0)\s?(?:\d[\s-]?){9,10}/g;
      const phones = markdown.match(phoneRegex) || [];
      const phone = phones[0]?.trim() || null;

      const { error } = await supabase
        .from("merchant_leads")
        .update({
          scraped_data: { ...lead.scraped_data, scrape_result: { markdown: markdown.slice(0, 5000), metadata } },
          status: "scraped" as string,
          description: metadata?.description || lead.description,
          contact_email: contactEmail || lead.contact_email,
          phone: phone || lead.phone,
          logo_url: metadata?.ogImage || lead.logo_url,
        })
        .eq("id", lead.id);

      if (error) throw error;
      toast.success(`Scraped ${lead.business_name} — ${contactEmail ? "email found!" : "no email found"}`);
      await fetchLeads();
    } catch (err) {
      toast.error("Scrape failed");
      console.error(err);
    } finally {
      setScraping(null);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("merchant_leads")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      await fetchLeads();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("merchant_leads").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else {
      toast.success("Lead removed");
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSendOutreach = async (lead: MerchantLead) => {
    if (!lead.contact_email) {
      toast.error("No email address — scrape the website first");
      return;
    }
    setSendingOutreach(lead.id);
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "merchant-outreach",
          recipientEmail: lead.contact_email,
          idempotencyKey: `outreach-${lead.id}`,
          templateData: {
            businessName: lead.business_name,
            vertical: lead.vertical,
            region: lead.region,
          },
        },
      });
      if (error) throw error;

      await supabase
        .from("merchant_leads")
        .update({ status: "contacted", outreach_sent_at: new Date().toISOString() })
        .eq("id", lead.id);

      toast.success(`Outreach email sent to ${lead.contact_email}`);
      await fetchLeads();
    } catch (err) {
      console.error("Outreach failed", err);
      toast.error("Failed to send outreach email");
    } finally {
      setSendingOutreach(null);
    }
  };

  const handleSendInvitation = async (lead: MerchantLead) => {
    if (!lead.contact_email) {
      toast.error("No email address — scrape the website first");
      return;
    }
    setSendingInvitation(lead.id);
    try {
      const token = crypto.randomUUID();
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "merchant-invitation",
          recipientEmail: lead.contact_email,
          idempotencyKey: `invitation-${lead.id}`,
          templateData: {
            businessName: lead.business_name,
            vertical: lead.vertical,
          },
        },
      });
      if (error) throw error;

      await supabase
        .from("merchant_leads")
        .update({
          status: "invited",
          invitation_sent_at: new Date().toISOString(),
          invitation_token: token,
        } as any)
        .eq("id", lead.id);

      toast.success(`Invitation sent to ${lead.contact_email}`);
      await fetchLeads();
    } catch (err) {
      console.error("Invitation failed", err);
      toast.error("Failed to send invitation email");
    } finally {
      setSendingInvitation(null);
    }
  };

  // Bulk send invitations
  const handleBulkSendInvitations = async () => {
    const eligibleLeads = leads.filter(
      (l) => selectedIds.has(l.id) && l.contact_email && !l.invitation_sent_at
    );

    if (eligibleLeads.length === 0) {
      toast.error("No eligible leads selected (need email & not already invited)");
      return;
    }

    setBulkSending(true);
    setBulkProgress({ sent: 0, total: eligibleLeads.length });

    let successCount = 0;
    for (const lead of eligibleLeads) {
      try {
        const token = crypto.randomUUID();
        const { error } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "merchant-invitation",
            recipientEmail: lead.contact_email,
            idempotencyKey: `invitation-${lead.id}`,
            templateData: {
              businessName: lead.business_name,
              vertical: lead.vertical,
            },
          },
        });

        if (!error) {
          await supabase
            .from("merchant_leads")
            .update({
              status: "invited",
              invitation_sent_at: new Date().toISOString(),
              invitation_token: token,
            } as any)
            .eq("id", lead.id);
          successCount++;
        }
      } catch (err) {
        console.error(`Failed for ${lead.business_name}`, err);
      }
      setBulkProgress((prev) => ({ ...prev, sent: prev.sent + 1 }));
    }

    toast.success(`Sent ${successCount}/${eligibleLeads.length} invitations`);
    setSelectedIds(new Set());
    setBulkSending(false);
    await fetchLeads();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) return null;

  const stats = {
    total: leads.length,
    withEmail: leads.filter((l) => l.contact_email).length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    invited: leads.filter((l) => l.invitation_sent_at).length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  const selectedEligibleCount = leads.filter(
    (l) => selectedIds.has(l.id) && l.contact_email && !l.invitation_sent_at
  ).length;

  const invitationStatusBadge = (lead: MerchantLead) => {
    if (lead.invitation_accepted_at) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Accepted</Badge>;
    }
    if (lead.invitation_opened_at) {
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Opened</Badge>;
    }
    if (lead.invitation_sent_at) {
      return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px]">Sent</Badge>;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Merchant Prospecting</h1>
            <p className="text-muted-foreground mt-1">Discover, scrape & invite potential merchants</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Building2 className="h-5 w-5" />} label="Total Leads" value={stats.total} />
          <StatCard icon={<Mail className="h-5 w-5 text-emerald-400" />} label="With Email" value={stats.withEmail} />
          <StatCard icon={<UserPlus className="h-5 w-5 text-yellow-400" />} label="Contacted" value={stats.contacted} />
          <StatCard icon={<MailPlus className="h-5 w-5 text-cyan-400" />} label="Invited" value={stats.invited} />
          <StatCard icon={<Globe className="h-5 w-5 text-blue-400" />} label="Converted" value={stats.converted} />
        </div>

        {/* Search Panel */}
        <Card className="border-border/50 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" /> Find Merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
              <Select value={searchVertical} onValueChange={setSearchVertical}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VERTICALS.map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Region (e.g. London, Manchester)"
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                className="md:w-[200px]"
              />
              <Input
                placeholder="Custom search query (optional)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="border-primary/30 bg-primary/5 mb-4">
            <CardContent className="py-3 px-5 flex items-center justify-between">
              <p className="text-sm">
                <strong>{selectedIds.size}</strong> selected
                {selectedEligibleCount > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({selectedEligibleCount} eligible for invitation)
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkSendInvitations}
                  disabled={bulkSending || selectedEligibleCount === 0}
                >
                  {bulkSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MailPlus className="h-4 w-4 mr-2" />
                  )}
                  Send {selectedEligibleCount} Invitations
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
            {bulkSending && (
              <div className="px-5 pb-3">
                <Progress value={(bulkProgress.sent / bulkProgress.total) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {bulkProgress.sent}/{bulkProgress.total} processed
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Leads Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Leads ({leads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : leads.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No leads yet. Use the search above to find merchants.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedIds.size === leads.length && leads.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Vertical</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invitation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id} className={selectedIds.has(lead.id) ? "bg-primary/5" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(lead.id)}
                            onCheckedChange={() => toggleSelect(lead.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{lead.business_name}</span>
                            {lead.website_url && (
                              <a
                                href={lead.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                              >
                                {new URL(lead.website_url).hostname}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{lead.vertical || "—"}</TableCell>
                        <TableCell className="text-sm">
                          {lead.contact_email ? (
                            <a href={`mailto:${lead.contact_email}`} className="text-primary hover:underline text-xs">
                              {lead.contact_email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select value={lead.status} onValueChange={(s) => handleStatusChange(lead.id, s)}>
                            <SelectTrigger className="w-[120px] h-7 text-xs">
                              <Badge variant="outline" className={STATUS_COLORS[lead.status] || ""}>
                                {lead.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(STATUS_COLORS).map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {invitationStatusBadge(lead) || (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleScrape(lead)}
                              disabled={scraping === lead.id || !lead.website_url}
                              title="Scrape website"
                            >
                              {scraping === lead.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Globe className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendOutreach(lead)}
                              disabled={sendingOutreach === lead.id || !lead.contact_email || lead.outreach_sent_at !== null}
                              title={lead.outreach_sent_at ? "Outreach already sent" : lead.contact_email ? "Send outreach email" : "No email — scrape first"}
                              className={lead.outreach_sent_at ? "text-muted-foreground" : "text-primary"}
                            >
                              {sendingOutreach === lead.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendInvitation(lead)}
                              disabled={sendingInvitation === lead.id || !lead.contact_email || !!lead.invitation_sent_at}
                              title={lead.invitation_sent_at ? "Invitation already sent" : lead.contact_email ? "Send invitation email" : "No email — scrape first"}
                              className={lead.invitation_sent_at ? "text-muted-foreground" : "text-cyan-400"}
                            >
                              {sendingInvitation === lead.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MailPlus className="h-4 w-4" />
                              )}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="ghost" onClick={() => setSelectedLead(lead)} title="View details">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{lead.business_name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 text-sm">
                                  {lead.website_url && <p><strong>Website:</strong> <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="text-primary">{lead.website_url}</a></p>}
                                  {lead.contact_email && <p><strong>Email:</strong> {lead.contact_email}</p>}
                                  {lead.phone && <p><strong>Phone:</strong> {lead.phone}</p>}
                                  {lead.vertical && <p><strong>Vertical:</strong> {lead.vertical}</p>}
                                  {lead.region && <p><strong>Region:</strong> {lead.region}</p>}
                                  {lead.description && <p><strong>Description:</strong> {lead.description}</p>}
                                  {lead.outreach_sent_at && <p><strong>Outreach sent:</strong> {new Date(lead.outreach_sent_at).toLocaleString()}</p>}
                                  
                                  {/* Invitation tracking */}
                                  {lead.invitation_sent_at && (
                                    <div className="border rounded-lg p-3 space-y-2 bg-muted/30">
                                      <p className="font-semibold text-sm">Invitation Tracking</p>
                                      <p>📩 <strong>Sent:</strong> {new Date(lead.invitation_sent_at).toLocaleString()}</p>
                                      {lead.invitation_opened_at && (
                                        <p>👁 <strong>Opened:</strong> {new Date(lead.invitation_opened_at).toLocaleString()}</p>
                                      )}
                                      {lead.invitation_accepted_at && (
                                        <p>✅ <strong>Accepted:</strong> {new Date(lead.invitation_accepted_at).toLocaleString()}</p>
                                      )}
                                      {!lead.invitation_opened_at && !lead.invitation_accepted_at && (
                                        <p className="text-muted-foreground text-xs">No opens or acceptance tracked yet</p>
                                      )}
                                    </div>
                                  )}

                                  {lead.scraped_data?.scrape_result?.markdown && (
                                    <div>
                                      <strong>Scraped Content (preview):</strong>
                                      <pre className="bg-muted p-2 rounded text-xs mt-1 max-h-60 overflow-auto whitespace-pre-wrap">
                                        {lead.scraped_data.scrape_result.markdown.slice(0, 2000)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(lead.id)} title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-5 pb-4 px-5 flex items-center gap-3">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
