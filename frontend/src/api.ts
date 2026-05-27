import type {
  AgentRunResult,
  AnalysesBag,
  ApprovalDecision,
  BankStatementExtraction,
  Case,
  CaseEvent,
  PendingApproval,
} from './types';

async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      // body wasn't JSON; keep the status message
    }
    throw new Error(message);
  }
  if (response.status === 204) return null as T;
  return (await response.json()) as T;
}

export const api = {
  listCases: () => fetchJson<Case[]>('/api/cases'),

  getCase: (id: string) => fetchJson<Case>(`/api/cases/${id}`),

  createCase: (clientName: string, document: File): Promise<Case> => {
    const formData = new FormData();
    formData.append('clientName', clientName);
    formData.append('document', document);
    return fetchJson<Case>('/api/cases', { method: 'POST', body: formData });
  },

  runAgent: (id: string) =>
    fetchJson<AgentRunResult>(`/api/cases/${id}/run`, { method: 'POST' }),

  listEvents: (id: string) => fetchJson<CaseEvent[]>(`/api/cases/${id}/events`),

  getExtraction: (id: string) =>
    fetchJson<BankStatementExtraction | null>(`/api/cases/${id}/extraction`),

  getAnalyses: (id: string) => fetchJson<AnalysesBag>(`/api/cases/${id}/analyses`),

  listApprovals: (id: string) =>
    fetchJson<PendingApproval[]>(`/api/cases/${id}/approvals`),

  resolveApproval: (id: number, decision: ApprovalDecision, notes?: string) =>
    fetchJson<PendingApproval>(`/api/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, notes }),
    }),
};

export function minFieldConfidence(extraction: BankStatementExtraction): number {
  return Math.min(
    extraction.bankName.confidence,
    extraction.accountHolderName.confidence,
    extraction.accountNumberLast4.confidence,
    extraction.statementPeriodStart.confidence,
    extraction.statementPeriodEnd.confidence,
    extraction.beginningBalance.confidence,
    extraction.endingBalance.confidence,
    extraction.totalDeposits.confidence,
    extraction.totalWithdrawals.confidence,
  );
}
