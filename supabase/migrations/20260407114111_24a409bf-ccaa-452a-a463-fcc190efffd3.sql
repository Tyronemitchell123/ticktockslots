
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES public.slots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  reviewer_name TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (social proof)
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  TO public
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role can manage reviews"
  ON public.reviews FOR ALL
  TO public
  USING (auth.role() = 'service_role');
