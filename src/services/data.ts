import { appConfig } from '../config/app';
import type { DashboardData } from '../types/market';
let cache: DashboardData | null = null;
export async function loadDashboard(): Promise<DashboardData> {
  if (cache) return cache;
  const response = await fetch(appConfig.dataUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Dashboard data request failed: ${response.status}`);
  cache = await response.json() as DashboardData;
  return cache;
}
