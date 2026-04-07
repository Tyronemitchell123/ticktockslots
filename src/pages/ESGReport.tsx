import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Leaf, Recycle, TrendingDown, Globe, BarChart3 } from "lucide-react";

const ESGReport = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="w-8 h-8 text-green-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">ESG Report 2026</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          Our commitment to environmental sustainability, social impact, and responsible governance.
        </p>

        {/* Key metrics */}
        <div className="grid sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: "847t", label: "CO₂ Saved", icon: <Recycle className="w-5 h-5 text-green-400" /> },
            { value: "$2.4M", label: "Revenue Recovered Daily", icon: <TrendingDown className="w-5 h-5 text-secondary" /> },
            { value: "12+", label: "Verticals Served", icon: <BarChart3 className="w-5 h-5 text-primary" /> },
            { value: "6", label: "Continents Active", icon: <Globe className="w-5 h-5 text-primary" /> },
          ].map((m) => (
            <div key={m.label} className="glass rounded-xl p-5 border border-border/30 text-center">
              <div className="flex justify-center mb-2">{m.icon}</div>
              <div className="text-2xl font-mono font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Environmental */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-400" /> Environmental
          </h2>
          <div className="glass rounded-2xl p-8 border border-border/30 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Reducing Waste at Scale</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every filled slot represents resources that would otherwise be wasted — energy for empty treatment rooms, food prepared for no-show diners, fuel for half-empty charter flights. By filling these gaps, we directly reduce the carbon footprint of service industries worldwide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Carbon Tracking</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We measure CO₂ savings per filled slot using industry-standard emission factors for each vertical. Our real-time dashboard tracks cumulative impact — currently 847 tonnes saved and growing daily.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Net Zero Operations</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SlotEngine's own operations are carbon neutral. We run on renewable-powered cloud infrastructure and offset remaining emissions through verified carbon credit programmes.
              </p>
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">🤝 Social</h2>
          <div className="glass rounded-2xl p-8 border border-border/30 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Merchant Empowerment</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We help small and medium businesses recover revenue from cancellations — income that would otherwise be lost. Over 60% of our merchants are independent businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Accessible Pricing</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discounted last-minute slots make premium services accessible to consumers who couldn't otherwise afford them — from Michelin dining to specialist healthcare.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Diverse & Remote Team</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team spans 12 countries with a 100% remote-friendly policy. We actively invest in underrepresented talent pipelines and equitable hiring practices.
              </p>
            </div>
          </div>
        </section>

        {/* Governance */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">⚖️ Governance</h2>
          <div className="glass rounded-2xl p-8 border border-border/30 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Trust Score System</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our proprietary trust scoring ensures accountability. Users with poor track records face upfront payment requirements, protecting merchants from no-shows and late cancellations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Merchant Verification</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every merchant on SlotEngine is verified before listing. We validate licenses, certifications, and insurance across all verticals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Data Privacy</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                GDPR-compliant by design. We process only what's necessary and never sell user data. All transactions are encrypted end-to-end.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ESGReport;
