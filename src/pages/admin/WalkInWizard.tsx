import { FlowWizard, useFlow } from '../../components/FlowWizard';
import type { FlowStep } from '../../components/FlowWizard';
import StaticPage from '../StaticPage';
import { StepNav } from '../../components/StepNav';

// Consolidates the admin walk-in flow the original split across 7 files:
//   walk-in-booking.html → walk-in-grooming-services.html → walk-in-pet-details.html
//   → walk-in-consent.html → walk-in-booking-review.html → walk-in-booking-confirmed.html
// with walk-in-clinic-confirmed.html as the clinic-path terminal.
// One stateful route: `visitType` in the draft selects the grooming vs clinic
// terminal, so the branching that used to need separate files is now state.
// Steps render each page's exact markup; submit uses existing BookingQueue /
// ClinicMedical contexts. No new logic here.

interface WalkInDraft {
  visitType: 'grooming' | 'clinic';
  customerId: number | null;
  petIds: number[];
  serviceIds: number[];
  consentAccepted: boolean;
}

const initialDraft: WalkInDraft = {
  visitType: 'grooming',
  customerId: null,
  petIds: [],
  serviceIds: [],
  consentAccepted: false,
};

const LABELS = ['Booking', 'Services', 'Pet details', 'Consent', 'Review', 'Confirmed'];

function Step({ pageKey }: { pageKey: string }) {
  return (
    <>
      <StaticPage pageKey={pageKey} />
      <StepNav labels={LABELS} />
    </>
  );
}

// grooming vs clinic terminal chosen by draft.visitType instead of a file split
function ConfirmedStep() {
  const { draft } = useFlow<WalkInDraft>();
  return (
    <Step
      pageKey={
        draft.visitType === 'clinic'
          ? 'admin__walk-in-clinic-confirmed'
          : 'admin__walk-in-booking-confirmed'
      }
    />
  );
}

const steps: FlowStep[] = [
  { key: 'walk-in-booking', render: () => <Step pageKey="admin__walk-in-booking" /> },
  { key: 'walk-in-grooming-services', render: () => <Step pageKey="admin__walk-in-grooming-services" /> },
  { key: 'walk-in-pet-details', render: () => <Step pageKey="admin__walk-in-pet-details" /> },
  { key: 'walk-in-consent', render: () => <Step pageKey="admin__walk-in-consent" /> },
  { key: 'walk-in-review', render: () => <Step pageKey="admin__walk-in-booking-review" /> },
  { key: 'walk-in-confirmed', render: () => <ConfirmedStep /> },
];

export default function WalkInWizard() {
  return <FlowWizard<WalkInDraft> steps={steps} initialDraft={initialDraft} />;
}
