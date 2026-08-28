import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PricePoint } from '../types/market';
export default function PriceChart({ data, normalized = false }: { data: PricePoint[]; normalized?: boolean }) {
  const first = data[0]?.close;
  const rows = normalized && first ? data.map(p => ({ ...p, close: (p.close / first) * 100 })) : data;
  if (!rows.length) return <div className="muted py-16 text-center">Data unavailable</div>;
  return <div className="h-72 w-full"><ResponsiveContainer><AreaChart data={rows}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="currentColor" stopOpacity={0.25}/><stop offset="95%" stopColor="currentColor" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" opacity={0.15}/><XAxis dataKey="date" hide/><YAxis domain={['auto','auto']} width={52} tick={{fontSize:11}}/><Tooltip contentStyle={{borderRadius:12}}/><Area type="monotone" dataKey="close" stroke="currentColor" fill="url(#g)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div>;
}
