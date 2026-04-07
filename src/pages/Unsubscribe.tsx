import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, MailX } from "lucide-react";

type Status = "loading" | "valid" | "already" | "invalid" | "success" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }

    const validate = async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${token}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const data = await res.json();
        if (!res.ok) { setStatus("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setStatus("already");
        } else if (data.valid) {
          setStatus("valid");
        } else {
          setStatus("invalid");
        }
      } catch { setStatus("invalid"); }
    };
    validate();
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) setStatus("success");
      else if (data?.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch { setStatus("error"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground">Validating your request…</p>
            </>
          )}

          {status === "valid" && (
            <>
              <MailX className="w-10 h-10 text-primary mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Unsubscribe</h2>
              <p className="text-muted-foreground text-sm">
                Click below to stop receiving email notifications from SlotEngine.
              </p>
              <Button onClick={handleUnsubscribe} disabled={processing} className="w-full">
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Unsubscribe
              </Button>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Unsubscribed</h2>
              <p className="text-muted-foreground text-sm">
                You've been removed from our mailing list. You won't receive any more emails.
              </p>
            </>
          )}

          {status === "already" && (
            <>
              <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Already Unsubscribed</h2>
              <p className="text-muted-foreground text-sm">
                You've already been unsubscribed from our emails.
              </p>
            </>
          )}

          {status === "invalid" && (
            <>
              <XCircle className="w-10 h-10 text-destructive mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Invalid Link</h2>
              <p className="text-muted-foreground text-sm">
                This unsubscribe link is invalid or has expired.
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-10 h-10 text-destructive mx-auto" />
              <h2 className="text-xl font-bold text-foreground">Something Went Wrong</h2>
              <p className="text-muted-foreground text-sm">
                We couldn't process your request. Please try again later.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
