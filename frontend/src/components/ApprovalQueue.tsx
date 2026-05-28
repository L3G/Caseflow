import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { ApprovalDecision, PendingApproval } from '../types';

interface Props {
  approvals: PendingApproval[];
  onResolve: (id: number, decision: ApprovalDecision, notes?: string) => void;
}

export function ApprovalQueue({ approvals, onResolve }: Props) {
  if (approvals.length === 0) {
    return <p style={{ color: 'var(--muted)', fontSize: 13 }}>No approvals on this case yet.</p>;
  }

  const pending = approvals.filter((a) => a.resolvedAt === null);
  const resolved = approvals.filter((a) => a.resolvedAt !== null);

  return (
    <>
      {pending.map((a) => (
        <PendingRow key={a.id} approval={a} onResolve={onResolve} />
      ))}
      {resolved.map((a) => (
        <ResolvedRow key={a.id} approval={a} />
      ))}
    </>
  );
}

function PendingRow({
  approval,
  onResolve,
}: {
  approval: PendingApproval;
  onResolve: Props['onResolve'];
}) {
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="au-appr" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="au-appr-name">{approval.toolName}</div>
          <div className="au-appr-meta">requested · {formatTime(approval.requestedAt)}</div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      {expanded && (
        <>
          <div
            style={{
              fontSize: 13,
              color: 'var(--ink-2)',
              marginTop: 6,
              padding: '8px 10px',
              background: 'var(--surface-2)',
              borderRadius: 8,
              border: '1px solid var(--line)',
              borderLeft: '3px solid var(--warn)',
            }}
          >
            {approval.plannerReasoning}
          </div>
          <textarea
            className="au-appr-notes"
            placeholder="Notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="au-appr-actions" style={{ marginTop: 4 }}>
            <button
              type="button"
              className="au-btn au-btn-ink au-btn-sm"
              onClick={() => onResolve(approval.id, 'approve', notes || undefined)}
            >
              <Check size={12} strokeWidth={3} /> Approve
            </button>
            <button
              type="button"
              className="au-btn au-btn-sm"
              onClick={() => onResolve(approval.id, 'reject', notes || undefined)}
            >
              <X size={12} /> Reject
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ResolvedRow({ approval }: { approval: PendingApproval }) {
  const pillCls =
    approval.decision === 'approve' ? 'au-pill-approved' : 'au-pill-needs';
  const icon =
    approval.decision === 'approve' ? <Check size={12} strokeWidth={3} /> : <X size={12} />;
  const label = approval.decision === 'approve' ? 'Approved' : 'Rejected';

  return (
    <div className="au-appr">
      <div>
        <div className="au-appr-name">{approval.toolName}</div>
        <div className="au-appr-meta">{approval.decision} · human</div>
      </div>
      <div className="au-appr-r">
        <span className={`au-pill ${pillCls}`}>
          <span className="ic">{icon}</span>
          {label}
        </span>
        <span className="au-appr-by aur-mono">
          by {approval.resolvedBy ?? '—'} · {approval.resolvedAt ? formatTime(approval.resolvedAt) : ''}
        </span>
      </div>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
