
ALTER TABLE public.merchant_leads
ADD COLUMN IF NOT EXISTS invitation_sent_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invitation_opened_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invitation_accepted_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS invitation_token text DEFAULT NULL;
