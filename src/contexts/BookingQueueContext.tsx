import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { db } from '../lib/data';
import type { Booking, BookingStatus, TimeWindow } from '../lib/types';

type Slot = TimeWindow & { booked: number; available: number };

interface BookingQueueValue {
  history: Booking[];
  queue: Booking[];
  slots: Slot[];
  loading: boolean;
  loadHistory: (userId: number) => Promise<void>;
  loadDailyQueue: (date: string) => Promise<void>;
  loadSlots: (date: string) => Promise<void>;
  createBooking: (input: {
    user_id: number;
    window_id: number;
    booking_date: string;
    number_of_pets: number;
    special_notes?: string;
  }) => Promise<Booking>;
  setBookingStatus: (bookingId: number, status: BookingStatus) => Promise<Booking>;
}

const BookingQueueContext = createContext<BookingQueueValue | null>(null);

export function BookingQueueProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Booking[]>([]);
  const [queue, setQueue] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      setHistory(await db.bookings.history(userId));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDailyQueue = useCallback(async (date: string) => {
    setLoading(true);
    try {
      setQueue(await db.bookings.dailyQueue(date));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSlots = useCallback(async (date: string) => {
    setSlots(await db.timeslots.forDate(date));
  }, []);

  const createBooking = useCallback<BookingQueueValue['createBooking']>(async (input) => {
    const booking = await db.bookings.create(input);
    setHistory((prev) => [booking, ...prev]);
    return booking;
  }, []);

  const setBookingStatus = useCallback(async (bookingId: number, status: BookingStatus) => {
    const updated = await db.bookings.setStatus(bookingId, status);
    const apply = (list: Booking[]) =>
      list.map((b) => (b.booking_id === bookingId ? updated : b));
    setQueue(apply);
    setHistory(apply);
    return updated;
  }, []);

  const value = useMemo<BookingQueueValue>(
    () => ({
      history,
      queue,
      slots,
      loading,
      loadHistory,
      loadDailyQueue,
      loadSlots,
      createBooking,
      setBookingStatus,
    }),
    [history, queue, slots, loading, loadHistory, loadDailyQueue, loadSlots, createBooking, setBookingStatus],
  );

  return <BookingQueueContext.Provider value={value}>{children}</BookingQueueContext.Provider>;
}

export function useBookingQueue(): BookingQueueValue {
  const ctx = useContext(BookingQueueContext);
  if (!ctx) throw new Error('useBookingQueue must be used within <BookingQueueProvider>.');
  return ctx;
}
