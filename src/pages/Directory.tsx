import { Link } from 'react-router';
import { PAGES } from './generated';

// Simple index of every ported page so the whole UI can be reviewed. Grouped by
// the original folder (client / admin / admin-inventory).
export default function Directory() {
  const entries = Object.values(PAGES);
  const groups: Record<string, typeof entries> = {
    Client: entries.filter((p) => p.source.startsWith('pages/client/')),
    Admin: entries.filter(
      (p) => p.source.startsWith('pages/admin/') && !p.source.includes('/inventory/'),
    ),
    'Admin · Inventory': entries.filter((p) => p.source.includes('/inventory/')),
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        Bethlehem Pet Grooming — page directory
      </h1>
      <p style={{ color: '#64748b', marginBottom: 28 }}>
        {entries.length} pages reproduced from the original design. Logins are disabled for testing.
      </p>
      {Object.entries(groups).map(([label, list]) => (
        <section key={label} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, color: '#475569', marginBottom: 10 }}>
            {label} <span style={{ color: '#94a3b8' }}>({list.length})</span>
          </h2>
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 8, listStyle: 'none', padding: 0 }}>
            {list.map((p) => (
              <li key={p.key}>
                <Link
                  to={`/view/${p.key}`}
                  style={{ display: 'block', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 10, textDecoration: 'none', color: '#0f172a', background: '#fff' }}
                >
                  <span style={{ fontWeight: 600 }}>{p.source.split('/').pop()}</span>
                  <br />
                  <span style={{ fontSize: 12, color: '#64748b' }}>{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
