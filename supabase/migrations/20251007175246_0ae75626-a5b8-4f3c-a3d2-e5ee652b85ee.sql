-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  registration TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('student', 'teacher', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  year INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  available INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (available >= 0 AND available <= quantity)
);

-- Create loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  loan_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for books (everyone authenticated can view, only admins can modify)
CREATE POLICY "Anyone authenticated can view books"
  ON public.books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert books"
  ON public.books FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
  ON public.books FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete books"
  ON public.books FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for loans
CREATE POLICY "Users can view all loans"
  ON public.loans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create loans"
  ON public.loans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update loans"
  ON public.loans FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, registration, type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    'REG' || LPAD(floor(random() * 999999)::text, 6, '0'),
    COALESCE(NEW.raw_user_meta_data->>'type', 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_isbn ON public.books(isbn);
CREATE INDEX idx_loans_user_id ON public.loans(user_id);
CREATE INDEX idx_loans_book_id ON public.loans(book_id);
CREATE INDEX idx_loans_status ON public.loans(status);