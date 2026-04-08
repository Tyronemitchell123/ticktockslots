import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Menu, X, LogOut, User, Shield } from "lucide-react";
import NotificationCenter from "./NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">TickTock Slots</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#slots" className="hover:text-foreground transition-colors">Live Slots</a>
          <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#sectors" className="hover:text-foreground transition-colors">Sectors</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-1" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4" />
                Profile
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-1" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-1" onClick={() => navigate("/admin")}>
                <Shield className="w-4 h-4" />
                Automation
              </Button>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-1" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate("/auth")}>Sign In</Button>
              <Button variant="hero" size="sm" className="hidden md:inline-flex" onClick={() => navigate("/auth")}>Get Early Access</Button>
            </>
          )}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/30 px-4 py-4 flex flex-col gap-4">
          <a href="#slots" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Live Slots</a>
          <a href="#how" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#sectors" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sectors</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          <div className="flex flex-col gap-2 pt-2 border-t border-border/30">
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}>Dashboard</Button>
                <Button variant="ghost" size="sm" onClick={() => { setMobileOpen(false); navigate("/admin"); }}>Automation</Button>
                <Button variant="ghost" size="sm" onClick={() => { setMobileOpen(false); handleSignOut(); }}>Sign Out</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>Sign In</Button>
                <Button variant="hero" size="sm" onClick={() => { setMobileOpen(false); navigate("/auth"); }}>Get Early Access</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
