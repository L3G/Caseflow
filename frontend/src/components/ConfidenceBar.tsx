interface Props {
  confidence: number;
  showLabel?: boolean;
}

const HIGH_THRESHOLD = 0.95;

export function ConfidenceBar({ confidence, showLabel = true }: Props) {
  const pct = Math.round(confidence * 100);
  const med = confidence < HIGH_THRESHOLD;

  return (
    <>
      <div className={`au-meter ${med ? 'med' : ''}`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="au-cf-num">{pct}%</span>}
    </>
  );
}
