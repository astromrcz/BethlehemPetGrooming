import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 px-6 text-center">
      <p className="text-6xl font-bold text-[#315b7e]">404</p>
      <p className="text-slate-600">This page could not be found.</p>
      <Link
        to="/"
        className="rounded-2xl bg-[#315b7e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#274a66]"
      >
        Back to home
      </Link>
    </div>
  );
}
