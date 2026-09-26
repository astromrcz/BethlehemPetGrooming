import { useFlow } from './FlowWizard';

// A small fixed stepper bar for the consolidated wizard flows. The ported pages
// keep their own designed Back/Continue buttons (their hard links were
// neutralized), so this bar drives the actual step state during review.
export function StepNav({ labels }: { labels?: string[] }) {
  const { stepIndex, stepKeys, isFirst, isLast, goBack, goNext } = useFlow();
  const names = labels ?? stepKeys;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 999,
        background: 'rgba(15,23,42,0.9)',
        color: '#fff',
        boxShadow: '0 8px 24px rgba(15,23,42,0.3)',
        fontFamily: 'system-ui',
        fontSize: 13,
      }}
    >
      <button onClick={goBack} disabled={isFirst} style={btn(isFirst)}>
        ← Back
      </button>
      <span style={{ opacity: 0.85 }}>
        {stepIndex + 1}/{names.length} · {names[stepIndex]}
      </span>
      <button onClick={goNext} disabled={isLast} style={btn(isLast)}>
        Next →
      </button>
    </div>
  );
}

function btn(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? 'rgba(255,255,255,0.15)' : '#fff',
    color: disabled ? 'rgba(255,255,255,0.5)' : '#0f172a',
    border: 'none',
    borderRadius: 999,
    padding: '6px 12px',
    fontWeight: 600,
    cursor: disabled ? 'default' : 'pointer',
  };
}
