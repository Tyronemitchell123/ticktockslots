import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLES = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "London / Remote", type: "Full-time" },
  { title: "ML Engineer — Pricing", team: "AI & Data", location: "London / Remote", type: "Full-time" },
  { title: "Product Designer", team: "Design", location: "London", type: "Full-time" },
  { title: "Account Executive — Enterprise", team: "Sales", location: "New York", type: "Full-time" },
  { title: "Merchant Success Manager", team: "Operations", location: "Manchester / Remote", type: "Full-time" },
  { title: "DevOps / Platform Engineer", team: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Content Marketing Manager", team: "Marketing", location: "London / Remote", type: "Full-time" },
  { title: "Data Analyst", team: "AI & Data", location: "Remote", type: "Full-time" },
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Careers at TickTock Slots</h1>
        <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
          Join the team building the world's real-time marketplace for perishable inventory. We're fast-moving, mission-driven, and fully distributed.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { stat: "40+", label: "Team Members" },
            { stat: "12", label: "Countries" },
            { stat: "100%", label: "Remote-Friendly" },
          ].map((s) => (
            <div key={s.label} className="glass rounded-xl p-5 border border-border/30 text-center">
              <div className="text-2xl font-mono font-bold text-primary">{s.stat}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-6">Open Positions</h2>
        <div className="space-y-3">
          {ROLES.map((role) => (
            <div key={role.title} className="glass rounded-xl p-5 border border-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/30 transition-colors">
              <div>
                <h3 className="font-semibold text-foreground">{role.title}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{role.team}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{role.location}</span>
                  <span>{role.type}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Apply <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8 border border-border/30 mt-12 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Don't see your role?</h3>
          <p className="text-sm text-muted-foreground mb-4">We're always looking for exceptional people. Send us your CV and tell us how you'd contribute.</p>
          <Button variant="hero">
            Send Open Application <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
