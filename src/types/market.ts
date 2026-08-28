export type MaybeNumber = number | null;
export type PricePoint = { date: string; close: number };
export type PerformanceSet = { day: MaybeNumber; week: MaybeNumber; month: MaybeNumber; ytd: MaybeNumber; year: MaybeNumber; threeYear: MaybeNumber; fiveYear: MaybeNumber };
export type Exposure = { name: string; weight: number };
export type Holding = {
  name: string; ticker: string | null; weight: number; price: MaybeNumber; currency?: string | null;
  daily: MaybeNumber; week: MaybeNumber; month: MaybeNumber; ytd: MaybeNumber;
  sector: string | null; country: string | null; contribution: MaybeNumber;
};
export type EtfSnapshot = {
  id: string; isin: string; name: string; ticker: string | null; yahooSymbol: string | null;
  provider: string | null; exchange: string | null; tradingCurrency: string | null; fundCurrency: string | null;
  ter: MaybeNumber; fundSize: MaybeNumber; fundSizeCurrency: string | null; incomeUse: string | null;
  price: MaybeNumber; performance: PerformanceSet; high52: MaybeNumber; low52: MaybeNumber;
  volatility: MaybeNumber; maxDrawdown: MaybeNumber; history: PricePoint[]; holdings: Holding[];
  sectors: Exposure[]; countries: Exposure[]; holdingsAsOf: string | null; sourceUrl: string | null;
};
export type MarketSnapshot = { id: string; name: string; symbol: string; price: MaybeNumber; currency: string | null; performance: PerformanceSet; history: PricePoint[] };
export type DashboardData = { generatedAt: string; delayed: boolean; delayNote: string; etfs: EtfSnapshot[]; markets: MarketSnapshot[]; warnings: string[] };
