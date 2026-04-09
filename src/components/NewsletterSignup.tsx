import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from("subscribers" as any)
      .insert({ email: email.trim().toLowerCase(), source: "homepage" } as any);

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
        setSubscribed(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      return;
    }

    setSubscribed(true);
    toast.success("You're subscribed! Watch your inbox for exclusive deals.");
  };

  if (subscribed) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">You're on the list!</h3>
          <p className="text-muted-foreground">We'll send you the best last-minute deals before anyone else.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-card/50 border-y border-border">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-4">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Never Miss a Deal
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Get exclusive last-minute cancellation deals delivered to your inbox. Be the first to know when premium slots open up.
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-background border-border"
          />
          <Button type="submit" disabled={loading} className="whitespace-nowrap">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
            Subscribe
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">No spam, unsubscribe anytime.</p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
