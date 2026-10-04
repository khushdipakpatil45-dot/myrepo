import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Subscribes to real-time critical hazard elevations and road cutoffs
 * using Supabase Realtime (CDC over WebSockets).
 */
export const subscribeToHazardEvents = (
  corridorId: string,
  onCriticalAlert: (payload: any) => void,
  onRoadCutoff: (payload: any) => void
) => {
  const channel = supabase
    .channel(`corridor-monitor:${corridorId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'landslide_threat_zones',
        filter: `corridor_id=eq.${corridorId}`,
      },
      (payload) => {
        if (payload.new?.threat_tier === 'CRITICAL') {
          onCriticalAlert(payload.new);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'road_segments',
        filter: `corridor_id=eq.${corridorId}`,
      },
      (payload) => {
        if (payload.new?.operational_status === 'BLOCKED') {
          onRoadCutoff(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
