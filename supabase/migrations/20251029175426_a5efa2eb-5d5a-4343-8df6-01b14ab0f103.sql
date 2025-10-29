-- Fix security definer view issue
-- The view should use SECURITY INVOKER to respect RLS policies

DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker=on) AS
SELECT 
  id,
  name,
  registration,
  type,
  avatar_url,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;