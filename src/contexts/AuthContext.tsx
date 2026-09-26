import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { db } from '../lib/data';
import type { Role, User } from '../lib/types';
import type { SignInResult } from '../lib/data/types';

const TOKEN_KEY = 'bpg_token';

// ── Testing bypass ────────────────────────────────────────────────────────
// When enabled, all logins are disabled: the app boots as a signed-in admin so
// every RequireAuth / RequireRole route is reachable without authenticating.
// ON by default for testing; set VITE_DISABLE_AUTH=false to restore real login.
const AUTH_DISABLED = import.meta.env.VITE_DISABLE_AUTH !== 'false';

const TEST_USER: User = {
  user_id: 0,
  first_name: 'Test',
  last_name: 'Admin',
  username: 'test',
  email: 'test@example.com',
  phone: null,
  role: 'admin',
  staff_type: null,
  email_verified_at: new Date().toISOString(),
  is_active: true,
  is_archived: false,
};

interface AuthContextValue {
  user: User | null;
  token: string | null;
  role: Role | null;
  loading: boolean;
  isAuthenticated: boolean;
  /** Roles allowed to reach admin/staff areas. */
  isStaff: boolean;
  hasRole: (...roles: Role[]) => boolean;
  signIn: (identifier: string, password: string, remember: boolean) => Promise<SignInResult>;
  completeLoginChallenge: (pollToken: string, code: string) => Promise<User>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(AUTH_DISABLED ? TEST_USER : null);
  const [token, setToken] = useState<string | null>(() =>
    AUTH_DISABLED ? 'test-token' : localStorage.getItem(TOKEN_KEY),
  );
  const [loading, setLoading] = useState(!AUTH_DISABLED);

  // Bootstrap the session from a persisted token (mirrors GET /me on load).
  useEffect(() => {
    if (AUTH_DISABLED) return; // testing bypass: skip session bootstrap
    let cancelled = false;
    (async () => {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }
      try {
        const me = await db.auth.me(stored);
        if (cancelled) return;
        if (me) {
          setUser(me);
          setToken(stored);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    (identifier: string, password: string, remember: boolean) =>
      db.auth.signIn(identifier, password, remember),
    [],
  );

  const completeLoginChallenge = useCallback(async (pollToken: string, code: string) => {
    const { token: newToken, user: newUser } = await db.auth.completeLoginChallenge(pollToken, code);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      loading,
      isAuthenticated: AUTH_DISABLED || !!user,
      isStaff: AUTH_DISABLED || user?.role === 'admin' || user?.role === 'staff',
      // testing bypass: allow every role so all guarded routes are reachable
      hasRole: (...roles: Role[]) => AUTH_DISABLED || (user ? roles.includes(user.role) : false),
      signIn,
      completeLoginChallenge,
      signOut,
    }),
    [user, token, loading, signIn, completeLoginChallenge, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>.');
  return ctx;
}
