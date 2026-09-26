import { requireSupabase } from '../supabase';
import type { Db } from './types';

/**
 * Supabase-backed data adapter.
 *
 * Reads and simple writes are plain PostgREST queries. Operations that must NOT
 * run in the browser — password/bcrypt verification, the emailed login
 * challenge, and the all-or-nothing POS transaction — are delegated to Supabase
 * Edge Functions (see FIRST_START.md → "Edge Functions"). This keeps the
 * security boundary the original Laravel controllers enforced.
 */
export const supabaseDb: Db = {
  auth: {
    async signIn(identifier, password, remember) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('auth-sign-in', {
        body: { identifier, password, remember },
      });
      if (error) throw error;
      return data;
    },
    async completeLoginChallenge(pollToken, code) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('auth-complete-challenge', {
        body: { poll_token: pollToken, code },
      });
      if (error) throw error;
      return data;
    },
    async me(token) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('auth-me', {
        body: { token },
      });
      if (error) return null;
      return data?.user ?? null;
    },
  },

  pets: {
    async list(userId) {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('pets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('pet_id');
      if (error) throw error;
      return data ?? [];
    },
    async create(input) {
      const sb = requireSupabase();
      const { data, error } = await sb.from('pets').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    async update(petId, patch) {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('pets')
        .update(patch)
        .eq('pet_id', petId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async setArchived(petId, archived) {
      const sb = requireSupabase();
      const { error } = await sb.from('pets').update({ is_archived: archived }).eq('pet_id', petId);
      if (error) throw error;
    },
  },

  bookings: {
    async history(userId) {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('booking_id', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    async dailyQueue(date) {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('bookings')
        .select('*')
        .eq('booking_date', date)
        .not('queue_number', 'is', null)
        .order('queue_number');
      if (error) throw error;
      return data ?? [];
    },
    async create(input) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('booking-create', { body: input });
      if (error) throw error;
      return data;
    },
    async setStatus(bookingId, status) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('booking-set-status', {
        body: { booking_id: bookingId, status },
      });
      if (error) throw error;
      return data;
    },
  },

  timeslots: {
    async forDate(date) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('timeslots', { body: { date } });
      if (error) throw error;
      return data ?? [];
    },
  },

  clinic: {
    async appointments(date) {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('clinic_appointments')
        .select('*')
        .eq('appointment_date', date)
        .order('queue_number');
      if (error) throw error;
      return data ?? [];
    },
    async setStatus(id, status) {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('clinic_appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  inventory: {
    async items() {
      const sb = requireSupabase();
      const { data, error } = await sb.from('inventory_items').select('*').order('item_name');
      if (error) throw error;
      return data ?? [];
    },
    async lowStock() {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('inventory-low-stock', { body: {} });
      if (error) throw error;
      return data ?? [];
    },
    async stockIn(itemId, quantity) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('inventory-stock-move', {
        body: { item_id: itemId, quantity, type: 'stock_in' },
      });
      if (error) throw error;
      return data;
    },
    async stockOut(itemId, quantity) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('inventory-stock-move', {
        body: { item_id: itemId, quantity, type: 'stock_out' },
      });
      if (error) throw error;
      return data;
    },
  },

  suppliers: {
    async list() {
      const sb = requireSupabase();
      const { data, error } = await sb
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('supplier_name');
      if (error) throw error;
      return data ?? [];
    },
  },

  pos: {
    async checkout(lines, cashierId) {
      const sb = requireSupabase();
      const { data, error } = await sb.functions.invoke('pos-checkout', {
        body: { lines, cashier_id: cashierId },
      });
      if (error) throw error;
      return data;
    },
  },
};
