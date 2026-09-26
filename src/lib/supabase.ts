import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client wiring.
 *
 * The app is designed to run in two modes so it works inside Figma Make today
 * (no server) and drops onto a real Supabase project later with zero component
 * changes:
 *
 *   - "mock"     — no backend; the data layer serves seeded in-memory data.
 *   - "supabase" — real @supabase/supabase-js client reading from .env.
 *
 * Mode is chosen by VITE_DATA_SOURCE, or auto-detected from whether the
 * Supabase URL + anon key are present.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const explicitSource = import.meta.env.VITE_DATA_SOURCE as
  | 'mock'
  | 'supabase'
  | undefined;

export const dataSource: 'mock' | 'supabase' =
  explicitSource ?? (url && anonKey ? 'supabase' : 'mock');

/**
 * The Supabase client, or null when running in mock mode. Consumers should go
 * through the data layer in `src/lib/data/` rather than touching this directly.
 */
export const supabase: SupabaseClient | null =
  dataSource === 'supabase' && url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: false }, // this app owns its own session model
      })
    : null;

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env, or run in mock mode.',
    );
  }
  return supabase;
}
