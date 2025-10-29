-- Add cover_url column to books table
ALTER TABLE public.books 
ADD COLUMN cover_url text;

-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for book covers
CREATE POLICY "Anyone can view book covers"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'book-covers');

CREATE POLICY "Librarians can upload book covers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-covers' AND
  public.has_role(auth.uid(), 'librarian'::app_role)
);

CREATE POLICY "Librarians can update book covers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-covers' AND
  public.has_role(auth.uid(), 'librarian'::app_role)
);

CREATE POLICY "Librarians can delete book covers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-covers' AND
  public.has_role(auth.uid(), 'librarian'::app_role)
);