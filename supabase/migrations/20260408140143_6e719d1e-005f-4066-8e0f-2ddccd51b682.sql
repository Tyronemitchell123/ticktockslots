
-- Revoke all column-level access first, then re-grant only safe columns
REVOKE SELECT ON public.merchants FROM anon, authenticated;

-- Grant SELECT on all columns EXCEPT contact_email to anon and authenticated
GRANT SELECT (id, name, location, region, vertical, logo_url, is_verified, created_at, updated_at) ON public.merchants TO anon, authenticated;
