import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
          Have a question, partnership inquiry, or just want to say hello? We'd love to hear from you.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact form */}
          <div className="glass rounded-2xl p-8 border border-border/30">
            {sent ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Message Sent</h3>
                <p className="text-sm text-muted-foreground">We'll respond within 24 hours.</p>
                <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" required maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required maxLength={255} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required maxLength={200} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us more..." rows={5} required maxLength={2000} />
                </div>
                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-8 border border-border/30">
              <h3 className="font-bold text-foreground mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Email</div>
                    <a href="mailto:hello@slotengine.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      hello@slotengine.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Phone</div>
                    <a href="tel:+442012345678" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      +44 (0) 20 1234 5678
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">HQ</div>
                    <p className="text-sm text-muted-foreground">
                      71 Rivington Street<br />
                      London EC2A 3AY<br />
                      United Kingdom
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-8 border border-border/30">
              <h3 className="font-bold text-foreground mb-2">For Merchants</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Interested in listing your inventory on SlotEngine? Our merchant team will get you set up in under 24 hours.
              </p>
              <a href="mailto:merchants@slotengine.com" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                merchants@slotengine.com →
              </a>
            </div>

            <div className="glass rounded-2xl p-8 border border-border/30">
              <h3 className="font-bold text-foreground mb-2">Press & Media</h3>
              <p className="text-sm text-muted-foreground mb-3">
                For press inquiries, interview requests, or media kits.
              </p>
              <a href="mailto:press@slotengine.com" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                press@slotengine.com →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
