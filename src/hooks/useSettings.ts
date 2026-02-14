import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSettings() {
  const [nextSessionTime, setNextSessionTime] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          const data = payload.new as { next_session_time?: string };
          if (data?.next_session_time !== undefined) {
            setNextSessionTime(data.next_session_time);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (!error && data) {
      setNextSessionTime((data as { next_session_time: string }).next_session_time);
    }
    setLoading(false);
  }

  async function updateNextSessionTime(time: string) {
    const { data: existing } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('settings')
        .update({ next_session_time: time, updated_at: new Date().toISOString() } as Record<string, unknown>)
        .eq('id', (existing as { id: string }).id);
      return { error };
    }
    return { error: new Error('No settings row found') };
  }

  return { nextSessionTime, updateNextSessionTime, loading };
}
