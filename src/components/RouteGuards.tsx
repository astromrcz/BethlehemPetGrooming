import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts';
import type { Role } from '../lib/types';

function FullscreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#315b7e]" />
    </div>
  );
}

/** Requires a signed-in user; otherwise sends to /sign-in preserving intent. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullscreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/sign-in" replace state={{ from: location }} />;
  return <>{children}</>;
}

/** Requires one of the given roles (role-based access control). */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { isAuthenticated, loading, hasRole } = useAuth();
  if (loading) return <FullscreenSpinner />;
  if (!isAuthenticated) return <Navigate to="/sign-in" replace />;
  if (!hasRole(...roles)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
