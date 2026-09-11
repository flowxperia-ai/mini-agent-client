import { Badge } from './ui/Badge.jsx';

const VIDEO = {
  QUEUED: { tone: 'gray', label: 'Queued', pulse: true },
  PROCESSING: { tone: 'blue', label: 'Generating', pulse: true },
  COMPLETED: { tone: 'green', label: 'Ready' },
  FAILED: { tone: 'red', label: 'Failed' },
  CANCELLED: { tone: 'gray', label: 'Cancelled' },
};

const CONSENT = {
  NOT_STARTED: { tone: 'gray', label: 'Consent not started' },
  PENDING: { tone: 'amber', label: 'Awaiting consent', pulse: true },
  PROCESSING: { tone: 'blue', label: 'Consent under review', pulse: true },
  APPROVED: { tone: 'green', label: 'Consent approved' },
  REJECTED: { tone: 'red', label: 'Consent rejected' },
  EXPIRED: { tone: 'amber', label: 'Consent link expired' },
};

const PAYMENT = {
  PENDING: { tone: 'amber', label: 'Pending' },
  COMPLETED: { tone: 'green', label: 'Paid' },
  FAILED: { tone: 'red', label: 'Failed' },
  EXPIRED: { tone: 'gray', label: 'Expired' },
  REFUNDED: { tone: 'blue', label: 'Refunded' },
};

const MAPS = { video: VIDEO, consent: CONSENT, payment: PAYMENT };

export function StatusBadge({ kind = 'video', status, size }) {
  const entry = MAPS[kind]?.[status] ?? { tone: 'gray', label: status ?? 'Unknown' };
  return (
    <Badge tone={entry.tone} dot pulse={entry.pulse} size={size}>
      {entry.label}
    </Badge>
  );
}
