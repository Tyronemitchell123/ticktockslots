
CREATE POLICY "Public can read merchants" ON public.merchants
FOR SELECT TO anon, authenticated
USING (true);
