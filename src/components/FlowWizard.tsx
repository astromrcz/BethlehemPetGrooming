import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

// Generic multi-step flow container.
//
// The original app split each linear flow across several static HTML files
// (e.g. booking-services.html → booking-pet-details.html → booking-consent.html
// → booking-review.html → booking-confirmed.html) purely because static HTML
// cannot carry state between steps. In React one component owns the step index
// and shared draft state, and each step renders the *identical* per-step markup.
// This collapses many routes/files into one WITHOUT altering the design of any
// step or the business logic (which lives in the contexts).

interface FlowState<T> {
  stepIndex: number;
  stepKeys: string[];
  activeKey: string;
  isFirst: boolean;
  isLast: boolean;
  draft: T;
  setDraft: (patch: Partial<T>) => void;
  goNext: () => void;
  goBack: () => void;
  goTo: (key: string) => void;
}

const FlowContext = createContext<FlowState<any> | null>(null);

export function useFlow<T>() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error('useFlow must be used inside <FlowWizard>');
  return ctx as FlowState<T>;
}

export interface FlowStep {
  /** Stable key, mirrors the original page filename (e.g. 'booking-services'). */
  key: string;
  render: () => ReactNode;
}

export function FlowWizard<T extends object>({
  steps,
  initialDraft,
}: {
  steps: FlowStep[];
  initialDraft: T;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraftState] = useState<T>(initialDraft);

  const setDraft = useCallback(
    (patch: Partial<T>) => setDraftState((prev) => ({ ...prev, ...patch })),
    [],
  );
  const goNext = useCallback(
    () => setStepIndex((i) => Math.min(i + 1, steps.length - 1)),
    [steps.length],
  );
  const goBack = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);
  const goTo = useCallback(
    (key: string) => {
      const idx = steps.findIndex((s) => s.key === key);
      if (idx >= 0) setStepIndex(idx);
    },
    [steps],
  );

  const value = useMemo<FlowState<T>>(
    () => ({
      stepIndex,
      stepKeys: steps.map((s) => s.key),
      activeKey: steps[stepIndex].key,
      isFirst: stepIndex === 0,
      isLast: stepIndex === steps.length - 1,
      draft,
      setDraft,
      goNext,
      goBack,
      goTo,
    }),
    [stepIndex, steps, draft, setDraft, goNext, goBack, goTo],
  );

  return (
    <FlowContext.Provider value={value}>{steps[stepIndex].render()}</FlowContext.Provider>
  );
}
