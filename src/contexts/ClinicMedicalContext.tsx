import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { db } from '../lib/data';
import type { ClinicAppointment } from '../lib/types';

interface ClinicMedicalValue {
  appointments: ClinicAppointment[];
  loading: boolean;
  loadAppointments: (date: string) => Promise<void>;
  setAppointmentStatus: (
    id: number,
    status: ClinicAppointment['status'],
  ) => Promise<ClinicAppointment>;
}

const ClinicMedicalContext = createContext<ClinicMedicalValue | null>(null);

export function ClinicMedicalProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAppointments = useCallback(async (date: string) => {
    setLoading(true);
    try {
      setAppointments(await db.clinic.appointments(date));
    } finally {
      setLoading(false);
    }
  }, []);

  const setAppointmentStatus = useCallback(
    async (id: number, status: ClinicAppointment['status']) => {
      const updated = await db.clinic.setStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const value = useMemo<ClinicMedicalValue>(
    () => ({ appointments, loading, loadAppointments, setAppointmentStatus }),
    [appointments, loading, loadAppointments, setAppointmentStatus],
  );

  return <ClinicMedicalContext.Provider value={value}>{children}</ClinicMedicalContext.Provider>;
}

export function useClinicMedical(): ClinicMedicalValue {
  const ctx = useContext(ClinicMedicalContext);
  if (!ctx) throw new Error('useClinicMedical must be used within <ClinicMedicalProvider>.');
  return ctx;
}
