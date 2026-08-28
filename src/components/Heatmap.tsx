import type { Holding } from '../types/market';
import { pct } from '../utils/format';
export default function Heatmap({ holdings }: { holdings: Holding[] }) {
  if (!holdings.length) return <div className="muted">Data unavailable</div>;
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">{holdings.slice(0,25).map(h => {
    const strength = h.daily == null ? 0 : Math.min(Math.abs(h.daily) / 4, 1);
    const bg = h.daily == null ? 'rgba(100,116,139,.12)' : h.daily >= 0 ? `rgba(16,185,129,${.12 + strength*.45})` : `rgba(244,63,94,${.12 + strength*.45})`;
    return <div key={`${h.name}-${h.ticker}`} className="min-h-24 rounded-xl border border-white/10 p-3" style={{ background:bg, gridColumn: `span ${Math.min(3, Math.max(1, Math.ceil(Math.sqrt(h.weight))))}` }}><div className="truncate text-sm font-semibold">{h.ticker || h.name}</div><div className="mt-2 text-xs opacity-70">Weight {h.weight.toFixed(2)}%</div><div className="text-sm font-bold">{pct(h.daily)}</div></div>;
  })}</div>;
}
