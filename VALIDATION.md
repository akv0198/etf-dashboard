# Validation report

Validated during generation on 2026-08-19:

- `config/etfs.json`, `config/markets.json`, `public/data/dashboard.json`, `package.json`: valid JSON
- `public/data/dashboard.json` schema/basic values: PASS (`npm run check:data` logic executed directly)
- Node syntax for `scripts/refresh-data.mjs`: PASS
- Node syntax for `scripts/validate-data.mjs`: PASS
- Relative TypeScript imports resolve to existing files: PASS
- External imports are declared in `package.json`: PASS
- No default ETF ISIN is hard-coded in the React application source: PASS
- GitHub Actions YAML parsing: PASS
- GitHub Pages scheduled-refresh handoff: PASS (`workflow_run` deploy trigger included)
- Scan of source/scripts/config/workflows for embedded API keys or secrets: PASS
- TypeScript source check with local module stubs (`strict`, ES2022): PASS
- GitHub Pages routing design: PASS (`base: './'` + `HashRouter`)
- Current 2026 GitHub Pages/Node-compatible Actions majors used: checkout v7, setup-node v7, configure-pages v6, upload-pages-artifact v5, deploy-pages v5

## Environment limitation

A real npm registry request was attempted from the generation container and failed with DNS error `EAI_AGAIN` for `registry.npmjs.org`. Because third-party packages cannot be downloaded in this environment, the final `vite build` cannot be executed locally here.

The included **Deploy GitHub Pages** workflow performs the real dependency installation, data refresh, JSON validation, TypeScript compilation and Vite production build on a GitHub-hosted runner before deployment. If that build fails, Pages deployment does not run.
