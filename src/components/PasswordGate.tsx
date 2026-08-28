import { FormEvent, PropsWithChildren, useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { authConfig } from '../config/auth';

const SESSION_KEY = 'etf-dashboard-unlocked';

function base64ToBytes(value: string) {
  const raw = atob(value);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function verifyPassword(password: string) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(authConfig.salt),
      iterations: authConfig.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  return constantTimeEqual(new Uint8Array(bits), base64ToBytes(authConfig.verifier));
}

export default function PasswordGate({ children }: PropsWithChildren) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    document.title = unlocked ? 'ETF Market Dashboard' : 'ETF Market Dashboard · Locked';
  }, [unlocked]);

  if (unlocked) return <>{children}</>;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setChecking(true);
    setError('');
    try {
      if (await verifyPassword(password)) {
        sessionStorage.setItem(SESSION_KEY, '1');
        setUnlocked(true);
        setPassword('');
      } else {
        setError('Incorrect password.');
        setPassword('');
      }
    } catch {
      setError('Unable to verify the password in this browser.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
        <form onSubmit={submit} className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <LockKeyhole size={22} />
          </div>
          <div className="label">Private dashboard</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">ETF Market Dashboard</h1>
          <p className="mt-2 text-sm muted">Enter your dashboard password to continue.</p>
          <label className="mt-6 block text-sm font-medium" htmlFor="dashboard-password">Password</label>
          <input
            id="dashboard-password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none ring-offset-2 focus:border-slate-500 focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-slate-700"
          />
          {error && <div className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</div>}
          <button disabled={checking || !password} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900">
            <ShieldCheck size={17} />
            {checking ? 'Checking…' : 'Unlock dashboard'}
          </button>
          <p className="mt-4 text-xs muted">This password gate is designed for personal/private viewing on static hosting.</p>
        </form>
      </div>
    </div>
  );
}
