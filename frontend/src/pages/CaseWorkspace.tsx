import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import type {
  AnalysesBag,
  ApprovalDecision,
  BankStatementExtraction,
  Case,
  CaseEvent,
  PendingApproval,
} from '../types';
import { api } from '../api';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { StatusBadge } from '../components/StatusBadge';
import { ActivityFeed } from '../components/ActivityFeed';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { ExtractedDataPanel } from '../components/ExtractedDataPanel';

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

export function CaseWorkspace({ dark, onToggleDark }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [extraction, setExtraction] = useState<BankStatementExtraction | null>(null);
  const [analyses, setAnalyses] = useState<AnalysesBag>({
    meansTest: null,
    deadlines: null,
    arithCheck: null,
  });
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [highlightLast, setHighlightLast] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [runState, setRunState] = useState<'idle' | 'running'>('idle');

  const loadAll = useCallback(async () => {
    if (!id) return;
    try {
      const [c, ev, ext, an, ap] = await Promise.all([
        api.getCase(id),
        api.listEvents(id),
        api.getExtraction(id),
        api.getAnalyses(id),
        api.listApprovals(id),
      ]);
      setCaseData(c);
      setEvents([...ev].reverse());
      setExtraction(ext);
      setAnalyses(an);
      setApprovals(ap);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (highlightLast === 0) return;
    const totalMs = 240 + (highlightLast - 1) * 80 + 200;
    const t = setTimeout(() => setHighlightLast(0), totalMs);
    return () => clearTimeout(t);
  }, [highlightLast]);

  async function handleRun() {
    if (!id) return;
    setRunState('running');
    setError(null);
    try {
      const result = await api.runAgent(id);
      setHighlightLast(result.newEvents.length);
      await loadAll();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunState('idle');
    }
  }

  const wrongDocType = useMemo(() => readClassifiedDocType(events), [events]);

  async function handleResolveApproval(
    approvalId: number,
    decision: ApprovalDecision,
    notes?: string,
  ) {
    try {
      await api.resolveApproval(approvalId, decision, notes);
      await loadAll();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (!caseData && !error) {
    return (
      <>
        <Topbar
          crumb={
            <>
              <Link to="/cases">Caseflow</Link>
              <span className="sep">/</span>
              <Link to="/cases">Cases</Link>
            </>
          }
          dark={dark}
          onToggleDark={onToggleDark}
        />
        <div className="au-scroll">
          <div className="au-page">
            <p style={{ color: 'var(--muted)' }}>Loading…</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !caseData) {
    return (
      <>
        <Topbar
          crumb={
            <>
              <Link to="/cases">Caseflow</Link>
              <span className="sep">/</span>
              <Link to="/cases">Cases</Link>
            </>
          }
          dark={dark}
          onToggleDark={onToggleDark}
        />
        <div className="au-scroll">
          <div className="au-page">
            <div className="au-banner">{error}</div>
          </div>
        </div>
      </>
    );
  }

  if (!caseData) return null;

  return (
    <>
      <Topbar
        crumb={
          <>
            <Link to="/cases">Caseflow</Link>
            <span className="sep">/</span>
            <Link to="/cases">Cases</Link>
            <span className="sep">/</span>
            <span className="cur">{caseData.clientName}</span>
          </>
        }
        right={
          <>
            <button
              type="button"
              className="au-btn"
              onClick={() => navigate('/cases')}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="button"
              className="au-btn au-btn-grad"
              onClick={handleRun}
              disabled={runState === 'running'}
            >
              <Sparkles size={14} />
              {runState === 'running' ? 'Running agent…' : 'Run agent'}
            </button>
          </>
        }
        dark={dark}
        onToggleDark={onToggleDark}
      />
      <div className="au-scroll">
        <div className="au-page">
          <div className="au-detail-hero">
            <Avatar name={caseData.clientName} size="detail" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="au-eyebrow">Matter</div>
              <h1 className="au-h1" style={{ marginTop: 6 }}>
                {caseData.clientName}
              </h1>
              <div className="au-detail-meta">
                <span className="au-id-chip">{caseData.id.slice(0, 16)}…</span>
                <span className="au-wf-cell">{caseData.workflowTitle}</span>
                <span className="au-bullet">·</span>
                <StatusBadge state={caseData.state} />
                {analyses.meansTest?.passes === false && (
                  <span className="au-pill au-pill-needs">
                    <span className="ic">
                      <AlertCircle size={11} />
                    </span>
                    Means test: Fails
                  </span>
                )}
                {analyses.arithCheck?.balanceReconciles === false && (
                  <span className="au-pill au-pill-needs">
                    <span className="ic">
                      <AlertCircle size={11} />
                    </span>
                    Arithmetic: Mismatch
                  </span>
                )}
                {wrongDocType && (
                  <span className="au-pill au-pill-needs">
                    <span className="ic">
                      <AlertCircle size={11} />
                    </span>
                    Wrong type: {wrongDocType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && <div className="au-banner">{error}</div>}

          <div className="au-detail-grid">
            <div className="au-card">
              <div className="au-card-h">
                <h3>Activity</h3>
                <span className="meta">{events.length} events</span>
              </div>
              <div className="au-card-b">
                <ActivityFeed events={events} highlightLast={highlightLast} />
              </div>
            </div>

            <div>
              <div className="au-card">
                <div className="au-card-h">
                  <h3>Approvals</h3>
                  <span className="meta">
                    {approvals.filter((a) => a.resolvedAt === null).length} pending
                  </span>
                </div>
                <div className="au-card-b">
                  <ApprovalQueue approvals={approvals} onResolve={handleResolveApproval} />
                </div>
              </div>

              <div className="au-card">
                <div className="au-card-h">
                  <h3>Extracted data</h3>
                </div>
                <div className="au-card-b">
                  <ExtractedDataPanel extraction={extraction} />
                </div>
              </div>

              {(analyses.meansTest || analyses.deadlines || analyses.arithCheck) && (
                <div className="au-card">
                  <div className="au-card-h">
                    <h3>Analyses</h3>
                  </div>
                  <div className="au-card-b">
                    <AnalysesPanel analyses={analyses} extraction={extraction} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Pulls the document type out of the ClassifyDocument tool's audit event.
// Returns the classified type only when it's something OTHER than BankStatement
// (the type this workflow expects). Returns null otherwise.
function readClassifiedDocType(events: CaseEvent[]): string | null {
  for (const e of events) {
    if (e.eventType !== 'toolSucceeded') continue;
    try {
      const p = JSON.parse(e.payloadJson) as { toolName?: string; summary?: string };
      if (p.toolName !== 'ClassifyDocument' || typeof p.summary !== 'string') continue;
      const m = p.summary.match(/Classified as (\w+)/);
      if (!m) continue;
      const type = m[1];
      if (type === 'BankStatement') return null;
      return type;
    } catch {
      continue;
    }
  }
  return null;
}

function AnalysesPanel({
  analyses,
  extraction,
}: {
  analyses: AnalysesBag;
  extraction: BankStatementExtraction | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {analyses.meansTest && (
        <div>
          <div className="au-eyebrow" style={{ marginBottom: 4 }}>Means test</div>
          <div style={{ fontSize: 13 }}>
            <strong
              style={{
                color: analyses.meansTest.passes ? 'var(--good-ink)' : 'var(--danger-ink)',
              }}
            >
              {analyses.meansTest.passes ? 'Passes' : 'Fails'}
            </strong>
            <span style={{ color: 'var(--muted)' }}> — </span>
            <span className="aur-mono">
              ${analyses.meansTest.annualizedIncomeProxy.toLocaleString()}
            </span>{' '}
            annualized vs{' '}
            <span className="aur-mono">
              ${analyses.meansTest.medianIncomeThreshold.toLocaleString()}
            </span>{' '}
            threshold
          </div>
        </div>
      )}
      {analyses.deadlines && (
        <div>
          <div className="au-eyebrow" style={{ marginBottom: 4 }}>
            Deadlines ({analyses.deadlines.deadlines.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            {analyses.deadlines.deadlines.map((d, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: 8,
                  alignItems: 'baseline',
                }}
              >
                <span className="aur-mono" style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {d.dueDate}
                </span>
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {analyses.arithCheck && (
        <div>
          <div className="au-eyebrow" style={{ marginBottom: 4 }}>Arithmetic check</div>
          <div style={{ fontSize: 13 }}>
            <strong
              style={{
                color: analyses.arithCheck.balanceReconciles
                  ? 'var(--good-ink)'
                  : 'var(--danger-ink)',
              }}
            >
              {analyses.arithCheck.balanceReconciles ? 'Reconciles' : 'Mismatch'}
            </strong>
            <span style={{ color: 'var(--muted)' }}> — discrepancy </span>
            <span className="aur-mono">${analyses.arithCheck.discrepancy.toFixed(2)}</span>
          </div>
          {!analyses.arithCheck.balanceReconciles && extraction && (
            <ArithBreakdown extraction={extraction} arith={analyses.arithCheck} />
          )}
        </div>
      )}
    </div>
  );
}

function ArithBreakdown({
  extraction,
  arith,
}: {
  extraction: BankStatementExtraction;
  arith: NonNullable<AnalysesBag['arithCheck']>;
}) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: '10px 12px',
        background: 'var(--danger-soft)',
        border: '1px solid var(--danger-border)',
        borderRadius: 10,
        fontSize: 12,
      }}
    >
      <ArithRow label="Beginning balance" value={extraction.beginningBalance.value} />
      <ArithRow label="+ Total deposits" value={extraction.totalDeposits.value} />
      <ArithRow label="− Total withdrawals" value={extraction.totalWithdrawals.value} />
      <div
        style={{
          borderTop: '1px dashed var(--danger-border)',
          marginTop: 6,
          paddingTop: 6,
        }}
      >
        <ArithRow label="Expected ending" value={arith.expectedEndingBalance} bold />
        <ArithRow
          label="Printed ending"
          value={arith.actualEndingBalance}
          bold
          danger
        />
      </div>
      <div
        style={{
          borderTop: '1px solid var(--danger-border)',
          marginTop: 6,
          paddingTop: 6,
        }}
      >
        <ArithRow label="Discrepancy" value={arith.discrepancy} bold danger />
      </div>
    </div>
  );
}

function ArithRow({
  label,
  value,
  bold,
  danger,
}: {
  label: string;
  value: number;
  bold?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '3px 0',
        color: danger ? 'var(--danger-ink)' : 'var(--ink-2)',
        fontWeight: bold ? 700 : 500,
      }}
    >
      <span>{label}</span>
      <span className="aur-mono">${value.toFixed(2)}</span>
    </div>
  );
}
