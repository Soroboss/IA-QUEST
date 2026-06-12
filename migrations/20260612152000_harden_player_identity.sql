DROP FUNCTION IF EXISTS public.resolve_login_email(TEXT);

ALTER FUNCTION public.enforce_player_identity() SET search_path = '';
REVOKE ALL ON FUNCTION public.enforce_player_identity() FROM PUBLIC;
