ALTER TABLE public.player_progress
  ADD COLUMN IF NOT EXISTS active_session JSONB;
