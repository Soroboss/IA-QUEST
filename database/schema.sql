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

CREATE TABLE IF NOT EXISTS public.player_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  lives INTEGER NOT NULL DEFAULT 3 CHECK (lives BETWEEN 0 AND 3),
  streak INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  unlocked_world INTEGER NOT NULL DEFAULT 0 CHECK (unlocked_world BETWEEN 0 AND 9),
  completed_worlds INTEGER[] NOT NULL DEFAULT '{}',
  profile_milestones INTEGER[] NOT NULL DEFAULT '{}',
  active_session JSONB,
  simulation_state JSONB NOT NULL DEFAULT '{}'::jsonb,
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

CREATE OR REPLACE FUNCTION public.valid_world_indexes(indexes INTEGER[])
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT COALESCE(
    cardinality(indexes) <= 10
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(indexes) AS world_index
      WHERE world_index < 0 OR world_index > 9
    )
    AND cardinality(indexes) = cardinality(ARRAY(SELECT DISTINCT value FROM unnest(indexes) AS value)),
    FALSE
  );
$$;

REVOKE ALL ON FUNCTION public.valid_world_indexes(INTEGER[]) FROM PUBLIC;

ALTER TABLE public.players
  DROP CONSTRAINT IF EXISTS players_email_format_check,
  ADD CONSTRAINT players_email_format_check
    CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  DROP CONSTRAINT IF EXISTS players_whatsapp_format_check,
  ADD CONSTRAINT players_whatsapp_format_check
    CHECK (regexp_replace(whatsapp, '[^0-9+]', '', 'g') ~ '^\+?[0-9]{8,15}$');

ALTER TABLE public.player_progress
  DROP CONSTRAINT IF EXISTS progress_xp_upper_bound,
  ADD CONSTRAINT progress_xp_upper_bound CHECK (xp <= 1000000),
  DROP CONSTRAINT IF EXISTS progress_streak_upper_bound,
  ADD CONSTRAINT progress_streak_upper_bound CHECK (streak <= 10000),
  DROP CONSTRAINT IF EXISTS progress_completed_worlds_valid,
  ADD CONSTRAINT progress_completed_worlds_valid CHECK (public.valid_world_indexes(completed_worlds)),
  DROP CONSTRAINT IF EXISTS progress_milestones_valid,
  ADD CONSTRAINT progress_milestones_valid CHECK (public.valid_world_indexes(profile_milestones)),
  DROP CONSTRAINT IF EXISTS progress_active_session_shape,
  ADD CONSTRAINT progress_active_session_shape CHECK (
    active_session IS NULL
    OR (
      jsonb_typeof(active_session) = 'object'
      AND pg_column_size(active_session) <= 100000
    )
  ),
  DROP CONSTRAINT IF EXISTS progress_simulation_state_shape,
  ADD CONSTRAINT progress_simulation_state_shape CHECK (
    jsonb_typeof(simulation_state) = 'object'
    AND pg_column_size(simulation_state) <= 20000
    AND COALESCE((simulation_state->>'expertise')::INTEGER BETWEEN 0 AND 100, TRUE)
    AND COALESCE((simulation_state->>'trust')::INTEGER BETWEEN 0 AND 100, TRUE)
    AND COALESCE((simulation_state->>'ethics')::INTEGER BETWEEN 0 AND 100, TRUE)
    AND COALESCE((simulation_state->>'budget')::INTEGER BETWEEN 0 AND 100, TRUE)
  );

ALTER TABLE public.world_attempts
  DROP CONSTRAINT IF EXISTS attempts_answers_consistent,
  ADD CONSTRAINT attempts_answers_consistent CHECK (
    total_questions BETWEEN 1 AND 5
    AND correct_answers <= total_questions
    AND timed_out_count <= total_questions
  );

CREATE OR REPLACE FUNCTION public.limit_world_attempt_rate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.world_attempts
    WHERE user_id = auth.uid()
      AND created_at > now() - INTERVAL '1 minute'
  ) >= 20 THEN
    RAISE EXCEPTION 'Trop de résultats envoyés. Réessaie dans une minute.'
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.limit_world_attempt_rate() FROM PUBLIC;

DROP TRIGGER IF EXISTS world_attempts_rate_limit ON public.world_attempts;
CREATE TRIGGER world_attempts_rate_limit
  BEFORE INSERT ON public.world_attempts
  FOR EACH ROW EXECUTE FUNCTION public.limit_world_attempt_rate();

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
SET search_path = '';

REVOKE ALL ON FUNCTION public.enforce_player_identity() FROM PUBLIC;

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
