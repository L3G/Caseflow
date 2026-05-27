import type { BankStatementExtraction, ExtractedField } from '../types';
import { minFieldConfidence } from '../api';
import { ConfidenceBar } from './ConfidenceBar';

interface Props {
  extraction: BankStatementExtraction | null;
}

export function ExtractedDataPanel({ extraction }: Props) {
  if (extraction === null) {
    return <p className="cf-text-muted">No extraction yet. The agent will populate this after extraction runs.</p>;
  }

  const min = minFieldConfidence(extraction);

  return (
    <div className="cf-extraction">
      <div className="cf-extraction-summary">
        <span className="cf-text-muted">Min field confidence:</span>
        <ConfidenceBar confidence={min} />
      </div>

      <table className="cf-extraction-table">
        <tbody>
          <Field label="Bank" field={extraction.bankName} />
          <Field label="Account holder" field={extraction.accountHolderName} />
          <Field label="Account ····" field={extraction.accountNumberLast4} />
          <Field label="Period start" field={extraction.statementPeriodStart} />
          <Field label="Period end" field={extraction.statementPeriodEnd} />
          <FieldMoney label="Beginning balance" field={extraction.beginningBalance} />
          <FieldMoney label="Ending balance" field={extraction.endingBalance} />
          <FieldMoney label="Total deposits" field={extraction.totalDeposits} />
          <FieldMoney label="Total withdrawals" field={extraction.totalWithdrawals} />
        </tbody>
      </table>

      {extraction.transactions.length > 0 && (
        <div>
          <h3 className="cf-section-title">Transactions ({extraction.transactions.length})</h3>
          <table className="cf-extraction-table cf-tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="cf-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {extraction.transactions.map((tx, i) => (
                <tr key={i}>
                  <td className="cf-tx-date">{tx.date}</td>
                  <td>{tx.description}</td>
                  <td className={`cf-right cf-tx-${tx.direction}`}>
                    {tx.direction === 'deposit' ? '+' : '−'}${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {extraction.reviewerNotes && (
        <div className="cf-reviewer-notes">
          <strong>Reviewer notes:</strong> {extraction.reviewerNotes}
        </div>
      )}
    </div>
  );
}

function Field({ label, field }: { label: string; field: ExtractedField<string> }) {
  return (
    <tr>
      <td className="cf-field-label">{label}</td>
      <td className="cf-field-value">{field.value}</td>
      <td className="cf-field-conf">
        <ConfidenceBar confidence={field.confidence} />
      </td>
    </tr>
  );
}

function FieldMoney({ label, field }: { label: string; field: ExtractedField<number> }) {
  return (
    <tr>
      <td className="cf-field-label">{label}</td>
      <td className="cf-field-value">${field.value.toFixed(2)}</td>
      <td className="cf-field-conf">
        <ConfidenceBar confidence={field.confidence} />
      </td>
    </tr>
  );
}
