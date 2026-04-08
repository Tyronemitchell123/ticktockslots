import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "slotengine_cookie_consent";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Cookie className="text-primary shrink-0" size={18} />
            <h3 className="text-sm font-semibold text-foreground">Cookie Preferences</h3>
          </div>
          <button onClick={reject} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed mb-4">
          We use essential cookies for authentication and security. Optional analytics cookies help us improve the platform.
        </p>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={reject} className="text-xs">
            Reject All
          </Button>
          <Button size="sm" onClick={accept} className="text-xs ml-auto">
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
