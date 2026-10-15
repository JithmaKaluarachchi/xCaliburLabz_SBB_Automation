# SBB Oxygen House Automation

Playwright and TypeScript automation for the SBB Oxygen House website and its administration panel.

## Repository layout

- `web site/` — public website browser tests, page objects, shared fixtures, test utilities, and generated PDF test reports.
- `admin panel/` — administration panel browser tests, page objects, utilities, and report generation scripts.
- `SBB_Oxygen_House_Bug_Report.xlsx` — project bug report workbook.
- `Prompt.txt` — original project testing brief, retained as project documentation.

Each application has its own `package.json` and lockfile. Install dependencies from the relevant folder before running its tests.

## Website automation

Requirements: Node.js 20 or later, npm, and Python for PDF report generation.

```powershell
Set-Location 'web site'
npm ci
npx playwright install
npm run test:smoke
```

Useful suites and reports:

```powershell
npm run test:homepage
npm run test:shop
npm run test:services
npm run test:about-us
npm run test:contact-us
npm run typecheck
npm run report:home:pdf
npm run report:shop:pdf
npm run report:services:pdf
npm run report:about-us:pdf
npm run report:contact-us:pdf
```

Use the corresponding `:all` suite scripts to run supported browser and device profiles. PDF reports are saved under `web site/output/pdf/`.

## Administration panel automation

```powershell
Set-Location 'admin panel'
npm ci
npx playwright install
npm run typecheck
```

The admin panel suites may require an authenticated test account and values configured locally. Keep credentials in a local `.env` file; never commit secrets or authenticated storage state. See each package's scripts and `.env.example` for available commands and configuration.

## Artifacts and privacy

Generated browser dependencies, installed packages, temporary files, test results, reports with captured traces, local environment files, and authentication state are excluded by `.gitignore`. Source code, package lockfiles, checked-in visual test snapshots, project documentation, the bug report workbook, and website PDF reports are included.

The browser tests target the configured SBB Oxygen House site. Run them only with suitable test data and accounts; form submissions and admin actions may affect the configured environment.
