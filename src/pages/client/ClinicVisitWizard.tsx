import { FlowWizard } from '../../components/FlowWizard';
import type { FlowStep } from '../../components/FlowWizard';
import StaticPage from '../StaticPage';
import { StepNav } from '../../components/StepNav';

// Consolidates the customer clinic-visit flow the original split across 4 files:
//   clinic-visit-reason.html → clinic-visit-date.html → clinic-visit-summary.html
//   → clinic-visit-confirmed.html
// One stateful route; steps render each page's exact markup and drive the draft
// through the existing ClinicMedical context on submit. No new logic here.

interface ClinicVisitDraft {
  reason: string | null;
  petIds: number[];
  appointmentDate: string | null;
  timeWindowId: number | null;
}

const initialDraft: ClinicVisitDraft = {
  reason: null,
  petIds: [],
  appointmentDate: null,
  timeWindowId: null,
};

function Step({ pageKey, labels }: { pageKey: string; labels: string[] }) {
  return (
    <>
      <StaticPage pageKey={pageKey} />
      <StepNav labels={labels} />
    </>
  );
}

const LABELS = ['Reason', 'Date', 'Summary', 'Confirmed'];

const steps: FlowStep[] = [
  { key: 'clinic-visit-reason', render: () => <Step pageKey="client__clinic-visit-reason" labels={LABELS} /> },
  { key: 'clinic-visit-date', render: () => <Step pageKey="client__clinic-visit-date" labels={LABELS} /> },
  { key: 'clinic-visit-summary', render: () => <Step pageKey="client__clinic-visit-summary" labels={LABELS} /> },
  { key: 'clinic-visit-confirmed', render: () => <Step pageKey="client__clinic-visit-confirmed" labels={LABELS} /> },
];

export default function ClinicVisitWizard() {
  return <FlowWizard<ClinicVisitDraft> steps={steps} initialDraft={initialDraft} />;
}
