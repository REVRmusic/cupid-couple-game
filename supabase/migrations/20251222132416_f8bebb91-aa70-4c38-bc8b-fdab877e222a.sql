-- Table des questions
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table des parties
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player1_name TEXT NOT NULL,
  player2_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 10,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Table des questions de la partie en cours
CREATE TABLE public.game_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  player1_answer TEXT CHECK (player1_answer IN ('player1', 'player2')),
  player2_answer TEXT CHECK (player2_answer IN ('player1', 'player2')),
  is_correct BOOLEAN,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;

-- Policies publiques (jeu accessible sans auth)
CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Questions can be managed by everyone" ON public.questions FOR ALL USING (true);

CREATE POLICY "Games are viewable by everyone" ON public.games FOR SELECT USING (true);
CREATE POLICY "Games can be managed by everyone" ON public.games FOR ALL USING (true);

CREATE POLICY "Game questions are viewable by everyone" ON public.game_questions FOR SELECT USING (true);
CREATE POLICY "Game questions can be managed by everyone" ON public.game_questions FOR ALL USING (true);

-- Enable realtime for games and game_questions
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER TABLE public.game_questions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_questions;

-- Insert default questions
INSERT INTO public.questions (text) VALUES
  ('Qui fait le lit le matin ?'),
  ('Qui cuisine le plus souvent ?'),
  ('Qui est le plus romantique ?'),
  ('Qui dit "je t''aime" en premier ?'),
  ('Qui prend le plus de temps dans la salle de bain ?'),
  ('Qui choisit les films à regarder ?'),
  ('Qui fait le premier pas pour se réconcilier ?'),
  ('Qui est le plus jaloux ?'),
  ('Qui dépense le plus ?'),
  ('Qui ronfle le plus fort ?'),
  ('Qui a le meilleur sens de l''orientation ?'),
  ('Qui est le plus têtu ?'),
  ('Qui conduit le mieux ?'),
  ('Qui fait le ménage ?'),
  ('Qui est le plus drôle ?');