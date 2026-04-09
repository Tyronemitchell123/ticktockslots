
-- Add Stripe Connect fields to merchants
ALTER TABLE public.merchants 
ADD COLUMN IF NOT EXISTS stripe_account_id text,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean NOT NULL DEFAULT false;

-- Create commissions ledger table
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  gross_amount numeric NOT NULL,
  platform_fee numeric NOT NULL,
  merchant_payout numeric NOT NULL,
  platform_fee_pct numeric NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'pending',
  stripe_transfer_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_commission_status CHECK (status IN ('pending', 'processing', 'paid', 'failed'))
);

-- Create payouts table for batched merchant payouts
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  commission_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  stripe_payout_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT valid_payout_status CHECK (status IN ('pending', 'processing', 'paid', 'failed'))
);

-- Enable RLS
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can manage all commissions
CREATE POLICY "Admins can manage commissions"
ON public.commissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: Service role can manage commissions
CREATE POLICY "Service role can manage commissions"
ON public.commissions FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- RLS: Admins can manage payouts
CREATE POLICY "Admins can manage payouts"
ON public.payouts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: Service role can manage payouts
CREATE POLICY "Service role can manage payouts"
ON public.payouts FOR ALL
TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Trigger for updated_at on commissions
CREATE TRIGGER update_commissions_updated_at
BEFORE UPDATE ON public.commissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on payouts
CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create commission record when a booking is paid
CREATE OR REPLACE FUNCTION public.create_commission_on_paid_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _slot record;
  _gross numeric;
  _platform_fee numeric;
  _merchant_payout numeric;
BEGIN
  -- Only trigger when status changes to 'paid' or 'confirmed'
  IF (NEW.status IN ('paid', 'confirmed')) AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    -- Get slot details
    SELECT * INTO _slot FROM public.slots WHERE id = NEW.slot_id;
    
    IF _slot IS NULL OR _slot.merchant_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Check if commission already exists for this booking
    IF EXISTS (SELECT 1 FROM public.commissions WHERE booking_id = NEW.id) THEN
      RETURN NEW;
    END IF;
    
    -- Calculate commission split (70/30)
    _gross := COALESCE(NEW.paid_amount, _slot.current_price);
    _platform_fee := ROUND(_gross * 0.30, 2);
    _merchant_payout := ROUND(_gross * 0.70, 2);
    
    INSERT INTO public.commissions (booking_id, merchant_id, gross_amount, platform_fee, merchant_payout)
    VALUES (NEW.id, _slot.merchant_id, _gross, _platform_fee, _merchant_payout);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Attach trigger to bookings table
CREATE TRIGGER trg_create_commission_on_paid
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_commission_on_paid_booking();
