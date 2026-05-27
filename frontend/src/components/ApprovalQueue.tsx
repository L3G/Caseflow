import { useState } from 'react';
import type { ApprovalDecision, PendingApproval } from '../types';

interface Props {
  approvals: PendingApproval[];
  onResolve: (id: number, decision: ApprovalDecision, notes?: string) => void;
}

export function ApprovalQueue({ approvals, onResolve }: Props) {
  if (approvals.length === 0) {
    return <p className="cf-text-muted">No approvals on this case yet.</p>;
  }

  const pending = approvals.filter((a) => a.resolvedAt === null);
  const resolved = approvals.filter((a) => a.resolvedAt !== null);

  return (
    <div className="cf-approvals">
      {pending.map((a) => (
        <PendingItem key={a.id} approval={a} onResolve={onResolve} />
      ))}
      {resolved.map((a) => (
        <ResolvedItem key={a.id} approval={a} />
      ))}
    </div>
  );
}

function PendingItem({
  approval,
  onResolve,
}: {
  approval: PendingApproval;
  onResolve: Props['onResolve'];
}) {
  const [notes, setNotes] = useState('');
  return (
    <div className="cf-approval cf-approval--pending">
      <div className="cf-approval-head">
        <strong>{approval.toolName}</strong>
        <span className="cf-text-faint">{formatTime(approval.requestedAt)}</span>
      </div>
      <p className="cf-approval-reason">{approval.plannerReasoning}</p>
      <textarea
        className="cf-approval-notes"
        placeholder="Notes (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="cf-approval-actions">
        <button
          className="cf-btn cf-btn--primary"
          onClick={() => onResolve(approval.id, 'approve', notes || undefined)}
        >
          Approve
        </button>
        <button
          className="cf-btn cf-btn--ghost-danger"
          onClick={() => onResolve(approval.id, 'reject', notes || undefined)}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

function ResolvedItem({ approval }: { approval: PendingApproval }) {
  return (
    <div
      className={`cf-approval cf-approval--resolved cf-approval--${approval.decision ?? 'resolved'}`}
    >
      <div className="cf-approval-head">
        <strong>{approval.toolName}</strong>
        <span className="cf-text-faint">
          {approval.decision} · {approval.resolvedBy}
        </span>
      </div>
      {approval.notes && <p className="cf-approval-reason">"{approval.notes}"</p>}
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
