CREATE TABLE IF NOT EXISTS public.players (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT NOT NULL CHECK (char_length(firstname) BETWEEN 2 AND 80),
  lastname TEXT NOT NULL CHECK (char_length(lastname) BETWEEN 2 AND 80),
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL CHECK (char_length(whatsapp) BETWEEN 8 AND 30),
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS players_email_unique
  ON public.players (lower(email));

CREATE UNIQUE INDEX IF NOT EXISTS players_whatsapp_unique
  ON public.players (regexp_replace(whatsapp, '[^0-9+]', '', 'g'));

CREATE INDEX IF NOT EXISTS players_created_at_idx
  ON public.players (created_at DESC);

CREATE OR REPLACE FUNCTION public.resolve_login_email(login_value TEXT)
RETURNS TEXT AS $$
  SELECT email
  FROM public.players
  WHERE regexp_replace(whatsapp, '[^0-9+]', '', 'g')
    = regexp_replace(login_value, '[^0-9+]', '', 'g')
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public;

REVOKE ALL ON FUNCTION public.resolve_login_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(TEXT) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.player_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  lives INTEGER NOT NULL DEFAULT 3 CHECK (lives BETWEEN 0 AND 3),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  unlocked_world INTEGER NOT NULL DEFAULT 0 CHECK (unlocked_world BETWEEN 0 AND 9),
  completed_worlds INTEGER[] NOT NULL DEFAULT '{}',
  profile_milestones INTEGER[] NOT NULL DEFAULT '{}',
  active_session JSONB,
  last_played_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.world_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_index INTEGER NOT NULL CHECK (world_index BETWEEN 0 AND 9),
  score_percent INTEGER NOT NULL CHECK (score_percent BETWEEN 0 AND 100),
  correct_answers INTEGER NOT NULL CHECK (correct_answers BETWEEN 0 AND 5),
  total_questions INTEGER NOT NULL DEFAULT 5 CHECK (total_questions > 0),
  passed BOOLEAN NOT NULL,
  timed_out_count INTEGER NOT NULL DEFAULT 0 CHECK (timed_out_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS world_attempts_user_created_idx
  ON public.world_attempts (user_id, created_at DESC);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_attempts ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.enforce_player_identity()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid();
    SELECT email INTO NEW.email
    FROM auth.users
    WHERE id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth;

DROP TRIGGER IF EXISTS players_enforce_identity ON public.players;
CREATE TRIGGER players_enforce_identity
  BEFORE INSERT OR UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.enforce_player_identity();

DROP POLICY IF EXISTS players_select_own ON public.players;
CREATE POLICY players_select_own ON public.players
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS players_insert_own ON public.players;
CREATE POLICY players_insert_own ON public.players
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS players_update_own ON public.players;
CREATE POLICY players_update_own ON public.players
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS progress_select_own ON public.player_progress;
CREATE POLICY progress_select_own ON public.player_progress
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS progress_insert_own ON public.player_progress;
CREATE POLICY progress_insert_own ON public.player_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS progress_update_own ON public.player_progress;
CREATE POLICY progress_update_own ON public.player_progress
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS attempts_select_own ON public.world_attempts;
CREATE POLICY attempts_select_own ON public.world_attempts
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS attempts_insert_own ON public.world_attempts;
CREATE POLICY attempts_insert_own ON public.world_attempts
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP TRIGGER IF EXISTS players_updated_at ON public.players;
CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();

DROP TRIGGER IF EXISTS player_progress_updated_at ON public.player_progress;
CREATE TRIGGER player_progress_updated_at
  BEFORE UPDATE ON public.player_progress
  FOR EACH ROW EXECUTE FUNCTION system.update_updated_at();
