import { Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">TickTock Slots</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              The global liquidity engine for perishable inventory. Fill every slot. Waste nothing.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-10 text-sm">
            <div>
              <div className="font-semibold text-foreground mb-3">Product</div>
              <div className="space-y-2 text-muted-foreground">
                <a href="/#slots" className="block hover:text-foreground transition-colors">Live Slots</a>
                <a href="/#how" className="block hover:text-foreground transition-colors">For Merchants</a>
                <a href="/#how" className="block hover:text-foreground transition-colors">API Access</a>
                <a href="/#pricing" className="block hover:text-foreground transition-colors">Pricing</a>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">Sectors</div>
              <div className="space-y-2 text-muted-foreground">
                <a href="/#sectors" className="block hover:text-foreground transition-colors">Beauty & Wellness</a>
                <a href="/#sectors" className="block hover:text-foreground transition-colors">Aviation</a>
                <a href="/#sectors" className="block hover:text-foreground transition-colors">Maritime</a>
                <a href="/#sectors" className="block hover:text-foreground transition-colors">Healthcare</a>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">Company</div>
              <div className="space-y-2 text-muted-foreground">
                <a href="/about" className="block hover:text-foreground transition-colors">About</a>
                <a href="/careers" className="block hover:text-foreground transition-colors">Careers</a>
                <a href="/esg" className="block hover:text-foreground transition-colors">ESG Report</a>
                <a href="/contact" className="block hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 mt-10 pt-6 text-center text-xs text-muted-foreground">
          © 2026 TickTock Slots. All rights reserved. Filling what others waste.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
