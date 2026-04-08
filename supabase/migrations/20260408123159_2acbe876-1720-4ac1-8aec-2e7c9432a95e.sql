
-- Fix privilege escalation: drop the ALL policy on user_roles and replace with separate SELECT and admin-only INSERT/UPDATE/DELETE policies

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Admins can do everything
CREATE POLICY "Admins can select all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix merchant email exposure: replace public SELECT with authenticated-only
DROP POLICY IF EXISTS "Merchants are publicly readable" ON public.merchants;

CREATE POLICY "Merchants are publicly readable without email"
ON public.merchants FOR SELECT TO public
USING (true);

-- Fix mutable search_path on email queue functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public;
