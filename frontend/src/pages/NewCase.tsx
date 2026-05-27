import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export function NewCase() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim()) {
      setError('Client name is required.');
      return;
    }
    if (!file) {
      setError('A document file is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createCase(clientName.trim(), file);
      navigate(`/cases/${created.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="cf-page-head">
        <div>
          <h1>Initiate case</h1>
          <p className="cf-text-muted">Upload a bank statement to open a new Chapter 7 intake.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="cf-form cf-card">
        <label className="cf-field">
          <span>Client name</span>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Jordan A. Park"
            disabled={submitting}
          />
        </label>

        <label className="cf-field">
          <span>Document (PDF)</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            disabled={submitting}
          />
          <span className="cf-field-hint">
            Mock provider returns the same fixture regardless of content — any file works for the demo.
          </span>
        </label>

        {error && <div className="cf-banner cf-banner--danger">{error}</div>}

        <div className="cf-form-actions">
          <button type="submit" className="cf-btn cf-btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create case'}
          </button>
        </div>
      </form>
    </section>
  );
}
