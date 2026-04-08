-- Create a public view that excludes user_id
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = on) AS
SELECT id, slot_id, rating, comment, reviewer_name, created_at
FROM public.reviews;

-- Grant access to the view
GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Replace the overly broad public SELECT policy
DROP POLICY IF EXISTS "Reviews are publicly readable" ON public.reviews;

-- Anon users can only read via the view (which excludes user_id)
-- The view uses security_invoker, so anon needs SELECT on the base table
-- but we restrict columns to exclude user_id for anon
REVOKE SELECT ON public.reviews FROM anon;
GRANT SELECT (id, slot_id, rating, comment, reviewer_name, created_at) ON public.reviews TO anon;

-- Authenticated users can see all columns (they need user_id for own-review checks)
CREATE POLICY "Authenticated can read reviews" ON public.reviews
FOR SELECT TO authenticated
USING (true);

-- Re-add anon SELECT policy for the view to work (column-restricted via GRANT above)
CREATE POLICY "Anon can read reviews" ON public.reviews
FOR SELECT TO anon
USING (true);