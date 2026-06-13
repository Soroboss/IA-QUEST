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
