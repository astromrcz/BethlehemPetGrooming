// Domain types — mirror the PostgreSQL schema (supabase/migrations/0001_init.sql).
// Kept intentionally close to the DB column names so the Supabase adapter is a
// thin pass-through.

export type Role = 'customer' | 'staff' | 'admin';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  phone: string | null;
  role: Role;
  staff_type: string | null;
  email_verified_at: string | null;
  is_active: boolean;
  is_archived: boolean;
}

export type PetSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface Pet {
  pet_id: number;
  user_id: number | null;
  pet_name: string;
  species: string;
  breed: string | null;
  gender: 'male' | 'female' | null;
  birthdate: string | null;
  weight: number | null;
  color: string | null;
  size: PetSize | null;
  fur_type: string | null;
  medical_conditions: string | null;
  is_archived: boolean;
  is_deceased: boolean;
}

export interface VaccinationRecord {
  id: number;
  pet_id: number;
  vaccine_name: string;
  administered_date: string;
  next_due_date: string | null;
  published_at: string | null;
  voided_at: string | null;
}

export type BookingStatus =
  | 'waiting_to_arrive'
  | 'checked_in'
  | 'in_progress'
  | 'for_pickup'
  | 'for_payment'
  | 'released'
  | 'archived'
  | 'waiting'
  | 'groomed'
  | 'waiting_for_payment'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Booking {
  booking_id: number;
  booking_reference: string;
  user_id: number | null;
  window_id: number | null;
  booking_date: string;
  number_of_pets: number;
  booking_type: 'online' | 'walk_in';
  status: BookingStatus;
  queue_number: number | null;
  paid: boolean;
  total_amount: number;
  special_notes: string | null;
}

export interface TimeWindow {
  window_id: number;
  window_label: string;
  start_time: string;
  end_time: string;
  max_slots: number;
  is_active: boolean;
}

export interface ClinicAppointment {
  id: number;
  appointment_reference: string;
  appointment_type: 'walk_in' | 'pre_registered';
  status:
    | 'waiting_to_arrive'
    | 'checked_in'
    | 'in_consultation'
    | 'for_payment'
    | 'completed'
    | 'cancelled'
    | 'no_show';
  queue_number: number | null;
  appointment_date: string;
  pet_id: number | null;
  chief_complaint: string | null;
  paid: boolean;
}

export interface InventoryItem {
  item_id: number;
  item_name: string;
  barcode: string | null;
  category:
    | 'medicine'
    | 'vaccine'
    | 'food'
    | 'grooming_supply'
    | 'pet_shop'
    | 'miscellaneous';
  unit: string;
  unit_cost: number;
  selling_price: number | null;
  quantity_on_hand: number;
  reorder_level: number;
  is_active: boolean;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string | null;
  phone: string | null;
  is_active: boolean;
}

export interface CartLine {
  item: InventoryItem;
  quantity: number;
}
