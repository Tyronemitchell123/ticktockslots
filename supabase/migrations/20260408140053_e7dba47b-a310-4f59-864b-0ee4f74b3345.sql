
-- 1. Fix merchant contact email exposure: create a public view without contact_email
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Merchants are publicly readable without email" ON public.merchants;

-- Create a view that excludes contact_email for public use
CREATE OR REPLACE VIEW public.merchants_public AS
SELECT id, name, location, region, vertical, logo_url, is_verified, created_at, updated_at
FROM public.merchants;

-- Grant access to the view for anon and authenticated roles
GRANT SELECT ON public.merchants_public TO anon, authenticated;

-- Add a new policy that only allows admins and service_role to SELECT from merchants table directly
-- (admins already have ALL via existing policy, service_role already has ALL)
-- No public SELECT needed on base table anymore.

-- 2. Fix reviewer_name impersonation: auto-populate from profiles
CREATE OR REPLACE FUNCTION public.set_reviewer_name()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _display_name text;
BEGIN
  SELECT display_name INTO _display_name
  FROM public.profiles
  WHERE id = auth.uid();
  
  NEW.reviewer_name := COALESCE(_display_name, 'Anonymous');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_reviewer_name
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reviewer_name();

-- 3. Fix review slot_id manipulation: prevent changing slot_id on update
CREATE OR REPLACE FUNCTION public.prevent_review_slot_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF OLD.slot_id IS DISTINCT FROM NEW.slot_id THEN
    RAISE EXCEPTION 'Cannot change slot_id on an existing review';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_review_slot_change
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_review_slot_change();

-- 4. Add guard trigger on user_roles to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.guard_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Allow service_role (migrations, admin dashboard)
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  
  -- Allow existing admins
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;
  
  RAISE EXCEPTION 'Only admins or service_role can modify user_roles';
END;
$$;

CREATE TRIGGER trg_guard_user_roles
  BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_user_roles();
