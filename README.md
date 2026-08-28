# ETF Market Dashboard

A broker-independent ETF and global-market dashboard built with React, TypeScript, Vite, Tailwind CSS and Recharts. It is designed for free hosting on GitHub Pages and uses a GitHub Actions data pipeline so the browser never needs a private API key.

## Default ETFs

| ISIN | Xetra ticker | Yahoo symbol | Provider |
|---|---:|---:|---|
| IE000XZSV718 | SPYL | SPYL.DE | State Street SPDR |
| IE0006WW1TQ4 | EXUS | EXUS.DE | Xtrackers by DWS |
| IE00BKM4GZ66 | IS3N | IS3N.DE | iShares by BlackRock |

The Xetra mappings were verified against the respective provider/Deutsche Börse listing information before the project was generated.

## Architecture

```text
Yahoo Finance public endpoints / ETF provider reference data
                         ↓
                  GitHub Actions
                         ↓
             scripts/refresh-data.mjs
                         ↓
             public/data/dashboard.json
                         ↓
           React + TypeScript dashboard
                         ↓
                    GitHub Pages
```

Yahoo Finance endpoints used here are public/unofficial and require no key. Provider metadata/seed holdings are reference fallbacks. If an upstream request fails, the pipeline preserves existing usable data where possible and the UI otherwise displays `Data unavailable` instead of inserting zeroes.

## Features

- ETF overview cards and detailed ETF pages
- Price, daily/1W/1M/YTD/1Y/3Y/5Y performance
- Historical charts, 52-week high/low, TER, fund size, exchange/currency and income use
- Top holdings table with stock performance enrichment
- Best/worst holdings and approximate daily contribution (`weight × stock return`)
- Holdings heatmap
- Sector and country exposure
- Multi-ETF comparison, normalized chart, volatility and maximum drawdown
- Holding/sector/country overlap analysis
- Global markets: S&P 500, Nasdaq 100, Dow, STOXX 600, DAX, FTSE 100, Nikkei 225, Hang Seng, Nifty 50, VIX, gold, Brent, EUR/USD, EUR/INR, USD/INR and Bitcoin
- Responsive dark/light UI
- Hourly GitHub Actions refresh and GitHub Pages deployment

## Add another ETF

Edit `config/etfs.json`. The smallest supported entry is:

```json
{
  "isin": "NEW_ETF_ISIN"
}
```

On refresh the script attempts to resolve the ISIN through Yahoo Finance search. For best reliability, add the verified listing symbol too:

```json
{
  "isin": "NEW_ETF_ISIN",
  "ticker": "XETRA_TICKER",
  "yahooSymbol": "XETRA_TICKER.DE"
}
```

That ETF will automatically be included in overview, ETF lists/detail routes, comparison and overlap. Holdings require a holdings source; for the included ETFs the repository contains verified provider/reference seed holdings that are enriched with market performance. For a new ETF, add `seedHoldings` or extend `scripts/refresh-data.mjs` with the provider's official holdings download endpoint. Missing holdings are shown as unavailable rather than fabricated.

## Local development

```bash
npm install
npm run refresh:data   # optional; requires outbound internet
npm run check:data
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

1. Create a GitHub repository, e.g. `etf-dashboard`.
2. Copy this project into it and push to the `main` branch.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. Run **Deploy GitHub Pages** once if it does not start automatically.

The project uses Vite `base: './'` plus `HashRouter`, so the same build works under a repository path such as:

```text
https://USERNAME.github.io/etf-dashboard/
```

No 404 rewrite hack is required because client-side routes live after `#`.

## Scheduled data refresh

`.github/workflows/update-data.yml` runs at minute 17 every hour. GitHub schedule execution can be delayed. Market data itself can also be delayed by the upstream vendor. The UI always displays the generated timestamp and a delay notice. A successful refresh triggers the Pages workflow through `workflow_run`, because commits made with the repository `GITHUB_TOKEN` do not themselves start a new push workflow.

ETF holdings generally change much less frequently than prices. The default seed holdings include an explicit `holdingsAsOf` date. For production-grade daily official holdings, add provider-specific CSV/XLSX loaders to the refresh script; State Street, DWS and iShares all publish holdings/product data, but their download endpoints and formats can change.

## API keys / secrets

This version does **not** require an API key, so there are no secrets to expose. If you replace or supplement Yahoo with Alpha Vantage, Twelve Data, Financial Modeling Prep, etc.:

1. Store the key in **Repository Settings → Secrets and variables → Actions**.
2. Read it only inside a GitHub Action/script (`process.env.MY_API_KEY`).
3. Never prefix the variable with `VITE_`; Vite-prefixed variables are compiled into browser JavaScript.
4. Write only the processed public market data to `public/data/dashboard.json`.

## Data accuracy note

This is a monitoring/research dashboard, not a broker execution feed. ETF exchange prices, NAVs and holdings can have different timestamps. Approximate contribution is intentionally labeled approximate and should not be interpreted as exact attribution. No investment allocation or portfolio weighting is implemented.
