import type { BankStatementExtraction, ExtractedField } from '../types';
import { minFieldConfidence } from '../api';
import { ConfidenceBar } from './ConfidenceBar';

interface Props {
  extraction: BankStatementExtraction | null;
}

export function ExtractedDataPanel({ extraction }: Props) {
  if (extraction === null) {
    return (
      <p style={{ color: 'var(--muted)', fontSize: 13 }}>
        No extraction yet. The agent will populate this after extraction runs.
      </p>
    );
  }

  const min = minFieldConfidence(extraction);
  const minPct = Math.round(min * 100);

  return (
    <>
      <div className="au-extr">
        <ExtrRow label="Bank" value={extraction.bankName.value} confidence={extraction.bankName.confidence} />
        <ExtrRow label="Account holder" value={extraction.accountHolderName.value} confidence={extraction.accountHolderName.confidence} />
        <ExtrRow label="Account ····" value={extraction.accountNumberLast4.value} confidence={extraction.accountNumberLast4.confidence} mono />
        <ExtrRow label="Period start" value={extraction.statementPeriodStart.value} confidence={extraction.statementPeriodStart.confidence} mono />
        <ExtrRow label="Period end" value={extraction.statementPeriodEnd.value} confidence={extraction.statementPeriodEnd.confidence} mono />
        <MoneyRow label="Beginning balance" field={extraction.beginningBalance} />
        <MoneyRow label="Ending balance" field={extraction.endingBalance} />
        <MoneyRow label="Total deposits" field={extraction.totalDeposits} />
        <MoneyRow label="Total withdrawals" field={extraction.totalWithdrawals} />
      </div>

      {extraction.transactions.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="au-eyebrow" style={{ marginBottom: 8 }}>
            Transactions ({extraction.transactions.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {extraction.transactions.map((tx, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr auto',
                  gap: 8,
                  alignItems: 'baseline',
                  fontSize: 12,
                  padding: '6px 0',
                  borderBottom: i < extraction.transactions.length - 1 ? '1px dashed var(--line)' : 'none',
                }}
              >
                <span className="aur-mono" style={{ color: 'var(--muted)', fontSize: 11 }}>
                  {tx.date}
                </span>
                <span style={{ color: 'var(--ink-2)' }}>{tx.description}</span>
                <span
                  className="aur-mono"
                  style={{
                    color: tx.direction === 'deposit' ? 'var(--good-ink)' : 'var(--ink-2)',
                    fontWeight: 600,
                  }}
                >
                  {tx.direction === 'deposit' ? '+' : '−'}${tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {extraction.reviewerNotes && (
        <div
          style={{
            marginTop: 18,
            padding: '10px 12px',
            background: 'var(--warn-soft)',
            color: 'var(--warn-ink)',
            border: '1px solid var(--warn-border)',
            borderRadius: 10,
            fontSize: 12,
          }}
        >
          <strong>Reviewer notes:</strong> {extraction.reviewerNotes}
        </div>
      )}

      <div style={{ marginTop: 18, fontSize: 11, color: 'var(--muted)' }} className="aur-mono">
        min field confidence: {minPct}%
      </div>
    </>
  );
}

function ExtrRow({
  label,
  value,
  confidence,
  mono = false,
}: {
  label: string;
  value: string;
  confidence: number;
  mono?: boolean;
}) {
  return (
    <div className="au-extr-row">
      <div className="au-extr-r1">
        <span className="au-extr-k">{label}</span>
        <span className={`au-extr-v ${mono ? 'aur-mono' : ''}`}>{value}</span>
      </div>
      <div className="au-extr-cf">
        <ConfidenceBar confidence={confidence} />
      </div>
    </div>
  );
}

function MoneyRow({ label, field }: { label: string; field: ExtractedField<number> }) {
  return (
    <div className="au-extr-row">
      <div className="au-extr-r1">
        <span className="au-extr-k">{label}</span>
        <span className="au-extr-v aur-mono">${field.value.toFixed(2)}</span>
      </div>
      <div className="au-extr-cf">
        <ConfidenceBar confidence={field.confidence} />
      </div>
    </div>
  );
}
