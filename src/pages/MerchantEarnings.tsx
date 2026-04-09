import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LuxuryLayout from "@/components/LuxuryLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Clock, TrendingUp, ArrowUpRight, Wallet } from "lucide-react";
import { formatPriceInCurrency } from "@/lib/currency";

interface MerchantProfile {
  id: string;
  name: string;
  vertical: string;
  region: string;
  is_verified: boolean;
  stripe_onboarding_complete: boolean;
}

interface Commission {
  id: string;
  gross_amount: number;
  platform_fee: number;
  merchant_payout: number;
  status: string;
  created_at: string;
  booking_id: string;
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  stripe_payout_id: string | null;
  created_at: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case "paid":
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
};

const MerchantEarnings = () => {
  const { user } = useAuth();
  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);

      // Get merchant profile linked to this user
      const { data: m } = await supabase
        .from("merchants")
        .select("id, name, vertical, region, is_verified, stripe_onboarding_complete")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!m) {
        setLoading(false);
        return;
      }
      setMerchant(m);

      // Fetch commissions and payouts in parallel
      const [commRes, payRes] = await Promise.all([
        supabase
          .from("commissions")
          .select("id, gross_amount, platform_fee, merchant_payout, status, created_at, booking_id")
          .eq("merchant_id", m.id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("payouts")
          .select("id, amount, status, stripe_payout_id, created_at")
          .eq("merchant_id", m.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      setCommissions(commRes.data ?? []);
      setPayouts(payRes.data ?? []);
      setLoading(false);
    };

    load();
  }, [user]);

  const fmt = (n: number) => formatPriceInCurrency(n, "GBP", "GBP");

  const totalEarned = commissions.reduce((s, c) => s + c.merchant_payout, 0);
  const pendingEarnings = commissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + c.merchant_payout, 0);
  const paidOut = payouts
    .filter((p) => p.status === "completed" || p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  if (loading) {
    return (
      <LuxuryLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </LuxuryLayout>
    );
  }

  if (!merchant) {
    return (
      <LuxuryLayout>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Merchant Account Found</h2>
          <p className="text-muted-foreground">
            Your account is not linked to a merchant profile. Contact the platform admin to get set up.
          </p>
        </div>
      </LuxuryLayout>
    );
  }

  return (
    <LuxuryLayout>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Merchant Earnings</h1>
          <p className="text-muted-foreground mt-1">
            {merchant.name} &middot; {merchant.vertical} &middot; {merchant.region}
            {merchant.is_verified && (
              <Badge variant="default" className="ml-2">Verified</Badge>
            )}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(totalEarned)}</div>
              <p className="text-xs text-muted-foreground">{commissions.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(pendingEarnings)}</div>
              <p className="text-xs text-muted-foreground">Awaiting transfer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(paidOut)}</div>
              <p className="text-xs text-muted-foreground">{payouts.filter((p) => p.status === "completed" || p.status === "paid").length} payouts</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="commissions">
          <TabsList>
            <TabsTrigger value="commissions">Transaction History</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <Card>
              <CardHeader>
                <CardTitle>Commissions</CardTitle>
                <CardDescription>Your 70% share from each booking</CardDescription>
              </CardHeader>
              <CardContent>
                {commissions.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">No transactions yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Gross</TableHead>
                        <TableHead>Platform Fee</TableHead>
                        <TableHead>Your Payout</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{fmt(c.gross_amount)}</TableCell>
                          <TableCell>{fmt(c.platform_fee)}</TableCell>
                          <TableCell className="font-medium">{fmt(c.merchant_payout)}</TableCell>
                          <TableCell>
                            <Badge variant={statusColor(c.status)}>{c.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payouts</CardTitle>
                <CardDescription>Transfers to your connected Stripe account</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">No payouts yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Transfer ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payouts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{fmt(p.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={statusColor(p.status)}>{p.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {p.stripe_payout_id || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LuxuryLayout>
  );
};

export default MerchantEarnings;
