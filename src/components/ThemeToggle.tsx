import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
export default function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.theme === 'dark' || (!('theme' in localStorage) && matchMedia('(prefers-color-scheme: dark)').matches));
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.theme = dark ? 'dark' : 'light'; }, [dark]);
  return <button aria-label="Toggle theme" onClick={() => setDark(v => !v)} className="rounded-xl border border-slate-200 p-2 dark:border-slate-800">{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
