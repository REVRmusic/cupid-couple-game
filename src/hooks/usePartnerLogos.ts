import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PartnerLogo {
  id: string;
  name: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export function usePartnerLogos() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogos();
  }, []);

  async function fetchLogos() {
    const { data, error } = await supabase
      .from('partner_logos')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (!error && data) {
      setLogos(data);
    }
    setLoading(false);
  }

  return { logos, loading, refetch: fetchLogos };
}

export function usePartnerLogosAdmin() {
  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogos();
  }, []);

  async function fetchLogos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('partner_logos')
      .select('*')
      .order('display_order');

    if (!error && data) {
      setLogos(data);
    }
    setLoading(false);
  }

  async function addLogo(name: string, imageUrl: string) {
    const maxOrder = logos.length > 0 ? Math.max(...logos.map(l => l.display_order)) + 1 : 0;
    const { error } = await supabase
      .from('partner_logos')
      .insert({ name, image_url: imageUrl, display_order: maxOrder });
    
    if (!error) {
      await fetchLogos();
    }
    return { error };
  }

  async function updateLogo(id: string, updates: Partial<PartnerLogo>) {
    const { error } = await supabase
      .from('partner_logos')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      await fetchLogos();
    }
    return { error };
  }

  async function deleteLogo(id: string) {
    const { error } = await supabase
      .from('partner_logos')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchLogos();
    }
    return { error };
  }

  async function toggleActive(id: string, isActive: boolean) {
    return updateLogo(id, { is_active: isActive });
  }

  return { logos, loading, refetch: fetchLogos, addLogo, updateLogo, deleteLogo, toggleActive };
}
