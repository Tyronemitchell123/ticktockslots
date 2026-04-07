
-- Create urgency enum
CREATE TYPE public.slot_urgency AS ENUM ('critical', 'high', 'medium');

-- Create slots table for live availability data
CREATE TABLE public.slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID,
  merchant_name TEXT NOT NULL,
  vertical TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  time_description TEXT NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2) NOT NULL,
  urgency slot_urgency NOT NULL DEFAULT 'medium',
  time_left INTEGER NOT NULL DEFAULT 300,
  is_live BOOLEAN NOT NULL DEFAULT true,
  source TEXT NOT NULL DEFAULT 'manual',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create merchants table
CREATE TABLE public.merchants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vertical TEXT NOT NULL,
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  contact_email TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user trust scores table
CREATE TABLE public.user_trust_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 80 CHECK (score >= 0 AND score <= 100),
  total_bookings INTEGER NOT NULL DEFAULT 0,
  completed_bookings INTEGER NOT NULL DEFAULT 0,
  no_shows INTEGER NOT NULL DEFAULT 0,
  cancellations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES public.merchants(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  paid_amount NUMERIC(10,2),
  paid_upfront BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key from slots to merchants
ALTER TABLE public.slots ADD CONSTRAINT fk_slots_merchant FOREIGN KEY (merchant_id) REFERENCES public.merchants(id);

-- Enable RLS on all tables
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Slots: publicly readable (they're live listings), only service role can insert/update
CREATE POLICY "Slots are publicly readable" ON public.slots FOR SELECT USING (true);
CREATE POLICY "Service role can manage slots" ON public.slots FOR ALL USING (auth.role() = 'service_role');

-- Merchants: publicly readable, only service role can manage
CREATE POLICY "Merchants are publicly readable" ON public.merchants FOR SELECT USING (true);
CREATE POLICY "Service role can manage merchants" ON public.merchants FOR ALL USING (auth.role() = 'service_role');

-- Trust scores: users can view their own, service role can manage
CREATE POLICY "Users can view own trust score" ON public.user_trust_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage trust scores" ON public.user_trust_scores FOR ALL USING (auth.role() = 'service_role');

-- Bookings: users can view/create their own
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage bookings" ON public.bookings FOR ALL USING (auth.role() = 'service_role');

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers
CREATE TRIGGER update_slots_updated_at BEFORE UPDATE ON public.slots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_merchants_updated_at BEFORE UPDATE ON public.merchants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trust_scores_updated_at BEFORE UPDATE ON public.user_trust_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_slots_expires_at ON public.slots(expires_at);
CREATE INDEX idx_slots_vertical ON public.slots(vertical);
CREATE INDEX idx_slots_region ON public.slots(region);
CREATE INDEX idx_slots_is_live ON public.slots(is_live);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX idx_trust_scores_user_id ON public.user_trust_scores(user_id);
