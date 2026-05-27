import type { CaseState } from '../types';

interface Props {
  state: CaseState;
}

const labels: Record<CaseState, string> = {
  new: 'New',
  documentReceived: 'Document received',
  classified: 'Classified',
  extracted: 'Extracted',
  analysesPending: 'Analyses pending',
  analyzed: 'Analyzed',
  attorneyReviewPending: 'Awaiting attorney',
  approved: 'Approved',
  flagged: 'Flagged',
};

export function StatusBadge({ state }: Props) {
  return <span className={`cf-badge cf-badge--${state}`}>{labels[state]}</span>;
}
