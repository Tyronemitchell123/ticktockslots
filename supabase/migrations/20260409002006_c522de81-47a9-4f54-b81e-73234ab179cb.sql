
-- Drop the insecure view
DROP VIEW IF EXISTS public.recent_claims;

-- Create a security definer function instead, which safely bypasses RLS
CREATE OR REPLACE FUNCTION public.get_recent_claims(claim_limit integer DEFAULT 50)
RETURNS TABLE(
  display_name text,
  deal text,
  vertical text,
  savings numeric,
  location text,
  region text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(
      SPLIT_PART(p.display_name, ' ', 1) || ' ' || LEFT(SPLIT_PART(p.display_name, ' ', 2), 1) || '.',
      'User'
    ) AS display_name,
    s.merchant_name AS deal,
    s.vertical,
    (s.original_price - s.current_price) AS savings,
    s.location,
    s.region,
    b.created_at
  FROM public.bookings b
  JOIN public.slots s ON s.id = b.slot_id
  LEFT JOIN public.profiles p ON p.id = b.user_id
  WHERE b.status IN ('confirmed', 'completed', 'paid')
  ORDER BY b.created_at DESC
  LIMIT claim_limit;
$$;
