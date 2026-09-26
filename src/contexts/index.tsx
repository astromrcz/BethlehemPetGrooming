import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { BookingQueueProvider } from './BookingQueueContext';
import { ClinicMedicalProvider } from './ClinicMedicalContext';
import { InventoryPosProvider } from './InventoryPosContext';
import { PetProfileProvider } from './PetProfileContext';

/**
 * Composes the five feature contexts. AuthProvider is outermost so every other
 * context (and the router guards) can read the current session/role.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PetProfileProvider>
        <BookingQueueProvider>
          <ClinicMedicalProvider>
            <InventoryPosProvider>{children}</InventoryPosProvider>
          </ClinicMedicalProvider>
        </BookingQueueProvider>
      </PetProfileProvider>
    </AuthProvider>
  );
}

export { useAuth } from './AuthContext';
export { useBookingQueue } from './BookingQueueContext';
export { useClinicMedical } from './ClinicMedicalContext';
export { useInventoryPos } from './InventoryPosContext';
export { usePetProfile } from './PetProfileContext';
