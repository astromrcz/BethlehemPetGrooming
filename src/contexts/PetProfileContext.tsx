import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { db } from '../lib/data';
import type { Pet } from '../lib/types';

// Static catalogs the original app ships for pet registration. Kept in the
// context so both customer and admin pet forms read from one source.
export const BREED_CATALOG = [
  'Aspin (Native)',
  'Shih Tzu',
  'Poodle',
  'Labrador Retriever',
  'Golden Retriever',
  'Beagle',
  'Chihuahua',
  'Pomeranian',
  'Siberian Husky',
  'Persian (Cat)',
  'Puspin (Native Cat)',
  'Other',
] as const;

export const COAT_CATALOG = ['short', 'medium', 'long', 'wire', 'curl'] as const;
export const SIZE_CATALOG = ['small', 'medium', 'large', 'extra_large'] as const;

interface PetProfileValue {
  pets: Pet[];
  loading: boolean;
  breeds: readonly string[];
  coats: readonly string[];
  sizes: readonly string[];
  loadPets: (userId: number) => Promise<void>;
  addPet: (input: Partial<Pet> & { user_id: number; pet_name: string }) => Promise<Pet>;
  updatePet: (petId: number, patch: Partial<Pet>) => Promise<Pet>;
  archivePet: (petId: number) => Promise<void>;
  unarchivePet: (petId: number) => Promise<void>;
}

const PetProfileContext = createContext<PetProfileValue | null>(null);

export function PetProfileProvider({ children }: { children: ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPets = useCallback(async (userId: number) => {
    setLoading(true);
    try {
      setPets(await db.pets.list(userId));
    } finally {
      setLoading(false);
    }
  }, []);

  const addPet = useCallback<PetProfileValue['addPet']>(async (input) => {
    const pet = await db.pets.create(input);
    setPets((prev) => [...prev, pet]);
    return pet;
  }, []);

  const updatePet = useCallback(async (petId: number, patch: Partial<Pet>) => {
    const updated = await db.pets.update(petId, patch);
    setPets((prev) => prev.map((p) => (p.pet_id === petId ? updated : p)));
    return updated;
  }, []);

  const archivePet = useCallback(async (petId: number) => {
    await db.pets.setArchived(petId, true);
    setPets((prev) => prev.filter((p) => p.pet_id !== petId));
  }, []);

  const unarchivePet = useCallback(async (petId: number) => {
    await db.pets.setArchived(petId, false);
  }, []);

  const value = useMemo<PetProfileValue>(
    () => ({
      pets,
      loading,
      breeds: BREED_CATALOG,
      coats: COAT_CATALOG,
      sizes: SIZE_CATALOG,
      loadPets,
      addPet,
      updatePet,
      archivePet,
      unarchivePet,
    }),
    [pets, loading, loadPets, addPet, updatePet, archivePet, unarchivePet],
  );

  return <PetProfileContext.Provider value={value}>{children}</PetProfileContext.Provider>;
}

export function usePetProfile(): PetProfileValue {
  const ctx = useContext(PetProfileContext);
  if (!ctx) throw new Error('usePetProfile must be used within <PetProfileProvider>.');
  return ctx;
}
