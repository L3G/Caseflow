import { Check, Circle, Clock, Zap } from 'lucide-react';
import type { CaseState } from '../types';

interface Props {
  state: CaseState;
}

export function StatusBadge({ state }: Props) {
  switch (state) {
    case 'new':
    case 'documentReceived':
      return (
        <span className="au-pill au-pill-draft">
          <span className="ic"><Circle size={8} fill="currentColor" strokeWidth={0} /></span>
          Draft
        </span>
      );
    case 'classified':
    case 'extracted':
    case 'analysesPending':
    case 'analyzed':
      return (
        <span className="au-pill au-pill-processing">
          <span className="ic"><Zap size={11} /></span>
          Processing
        </span>
      );
    case 'attorneyReviewPending':
      return (
        <span className="au-pill au-pill-await">
          <span className="ic"><Clock size={11} /></span>
          Awaiting attorney
        </span>
      );
    case 'approved':
      return (
        <span className="au-pill au-pill-approved">
          <span className="ic"><Check size={12} strokeWidth={3} /></span>
          Completed
        </span>
      );
    case 'flagged':
      return (
        <span className="au-pill au-pill-needs">
          <span className="ic"><Circle size={8} fill="currentColor" strokeWidth={0} /></span>
          Needs documents
        </span>
      );
  }
}
