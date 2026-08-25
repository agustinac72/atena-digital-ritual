CREATE TABLE public.atena_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_handle TEXT NOT NULL,
  experience TEXT,
  prize TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT INSERT ON public.atena_entries TO anon, authenticated;
GRANT ALL ON public.atena_entries TO service_role;
ALTER TABLE public.atena_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create an entry" ON public.atena_entries FOR INSERT TO anon, authenticated WITH CHECK (char_length(instagram_handle) BETWEEN 1 AND 60);