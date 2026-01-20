-- Add column to mark games as hidden from leaderboard (for new evening sessions)
ALTER TABLE public.games 
ADD COLUMN hidden_from_leaderboard BOOLEAN NOT NULL DEFAULT false;