ALTER TABLE public.player_progress
  ADD COLUMN IF NOT EXISTS simulation_state JSONB NOT NULL DEFAULT '{}'::jsonb;
