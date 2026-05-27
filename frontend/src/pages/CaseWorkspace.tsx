import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type {
  AnalysesBag,
  ApprovalDecision,
  BankStatementExtraction,
  Case,
  CaseEvent,
  PendingApproval,
} from '../types';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';
import { ActivityFeed } from '../components/ActivityFeed';
import { ApprovalQueue } from '../components/ApprovalQueue';
import { ExtractedDataPanel } from '../components/ExtractedDataPanel';

export function CaseWorkspace() {
  const { id } = useParams<{ id: string }>();
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
      // API returns events newest-first; reverse for chronological display.
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

  // Clear the animation highlight after the staggered slide-in completes.
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

  if (!caseData && !error) return <p className="cf-text-muted">Loading…</p>;
  if (error && !caseData) return <div className="cf-banner cf-banner--danger">{error}</div>;
  if (!caseData) return null;

  return (
    <section>
      <div className="cf-page-head">
        <div>
          <h1>{caseData.clientName}</h1>
          <p className="cf-text-muted">
            <span className="cf-mono cf-text-faint">{caseData.id.slice(0, 12)}…</span>
            &nbsp;·&nbsp;{caseData.workflowTitle}
          </p>
        </div>
        <div className="cf-page-head-actions">
          <StatusBadge state={caseData.state} />
          <button
            className="cf-btn cf-btn--primary"
            onClick={handleRun}
            disabled={runState === 'running'}
          >
            {runState === 'running' ? 'Running agent…' : 'Run agent'}
          </button>
        </div>
      </div>

      {error && <div className="cf-banner cf-banner--danger">{error}</div>}

      <div className="cf-workspace">
        <div className="cf-workspace-main">
          <div className="cf-card">
            <h2 className="cf-section-title">Activity</h2>
            <ActivityFeed events={events} highlightLast={highlightLast} />
          </div>
        </div>

        <aside className="cf-workspace-aside">
          {approvals.length > 0 && (
            <div className="cf-card">
              <h2 className="cf-section-title">Approvals</h2>
              <ApprovalQueue approvals={approvals} onResolve={handleResolveApproval} />
            </div>
          )}

          <div className="cf-card">
            <h2 className="cf-section-title">Extracted data</h2>
            <ExtractedDataPanel extraction={extraction} />
          </div>

          {(analyses.meansTest || analyses.deadlines || analyses.arithCheck) && (
            <div className="cf-card">
              <h2 className="cf-section-title">Analyses</h2>
              <AnalysesPanel analyses={analyses} />
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function AnalysesPanel({ analyses }: { analyses: AnalysesBag }) {
  return (
    <div className="cf-analyses">
      {analyses.meansTest && (
        <div className="cf-analysis">
          <h3>Means test</h3>
          <p>
            <strong className={analyses.meansTest.passes ? 'cf-success' : 'cf-danger'}>
              {analyses.meansTest.passes ? 'Passes' : 'Fails'}
            </strong>
            {' — '}${analyses.meansTest.annualizedIncomeProxy.toLocaleString()} annualized vs $
            {analyses.meansTest.medianIncomeThreshold.toLocaleString()} threshold
          </p>
        </div>
      )}
      {analyses.deadlines && (
        <div className="cf-analysis">
          <h3>Deadlines</h3>
          <ul className="cf-deadline-list">
            {analyses.deadlines.deadlines.map((d, i) => (
              <li key={i}>
                <span className="cf-deadline-date">{d.dueDate}</span>
                <span>{d.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {analyses.arithCheck && (
        <div className="cf-analysis">
          <h3>Arithmetic check</h3>
          <p>
            <strong className={analyses.arithCheck.balanceReconciles ? 'cf-success' : 'cf-danger'}>
              {analyses.arithCheck.balanceReconciles ? 'Reconciles' : 'Mismatch'}
            </strong>
            {' — discrepancy $'}
            {analyses.arithCheck.discrepancy.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
