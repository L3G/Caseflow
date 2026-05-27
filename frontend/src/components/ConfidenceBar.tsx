interface Props {
  confidence: number;
  label?: string;
}

const THRESHOLD = 0.7;

export function ConfidenceBar({ confidence, label }: Props) {
  const pct = Math.round(confidence * 100);
  const isLow = confidence < THRESHOLD;

  return (
    <div className="cf-confidence">
      {label && <div className="cf-confidence-label">{label}</div>}
      <div className="cf-confidence-bar">
        <div
          className={`cf-confidence-fill ${isLow ? 'cf-confidence-fill--low' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`cf-confidence-pct ${isLow ? 'cf-confidence-pct--low' : ''}`}>{pct}%</div>
    </div>
  );
}
