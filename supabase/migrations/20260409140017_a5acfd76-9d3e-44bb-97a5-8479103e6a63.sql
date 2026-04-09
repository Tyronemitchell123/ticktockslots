
-- Add user_id to merchants table
ALTER TABLE public.merchants ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for fast lookup
CREATE INDEX idx_merchants_user_id ON public.merchants(user_id);

-- Policy: merchants can view their own merchant record
CREATE POLICY "Merchants can view own merchant"
ON public.merchants FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Policy: merchants can view their own commissions
CREATE POLICY "Merchants can view own commissions"
ON public.commissions FOR SELECT TO authenticated
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));

-- Policy: merchants can view their own payouts
CREATE POLICY "Merchants can view own payouts"
ON public.payouts FOR SELECT TO authenticated
USING (merchant_id IN (SELECT id FROM public.merchants WHERE user_id = auth.uid()));
