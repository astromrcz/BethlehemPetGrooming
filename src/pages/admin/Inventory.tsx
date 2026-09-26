import { useState } from 'react';
import StaticPage from '../StaticPage';

// Consolidates the 6 sibling admin inventory pages into ONE route with tab
// views (the original navigated between separate files that share the same
// shell + InventoryPos context):
//   inventory-dashboard.html · inventory-items.html · inventory-transactions.html
//   · stock-in.html · stock-out.html · suppliers.html
// POS (pos.html) stays its own route — it's a distinct checkout workflow, not a
// view of the inventory ledger. Each tab renders its page's exact markup; all
// reads/writes go through the existing InventoryPos context. No new logic here.

type Tab = 'dashboard' | 'items' | 'transactions' | 'stock-in' | 'stock-out' | 'suppliers';

const TABS: { key: Tab; label: string; pageKey: string }[] = [
  { key: 'dashboard', label: 'Overview', pageKey: 'admin__inventory__inventory-dashboard' },
  { key: 'items', label: 'Items', pageKey: 'admin__inventory__inventory-items' },
  { key: 'transactions', label: 'Transactions', pageKey: 'admin__inventory__inventory-transactions' },
  { key: 'stock-in', label: 'Stock in', pageKey: 'admin__inventory__stock-in' },
  { key: 'stock-out', label: 'Stock out', pageKey: 'admin__inventory__stock-out' },
  { key: 'suppliers', label: 'Suppliers', pageKey: 'admin__inventory__suppliers' },
];

export default function Inventory() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <>
      <StaticPage pageKey={active.pageKey} />
      {/* Floating tab switcher for reviewing the consolidated inventory views. */}
      <nav
        aria-label="Inventory sections"
        style={{
          position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 200, display: 'flex', gap: 6, padding: 8, borderRadius: 999,
          background: 'rgba(15,23,42,0.9)', boxShadow: '0 8px 24px rgba(15,23,42,0.3)',
          fontFamily: 'system-ui', fontSize: 13,
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            aria-current={t.key === tab}
            style={{
              border: 'none', borderRadius: 999, padding: '6px 12px', cursor: 'pointer',
              fontWeight: 600,
              background: t.key === tab ? '#fff' : 'transparent',
              color: t.key === tab ? '#0f172a' : '#fff',
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </>
  );
}
