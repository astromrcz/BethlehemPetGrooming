import { useEffect } from 'react';
import { useAuth, useBookingQueue, useClinicMedical, useInventoryPos } from '../../contexts';
import { StatusBadge } from '../client/Dashboard';

const today = new Date().toISOString().slice(0, 10);

// Reference admin/staff dashboard — exercises the grooming queue, clinic queue,
// and inventory low-stock alerts through their contexts.
export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const { queue, loadDailyQueue, setBookingStatus } = useBookingQueue();
  const { appointments, loadAppointments } = useClinicMedical();
  const { lowStock, loadInventory } = useInventoryPos();

  useEffect(() => {
    loadDailyQueue(today);
    loadAppointments(today);
    loadInventory();
  }, [loadDailyQueue, loadAppointments, loadInventory]);

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="site-nav sticky top-0 z-10 flex items-center justify-between bg-[#1e3a5f] px-8 py-4 text-white">
        <div className="flex items-center gap-3">
          <img src="/assets/images/clinic/Bethlehem_Logo-256.png" alt="" className="h-10 w-auto" />
          <span className="font-semibold">Admin Console</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="capitalize">
            {user?.role}: {user?.first_name}
          </span>
          <button
            onClick={signOut}
            className="rounded-xl bg-white/10 px-4 py-2 font-medium transition hover:bg-white/20"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-2">
        <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Today's grooming queue</h2>
          {queue.length === 0 ? (
            <p className="text-sm text-slate-500">No pets in the queue today.</p>
          ) : (
            <ul className="space-y-3">
              {queue.map((b) => (
                <li
                  key={b.booking_id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f0fa] font-bold text-[#315b7e]">
                      {b.queue_number}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{b.booking_reference}</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  {b.status !== 'completed' && (
                    <button
                      onClick={() =>
                        setBookingStatus(
                          b.booking_id,
                          b.status === 'checked_in' ? 'in_progress' : 'groomed',
                        )
                      }
                      className="rounded-xl bg-[#315b7e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#274a66]"
                    >
                      Advance
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Clinic appointments</h2>
          {appointments.length === 0 ? (
            <p className="text-sm text-slate-500">No clinic appointments today.</p>
          ) : (
            <ul className="space-y-3">
              {appointments.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{a.appointment_reference}</p>
                    <p className="text-sm text-slate-500">{a.chief_complaint}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[1.5rem] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Low-stock alerts</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-slate-500">All items are above their reorder level.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {lowStock.map((i) => (
                <li
                  key={i.item_id}
                  className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
                >
                  <span className="font-medium text-slate-800">{i.item_name}</span>
                  <span className="text-sm font-semibold text-amber-700">
                    {i.quantity_on_hand} / {i.reorder_level} {i.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
