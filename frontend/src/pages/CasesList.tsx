import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Case } from '../types';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';

export function CasesList() {
  const [cases, setCases] = useState<Case[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listCases()
      .then((data) => {
        if (!cancelled) setCases(data);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      <div className="cf-page-head">
        <div>
          <h1>Cases</h1>
          <p className="cf-text-muted">Chapter 7 intake workflow</p>
        </div>
        <Link to="/cases/new" className="cf-btn cf-btn--primary">
          + Initiate case
        </Link>
      </div>

      {error && <div className="cf-banner cf-banner--danger">{error}</div>}

      {cases === null && !error && <p className="cf-text-muted">Loading…</p>}

      {cases !== null && cases.length === 0 && (
        <div className="cf-card cf-empty">
          <p>No cases yet. Initiate the first one to see the agent in action.</p>
        </div>
      )}

      {cases !== null && cases.length > 0 && (
        <table className="cf-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Workflow</th>
              <th>State</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/cases/${c.id}`}>{c.clientName}</Link>
                </td>
                <td>{c.workflowTitle}</td>
                <td>
                  <StatusBadge state={c.state} />
                </td>
                <td>{new Date(c.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
