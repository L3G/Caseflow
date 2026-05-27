import type { CaseEvent, CaseEventType } from '../types';

interface Props {
  events: CaseEvent[];
  highlightLast?: number;
}

const eventLabels: Record<CaseEventType, string> = {
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
    return <p className="cf-text-muted">No events yet. Click "Run agent" to begin.</p>;
  }

  const cutoff = events.length - highlightLast;

  return (
    <ol className="cf-feed">
      {events.map((event, index) => {
        const isHighlight = highlightLast > 0 && index >= cutoff;
        const animDelay = isHighlight ? (index - cutoff) * 80 : 0;
        return (
          <li
            key={event.id}
            className={`cf-feed-item ${isHighlight ? 'cf-feed-item--enter' : ''}`}
            style={isHighlight ? { animationDelay: `${animDelay}ms` } : undefined}
          >
            <FeedItem event={event} />
          </li>
        );
      })}
    </ol>
  );
}

function FeedItem({ event }: { event: CaseEvent }) {
  let payload: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(event.payloadJson) as unknown;
    if (parsed && typeof parsed === 'object') {
      payload = parsed as Record<string, unknown>;
    }
  } catch {
    // payload remains empty
  }

  return (
    <div className="cf-feed-row">
      <div className="cf-feed-meta">
        <span className={`cf-feed-type cf-feed-type--${event.eventType}`}>
          {eventLabels[event.eventType] ?? event.eventType}
        </span>
        <span className="cf-feed-time">{formatTime(event.at)}</span>
        <span className="cf-feed-actor">· {event.actor}</span>
      </div>
      <div className="cf-feed-content">
        <FeedContent eventType={event.eventType} payload={payload} />
      </div>
    </div>
  );
}

type FeedPayload = Record<string, unknown>;

function FeedContent({ eventType, payload }: { eventType: CaseEventType; payload: FeedPayload }) {
  switch (eventType) {
    case 'plannerDecision': {
      const alts = Array.isArray(payload.alternativesConsidered)
        ? (payload.alternativesConsidered as Array<{ action: string; reasonRejected: string }>)
        : [];
      return (
        <>
          <div className="cf-feed-action">
            → <strong>{String(payload.nextAction ?? '')}</strong>
            <span className="cf-feed-confidence">{String(payload.estimatedConfidence ?? '')} confidence</span>
          </div>
          <p className="cf-feed-reason">"{String(payload.reasoning ?? '')}"</p>
          {alts.length > 0 && (
            <details className="cf-feed-alts">
              <summary>{alts.length} alternative(s) considered</summary>
              <ul>
                {alts.map((alt, i) => (
                  <li key={i}>
                    <strong>{alt.action}</strong> — {alt.reasonRejected}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </>
      );
    }
    case 'toolStarted':
      return <div>{String(payload.toolName ?? '')}</div>;
    case 'toolSucceeded':
      return (
        <div>
          <strong>{String(payload.toolName ?? '')}</strong>
          {payload.summary != null && <p className="cf-feed-summary">{String(payload.summary)}</p>}
        </div>
      );
    case 'toolFailed':
      return (
        <div>
          <strong>{String(payload.toolName ?? '')}</strong>
          {payload.error != null && <p className="cf-feed-error">{String(payload.error)}</p>}
        </div>
      );
    case 'stateTransitioned':
      return (
        <div>
          <code>{String(payload.from ?? '')}</code> → <code>{String(payload.to ?? '')}</code>
        </div>
      );
    case 'agentStopped':
      return (
        <div>
          <strong>{String(payload.stopReason ?? '')}</strong>
          {payload.stopMessage != null && (
            <p className="cf-feed-summary">{String(payload.stopMessage)}</p>
          )}
        </div>
      );
    case 'approvalRequested':
      return (
        <div>
          For: <strong>{String(payload.toolName ?? '')}</strong>
        </div>
      );
    case 'approvalResolved':
      return (
        <div>
          <strong>{String(payload.decision ?? '')}</strong> — {String(payload.toolName ?? '')}
          {payload.notes != null && <p className="cf-feed-summary">"{String(payload.notes)}"</p>}
        </div>
      );
    case 'documentUploaded':
      return <div>{String(payload.fileName ?? '')}</div>;
    case 'caseCreated':
      return (
        <div>
          {String(payload.clientName ?? '')} · {String(payload.workflowTitle ?? '')}
        </div>
      );
    case 'policyViolation':
      return (
        <div>
          <p className="cf-feed-error">{String(payload.violation ?? '')}</p>
          {payload.chosenTool != null && (
            <p className="cf-feed-summary">
              Tool: <code>{String(payload.chosenTool)}</code>
            </p>
          )}
        </div>
      );
    default:
      return <div className="cf-text-faint">(no details)</div>;
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
