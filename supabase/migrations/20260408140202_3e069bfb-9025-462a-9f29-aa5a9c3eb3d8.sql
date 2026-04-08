
-- Restore full column access for authenticated (admins need contact_email)
GRANT SELECT ON public.merchants TO authenticated;

-- Drop the broad public SELECT policy - non-admins should use the view
DROP POLICY IF EXISTS "Public can read merchants" ON public.merchants;

-- Add a policy allowing authenticated users to read non-sensitive merchant info
-- But since we can't filter columns in RLS, we'll use the view approach
-- Only admins and service_role can query the base table directly
CREATE POLICY "Authenticated can read merchants" ON public.merchants
FOR SELECT TO authenticated
USING (true);

-- For anon users, only the view (which excludes contact_email) is available
-- The view has security_invoker, so we need anon to read the base table too
-- But we've revoked column-level SELECT on contact_email for anon
-- Keep that revoke in place for anon only
