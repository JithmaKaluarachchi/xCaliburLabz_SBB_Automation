# SBB Oxygen House Admin Panel Automation

## Admin Login

Login code is organised as requested:

- `pages/login.page.ts`
- `tests/functional/login/`
- `tests/nonfunctional/login/`

Copy `.env.example` to `.env` locally and set the credentials without committing
that file. Run `npm run test:login:all` for all configured profiles, then
`npm run report:login:pdf` to build the evidence-based PDF.

Chrome and Edge web projects use installed vendor browsers. Mobile projects are
viewport/device compatibility profiles. Safari compatibility uses the Safari-like
engine available on Windows; final real-Safari acceptance must be run on macOS/iOS.

## Admin Side Navigation

Side-navigation automation is organised under:

- `pages/side-navigation.page.ts`
- `tests/functional/side-navigation/`
- `tests/nonfunctional/side-navigation/`

Run `npm run test:side-navigation` for Chrome Web, `npm run
test:side-navigation:mobile` for Chrome Mobile, or `npm run
test:side-navigation:all` for the Chrome, Edge, Firefox and Safari-compatible
web/mobile matrix. Run `npm run report:side-navigation:pdf` after a navigation
execution, or use `npm run test:side-navigation:report` for execution and PDF
generation together.

## Admin Dashboard

Dashboard automation is organised under `pages/dashboard.page.ts`,
`tests/functional/dashboard/`, and `tests/nonfunctional/dashboard/`. Run
`npm run test:dashboard` for Chrome Web, `npm run test:dashboard:headed` to
watch it run, `npm run test:dashboard:mobile` for Chrome Mobile, or
`npm run test:dashboard:report` for the complete browser matrix and standalone
PDF report.

## Admin Products

Products automation is organised under `pages/products.page.ts`,
`tests/functional/products/`, and `tests/nonfunctional/products/`. It validates
the catalog, search, status/category/brand filters, bulk controls, new and edit
forms, image/specification sections, and the soft-delete confirmation. Tests do
not submit product changes or confirm deletion against the live catalog.

Run `npm run test:products` for Chrome Web, `npm run test:products:headed` to
watch the test, `npm run test:products:mobile` for Chrome Mobile, or
`npm run test:products:all` for all configured web/mobile profiles.
Run `npm run test:products:form:headed` to watch the controlled create/edit
form lifecycle. This test uses unique data and archives only its own record in
cleanup.

## Admin Categories

Categories automation is organised under `pages/categories.page.ts`,
`tests/functional/categories/`, and `tests/nonfunctional/categories/`. Run
`npm run test:categories`, `npm run test:categories:all`, or watch the unique
create/edit/delete lifecycle using `npm run test:categories:form:headed`.
Generate the native portrait PDF from the latest Categories matrix with
`npm run report:categories:pdf`, or run the matrix and report together with
`npm run test:categories:report`.

## Admin Brands

Brands automation is organised under `pages/brands.page.ts`,
`tests/functional/brands/`, and `tests/nonfunctional/brands/`. Run `npm run
test:brands`, the web/mobile matrix with `npm run test:brands:all`, or watch
the guarded create/edit/delete lifecycle with `npm run test:brands:form:headed`.
Generate its native portrait report with `npm run report:brands:pdf`, or run
the matrix and report together with `npm run test:brands:report`.

## Admin Orders

Orders automation is organised under `pages/orders.page.ts`,
`tests/functional/orders/`, `tests/nonfunctional/orders/`, and
`tests/test-data/orders.data.ts`. It covers the list, live read-only search data,
status/payment/date filters, row actions, delete cancellation, order-detail
navigation, item totals, customer/shipping information, timeline, status and
payment form validation, and invoice-button availability. Normal executions do
not update or delete production orders.

Run `npm run test:orders` for the complete Chrome suite, `npm run
test:orders:headed` to watch it, `npm run test:orders:mobile` for Chrome Mobile,
or `npm run test:orders:all` for Chrome, Edge, Firefox and Safari-compatible web
and mobile profiles. Use `npm run test:orders:complete` for both the full Chrome
suite and the eight-profile matrix. Generate the portrait PDF from the latest
Orders results with `npm run report:orders:pdf`, or run the matrix and generate
the report together with `npm run test:orders:report`. The combined report
command generates the PDF even when the matrix correctly detects defects.

## Admin Coupons

Coupons automation is organised under `pages/coupons.page.ts`,
`tests/functional/coupons/`, `tests/nonfunctional/coupons/`, and
`tests/test-data/coupons.data.ts`. It covers search, table content, new/edit
forms, required and numeric validation, type/value/limit/date fields, safe
delete confirmation, a timestamped create/edit/delete lifecycle, UI,
accessibility, performance, security, runtime quality, and responsive layouts.
Run `npm run test:coupons`, watch the lifecycle with `npm run
test:coupons:form:headed`, or run all eight web/mobile profiles with `npm run
test:coupons:all`.

## Admin Advertisements

Advertisements automation is organised under `pages/advertisements.page.ts`,
`tests/functional/advertisements/`, `tests/nonfunctional/advertisements/`, and
`tests/test-data/advertisements.data.ts`. It covers page identity, table data,
search, optional title, required PNG image, link URL validation, active state,
image upload, safe edit/delete dialogs, a uniquely named create/edit/delete
lifecycle with cleanup, UI and keyboard checks, accessibility, responsive
layout, performance, authenticated HTTPS access, runtime quality, and server
errors.

Run `npm run test:advertisements` for the complete Chrome suite, `npm run
test:advertisements:headed` to watch it, `npm run test:advertisements:mobile`
for Chrome Mobile, or `npm run test:advertisements:all` for the eight configured
web/mobile compatibility profiles. Watch the guarded data lifecycle with `npm
run test:advertisements:form:headed`, or use `npm run
test:advertisements:complete` for the Chrome suite followed by the matrix.
Generate the portrait report from the latest matrix with `npm run
report:advertisements:pdf`, or execute the matrix and generate the report with
`npm run test:advertisements:report` (the plural `reports` alias also works).

## Admin Reviews

Reviews automation is organised under `pages/reviews.page.ts`,
`tests/functional/reviews/`, and `tests/nonfunctional/reviews/`. It covers the
table, search, Pending/Approved filtering, selection and bulk controls, a
guarded hide/approve status round-trip, delete cancellation, UI,
accessibility, responsive layout, performance, HTTPS and runtime quality.
Run `npm run test:reviews`, watch the status restoration with `npm run
test:reviews:status:headed`, or execute all eight profiles with `npm run
test:reviews:all`. Generate its portrait report with `npm run
report:reviews:pdf`, or run matrix and report together with `npm run
test:reviews:report`.

Independent Playwright and TypeScript environment for admin-panel testing.

## Setup

1. Copy `.env.example` to `.env`.
2. Set the real `ADMIN_BASE_URL`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.
3. Run `npm install`.
4. Run `npx playwright install` if the required browser binaries are not already available.

## Commands

```powershell
npm test
npm run test:smoke
npm run test:functional
npm run test:nonfunctional
npm run test:accessibility
npm run typecheck
npm run report
```

Chrome Web, Edge Web, Firefox Web, and Chrome Mobile projects are configured. Safari Web and Safari Mobile require execution on actual Apple environments or a real-device browser service and must not be inferred from another browser.
