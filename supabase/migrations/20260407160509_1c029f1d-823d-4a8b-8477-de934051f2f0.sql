
-- 1. Create atomic claim_slot function that prevents double-booking
CREATE OR REPLACE FUNCTION public.claim_slot(
  _slot_id uuid,
  _user_id uuid,
  _paid_amount numeric DEFAULT NULL,
  _paid_upfront boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _booking_id uuid;
  _is_available boolean;
BEGIN
  -- Lock the slot row and check availability
  SELECT is_live INTO _is_available
  FROM public.slots
  WHERE id = _slot_id
  FOR UPDATE;

  IF _is_available IS NULL THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  IF NOT _is_available THEN
    RAISE EXCEPTION 'Slot is no longer available';
  END IF;

  -- Mark slot as no longer live
  UPDATE public.slots
  SET is_live = false, updated_at = now()
  WHERE id = _slot_id;

  -- Create the booking
  INSERT INTO public.bookings (slot_id, user_id, paid_amount, paid_upfront, status)
  VALUES (_slot_id, _user_id, _paid_amount, _paid_upfront, CASE WHEN _paid_upfront THEN 'paid' ELSE 'confirmed' END)
  RETURNING id INTO _booking_id;

  RETURN _booking_id;
END;
$$;

-- 2. Enable realtime on slots table
ALTER PUBLICATION supabase_realtime ADD TABLE public.slots;

-- 3. RLS policy for admins to manage slots
CREATE POLICY "Admins can manage slots"
ON public.slots FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
