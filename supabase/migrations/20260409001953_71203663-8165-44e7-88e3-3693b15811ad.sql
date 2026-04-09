
CREATE VIEW public.recent_claims
WITH (security_invoker = false) AS
SELECT
  b.id,
  LEFT(COALESCE(p.display_name, 'User'), 1) || '.' AS display_initial,
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
LIMIT 50;

GRANT SELECT ON public.recent_claims TO anon, authenticated;
