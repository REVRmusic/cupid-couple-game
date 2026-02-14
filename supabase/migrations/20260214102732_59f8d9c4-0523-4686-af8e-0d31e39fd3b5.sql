CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  next_session_time text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO public.settings (next_session_time) VALUES ('');

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.settings FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;