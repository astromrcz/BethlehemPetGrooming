import { dataSource } from '../supabase';
import { mockDb } from './mock';
import { supabaseDb } from './supabase';
import type { Db } from './types';

/**
 * The active data adapter. Every Context imports `db` from here and never
 * touches Supabase or mock data directly — so switching backends is this one
 * line, driven by env (VITE_DATA_SOURCE / presence of Supabase keys).
 */
export const db: Db = dataSource === 'supabase' ? supabaseDb : mockDb;

export { dataSource };
export type { Db, SignInResult } from './types';
