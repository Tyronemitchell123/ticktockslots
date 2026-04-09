
-- Allow merchants to insert slots for their own merchant_id
CREATE POLICY "Merchants can create own slots"
ON public.slots
FOR INSERT
TO authenticated
WITH CHECK (
  merchant_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
  )
);

-- Allow merchants to update their own slots
CREATE POLICY "Merchants can update own slots"
ON public.slots
FOR UPDATE
TO authenticated
USING (
  merchant_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  merchant_id IN (
    SELECT id FROM public.merchants WHERE user_id = auth.uid()
  )
);
