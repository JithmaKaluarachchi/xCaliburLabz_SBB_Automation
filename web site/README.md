# SBB Oxygen House Playwright automation

TypeScript test framework for `https://sbb.caliburlabz.com/`, built with Playwright Test and the Page Object pattern.

## Quick start

Prerequisites: Node.js 20+.

```powershell
npm install
npx playwright install
Copy-Item .env.example .env
npm run test:smoke
```

Open the HTML report with `npm run report`.

Create a management-friendly PDF after a homepage run with `npm run report:home:pdf`. The legacy `npm run report:owner:pdf` command remains available. The file is written to `output/pdf/SBB-Oxygen-House-Homepage-Test-Report.pdf` and includes Sri Lanka execution time, executive totals, tested areas, issues, recommendations, and detailed results.

Create the separate management Shop PDF after `npm run test:shop` with `npm run report:shop:pdf`. It reports Shop Page, Item Detail Page, Cart Page, and Checkout Page separately.

Run the About Us checks with `npm run test:about-us` for Chromium or `npm run test:about-us:all` for all browser/device profiles. Generate its separate management report with `npm run report:about-us:pdf`; the PDF is written to `output/pdf/SBB-Oxygen-House-About-Us-Test-Report.pdf`.

## Test suites

- `npm test` — all configured desktop and mobile browser projects
- `npm run test:smoke` — fast Chromium deployment check
- `npm run test:functional` — page behavior and internal-link checks
- `npm run test:nonfunctional` — accessibility, performance, responsive, and security baselines
- `npm run test:accessibility` — WCAG automated scan
- `npm run test:api` — HTTP-level checks
- `npm run test:homepage` — complete homepage header, navigation, buttons, links, images, content, footer, SEO, keyboard, and UI checks
- `npm run test:headed:homepage` — run homepage tests one at a time in a visible Chromium window
- `npm run test:shop` — shop listing, filters, product details, cart, checkout validation, and shop non-functional coverage
- `npm run test:headed:shop` — watch the shop functional suite in a visible Chromium window
- `npm run test:shop:all` — shop functional and non-functional tests across desktop and mobile browser projects
- `npm run test:shop:visual:update` / `npm run test:shop:visual` — approve and compare Shop, populated Cart, and populated Checkout screenshots
- `npm run test:visual:update` — create/update approved Chromium UI screenshots
- `npm run test:visual` — compare the homepage with approved screenshots
- `npm run test:headed` / `npm run test:debug` / `npm run test:ui` — local investigation
- `npm run typecheck` — TypeScript validation

Tags such as `@smoke`, `@functional`, `@api`, `@accessibility`, `@performance`, `@responsive`, and `@security` allow focused execution with `--grep`.

## Structure

```text
fixtures/              shared typed Playwright fixtures
pages/                 page objects
tests/functional/      UI and HTTP functional coverage, grouped by application page
tests/nonfunctional/   accessibility, performance, security, responsive checks
utils/                 reusable helpers
playwright.config.ts   browsers, retries, reports, and artifact settings
```

## Adding product flows

Create a page object in `pages/`, expose it through `fixtures/test.fixture.ts`, and add a focused spec. Prefer `getByRole`, `getByLabel`, and `getByTestId` locators. Add `data-testid` only when a stable user-facing locator is impossible.

Authenticated tests should read credentials from `.env`; never hard-code them. Keep destructive tests (delete, payment, irreversible submissions) against a dedicated test environment and account.

## Scope and limitations

This is the initial automation foundation, not exhaustive coverage of every possible test type. Automated browser coverage is well suited to regression, cross-browser, responsive, accessibility, API integration, and lightweight performance/security baselines. Use dedicated tools and controlled environments for load/stress testing, penetration testing, visual approval baselines, email/SMS integrations, and destructive end-to-end flows.

The performance limits are intentionally configurable in `.env.example`. Measure the production baseline over multiple CI runs before choosing final service-level budgets. Automated axe scans catch only a subset of accessibility issues; include manual keyboard and assistive-technology testing.

The default run uses two workers because production is a shared environment and the full matrix contains 35 browser/test combinations. For diagnosis, run a browser serially, for example `npx playwright test --project=firefox --workers=1`.
