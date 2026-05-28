import { useState } from 'react';
import { Check, ChevronDown, ChevronRight, Sparkles, User, Zap } from 'lucide-react';
import type { CaseEvent, CaseEventType } from '../types';

interface Props {
  events: CaseEvent[];
  highlightLast?: number;
}

type Severity = 'agent' | 'good' | 'human' | 'attn' | 'danger' | 'neutral';

function severity(eventType: CaseEventType): Severity {
  switch (eventType) {
    case 'plannerDecision':
    case 'toolStarted':
      return 'agent';
    case 'toolSucceeded':
    case 'stateTransitioned':
      return 'good';
    case 'toolFailed':
    case 'policyViolation':
      return 'danger';
    case 'approvalRequested':
      return 'attn';
    case 'approvalResolved':
      return 'human';
    case 'agentStopped':
    case 'caseCreated':
    case 'documentUploaded':
    default:
      return 'neutral';
  }
}

function nodeIcon(eventType: CaseEventType) {
  switch (eventType) {
    case 'plannerDecision':
      return <Sparkles size={9} />;
    case 'toolStarted':
      return <Zap size={9} />;
    case 'toolSucceeded':
    case 'stateTransitioned':
    case 'approvalResolved':
      return <Check size={9} strokeWidth={3} />;
    case 'approvalRequested':
      return <ChevronRight size={9} />;
    case 'toolFailed':
    case 'policyViolation':
      return <Zap size={9} />;
    default:
      return <User size={9} />;
  }
}

const labels: Record<CaseEventType, string> = {
  caseCreated: 'Case created',
  documentUploaded: 'Document uploaded',
  plannerDecision: 'Planner decided',
  toolStarted: 'Tool started',
  toolSucceeded: 'Tool succeeded',
  toolFailed: 'Tool failed',
  stateTransitioned: 'State changed',
  approvalRequested: 'Approval requested',
  approvalResolved: 'Approval resolved',
  agentStopped: 'Agent stopped',
  policyViolation: 'Policy violation',
};

export function ActivityFeed({ events, highlightLast = 0 }: Props) {
  if (events.length === 0) {
    return <p style={{ color: 'var(--muted)' }}>No events yet. Click "Run agent" to begin.</p>;
  }

  const cutoff = events.length - highlightLast;

  return (
    <div className="au-trace">
      {events.map((event, index) => {
        const isHighlight = highlightLast > 0 && index >= cutoff;
        const animDelay = isHighlight ? (index - cutoff) * 80 : 0;
        return (
          <TraceItem
            key={event.id}
            event={event}
            highlight={isHighlight}
            animDelay={animDelay}
          />
        );
      })}
    </div>
  );
}

type FeedPayload = Record<string, unknown>;

function TraceItem({
  event,
  highlight,
  animDelay,
}: {
  event: CaseEvent;
  highlight: boolean;
  animDelay: number;
}) {
  let payload: FeedPayload = {};
  try {
    const parsed = JSON.parse(event.payloadJson) as unknown;
    if (parsed && typeof parsed === 'object') payload = parsed as FeedPayload;
  } catch {
    // empty
  }

  const sev = severity(event.eventType);
  const sevCls =
    sev === 'agent' ? 'is-agent' :
    sev === 'good' ? 'is-good' :
    sev === 'human' ? 'is-human' :
    sev === 'attn' ? 'is-attn' :
    sev === 'danger' ? 'is-danger' :
    '';

  return (
    <div
      className={`au-tr ${sevCls} ${highlight ? 'au-tr-enter' : ''}`}
      style={highlight ? { animationDelay: `${animDelay}ms` } : undefined}
    >
      <div className="au-tr-gut">
        <div className="au-tr-node">{nodeIcon(event.eventType)}</div>
      </div>
      <div>
        <div className="au-tr-head">
          <span className="au-kind">{labels[event.eventType] ?? event.eventType}</span>
          <span className={`au-actor ${event.actor.toLowerCase()}`}>{event.actor}</span>
          <span className="au-time aur-mono">{formatTime(event.at)}</span>
        </div>
        <TraceBody eventType={event.eventType} payload={payload} />
      </div>
    </div>
  );
}

function TraceBody({ eventType, payload }: { eventType: CaseEventType; payload: FeedPayload }) {
  const [showAlts, setShowAlts] = useState(false);

  switch (eventType) {
    case 'plannerDecision': {
      const alts = Array.isArray(payload.alternativesConsidered)
        ? (payload.alternativesConsidered as Array<{ action: string; reasonRejected: string }>)
        : [];
      return (
        <>
          <div className="au-tr-title">
            Next → <span className="au-tool">{String(payload.nextAction ?? '')}</span>
            <span className={`au-conf-chip ${payload.estimatedConfidence === 'high' ? '' : 'med'}`}>
              {String(payload.estimatedConfidence ?? '')} confidence
            </span>
          </div>
          {typeof payload.reasoning === 'string' && (
            <div className="au-reason">"{payload.reasoning}"</div>
          )}
          {alts.length > 0 && (
            <>
              <button
                type="button"
                className="au-disclose"
                onClick={() => setShowAlts((s) => !s)}
              >
                {showAlts ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {alts.length} alternative{alts.length === 1 ? '' : 's'} considered
              </button>
              {showAlts && (
                <div className="au-alts">
                  {alts.map((a, i) => (
                    <div className="au-alt" key={i}>
                      <span className="name">{a.action}</span>
                      <span>— {a.reasonRejected}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      );
    }
    case 'toolStarted':
      return (
        <div className="au-tr-title">
          <span className="au-tool">{String(payload.toolName ?? '')}</span>
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>running…</span>
        </div>
      );
    case 'toolSucceeded':
      return (
        <>
          <div className="au-tr-title">
            <span className="au-tool">{String(payload.toolName ?? '')}</span>
            <span style={{ color: 'var(--good-ink)', fontWeight: 500 }}>succeeded</span>
          </div>
          {payload.summary != null && (
            <div className="au-tr-body">{String(payload.summary)}</div>
          )}
        </>
      );
    case 'toolFailed':
      return (
        <>
          <div className="au-tr-title">
            <span className="au-tool">{String(payload.toolName ?? '')}</span>
            <span style={{ color: 'var(--danger-ink)', fontWeight: 500 }}>failed</span>
          </div>
          {payload.error != null && (
            <div className="au-tr-body" style={{ color: 'var(--danger-ink)' }}>
              {String(payload.error)}
            </div>
          )}
        </>
      );
    case 'stateTransitioned':
      return (
        <div className="au-tr-title">
          <span className="au-tool">{String(payload.from ?? '')}</span>
          <span style={{ color: 'var(--muted)' }}>→</span>
          <span className="au-tool">{String(payload.to ?? '')}</span>
        </div>
      );
    case 'agentStopped':
      return (
        <>
          <div className="au-tr-title">{String(payload.stopReason ?? '')}</div>
          {payload.stopMessage != null && (
            <div className="au-tr-body">{String(payload.stopMessage)}</div>
          )}
        </>
      );
    case 'approvalRequested':
      return (
        <div className="au-tr-title">
          For: <span className="au-tool">{String(payload.toolName ?? '')}</span>
        </div>
      );
    case 'approvalResolved':
      return (
        <>
          <div className="au-tr-title">
            <strong>{String(payload.decision ?? '')}</strong>
            <span style={{ color: 'var(--muted)' }}>—</span>
            <span className="au-tool">{String(payload.toolName ?? '')}</span>
          </div>
          {payload.notes != null && (
            <div
              className="au-reason"
              style={{ borderLeftColor: 'var(--good)' }}
            >
              "{String(payload.notes)}"
            </div>
          )}
        </>
      );
    case 'documentUploaded':
      return (
        <div className="au-tr-title">
          <span className="au-tool">{String(payload.fileName ?? '')}</span>
        </div>
      );
    case 'caseCreated':
      return (
        <div className="au-tr-title">
          {String(payload.clientName ?? '')}
          <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
            · {String(payload.workflowTitle ?? '')}
          </span>
        </div>
      );
    case 'policyViolation':
      return (
        <>
          <div className="au-tr-title" style={{ color: 'var(--danger-ink)' }}>
            {String(payload.violation ?? 'Policy violation')}
          </div>
          {payload.chosenTool != null && (
            <div className="au-tr-body">
              Tool: <span className="au-tool">{String(payload.chosenTool)}</span>
            </div>
          )}
        </>
      );
    default:
      return null;
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
