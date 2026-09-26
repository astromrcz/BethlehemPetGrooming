import type {
  Booking,
  ClinicAppointment,
  InventoryItem,
  Pet,
  Supplier,
  TimeWindow,
  User,
} from '../types';
import type { Db, SignInResult } from './types';

// ── Seed data ──────────────────────────────────────────────────────────────
// Enough to exercise every context and reference page offline. Passwords in
// mock mode are plain strings (no bcrypt); the Supabase adapter uses a real
// Edge Function instead.

const users: Array<User & { password: string }> = [
  {
    user_id: 1,
    first_name: 'Maria',
    last_name: 'Santos',
    username: 'maria',
    email: 'customer@example.com',
    phone: '09171234567',
    role: 'customer',
    staff_type: null,
    email_verified_at: '2026-01-01T00:00:00Z',
    is_active: true,
    is_archived: false,
    password: 'password123',
  },
  {
    user_id: 2,
    first_name: 'Grooming',
    last_name: 'Staff',
    username: 'grooming',
    email: 'staff@example.com',
    phone: null,
    role: 'staff',
    staff_type: 'grooming',
    email_verified_at: '2026-01-01T00:00:00Z',
    is_active: true,
    is_archived: false,
    password: 'password123',
  },
  {
    user_id: 3,
    first_name: 'Clinic',
    last_name: 'Admin',
    username: 'admin',
    email: 'admin@example.com',
    phone: null,
    role: 'admin',
    staff_type: null,
    email_verified_at: '2026-01-01T00:00:00Z',
    is_active: true,
    is_archived: false,
    password: 'password123',
  },
];

const pets: Pet[] = [
  {
    pet_id: 1,
    user_id: 1,
    pet_name: 'Coco',
    species: 'Dog',
    breed: 'Shih Tzu',
    gender: 'female',
    birthdate: '2022-05-10',
    weight: 6.4,
    color: 'White/Brown',
    size: 'small',
    fur_type: 'long',
    medical_conditions: null,
    is_archived: false,
    is_deceased: false,
  },
  {
    pet_id: 2,
    user_id: 1,
    pet_name: 'Bruno',
    species: 'Dog',
    breed: 'Labrador',
    gender: 'male',
    birthdate: '2020-02-01',
    weight: 28.0,
    color: 'Golden',
    size: 'large',
    fur_type: 'short',
    medical_conditions: 'Sensitive skin',
    is_archived: false,
    is_deceased: false,
  },
];

const timeWindows: TimeWindow[] = [
  { window_id: 1, window_label: '8:00 AM – 10:00 AM', start_time: '08:00', end_time: '10:00', max_slots: 4, is_active: true },
  { window_id: 2, window_label: '10:00 AM – 12:00 PM', start_time: '10:00', end_time: '12:00', max_slots: 4, is_active: true },
  { window_id: 3, window_label: '1:00 PM – 3:00 PM', start_time: '13:00', end_time: '15:00', max_slots: 4, is_active: true },
];

const today = new Date().toISOString().slice(0, 10);

const bookings: Booking[] = [
  {
    booking_id: 1,
    booking_reference: 'BPG-0001',
    user_id: 1,
    window_id: 1,
    booking_date: today,
    number_of_pets: 1,
    booking_type: 'online',
    status: 'checked_in',
    queue_number: 1,
    paid: false,
    total_amount: 650,
    special_notes: null,
  },
  {
    booking_id: 2,
    booking_reference: 'BPG-0002',
    user_id: 1,
    window_id: 2,
    booking_date: today,
    number_of_pets: 1,
    booking_type: 'online',
    status: 'waiting_to_arrive',
    queue_number: 2,
    paid: false,
    total_amount: 1050,
    special_notes: 'Bruno is nervous around clippers.',
  },
];

const clinicAppointments: ClinicAppointment[] = [
  {
    id: 1,
    appointment_reference: 'CL-0001',
    appointment_type: 'walk_in',
    status: 'checked_in',
    queue_number: 1,
    appointment_date: today,
    pet_id: 2,
    chief_complaint: 'Recurring ear infection',
    paid: false,
  },
];

const inventoryItems: InventoryItem[] = [
  { item_id: 1, item_name: 'Dog Shampoo (1L)', barcode: '480000000011', category: 'grooming_supply', unit: 'bottle', unit_cost: 120, selling_price: 220, quantity_on_hand: 24, reorder_level: 6, is_active: true },
  { item_id: 2, item_name: 'Anti-Rabies Vaccine', barcode: '480000000028', category: 'vaccine', unit: 'vial', unit_cost: 180, selling_price: 350, quantity_on_hand: 4, reorder_level: 5, is_active: true },
  { item_id: 3, item_name: 'Premium Kibble (5kg)', barcode: '480000000035', category: 'food', unit: 'bag', unit_cost: 800, selling_price: 1150, quantity_on_hand: 12, reorder_level: 4, is_active: true },
];

const suppliers: Supplier[] = [
  { supplier_id: 1, supplier_name: 'VetSupply Co.', contact_person: 'Jomar Reyes', phone: '09991112222', is_active: true },
  { supplier_id: 2, supplier_name: 'PetFoods Direct', contact_person: 'Ana Cruz', phone: '09883334444', is_active: true },
];

// Session store for mock tokens → user_id
const sessions = new Map<string, number>();
// Pending email login challenges: pollToken → { userId, code }
const challenges = new Map<string, { userId: number; code: string }>();

let posSeq = 1;
let petSeq = pets.length;
let bookingSeq = bookings.length;

const delay = () => new Promise((r) => setTimeout(r, 120));
const publicUser = (u: User & { password: string }): User => {
  const { password: _pw, ...rest } = u;
  return rest;
};

function resolveIdentifierField(identifier: string): 'email' | 'phone' | 'username' {
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(identifier)) return 'email';
  if (/^(09|\+639)\d{9}$/.test(identifier)) return 'phone';
  return 'username';
}

export const mockDb: Db = {
  auth: {
    async signIn(identifier, password, _remember): Promise<SignInResult> {
      await delay();
      const id = identifier.trim();
      const field = resolveIdentifierField(id);
      const lookup = field === 'email' ? id.toLowerCase() : id;
      const user = users.find((u) => (u[field] ?? '').toLowerCase() === lookup.toLowerCase());

      if (!user || user.password !== password) return { code: 'invalid_credentials' };
      if (!user.is_active || user.is_archived) return { code: 'account_disabled' };
      if (!['admin', 'staff'].includes(user.role) && !user.email_verified_at) {
        return { code: 'email_not_verified', email: user.email };
      }

      // Mirror the controller: all roles go through the emailed login challenge.
      const pollToken = crypto.randomUUID();
      const code = '123456'; // fixed mock code; shown in a hint on the confirm screen
      challenges.set(pollToken, { userId: user.user_id, code });
      return { code: 'login_confirmation_required', login_poll_token: pollToken, email: user.email };
    },
    async completeLoginChallenge(pollToken, code) {
      await delay();
      const challenge = challenges.get(pollToken);
      if (!challenge || challenge.code !== code.trim()) {
        throw new Error('Invalid or expired confirmation code.');
      }
      challenges.delete(pollToken);
      const user = users.find((u) => u.user_id === challenge.userId)!;
      const token = crypto.randomUUID();
      sessions.set(token, user.user_id);
      return { token, user: publicUser(user) };
    },
    async me(token) {
      await delay();
      const userId = sessions.get(token);
      const user = users.find((u) => u.user_id === userId);
      return user ? publicUser(user) : null;
    },
  },

  pets: {
    async list(userId) {
      await delay();
      return pets.filter((p) => p.user_id === userId && !p.is_archived);
    },
    async create(input) {
      await delay();
      const pet: Pet = {
        pet_id: ++petSeq,
        user_id: input.user_id,
        pet_name: input.pet_name,
        species: input.species ?? 'Dog',
        breed: input.breed ?? null,
        gender: input.gender ?? null,
        birthdate: input.birthdate ?? null,
        weight: input.weight ?? null,
        color: input.color ?? null,
        size: input.size ?? null,
        fur_type: input.fur_type ?? null,
        medical_conditions: input.medical_conditions ?? null,
        is_archived: false,
        is_deceased: false,
      };
      pets.push(pet);
      return pet;
    },
    async update(petId, patch) {
      await delay();
      const pet = pets.find((p) => p.pet_id === petId);
      if (!pet) throw new Error('Pet not found.');
      Object.assign(pet, patch);
      return pet;
    },
    async setArchived(petId, archived) {
      await delay();
      const pet = pets.find((p) => p.pet_id === petId);
      if (pet) pet.is_archived = archived;
    },
  },

  bookings: {
    async history(userId) {
      await delay();
      return bookings
        .filter((b) => b.user_id === userId)
        .sort((a, b) => b.booking_id - a.booking_id);
    },
    async dailyQueue(date) {
      await delay();
      return bookings
        .filter((b) => b.booking_date === date && b.queue_number != null)
        .sort((a, b) => (a.queue_number ?? 0) - (b.queue_number ?? 0));
    },
    async create(input) {
      await delay();
      const booking: Booking = {
        booking_id: ++bookingSeq,
        booking_reference: `BPG-${String(bookingSeq).padStart(4, '0')}`,
        user_id: input.user_id,
        window_id: input.window_id,
        booking_date: input.booking_date,
        number_of_pets: input.number_of_pets,
        booking_type: 'online',
        status: 'waiting_to_arrive',
        queue_number: null,
        paid: false,
        total_amount: 0,
        special_notes: input.special_notes ?? null,
      };
      bookings.push(booking);
      return booking;
    },
    async setStatus(bookingId, status) {
      await delay();
      const booking = bookings.find((b) => b.booking_id === bookingId);
      if (!booking) throw new Error('Booking not found.');
      booking.status = status;
      return booking;
    },
  },

  timeslots: {
    async forDate(date) {
      await delay();
      return timeWindows
        .filter((w) => w.is_active)
        .map((w) => {
          const booked = bookings.filter(
            (b) => b.window_id === w.window_id && b.booking_date === date && b.status !== 'cancelled',
          ).length;
          return { ...w, booked, available: Math.max(0, w.max_slots - booked) };
        });
    },
  },

  clinic: {
    async appointments(date) {
      await delay();
      return clinicAppointments
        .filter((a) => a.appointment_date === date)
        .sort((a, b) => (a.queue_number ?? 0) - (b.queue_number ?? 0));
    },
    async setStatus(id, status) {
      await delay();
      const appt = clinicAppointments.find((a) => a.id === id);
      if (!appt) throw new Error('Appointment not found.');
      appt.status = status;
      return appt;
    },
  },

  inventory: {
    async items() {
      await delay();
      return [...inventoryItems];
    },
    async lowStock() {
      await delay();
      return inventoryItems.filter((i) => i.quantity_on_hand <= i.reorder_level);
    },
    async stockIn(itemId, quantity) {
      await delay();
      const item = inventoryItems.find((i) => i.item_id === itemId);
      if (!item) throw new Error('Item not found.');
      item.quantity_on_hand += quantity;
      return item;
    },
    async stockOut(itemId, quantity) {
      await delay();
      const item = inventoryItems.find((i) => i.item_id === itemId);
      if (!item) throw new Error('Item not found.');
      if (quantity > item.quantity_on_hand) throw new Error('Insufficient stock on hand.');
      item.quantity_on_hand -= quantity;
      return item;
    },
  },

  suppliers: {
    async list() {
      await delay();
      return suppliers.filter((s) => s.is_active);
    },
  },

  pos: {
    async checkout(lines, _cashierId) {
      await delay();
      let total = 0;
      for (const line of lines) {
        const item = inventoryItems.find((i) => i.item_id === line.item_id);
        if (!item) throw new Error('Item not found.');
        if (line.quantity > item.quantity_on_hand) {
          throw new Error(`Insufficient stock for ${item.item_name}.`);
        }
        total += (item.selling_price ?? 0) * line.quantity;
      }
      // Commit stock decrement only after all lines validate (mirrors the
      // all-or-nothing POS transaction in PosController@processSale).
      for (const line of lines) {
        const item = inventoryItems.find((i) => i.item_id === line.item_id)!;
        item.quantity_on_hand -= line.quantity;
      }
      return { pos_id: ++posSeq, total_amount: total };
    },
  },
};
