import { useState, type FormEvent } from 'react';
import { ArrowRight, Upload, X } from 'lucide-react';
import { api } from '../api';
import type { Case } from '../types';

interface Props {
  onClose: () => void;
  onCreated: (created: Case) => void;
}

interface WorkflowOption {
  id: string;
  name: string;
  desc: string;
  enabled: boolean;
}

const WORKFLOWS: WorkflowOption[] = [
  {
    id: 'chapter7',
    name: 'Chapter 7 Intake',
    desc: 'Liquidation — bank statements, schedules, means test',
    enabled: true,
  },
  {
    id: 'chapter13',
    name: 'Chapter 13 Intake',
    desc: 'Reorganization plan with 3–5 year repayment',
    enabled: false,
  },
  {
    id: 'i130',
    name: 'Immigration — I-130',
    desc: 'Petition for relative; supporting evidence pack',
    enabled: false,
  },
  {
    id: 'general',
    name: 'General matter intake',
    desc: 'Open-ended ingestion for review',
    enabled: false,
  },
];

export function InitiateModal({ onClose, onCreated }: Props) {
  const [clientName, setClientName] = useState('');
  const [workflow, setWorkflow] = useState('chapter7');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = clientName.trim().length > 0 && file !== null && !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createCase(clientName.trim(), file!);
      onCreated(created);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="au-overlay" onClick={onClose}>
      <form
        className="au-sheet"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="au-sheet-h">
          <div>
            <h2>Initiate case</h2>
            <div className="au-sheet-h-sub">
              Open a new matter. The intake agent starts once a document arrives.
            </div>
          </div>
          <button
            type="button"
            className="au-sheet-x"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="au-sheet-b">
          <div className="au-fg">
            <label htmlFor="cn">Client name</label>
            <input
              id="cn"
              type="text"
              className="au-input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Jordan A. Park"
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="au-fg">
            <label>Workflow</label>
            <div className="au-wf-grid">
              {WORKFLOWS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  className={`au-wf-opt ${workflow === w.id ? 'on' : ''}`}
                  onClick={() => w.enabled && setWorkflow(w.id)}
                  disabled={!w.enabled}
                >
                  <span className="au-wf-radio" />
                  <div style={{ flex: 1 }}>
                    <h4>{w.name}</h4>
                    <p>{w.desc}</p>
                  </div>
                  {!w.enabled && <span className="au-wf-soon">Coming soon</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="au-fg">
            <label>Initial documents</label>
            <label className="au-drop">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                disabled={submitting}
              />
              <span className="au-drop-icon">
                <Upload size={18} />
              </span>
              <span>{file ? 'Selected:' : 'Click to upload a PDF'}</span>
              {file && <span className="au-drop-filename">{file.name}</span>}
            </label>
          </div>

          {error && <div className="au-banner">{error}</div>}
        </div>

        <div className="au-sheet-foot">
          <span className="au-eyebrow" style={{ color: 'var(--muted)' }}>
            Step 1 of 1
          </span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="au-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="au-btn au-btn-grad"
              disabled={!canSubmit}
            >
              {submitting ? 'Creating…' : 'Open matter'}
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
