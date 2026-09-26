import { FlowWizard } from '../../components/FlowWizard';
import type { FlowStep } from '../../components/FlowWizard';
import StaticPage from '../StaticPage';
import { StepNav } from '../../components/StepNav';

// Consolidates the customer grooming-booking flow that the original app split
// across 5 files into ONE stateful route:
//   booking-services.html → booking-pet-details.html → booking-consent.html
//   → booking-review.html → booking-confirmed.html
// Each step below renders that page's exact markup (port verbatim) and drives
// the draft via useFlow(); the final step calls the existing BookingQueue
// context — no new business logic is introduced here.

interface BookingDraft {
  serviceIds: number[];
  petIds: number[];
  addonIds: number[];
  timeWindowId: number | null;
  bookingDate: string | null;
  consentAccepted: boolean;
}

const initialDraft: BookingDraft = {
  serviceIds: [],
  petIds: [],
  addonIds: [],
  timeWindowId: null,
  bookingDate: null,
  consentAccepted: false,
};

// Each step renders the verbatim markup of the matching original page; StepNav
// drives the step state during review.
function Step({ pageKey, labels }: { pageKey: string; labels: string[] }) {
  return (
    <>
      <StaticPage pageKey={pageKey} />
      <StepNav labels={labels} />
    </>
  );
}

const LABELS = ['Services', 'Pet details', 'Consent', 'Review', 'Confirmed'];

const steps: FlowStep[] = [
  { key: 'booking-services', render: () => <Step pageKey="client__booking-services" labels={LABELS} /> },
  { key: 'booking-pet-details', render: () => <Step pageKey="client__booking-pet-details" labels={LABELS} /> },
  { key: 'booking-consent', render: () => <Step pageKey="client__booking-consent" labels={LABELS} /> },
  { key: 'booking-review', render: () => <Step pageKey="client__booking-review" labels={LABELS} /> },
  { key: 'booking-confirmed', render: () => <Step pageKey="client__booking-confirmed" labels={LABELS} /> },
];

export default function BookingWizard() {
  return <FlowWizard<BookingDraft> steps={steps} initialDraft={initialDraft} />;
}
