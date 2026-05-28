import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronRight, Plus, Search } from 'lucide-react';
import type { Case } from '../types';
import { api } from '../api';
import { Topbar } from '../components/Topbar';
import { Avatar } from '../components/Avatar';
import { StatusBadge } from '../components/StatusBadge';
import { InitiateModal } from '../components/InitiateModal';

interface Props {
  dark: boolean;
  onToggleDark: () => void;
}

type Tab = 'all' | 'open' | 'attn' | 'done';

interface OutcomeFlags {
  meansTestFails: boolean;
  arithMismatch: boolean;
}

export function CasesList({ dark, onToggleDark }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[] | null>(null);
  const [flagsByCase, setFlagsByCase] = useState<Map<string, OutcomeFlags>>(
    () => new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  const modalOpen = location.pathname === '/cases/new';

  const refetch = useCallback(() => {
    api
      .listCases()
      .then(setCases)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // N+1 fetch of analyses for the outcome chips. Fine at prototype scale;
  // production would denormalize summary flags onto the cases endpoint.
  useEffect(() => {
    if (!cases) return;
    let cancelled = false;
    Promise.all(
      cases.map(async (c) => {
        try {
          const a = await api.getAnalyses(c.id);
          return [
            c.id,
            {
              meansTestFails: a.meansTest?.passes === false,
              arithMismatch: a.arithCheck?.balanceReconciles === false,
            },
          ] as const;
        } catch {
          return [c.id, { meansTestFails: false, arithMismatch: false }] as const;
        }
      }),
    ).then((entries) => {
      if (cancelled) return;
      setFlagsByCase(new Map(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [cases]);

  const kpis = useMemo(() => computeKpis(cases), [cases]);
  const counts = useMemo(() => computeCounts(cases), [cases]);
  const filtered = useMemo(
    () => applyFilters(cases, tab, search),
    [cases, tab, search],
  );

  return (
    <>
      <Topbar
        crumb={
          <>
            <a onClick={() => navigate('/cases')}>Caseflow</a>
            <span className="sep">/</span>
            <span className="cur">Cases</span>
          </>
        }
        dark={dark}
        onToggleDark={onToggleDark}
      />
      <div className="au-scroll">
        <div className="au-page">
          <div className="au-hero">
            <div className="au-hero-l">
              <div className="au-eyebrow">
                Chapter 7 Intake · Matthews &amp; Associates
              </div>
              <h1 className="au-h1">Cases</h1>
            </div>
            <div className="au-hero-r">
              <Link to="/cases/new" className="au-btn au-btn-grad">
                <Plus size={14} /> Initiate case
              </Link>
            </div>
          </div>

          <div className="au-kpi-row">
            <KpiCard label="Active" value={kpis.active} delta="—" />
            <KpiCard label="Awaiting review" value={kpis.awaiting} delta="—" attn />
            <KpiCard label="Approved · 30d" value={kpis.approved30} delta="—" />
            <KpiCard label="Time to file" value={kpis.ttf} delta="—" />
          </div>

          <div className="au-toolbar">
            {(['all', 'open', 'attn', 'done'] as const).map((t) => (
              <button
                key={t}
                className={`au-tab ${tab === t ? 'on' : ''}`}
                onClick={() => setTab(t)}
                type="button"
              >
                {tabLabel(t)} <span className="n">{counts[t]}</span>
              </button>
            ))}
            <div className="au-search">
              <Search size={14} color="var(--muted)" />
              <input
                placeholder="Search cases…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd className="au-kbd">⌘K</kbd>
            </div>
          </div>

          {error && <div className="au-banner">{error}</div>}

          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Workflow</th>
                  <th>Status</th>
                  <th>Docs</th>
                  <th>Updated</th>
                  <th aria-label="More" />
                </tr>
              </thead>
              <tbody>
                {cases === null && !error && (
                  <tr>
                    <td colSpan={6} className="au-empty-row">
                      Loading…
                    </td>
                  </tr>
                )}
                {cases !== null && cases.length === 0 && (
                  <tr>
                    <td colSpan={6} className="au-empty-row">
                      No cases yet. Click <strong>Initiate case</strong> to create the first one.
                    </td>
                  </tr>
                )}
                {cases !== null && cases.length > 0 && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="au-empty-row">
                      No matters match your filter.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)}>
                    <td>
                      <div className="au-client">
                        <Avatar name={c.clientName} />
                        <div>
                          <div className="au-client-name">{c.clientName}</div>
                          <div className="au-client-id">{c.id.slice(0, 12)}…</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="au-wf-cell">{c.workflowTitle}</span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <StatusBadge state={c.state} />
                        {flagsByCase.get(c.id)?.meansTestFails && (
                          <span className="au-pill au-pill-needs">
                            <span className="ic">
                              <AlertCircle size={11} />
                            </span>
                            Means test: Fails
                          </span>
                        )}
                        {flagsByCase.get(c.id)?.arithMismatch && (
                          <span className="au-pill au-pill-needs">
                            <span className="ic">
                              <AlertCircle size={11} />
                            </span>
                            Arithmetic: Mismatch
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="aur-mono" style={{ color: 'var(--muted)', fontSize: 13 }}>
                      1 file
                    </td>
                    <td>
                      <div className="au-updated">
                        {relativeTime(c.updatedAt)}
                        <span className="abs">{new Date(c.updatedAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <ChevronRight size={16} className="au-chev" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="au-foot">
            <span>Caseflow · Chapter 7 intake</span>
            <span className="aur-mono">v0.4.2 · agent build 218</span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <InitiateModal
          onClose={() => navigate('/cases')}
          onCreated={(c) => {
            refetch();
            navigate(`/cases/${c.id}`);
          }}
        />
      )}
    </>
  );
}

function KpiCard({
  label,
  value,
  delta,
  attn = false,
}: {
  label: string;
  value: number | string;
  delta: string;
  attn?: boolean;
}) {
  return (
    <div className={`au-kpi ${attn ? 'attn' : ''}`}>
      <div className="au-eyebrow">{label}</div>
      <div className="au-kpi-v">{value}</div>
      <div className="au-kpi-d">{delta}</div>
    </div>
  );
}

function tabLabel(t: Tab): string {
  switch (t) {
    case 'all':
      return 'All';
    case 'open':
      return 'Open';
    case 'attn':
      return 'Needs attention';
    case 'done':
      return 'Completed';
  }
}

function computeKpis(cases: Case[] | null) {
  const empty = { active: 0, awaiting: 0, approved30: 0, ttf: '—' as string };
  if (!cases) return empty;
  const now = Date.now();
  const dayMs = 86_400_000;
  const active = cases.filter((c) => c.state !== 'approved' && c.state !== 'flagged').length;
  const awaiting = cases.filter((c) => c.state === 'attorneyReviewPending').length;
  const approved30 = cases.filter(
    (c) => c.state === 'approved' && now - new Date(c.updatedAt).getTime() <= 30 * dayMs,
  ).length;
  const approvedCases = cases.filter((c) => c.state === 'approved');
  let ttf: string = '—';
  if (approvedCases.length > 0) {
    const avgMs =
      approvedCases.reduce(
        (sum, c) =>
          sum + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()),
        0,
      ) / approvedCases.length;
    const days = avgMs / dayMs;
    ttf = days < 1 ? `${(avgMs / 3_600_000).toFixed(1)}h` : `${days.toFixed(1)}d`;
  }
  return { active, awaiting, approved30, ttf };
}

function computeCounts(cases: Case[] | null): Record<Tab, number> {
  if (!cases) return { all: 0, open: 0, attn: 0, done: 0 };
  return {
    all: cases.length,
    open: cases.filter((c) => c.state !== 'approved' && c.state !== 'flagged').length,
    attn: cases.filter((c) => c.state === 'attorneyReviewPending' || c.state === 'flagged').length,
    done: cases.filter((c) => c.state === 'approved').length,
  };
}

function applyFilters(cases: Case[] | null, tab: Tab, search: string): Case[] {
  if (!cases) return [];
  return cases.filter((c) => {
    if (tab === 'open' && (c.state === 'approved' || c.state === 'flagged')) return false;
    if (
      tab === 'attn' &&
      !(c.state === 'attorneyReviewPending' || c.state === 'flagged')
    )
      return false;
    if (tab === 'done' && c.state !== 'approved') return false;
    if (search && !c.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
