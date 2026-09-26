import { createBrowserRouter, useParams } from 'react-router';
import { RequireAuth, RequireRole } from '../components/RouteGuards';
import Directory from '../pages/Directory';
import StaticPage from '../pages/StaticPage';
import BookingWizard from '../pages/client/BookingWizard';
import ClinicVisitWizard from '../pages/client/ClinicVisitWizard';
import WalkInWizard from '../pages/admin/WalkInWizard';
import Inventory from '../pages/admin/Inventory';
import NotFound from '../pages/NotFound';

// Renders any ported page by its manifest key, e.g. /view/admin__appointments.
function ViewByKey() {
  const { key = '' } = useParams();
  return <StaticPage pageKey={key} />;
}

// Every screen is reproduced from the original design (see src/pages/generated.ts,
// built by scripts/build-pages.mjs). Linear flows are consolidated into single
// stateful routes; every page is also reachable individually at /view/:key, and
// the directory at "/" links to all of them. Logins are disabled for testing, so
// the guards pass through — they still describe the intended RBAC.
export const router = createBrowserRouter([
  { path: '/', Component: Directory },
  { path: '/view/:key', Component: ViewByKey },

  // ── Auth ─────────────────────────────────────────────────
  { path: '/sign-in', element: <StaticPage pageKey="client__sign-in" /> },
  { path: '/signup', element: <StaticPage pageKey="client__signup" /> },
  { path: '/forgot-password', element: <StaticPage pageKey="client__forgot-password" /> },
  { path: '/reset-password', element: <StaticPage pageKey="client__reset-password" /> },
  { path: '/verify-email', element: <StaticPage pageKey="client__verify-email" /> },
  { path: '/pre-register', element: <StaticPage pageKey="client__pre-register" /> },

  // ── Customer area ────────────────────────────────────────
  {
    path: '/dashboard',
    element: (
      <RequireRole roles={['customer']}>
        <StaticPage pageKey="client__dashboard" />
      </RequireRole>
    ),
  },
  { path: '/my-pets', element: <RequireAuth><StaticPage pageKey="client__my-pets" /></RequireAuth> },
  { path: '/pet-details', element: <RequireAuth><StaticPage pageKey="client__pet-details" /></RequireAuth> },
  { path: '/grooming-history', element: <RequireAuth><StaticPage pageKey="client__grooming-history" /></RequireAuth> },
  { path: '/notifications', element: <RequireAuth><StaticPage pageKey="client__notifications" /></RequireAuth> },
  { path: '/settings', element: <RequireAuth><StaticPage pageKey="client__settings" /></RequireAuth> },
  { path: '/booking', element: <RequireAuth><BookingWizard /></RequireAuth> },
  { path: '/clinic-visit', element: <RequireAuth><ClinicVisitWizard /></RequireAuth> },

  // ── Admin / staff area ───────────────────────────────────
  {
    path: '/admin',
    element: (
      <RequireRole roles={['admin', 'staff']}>
        <StaticPage pageKey="admin__dashboard" />
      </RequireRole>
    ),
  },
  { path: '/admin/appointments', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__appointments" /></RequireRole> },
  { path: '/admin/clinic', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__clinic" /></RequireRole> },
  { path: '/admin/clients', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__clients" /></RequireRole> },
  { path: '/admin/services', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__services" /></RequireRole> },
  { path: '/admin/reports', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__reports" /></RequireRole> },
  { path: '/admin/transactions', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__transactions" /></RequireRole> },
  { path: '/admin/archive', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__archive" /></RequireRole> },
  { path: '/admin/chatbot-insights', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__chatbot-insights" /></RequireRole> },
  { path: '/admin/notifications', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__notifications" /></RequireRole> },
  { path: '/admin/settings', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__settings" /></RequireRole> },
  { path: '/admin/pos', element: <RequireRole roles={['admin', 'staff']}><StaticPage pageKey="admin__inventory__pos" /></RequireRole> },
  { path: '/admin/walk-in', element: <RequireRole roles={['admin', 'staff']}><WalkInWizard /></RequireRole> },
  { path: '/admin/inventory', element: <RequireRole roles={['admin', 'staff']}><Inventory /></RequireRole> },

  { path: '*', Component: NotFound },
]);
