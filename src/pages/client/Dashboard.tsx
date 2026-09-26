import { useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth, useBookingQueue, usePetProfile } from '../../contexts';

// Reference customer dashboard — shows the context wiring pattern for the
// remaining client pages (my-pets, booking flow, notifications, etc.).
export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const { pets, loadPets } = usePetProfile();
  const { history, loadHistory } = useBookingQueue();

  useEffect(() => {
    if (user) {
      loadPets(user.user_id);
      loadHistory(user.user_id);
    }
  }, [user, loadPets, loadHistory]);

  const upcoming = history.filter((b) =>
    ['waiting_to_arrive', 'checked_in', 'waiting', 'in_progress'].includes(b.status),
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="site-nav sticky top-0 z-10 flex items-center justify-between bg-[#b6d4ee] px-8 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/clinic/Bethlehem_Logo-256.png"
            alt="Bethlehem Animal Clinic"
            className="h-10 w-auto"
          />
          <span className="font-semibold text-[#1e3a5f]">Bethlehem Animal Clinic</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#1e3a5f]">
            Hi, {user?.first_name} {user?.last_name}
          </span>
          <button
            onClick={signOut}
            className="rounded-xl bg-white/70 px-4 py-2 font-medium text-[#315b7e] transition hover:bg-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="My pets" value={pets.length} />
          <StatCard label="Upcoming appointments" value={upcoming.length} />
          <StatCard label="Total bookings" value={history.length} />
        </section>

        <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Your pets</h2>
            <Link
              to="/my-pets"
              className="rounded-xl bg-[#315b7e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#274a66]"
            >
              Manage pets
            </Link>
          </div>
          {pets.length === 0 ? (
            <p className="text-sm text-slate-500">No pets registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {pets.map((pet) => (
                <li key={pet.pet_id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-slate-800">{pet.pet_name}</p>
                    <p className="text-sm text-slate-500">
                      {pet.breed ?? pet.species} · {pet.size ?? 'size n/a'}
                    </p>
                  </div>
                  <span className="text-sm text-slate-400">#{pet.pet_id}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent bookings</h2>
            <Link
              to="/booking"
              className="rounded-xl bg-[#315b7e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#274a66]"
            >
              Book grooming
            </Link>
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.map((b) => (
                <li key={b.booking_id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-slate-800">{b.booking_reference}</p>
                    <p className="text-sm text-slate-500">{b.booking_date}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <p className="text-3xl font-bold text-[#315b7e]">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
      {label}
    </span>
  );
}
