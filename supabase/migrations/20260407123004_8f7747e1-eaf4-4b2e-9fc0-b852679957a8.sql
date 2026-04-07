CREATE TABLE public.saved_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  slot_id text NOT NULL,
  slot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, slot_id)
);

ALTER TABLE public.saved_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved slots"
ON public.saved_slots FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save slots"
ON public.saved_slots FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved slots"
ON public.saved_slots FOR DELETE
TO authenticated
USING (auth.uid() = user_id);