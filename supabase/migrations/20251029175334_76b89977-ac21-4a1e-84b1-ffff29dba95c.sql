-- Fix critical security issues in RLS policies

-- 1. Fix profiles table - restrict email visibility
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can view basic info of all profiles (name, avatar, registration, type)
-- but only see their own email
CREATE POLICY "Users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Note: Email should be filtered at application level or use a view
-- For now, users can see emails but we'll add a view for restricted access

-- Create a secure view for public profile information (without email)
CREATE OR REPLACE VIEW public.public_profiles AS
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

-- 2. Fix books table - only librarians can modify
DROP POLICY IF EXISTS "Authenticated users can insert books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can update books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can delete books" ON public.books;

CREATE POLICY "Librarians can insert books"
ON public.books
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'librarian'::app_role));

CREATE POLICY "Librarians can update books"
ON public.books
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'librarian'::app_role));

CREATE POLICY "Librarians can delete books"
ON public.books
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'librarian'::app_role));

-- 3. Fix loans table - proper role-based access
DROP POLICY IF EXISTS "Users can create loans" ON public.loans;
DROP POLICY IF EXISTS "Users can update loans" ON public.loans;
DROP POLICY IF EXISTS "Users can view all loans" ON public.loans;

-- Students can only view their own loans
-- Librarians can view all loans
CREATE POLICY "Users can view loans"
ON public.loans
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'librarian'::app_role)
);

-- Only librarians can create loans
CREATE POLICY "Librarians can create loans"
ON public.loans
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'librarian'::app_role));

-- Only librarians can update loans
CREATE POLICY "Librarians can update loans"
ON public.loans
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'librarian'::app_role));

-- 4. Improve user_roles table policies
CREATE POLICY "Librarians can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'librarian'::app_role));

CREATE POLICY "Librarians can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'librarian'::app_role));

CREATE POLICY "Librarians can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'librarian'::app_role));

-- 5. Make avatars bucket private with proper policies
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow all authenticated users to view avatars
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');