-- Create partner_logos table
CREATE TABLE public.partner_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.partner_logos ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Partner logos are viewable by everyone" ON public.partner_logos
  FOR SELECT USING (true);

CREATE POLICY "Partner logos can be managed by everyone" ON public.partner_logos
  FOR ALL USING (true);

-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-logos', 'partner-logos', true);

-- Storage policies
CREATE POLICY "Partner logos are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'partner-logos');

CREATE POLICY "Anyone can upload partner logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'partner-logos');

CREATE POLICY "Anyone can update partner logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'partner-logos');

CREATE POLICY "Anyone can delete partner logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'partner-logos');