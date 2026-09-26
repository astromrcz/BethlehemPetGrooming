import type {
  Booking,
  BookingStatus,
  ClinicAppointment,
  InventoryItem,
  Pet,
  Supplier,
  TimeWindow,
  User,
} from '../types';

/** Result shape mirroring AuthController@signIn's JSON responses. */
export type SignInResult =
  | { code: 'ok'; token: string; user: User }
  | { code: 'login_confirmation_required'; login_poll_token: string; email: string }
  | { code: 'email_not_verified'; email: string }
  | { code: 'account_disabled' }
  | { code: 'invalid_credentials' }
  | { code: 'rate_limited'; retry_after: number };

export interface Db {
  auth: {
    signIn(identifier: string, password: string, remember: boolean): Promise<SignInResult>;
    /** Confirms the emailed login code and returns the session token + user. */
    completeLoginChallenge(pollToken: string, code: string): Promise<{ token: string; user: User }>;
    me(token: string): Promise<User | null>;
  };
  pets: {
    list(userId: number): Promise<Pet[]>;
    create(input: Partial<Pet> & { user_id: number; pet_name: string }): Promise<Pet>;
    update(petId: number, patch: Partial<Pet>): Promise<Pet>;
    setArchived(petId: number, archived: boolean): Promise<void>;
  };
  bookings: {
    history(userId: number): Promise<Booking[]>;
    dailyQueue(date: string): Promise<Booking[]>;
    create(input: {
      user_id: number;
      window_id: number;
      booking_date: string;
      number_of_pets: number;
      special_notes?: string;
    }): Promise<Booking>;
    setStatus(bookingId: number, status: BookingStatus): Promise<Booking>;
  };
  timeslots: {
    forDate(date: string): Promise<Array<TimeWindow & { booked: number; available: number }>>;
  };
  clinic: {
    appointments(date: string): Promise<ClinicAppointment[]>;
    setStatus(id: number, status: ClinicAppointment['status']): Promise<ClinicAppointment>;
  };
  inventory: {
    items(): Promise<InventoryItem[]>;
    lowStock(): Promise<InventoryItem[]>;
    stockIn(itemId: number, quantity: number): Promise<InventoryItem>;
    stockOut(itemId: number, quantity: number): Promise<InventoryItem>;
  };
  suppliers: {
    list(): Promise<Supplier[]>;
  };
  pos: {
    checkout(lines: Array<{ item_id: number; quantity: number }>, cashierId: number): Promise<{ pos_id: number; total_amount: number }>;
  };
}
