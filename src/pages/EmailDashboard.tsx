import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, CheckCircle, XCircle, Ban, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

interface EmailLog {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

type TimeRange = "24h" | "7d" | "30d";

const STATUS_COLORS: Record<string, string> = {
  sent: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  dlq: "bg-red-500/20 text-red-400 border-red-500/30",
  suppressed: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  bounced: "bg-red-500/20 text-red-400 border-red-500/30",
  complained: "bg-red-500/20 text-red-400 border-red-500/30",
};

const PAGE_SIZE = 50;

function getStartDate(range: TimeRange): string {
  const now = new Date();
  if (range === "24h") now.setHours(now.getHours() - 24);
  else if (range === "7d") now.setDate(now.getDate() - 7);
  else now.setDate(now.getDate() - 30);
  return now.toISOString();
}

export default function EmailDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!adminLoading && (!user || !isAdmin)) navigate("/dashboard");
  }, [adminLoading, isAdmin, user, navigate]);

  const fetchLogs = async () => {
    setLoading(true);
    const startDate = getStartDate(timeRange);

    const { data, error } = await supabase
      .from("email_send_log")
      .select("*")
      .gte("created_at", startDate)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) {
      console.error("Failed to fetch email logs", error);
      setLogs([]);
    } else {
      setLogs((data as EmailLog[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, [isAdmin, timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const dedupedLogs = useMemo(() => {
    const map = new Map<string, EmailLog>();
    for (const log of logs) {
      const key = log.message_id || log.id;
      const existing = map.get(key);
      if (!existing || new Date(log.created_at) > new Date(existing.created_at)) {
        map.set(key, log);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [logs]);

  const templateNames = useMemo(
    () => [...new Set(dedupedLogs.map((l) => l.template_name))].sort(),
    [dedupedLogs]
  );

  const filteredLogs = useMemo(() => {
    return dedupedLogs.filter((log) => {
      if (templateFilter !== "all" && log.template_name !== templateFilter) return false;
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      return true;
    });
  }, [dedupedLogs, templateFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const sent = filteredLogs.filter((l) => l.status === "sent").length;
    const failed = filteredLogs.filter((l) => ["failed", "dlq"].includes(l.status)).length;
    const suppressed = filteredLogs.filter((l) => l.status === "suppressed").length;
    const pending = filteredLogs.filter((l) => l.status === "pending").length;
    return { total, sent, failed, suppressed, pending };
  }, [filteredLogs]);

  const pagedLogs = filteredLogs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);

  useEffect(() => setPage(0), [templateFilter, statusFilter, timeRange]);

  if (adminLoading) return <PageLoader />;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Email Dashboard</h1>
            <p className="text-muted-foreground mt-1">Monitor email delivery across your app</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["24h", "7d", "30d"] as TimeRange[]).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={timeRange === r ? "default" : "ghost"}
                onClick={() => setTimeRange(r)}
                className="text-xs"
              >
                {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : "30 Days"}
              </Button>
            ))}
          </div>

          <Select value={templateFilter} onValueChange={setTemplateFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All templates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Templates</SelectItem>
              {templateNames.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="dlq">DLQ</SelectItem>
              <SelectItem value="suppressed">Suppressed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard icon={<Mail className="h-5 w-5" />} label="Total" value={stats.total} loading={loading} />
          <StatCard icon={<CheckCircle className="h-5 w-5 text-emerald-400" />} label="Sent" value={stats.sent} loading={loading} />
          <StatCard icon={<RefreshCw className="h-5 w-5 text-yellow-400" />} label="Pending" value={stats.pending} loading={loading} />
          <StatCard icon={<XCircle className="h-5 w-5 text-red-400" />} label="Failed" value={stats.failed} loading={loading} />
          <StatCard icon={<Ban className="h-5 w-5 text-orange-400" />} label="Suppressed" value={stats.suppressed} loading={loading} />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Email Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No emails found for the selected filters.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Template</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs">{log.template_name}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{log.recipient_email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={STATUS_COLORS[log.status] || ""}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs text-red-400 max-w-[200px] truncate">
                            {log.error_message || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages} ({filteredLogs.length} emails)
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number; loading: boolean }) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-5 pb-4 px-5 flex items-center gap-3">
        {icon}
        <div>
          {loading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <RefreshCw className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
