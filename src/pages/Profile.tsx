import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Camera, Loader2, Save, Shield, Star,
  CheckCircle2, AlertTriangle, XCircle, User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Trust score state
  const [trustScore, setTrustScore] = useState(80);
  const [totalBookings, setTotalBookings] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [cancellations, setCancellations] = useState(0);
  const [noShows, setNoShows] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const [profileRes, trustRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_trust_scores").select("*").eq("user_id", user.id).single(),
      ]);

      if (profileRes.data) {
        setDisplayName(profileRes.data.display_name || "");
        setPhone(profileRes.data.phone || "");
        setAvatarUrl(profileRes.data.avatar_url);
      }

      if (trustRes.data) {
        setTrustScore(trustRes.data.score);
        setTotalBookings(trustRes.data.total_bookings);
        setCompletedBookings(trustRes.data.completed_bookings);
        setCancellations(trustRes.data.cancellations);
        setNoShows(trustRes.data.no_shows);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2MB.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(url);
      toast({ title: "Avatar updated!" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName, phone })
        .eq("id", user.id);

      if (error) throw error;
      toast({ title: "Profile saved!" });
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getTrustLevel = () => {
    if (trustScore >= 80) return { label: "Excellent", color: "text-green-400", icon: CheckCircle2, bg: "bg-green-400/10 border-green-400/30" };
    if (trustScore >= 60) return { label: "Good", color: "text-secondary", icon: Star, bg: "bg-secondary/10 border-secondary/30" };
    if (trustScore >= 40) return { label: "Fair", color: "text-orange-400", icon: AlertTriangle, bg: "bg-orange-400/10 border-orange-400/30" };
    return { label: "Low", color: "text-destructive", icon: XCircle, bg: "bg-destructive/10 border-destructive/30" };
  };

  const trust = getTrustLevel();
  const TrustIcon = trust.icon;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
        </div>

        {/* Avatar Section */}
        <div className="glass rounded-2xl border border-border/30 p-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-muted overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 bg-background/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                ) : (
                  <Camera className="w-6 h-6 text-foreground" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{displayName || "New User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="outline" className={`mt-2 ${trust.bg}`}>
                <TrustIcon className={`w-3 h-3 mr-1 ${trust.color}`} />
                <span className={trust.color}>Trust: {trust.label}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="glass rounded-2xl border border-border/30 p-6 space-y-5">
          <h3 className="text-lg font-semibold text-foreground">Profile Details</h3>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+44 7700 900000"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>

          <Button variant="hero" onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Trust Score */}
        <div className="glass rounded-2xl border border-border/30 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Trust Score</h3>
          </div>

          {/* Score Gauge */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={trustScore >= 60 ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(trustScore / 100) * 264} 264`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{trustScore}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <div className="flex-1 space-y-1 text-sm">
              <p className={`font-medium ${trust.color}`}>{trust.label} Standing</p>
              <p className="text-muted-foreground">
                {trustScore >= 60
                  ? "You have flexible payment options on all slots."
                  : "Score below 60 — 100% upfront payment required on all bookings."}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total", value: totalBookings, color: "text-foreground" },
              { label: "Completed", value: completedBookings, color: "text-green-400" },
              { label: "Cancelled", value: cancellations, color: "text-secondary" },
              { label: "No-Shows", value: noShows, color: "text-destructive" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-3 text-center">
                <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
