import { BarChart3, Boxes, ChartNoAxesCombined, Globe2, Layers3, LayoutDashboard, LockKeyhole } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import DataTimestamp from './DataTimestamp';
const nav = [
  ['Overview','/',LayoutDashboard],['ETFs','/etfs',Layers3],['Holdings','/holdings',Boxes],['Compare','/compare',BarChart3],['Markets','/markets',Globe2],['Analysis','/analysis',ChartNoAxesCombined]
] as const;
export default function Layout() {
  const lock = () => { sessionStorage.removeItem('etf-dashboard-unlocked'); window.location.reload(); };
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100"><header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-[#070b14]/90"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3"><div><div className="font-bold tracking-tight">ETF Market Dashboard</div><div className="text-xs muted">Public market data · broker independent</div><DataTimestamp/></div><div className="flex items-center gap-2"><button onClick={lock} title="Lock dashboard" className="rounded-lg p-2 muted hover:bg-slate-100 dark:hover:bg-slate-900"><LockKeyhole size={17}/></button><ThemeToggle/></div></div><nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2">{nav.map(([name,to,Icon]) => <NavLink key={name} to={to} end={to === '/'} className={({isActive}:{isActive:boolean}) => `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${isActive?'bg-slate-900 text-white dark:bg-white dark:text-slate-900':'muted hover:bg-slate-100 dark:hover:bg-slate-900'}`}><Icon size={16}/>{name}</NavLink>)}</nav></header><main className="mx-auto max-w-7xl p-4 sm:p-6"><Outlet/></main></div>;
}
