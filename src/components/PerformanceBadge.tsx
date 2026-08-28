import { pct, tone } from '../utils/format';
export default function PerformanceBadge({ value, label }: { value: number | null; label?: string }) {
  return <div className="min-w-20"><div className="label">{label}</div><div className={`mt-1 font-semibold ${tone(value)}`}>{pct(value)}</div></div>;
}
