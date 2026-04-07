import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">SlotEngine</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The global liquidity engine for perishable inventory. Fill every slot. Waste nothing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-10 text-sm">
            <div>
              <div className="font-semibold text-foreground mb-3">Product</div>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-foreground cursor-pointer transition-colors">Live Slots</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">For Merchants</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">API Access</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">Pricing</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">Sectors</div>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-foreground cursor-pointer transition-colors">Beauty & Wellness</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">Aviation</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">Maritime</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">Healthcare</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">Company</div>
              <div className="space-y-2 text-muted-foreground">
                <div className="hover:text-foreground cursor-pointer transition-colors">About</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">Careers</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">ESG Report</div>
                <div className="hover:text-foreground cursor-pointer transition-colors">Contact</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-10 pt-6 text-center text-xs text-muted-foreground">
          © 2026 SlotEngine. All rights reserved. Filling what others waste.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
