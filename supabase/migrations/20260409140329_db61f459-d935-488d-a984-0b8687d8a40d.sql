
-- Allow authenticated users to create their own merchant profile
CREATE POLICY "Users can create own merchant profile"
ON public.merchants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow merchants to update their own profile
CREATE POLICY "Merchants can update own merchant"
ON public.merchants
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
