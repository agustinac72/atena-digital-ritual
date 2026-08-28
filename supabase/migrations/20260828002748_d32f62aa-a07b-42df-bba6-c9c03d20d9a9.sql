CREATE OR REPLACE FUNCTION public.reset_roulette(p_code text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF p_code IS DISTINCT FROM 'ATENA-RESET' THEN
    RAISE EXCEPTION 'Codigo de reinicio invalido';
  END IF;

  DELETE FROM public.atena_entries;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  UPDATE public.prizes_counter SET total_drinks_given = 0 WHERE id = 1;

  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_roulette(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_roulette(text) TO anon, authenticated;