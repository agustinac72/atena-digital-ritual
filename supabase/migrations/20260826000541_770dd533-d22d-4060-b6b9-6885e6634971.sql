CREATE TABLE public.prizes_counter (
  id integer PRIMARY KEY,
  total_drinks_given integer NOT NULL DEFAULT 0,
  max_drinks integer NOT NULL DEFAULT 50,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.prizes_counter TO anon, authenticated;
GRANT ALL ON public.prizes_counter TO service_role;

ALTER TABLE public.prizes_counter ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read the counter"
ON public.prizes_counter FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.prizes_counter (id, total_drinks_given, max_drinks) VALUES (1, 0, 50);

ALTER TABLE public.atena_entries ADD COLUMN won_drink boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.claim_drink()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated integer;
BEGIN
  UPDATE public.prizes_counter
     SET total_drinks_given = total_drinks_given + 1,
         updated_at = now()
   WHERE id = 1
     AND total_drinks_given < max_drinks
  RETURNING total_drinks_given INTO updated;

  RETURN updated IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_drink() TO anon, authenticated, service_role;