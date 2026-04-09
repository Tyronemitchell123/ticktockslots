
CREATE TABLE public.merchant_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  website_url text,
  contact_email text,
  phone text,
  vertical text,
  region text,
  location text,
  description text,
  logo_url text,
  scraped_data jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  notes text,
  outreach_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.merchant_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage merchant leads"
  ON public.merchant_leads FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage merchant leads"
  ON public.merchant_leads FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_merchant_leads_updated_at
  BEFORE UPDATE ON public.merchant_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
