export const pct = (v: number | null, digits = 2) => v == null ? 'Data unavailable' : `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`;
export const num = (v: number | null, currency?: string | null) => v == null ? 'Data unavailable' : new Intl.NumberFormat('en-DE', { style: currency ? 'currency' : 'decimal', currency: currency || undefined, maximumFractionDigits: 2 }).format(v);
export const compact = (v: number | null, currency?: string | null) => v == null ? 'Data unavailable' : new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2, style: currency ? 'currency' : 'decimal', currency: currency || undefined }).format(v);
export const updated = (iso: string) => new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
export const tone = (v: number | null) => v == null ? 'text-slate-400' : v > 0 ? 'text-emerald-500' : v < 0 ? 'text-rose-500' : 'text-slate-500';
