import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Exposure } from '../types/market';
export default function ExposureChart({ data }: { data: Exposure[] }) {
  if (!data.length) return <div className="muted py-16 text-center">Data unavailable</div>;
  return <div className="h-72"><ResponsiveContainer><BarChart data={data} layout="vertical" margin={{left:20}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={105} tick={{fontSize:11}}/><Tooltip formatter={(v:any) => `${Number(v).toFixed(2)}%`}/><Bar dataKey="weight" fill="currentColor" radius={[0,5,5,0]}/></BarChart></ResponsiveContainer></div>;
}
