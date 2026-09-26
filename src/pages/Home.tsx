import { Link, Navigate } from 'react-router';
import { useAuth } from '../contexts';

// Root route. Signed-in users are routed to their role's home; guests see a
// minimal landing that leads to sign-in (full marketing index.html to follow).
export default function Home() {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={role === 'customer' ? '/dashboard' : '/admin'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="site-nav sticky top-0 z-10 flex w-full items-center justify-between bg-[#b6d4ee] px-12 py-5">
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/images/clinic/Bethlehem_Logo-256.png" alt="" className="h-10 w-auto" />
          <span className="font-semibold text-[#1e3a5f]">Bethlehem Animal Clinic</span>
        </Link>
        <Link
          to="/sign-in"
          className="rounded-2xl bg-[#315b7e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#274a66]"
        >
          Sign In
        </Link>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-4xl font-bold text-slate-800 sm:text-5xl">
          Grooming & clinic care for the pets you love
        </h1>
        <p className="mt-6 text-lg text-slate-500">
          Book grooming appointments, track your pet's health records, and manage clinic visits — all
          in one place.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/sign-in"
            className="rounded-2xl bg-[#315b7e] px-6 py-3 font-semibold text-white transition hover:bg-[#274a66]"
          >
            Get started
          </Link>
          <Link
            to="/signup"
            className="rounded-2xl bg-white px-6 py-3 font-semibold text-[#315b7e] shadow-sm transition hover:bg-slate-50"
          >
            Create an account
          </Link>
        </div>
      </main>
    </div>
  );
}
