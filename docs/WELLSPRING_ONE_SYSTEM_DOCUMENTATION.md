# WellSpring One — Combined System Documentation

**Integrated pharmacy POS, inventory, purchasing, reporting, and offline-workflow prototype**  
**Course:** Systems Integration and Architecture  
**Instructor:** Jessa May Condino  
**Version:** 1.0 submission baseline  
**Date:** November 27, 2026  
**Demonstration branch:** WS01 · Davao Main

> **Submission status.** WellSpring One is a functional browser prototype with a separate Express/Prisma/PostgreSQL implementation in source. Browser workflows and their stated QA checks are demonstrated; database-backed operation, real server synchronization, external integrations, production performance, and regulatory certification are not verified.

---

## Table of Contents

1. [System Documentation and User Guide](#1-system-documentation-and-user-guide)
2. [Technical Architecture, API, and Handover Guide](#2-technical-architecture-api-and-handover-guide)
3. [Requirements Specification](#3-requirements-specification)
4. [Test Plan and QA Evidence](#4-test-plan-and-qa-evidence)
5. [Defense Presentation Narrative](#5-defense-presentation-narrative)
6. [Presenter and Live-Demo Script](#6-presenter-and-live-demo-script)
7. [Two-Week Sprint Gantt Chart — Editable Task Table](#7-two-week-sprint-gantt-chart--editable-task-table)
8. [Appendix A. Gantt Chart — Original Document Facsimiles](#appendix-a-gantt-chart--original-document-facsimiles)
9. [Appendix B. RFP Use Case Specification — Original Document Facsimiles](#appendix-b-rfp-use-case-specification--original-document-facsimiles)

---

## 1. System Documentation and User Guide

*Source: `docs/SUBMISSION_GUIDE.md`*

### 1.1 Executive Summary

WellSpring One responds to a practical pharmacy operations problem: sales, stock, supplier receipts, and management reporting are difficult to reconcile when each activity is recorded separately. The prototype presents one coherent workstation for the daily cycle—from sign-in and checkout to stock visibility, purchasing, reports, and a labeled offline queue.

The submission demonstrates:

- Responsive sign-in and local demo signup;
- Role-aware navigation and workflow controls for eight pharmacy roles;
- POS search, cart, payment/customer selections, prescription attestation, totals, receipt, and stock deduction;
- Inventory filtering, valuation, expiry watch, and physical-count adjustment;
- Purchase-order drafting, approval, receiving, and stock updates;
- Dashboard metrics, sales charts, a transaction register, and CSV export;
- Local staff/audit administration and an explicit offline simulation;
- Ocean-and-mint WellSpring visuals, desktop/mobile layouts, and an 80 mm receipt view.

It does **not** yet prove centralized eight-branch operation, payment/accounting integration, automatic FEFO, real server sync, hardware integration, backup/restore, production security, BIR/RA 10173 compliance, or RFP performance targets.

### 1.2 Evidence Legend

| Label | Meaning in this submission |
|---|---|
| **Demonstrated** | Observed in the browser or supported by the listed local automated check |
| **Source-verified** | Present in code but not accepted as runtime proof |
| **Ready to run** | Procedure or test prepared but not executed in the stated environment |
| **Production target** | RFP objective requiring future implementation and independent evidence |

### 1.3 Quick Start

**Requirements:**
- Node.js 20 or later;
- npm;
- A modern browser with JavaScript and `localStorage` enabled;
- No PostgreSQL server for the local browser demonstration.

**Install and run:**
```bash
git clone https://github.com/kurunami31/WellSpring1.git
cd WellSpring1
npm ci
npm run dev --workspace=@wellspring/web -- --host 127.0.0.1
```

Open **http://127.0.0.1:5173**.

**Administrator demo:** `admin@wellspring.ph` / `password123`  
**Scope:** local evaluation only; never use these credentials or sample data in production.

**Reset and privacy:** Use **Offline & sync → Reset demo data** before a repeatable demonstration. Local signup profiles are separate; clear site data for a completely fresh browser profile. Do not enter real patient, customer, employee, payment, or confidential business data.

### 1.4 User and Role Guide

All eight seeded browser identities use `password123`. Quick-fill is provided for administrator, cashier, and branch manager; other accounts can be typed manually.

| Role | Demo email | Primary demonstrated responsibilities |
|---|---|---|
| System Admin | `admin@wellspring.ph` | Full local demonstration, staff records, audit view |
| Head Office Manager | `ho.manager@wellspring.ph` | Read-only operational views, PO approval, local reports; no central eight-branch data |
| Branch Manager | `branch1.mgr@wellspring.ph` | PO approval, reports, read-only staff/audit view |
| Cashier | `cashier1@wellspring.ph` | POS and receipt workflow |
| Pharmacist | `pharmacist1@wellspring.ph` | POS; read-only inventory |
| Inventory Staff | `inventory1@wellspring.ph` | Stock counts, receiving, read-only POS/reports access as implemented |
| Purchasing Officer | `purchasing1@wellspring.ph` | Draft and receive purchase orders |
| Store Supervisor | `supervisor1@wellspring.ph` | POS, stock counts, local reports |

Client-side route controls support the demonstration but are not production security boundaries. Server-side authorization must be independently verified before deployment.

#### 1.4.1 Local Signup

1. Open **Create account** on the desktop overlay, or use the compact Sign in/Create account switcher on smaller screens.
2. Enter a demo name, unique email, and matching password of at least eight characters.
3. Submit to create a browser-only cashier at **WS01 · Davao Main**.
4. Sign out and sign in again; email matching is case-insensitive on subsequent login.

Local passwords are stored in the browser solely for this labeled demo. Use a disposable demo password, never a real one.

### 1.5 Core Workflows

#### 1.5.1 Dashboard

The dashboard derives current browser-state metrics: today's revenue and transaction count, current stock units, low-stock count, seven-day sales trend, stock categories, fast-moving products, recent receipts, and stock/expiry alerts. Quick actions vary by role.

**Evidence:** local browser demonstration; figures are sample data, not business results or benchmarks.

#### 1.5.2 POS Checkout and Receipt

1. Open **Point of sale** with an authorized role.
2. Search by product name, SKU, barcode, or category.
3. Add products and set whole-number quantities within available stock.
4. Select customer type and payment method. For prescription merchandise, confirm the pharmacist-review attestation.
5. For cash, enter enough tender or select **Exact amount**. For card/e-wallet, enter a demo reference.
6. Review totals and select **Charge**. The application creates the receipt and deducts local stock once.
7. Print or save the 80 mm receipt using the browser print command.

**Observed example:** receipt `WS-2026-01009`; Paracetamol changed from 184 to 182 tablets and alcohol from 64 to 63 bottles. This is functional evidence for the captured local transaction, not a concurrency or accounting test.

#### 1.5.3 Inventory Count

1. Open **Inventory** as inventory staff, supervisor, or administrator.
2. Search or filter by low stock, out of stock, or expiry watch.
3. Review stock valuation, reorder points, batch/expiry display, and recent movement entries.
4. Enter a nonnegative physical count and a reason.
5. Save the adjustment; local stock and movement/audit records update.

**Boundary:** one batch/expiry value per browser product; no automatic multi-batch FEFO, transfer UI, or centralized branch stock.

#### 1.5.4 Purchasing and Receiving

The normal non-administrator browser flow uses role handoff:

1. **Purchasing Officer:** create a draft PO with supplier, expected date, product, quantity, and cost.
2. **Branch Manager or Head Office Manager:** approve the draft; browser status moves `DRAFT → SENT`.
3. **Purchasing Officer or Inventory Staff:** receive the sent order; status moves `SENT → RECEIVED` and full listed quantities are added to stock.

The administrator can perform all local stages. The new-PO form has one line; seeded examples can contain multiple lines.

**Boundary:** no supplier-maintenance UI, partial/discrepant receiving, quality-check workflow, GRN document UI, or invoice-matching UI in the browser.

#### 1.5.5 Reports and Export

1. Open **Reports** with an authorized role.
2. Select today, seven days, or all demo records.
3. Review sales metrics, trend/category charts, and the transaction register.
4. Export the current local register to CSV.

**Boundary:** reports use one browser's local data. They are not head-office consolidation, BIR certification, or proof of eight-branch reporting.

#### 1.5.6 Offline Queue and Manual Synchronization

1. Open **Offline & sync** and select **Simulate offline mode**.
2. Complete a sale in POS. Stock is deducted immediately and the sale is queued locally.
3. Return to Offline & sync and verify the pending entry.
4. Select **Restore online connection**, then **Sync now**.
5. Verify that the queue clears and stock is **not deducted a second time**.

**Critical distinction:** this is a manual local simulation. It does not detect real connectivity or upload to Express/PostgreSQL. "Synced" means local queue completion only. There is no server acknowledgement, conflict resolution, automatic retry, or durable central upload in this workflow.

#### 1.5.7 Administration

Administrators can add local staff-table records, activate/deactivate those records, and inspect local audit events. Branch managers have read-only administration access.

**Boundary:** added records are not working credentials; activation does not govern seeded demo login; local audit is editable through browser storage and erased by reset. It is not tamper-evident.

### 1.6 Authentication and Responsive Evidence

The desktop authentication page uses a sliding WellSpring overlay; compact screens use a Sign in/Create account switcher. The application retains self-hosted Manrope and DM Sans, while editable Office deliverables use Arial for portability.

Earlier browser QA recorded 16/16 login checks and 28 responsive page/device checks passed. These are prototype checks, not production browser-certification results.

### 1.7 Use Cases and Planning Artifacts

The retained RFP use-case specification and diagram describe the intended actors and system scope. They are planning artifacts, not proof that every proposed integration is operational.

The two-week Gantt chart records the implementation plan and sequencing. It should be read as a project plan, not an actual measured schedule or production rollout commitment.

The combined `WELLSPRING_ONE_SYSTEM_DOCUMENTATION.docx/.pdf` includes the editable Gantt task table, both original Gantt chart pages, and the complete 25-page use-case specification as appendix facsimiles. The separate editable originals remain available for focused editing.

- Editable use cases: `USE_CASE_SPECIFICATION_RFP.docx`; PDF copy included.
- Editable Gantt plan: `GANTT_TWO_WEEK_PLAN.docx`; PDF copy included.
- Full requirement-by-requirement status: [REQUIREMENTS.md](REQUIREMENTS.md).

### 1.8 Verification Summary

| Check | Final recorded result | Interpretation |
|---|---|---|
| API unit tests | **4/4 passed**, 2 files | JWT identity/malformed token and shared permission examples only |
| Web unit tests | **21/21 passed**, 3 files | Sales calculations, dashboard derivations, local signup/login |
| Production builds | **Passed** for API, web, shared | TypeScript/build verification, not runtime integration |
| Web ESLint | **Passed** | Web source lint only |
| Root test command | API/web tests pass; shared workspace reports no test script | Root command is not a clean all-workspace pass |
| Root lint command | **Failed** | API/shared ESLint configuration is missing |
| Browser workflow evidence | 16/16 login and 28 responsive checks; captured POS stock/receipt and offline states | Local browser prototype only |
| Dependency audit | **4 moderate, 8 high, 2 critical** | Requires reviewed remediation; no blind auto-fix applied |
| PostgreSQL/API integration | **Not executed** | PostgreSQL unavailable; migrations/seed/runtime workflows unverified |

See [TEST_PLAN.md](TEST_PLAN.md) for commands, manual cases, acceptance gates, and the defect register.

### 1.9 Limitations and Production Roadmap

#### Current Limitations

- Browser operational state is device/profile-specific `localStorage`; API mode changes authentication only.
- Real API/database integration, migrations, seed execution, and multi-client consistency are unverified.
- Offline/Sync is manual and local; API sync idempotency is incomplete in source.
- Authorization and branch isolation require backend remediation and integration tests.
- Frontend/backend senior/PWD calculations differ; compliance review is required.
- Local credentials and audit records are not production-safe.
- Multi-batch/FEFO, complete receiving, browser void/refund, loyalty, accounting, payments, and hardware are incomplete or absent.
- CI/CD and Docker definitions are drafts; dependency vulnerabilities remain.
- PR-01–PR-06, stock accuracy, availability, recovery, privacy, BIR, and training targets have no production evidence.

#### Recommended Next Increments

1. Make clean install, lint, tests, and CI reproducible; establish migrations and a dependency-remediation baseline.
2. Correct backend authorization, branch isolation, session restoration, audit redaction, tax rules, and sync idempotency.
3. Integrate one end-to-end server-backed sale, then inventory, purchasing, and reporting.
4. Complete pharmacy batch/FEFO and receiving controls; implement durable offline commands and conflict handling.
5. Add vendor integrations, monitoring, backup/restore, deployment, training, and eight-branch acceptance evidence.

Detailed architecture, endpoints, data models, and security findings are in [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md).

---

## 2. Technical Architecture, API, and Handover Guide

*Source: `docs/TECHNICAL_GUIDE.md`*

### 2.1 System Overview

WellSpring One is an npm-workspaces prototype for pharmacy sales, stock control, purchasing, reporting, and role-based administration.

| Workspace | Implementation | Current role |
|---|---|---|
| `apps/web` | React 18, TypeScript, Vite, React Router, Axios, TanStack Query, Recharts, Tailwind | Demonstrated local browser workflows and responsive UI |
| `apps/api` | Express, Prisma 5, PostgreSQL, JWT, bcrypt, Zod, Helmet, CORS, Morgan, rate limiting | Separate backend implementation; database runtime not verified |
| `packages/shared` | Roles, permission matrix, Zod models, API types, business constants | Shared TypeScript source used by web and API |

Node.js 20 or later is required. The supported local demonstration uses npm and the checked-in `package-lock.json`; the repository has no pnpm lockfile even though its CI currently uses pnpm.

### 2.2 Current-State Architecture

1. A user interacts with the React application.
2. Operational prototype state is stored under `wellspring-prototype-v1` in that browser's `localStorage`.
3. Demo identities and local signup profiles use `wellspring-demo-accounts-v1`; the demo session uses `wellspring-demo-session`.
4. Offline mode is a manual UI state. Its queue is part of local prototype state; synchronization marks local entries complete only after the user restores the simulated connection and selects **Sync**.
5. The Express/Prisma/PostgreSQL layer exists in source. Browser operational pages do not consume it. API login can be selected with an environment flag, but session restoration is incomplete.

### 2.3 Repository Map

```
wellspring-pos/
├─ apps/
│  ├─ web/src/             React pages, contexts, calculations, demo data, tests
│  └─ api/
│     ├─ src/routes/       Express resource handlers
│     ├─ src/middleware/   JWT, RBAC, branch scope, audit, errors
│     ├─ prisma/           Schema and seed
│     └─ tests/            JWT and shared-permission unit tests
├─ packages/shared/src/    Shared roles, permissions, schemas, constants
├─ docs/                   Requirements, test plan, diagrams, screenshots, handover
├─ .github/workflows/      CI/CD draft requiring remediation
├─ docker-compose.yml      Deployment draft; not a verified startup path
└─ package.json            npm workspaces and root commands
```

### 2.4 Running the Demonstrated Browser Prototype

#### Clean Setup on Another Computer

```bash
git clone https://github.com/kurunami31/WellSpring1.git
cd WellSpring1
npm ci
npm run dev --workspace=@wellspring/web -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. Use `admin@wellspring.ph` / `password123` for the administrator demonstration. All seeded browser identities use the same demo-only password. Do not use real customer, patient, employee, or payment information.

No API or PostgreSQL server is needed for the local browser demonstration. Do not set `VITE_USE_API=true` unless an API and database have intentionally been configured.

#### Reset and Persistence

- **Offline & sync → Reset demo data** restores the shared local operational dataset.
- Local signup profiles are stored separately; a full clean-slate reset can be performed by clearing this site's browser storage.
- State is specific to one browser profile, origin, and device. It is not centralized across browsers or branches.
- Browser storage is editable and is neither a secure credential store nor a tamper-evident audit log.

### 2.5 Browser Behavior and Effective Access

`apps/web/src/App.tsx` defines routes; `AppShell.tsx` applies matching navigation visibility. `SYSTEM_ADMIN` bypasses browser permission checks. These are usability controls, not security boundaries.

| Route | Demonstrated behavior | Effective browser access |
|---|---|---|
| `/login` | Seeded sign-in, local cashier signup, responsive overlay/switcher | Public; authenticated users redirect to dashboard |
| `/dashboard` | Revenue, transaction and stock metrics, trend, categories, fast movers, alerts, recent receipts | All authenticated roles; shortcuts are role-filtered |
| `/pos` | Search, cart, customer/payment selections, receipt, stock deduction | Cashier, supervisor, pharmacist, administrator; some other roles read-only; purchasing denied |
| `/inventory` | Search, stock/expiry filters, valuation, physical count with reason | Inventory staff, supervisor, administrator can adjust; selected roles read-only; cashier/purchasing denied |
| `/purchasing` | New PO, draft → sent approval, sent → received stock update | Purchasing drafts/receives; branch/head-office manager approves; inventory receives; administrator all |
| `/reports` | Today/seven-day/all sales reporting, charts, register, CSV export | Supervisor, inventory, branch/head-office manager, administrator; same local report for admitted roles |
| `/offline` | Manual connection simulator, queue view, manual sync, demo reset | All authenticated roles |
| `/admin` | Local staff table, add/activate/deactivate records, local audit events | Administrator manages; branch manager read-only; others denied |

#### Demonstrated Business Rules

- PHP currency, two-decimal display, positive integer quantities, and stock limits.
- Regular browser sales treat prices as VAT-exclusive and add 12% VAT.
- Browser senior/PWD sales apply a 20% discount to the after-item-discount subtotal and remove VAT.
- Card/e-wallet payments require a nonblank reference; installment shows an agreement field but contacts no provider.
- A cart containing prescription merchandise requires a checkbox attesting pharmacist review; no independent pharmacist/prescription verification occurs.
- Checkout decrements stock once and creates local sale, movement, and audit records. Receipt display and browser printing are available.
- The new-PO form creates one line; seeded POs can contain multiple lines. Browser receiving adds full listed quantities.
- Local signup creates a browser-only `CASHIER` at `WS01 · Davao Main`; later sign-in is case-insensitive by email.

#### Important Demo-Only Behavior

- Local signup passwords are stored in plaintext in browser storage. The UI warns against using a real password.
- Administration creates staff-table records, not working credentials. Activation state does not control seeded demo authentication.
- Loyalty has no membership, points balance, or redemption workflow in the browser.
- There is no browser void/refund, transfer, supplier-maintenance, partial receiving, GRN document, invoice matching, or consolidated head-office dashboard.
- A single batch/expiry value is stored per browser product; automatic FEFO and multi-batch allocation are not demonstrated.
- Browser synchronization has no real connectivity detection, service worker, automatic retry, server acknowledgement, conflict resolution, or durable server upload.

### 2.6 API Architecture and Authorization

Except for public authentication handlers and `/health`, routes use Bearer JWT verification and a fresh active-user database lookup. Administrator bypasses permission checks. Zod validates major request bodies. Helmet, CORS, request logging, general rate limiting, and stricter login rate limiting are configured in source.

#### 2.6.1 Endpoint Inventory

The source contains **62 `/api` handlers plus `/health`**. This is a source inventory, not a runtime contract test or generated OpenAPI specification.

| Resource | Methods and paths | Effective guards |
|---|---|---|
| Authentication | `POST /api/auth/login`; `POST /api/auth/logout`; `GET /api/auth/me`; `POST /api/auth/change-password`; `POST /api/auth/refresh` | Login public/rate-limited; logout acknowledges client deletion; remaining handlers authenticated |
| Users | `GET /api/users`; `GET /api/users/:id`; `POST /api/users`; `PATCH /api/users/:id`; `DELETE /api/users/:id` | `admin:users`; delete deactivates |
| Branches | `GET /api/branches`; `GET /api/branches/:id`; `POST /api/branches`; `PATCH /api/branches/:id`; `DELETE /api/branches/:id` | `admin:config` |
| Products | `GET /api/products`; `GET /api/products/:id`; `POST /api/products`; `PATCH /api/products/:id`; `DELETE /api/products/:id`; `GET /api/products/categories/all` | Entire mount `inventory:read`, including mutations |
| Inventory queries | `GET /api/inventory/stock`; `GET /api/inventory/stock/:productId/:branchId`; `GET /api/inventory/counts`; `GET /api/inventory/transfers`; `GET /api/inventory/reorder-alerts` | `inventory:read` |
| Inventory actions | `POST /api/inventory/count`; `POST /api/inventory/transfers`; `POST /api/inventory/transfers/:id/approve`; `POST /api/inventory/transfers/:id/ship`; `POST /api/inventory/transfers/:id/receive` | Count `inventory:count`; transfers `inventory:transfer` |
| Sales | `GET /api/sales`; `GET /api/sales/:id`; `GET /api/sales/:id/receipt`; `POST /api/sales`; `POST /api/sales/:id/void`; `POST /api/sales/:id/refund` | Read `sales:read`; create/void/refund use corresponding permissions |
| Suppliers | `GET /api/purchasing/suppliers`; `GET /api/purchasing/suppliers/:id`; `POST /api/purchasing/suppliers`; `PATCH /api/purchasing/suppliers/:id`; `DELETE /api/purchasing/suppliers/:id` | Read `purchasing:read`; mutations `supplier:manage` |
| Purchase orders | `GET /api/purchasing/purchase-orders`; `GET /api/purchasing/purchase-orders/:id`; `POST /api/purchasing/purchase-orders`; `POST /api/purchasing/purchase-orders/:id/send` | Read `purchasing:read`; create/send `purchasing:create_po` |
| Receiving/invoice | `POST /api/purchasing/grns`; `GET /api/purchasing/grns`; `POST /api/purchasing/invoice-match` | GRN create `purchasing:grn`; GRN read `purchasing:read` OR `purchasing:grn`; match `purchasing:invoice_match` |
| Reports | `GET /api/reports/sales/branch`; `GET /api/reports/bir/sales`; `GET /api/reports/inventory/stock-on-hand`; `GET /api/reports/inventory/ageing`; `GET /api/reports/inventory/expiry`; `GET /api/reports/dashboard/consolidated` | Branch/BIR `reports:branch_sales`; inventory `reports:inventory`; consolidated `reports:consolidated` plus head-office/admin role check |
| Administration | `GET /api/admin/config`; `PATCH /api/admin/config`; `GET /api/admin/health`; `GET /api/admin/backup-status`; `GET /api/admin/audit` | Config/health/backup `admin:config`; audit `admin:audit` |
| Sync | `POST /api/sync/upload`; `GET /api/sync/status` | Authenticated; no operation-specific RBAC |
| Health | `GET /health` | Public status/timestamp; not a database health check |

#### API Behavior Established by Source Review

- Sale creation validates stock, selected batch expiry, and prescription boolean; calculates totals; creates sale/items; decrements stock; and writes audit records. It does not automatically select the earliest-expiry batch.
- Void/refund handlers restore stock and require reasons.
- Stock counts auto-adjust within tolerance. Larger variances remain unapproved, but no approval endpoint is present.
- Transfers implement pending/approved/shipped/received states and source/destination stock updates.
- GRN creation updates PO received quantities and status but does not create product batches or stock levels.
- Admin configuration PATCH echoes input; backup status returns generated placeholder values.
- Browser approval uses `purchasing:approve_po`, but API send uses `purchasing:create_po`; no API endpoint uses `purchasing:approve_po`.
- The consolidated report route is statically reachable for head-office/admin roles under the current mounts, but remains runtime-unverified and unused by the browser.

#### Suggested Integration Sequence

1. Add API/database contract tests before wiring browser pages.
2. Correct authorization, branch-isolation, tax, sync-idempotency, and audit-redaction defects.
3. Introduce versioned migrations and representative seed data.
4. Connect one vertical slice—authenticate, read catalog, complete sale, read receipt—to prove shared server state.
5. Connect inventory and purchasing with explicit branch scope and transaction boundaries.
6. Replace simulated offline completion with durable queued commands, idempotency keys, acknowledgements, conflict policy, and retry monitoring.
7. Add consolidated reporting and external integrations only after the core data path is accepted.

### 2.7 Data Model

The Prisma schema defines **17 models**:

| Domain | Models and principal relationships |
|---|---|
| Organization/security | `Branch`, `User`, `AuditLog`; users and audit records optionally relate to branches |
| Catalog/stock | `Category`, `Product`, `ProductBatch`, `StockLevel`; category hierarchy, product batches, branch/product/batch stock |
| Sales | `Sale`, `SaleItem`; sale relates to branch/cashier and cascading items; item optionally relates to batch |
| Supply chain | `Supplier`, `PurchaseOrder`, `POItem`, `GRN`, `GRNItem`; PO relates to supplier/branch/items/GRNs |
| Controls | `StockCount`, `StockTransfer`, `TransferItem`; transfers relate to both branches and actor users |

#### Notable Boundaries

- The seed creates three branches, four categories, six products, one supplier, nine users, and 50 units per product per branch. The browser demo has a different dataset.
- The seed creates no `ProductBatch` records; batch-tracked products receive `batchId: null` stock. Seed data alone cannot demonstrate FEFO.
- There is no persistent stock-movement model despite a `StockMovementType` enum.
- Some IDs lack Prisma relations, including batch supplier ID, PO creator/approver IDs, stock-count approver, and sale prescription ID.
- There are no promotion, loyalty-account, payment-provider, accounting, or system-configuration models.
- No Prisma migration directory is included. Use versioned migrations before any shared or production database work.

### 2.8 Environment and Database Setup for Future Integration

The following is a **ready-to-run integration procedure, not an executed result**. PostgreSQL was unavailable during this submission's final QA.

```bash
cd apps/api
cp .env.example .env       # Windows: copy .env.example .env
# Set a unique DATABASE_URL and a strong JWT_SECRET in .env.
npm run db:generate --workspace=@wellspring/api
npm run db:push --workspace=@wellspring/api
npm run db:seed --workspace=@wellspring/api
npm run dev --workspace=@wellspring/api
```

For an intentional API-authentication experiment, configure the web app with `VITE_USE_API=true` and `VITE_API_URL=http://localhost:3001`, then restart Vite. Operational pages remain local. API session restoration must be corrected before relying on reload behavior.

Do not commit `.env`, real connection strings, passwords, access tokens, or production secrets. Use a secret manager in deployed environments.

### 2.9 Security and Correctness Register

These are source-review findings requiring remediation and verification, not claims that an exploit was executed.

| Priority | Finding | Required action |
|---|---|---|
| Critical | Operational browser data and local passwords are client-controlled; local audit is editable | Label demo accurately; use server-side identity, authorization, password hashes, and protected audit storage for production |
| High | Product mutations inherit `inventory:read`; sync lacks operation-specific RBAC | Enforce least privilege for every action and operation type; add deny-by-default tests |
| High | Several direct-ID handlers do not visibly verify returned entity branch, including sale/PO/transfer examples | Apply branch predicates inside every query/transaction and test cross-branch access |
| High | Sync validates `clientId` but does not persist/check it; retry can duplicate a sale | Add a unique idempotency record and atomic replay behavior; implement tested conflict policy |
| High | Audit middleware stores request/response bodies without visible redaction; user-creation passwords may enter audit JSON | Redact secrets and sensitive fields before logging; define retention/access controls |
| High | Frontend and API senior/PWD calculations differ | Obtain compliance review, implement one statutory rule, and reconcile receipts across paths |
| High | API session restoration does not call `getMe()` for a database identity | Restore from validated token/server identity; handle expiry and inactive users |
| Medium | GRN does not create stock/batch records; large stock-count variance lacks approval endpoint | Complete transactional receiving and variance workflows or explicitly remove unsupported claims |
| Medium | Demo administration does not govern actual login; local staff changes are cosmetic for authentication | Use one authoritative user store and enforce active state at authentication/authorization |
| Medium | Offline UI wording can imply server upload although none occurs | Retain explicit "simulation/local only" wording until real acknowledgements exist |

Use only synthetic data in the prototype. No RA 10173, BIR, payment, or production-security certification is asserted.

### 2.10 Build, Test, CI, and Dependency Status

Final local results are detailed in [TEST_PLAN.md](TEST_PLAN.md):

- API: 4/4 tests in two files passed; web: 21/21 tests in three files passed.
- API, web, and shared production builds passed.
- Web ESLint passed. Root lint is not green because API/shared ESLint configuration is missing.
- Root `npm test` also reports that the shared workspace has no test script after the API/web tests complete.
- `npm audit --json` reported **4 moderate, 8 high, and 2 critical** dependency findings. No automatic force upgrade was applied.

CI requires handover remediation: it uses pnpm without a pnpm lockfile, root lint is not green, the **Web Tests** job only builds rather than running web tests, and staging deployment is an echo placeholder. Do not describe this workflow as a verified deployment pipeline.

`docker-compose.yml` references a missing `apps/web/Dockerfile`, does not set `VITE_USE_API=true`, contains example secrets, and includes an unused Redis service. npm setup is the reproducible browser-demo path; Compose is a draft.

### 2.11 Production Roadmap and Acceptance Gates

| Stage | Deliverables | Exit evidence |
|---|---|---|
| 1. Stabilize foundation | Reproducible npm CI, lint configuration, migration baseline, dependency remediation plan | Clean install/build/test/lint; reviewed audit; rollback-safe migration |
| 2. Secure core API | Action/branch RBAC, session restoration, audit redaction, tax reconciliation, idempotent sync | API integration/security tests with PostgreSQL; cross-branch denial proof |
| 3. Integrate operations | Browser uses shared server catalog, sales, stock, purchasing, reports | End-to-end role workflows and two-client consistency proof |
| 4. Complete pharmacy controls | Multi-batch/FEFO, receiving/discrepancy, void/refund UI, stock movement ledger | Representative pharmacy UAT and reconciliation |
| 5. Offline and integrations | Durable queue, acknowledgements, conflicts, accounting/payment adapters | Fault injection, retry/replay tests, vendor sandbox certification |
| 6. Operate at scale | TLS, monitoring, backup/restore, deployment, training, support | PR-01–PR-06 measurements, recovery exercise, eight-branch UAT, compliance sign-off |

Production acceptance requires every mandatory RFP requirement, no critical UAT defects, reconciliation across eight branches and accounting, independent PR-01–PR-06 evidence, and approved privacy/BIR/support procedures. See [REQUIREMENTS.md](REQUIREMENTS.md) for measurable targets.

### 2.12 Handover Checklist

- [ ] Clone with the URL above and run `npm ci` using Node.js 20+.
- [ ] Demonstrate the browser prototype without presenting local state as a server database.
- [ ] Keep demo credentials and sample data out of real operations.
- [ ] Review the source security register before exposing any API publicly.
- [ ] Establish PostgreSQL, migrations, API integration tests, and a single operational data path.
- [ ] Replace CI/CD and Compose drafts with tested, secret-safe workflows.
- [ ] Resolve dependency findings deliberately; retest rather than applying blind force upgrades.
- [ ] Preserve editable Markdown/DOCX/PPTX sources and regenerate PDFs after changes.
- [ ] Record future acceptance evidence in `TEST_PLAN.md`; never convert an unexecuted case into a pass by assertion.

---

## 3. Requirements Specification

*Source: `docs/REQUIREMENTS.md`*

### 3.1 Purpose and Sources

This specification translates the WellSpring Request for Proposal (RFP) into verifiable system requirements and distinguishes them from the current implementation. It uses two authorities:

1. The 16-page RFP dated November 10, 2026, especially FR-01–FR-13 and PR-01–PR-06.
2. The WellSpring One source tree, including the React prototype, Express routes, shared permission matrix, Prisma schema, seed data, and existing unit-test files.

Source review establishes what code exists. It does **not** establish that a workflow has passed runtime testing, that the browser uses an API route, or that a production control is operational.

### 3.2 Project Team

Christopher Lyod B. Mercado, Frankie Dhon M. Pelayo, Mark Steven S. Punto, Rick Lorenz T. Perez, Asaph Andrie R. Ildefonso, Mave M. Ancog, John Lloyd B. Otero, Jannel C. Pondoyo, Erlyn A. Ongcoy, and Bianca Benaldo.

### 3.3 Business Context and Objectives

WellSpring Pharmacy & Retail Corp. operates eight branches in the Davao Region and has about 120 staff. Standalone POS terminals, spreadsheets, and manual logs currently separate sales, stock, supplier, and accounting work.

The desired system shall:

- give branch staff and head office a shared view of sales and inventory;
- track medicine batches and expiry dates and enforce first-expiry-first-out (FEFO) issuing;
- support controlled purchasing, receiving, void/refund, and user administration;
- reduce manual consolidation and accounting re-keying;
- provide accurate, legally compliant receipts and reports; and
- maintain service during connectivity interruptions.

The current browser prototype demonstrates a **single WS01 Davao Main workflow**. It is not an eight-branch deployment.

### 3.4 Scope

#### Current Browser-Prototype Scope

- Sign-in using eight seeded demo identities, or API authentication when `VITE_USE_API=true`.
- Point of sale: product/SKU/barcode text search, cart, customer type, payment selection, prescription confirmation, browser receipt display, and browser printing.
- Inventory: one batch/expiry record per demo product, stock and expiry filters, physical-count adjustment, and recent stock movements.
- Purchasing: a fixed supplier list, one-line purchase orders, draft approval, and full receipt into stock.
- Reports: local sales metrics, charts, a transaction register, and CSV export.
- Administration: local staff records, activation/deactivation, and a local operational event list.
- Offline demonstration: a manual connection simulator, offline sale queue, explicit user-triggered synchronization, and demo reset.

#### Separate Express/PostgreSQL API Surface

The repository also contains API routes for authentication, users, branches, products, inventory, sales, purchasing, reports, administration, and synchronization. These routes use PostgreSQL through Prisma. They are **not proof of an integrated production system**: except for optional login/logout, the prototype pages continue to use their local state rather than these resources.

#### Not Established by the Current Implementation

- Accounting-software integration or elimination of manual re-keying.
- True eight-branch consolidation or centralized real-time browser data.
- Automatic FEFO batch selection.
- RFID support or verified barcode/printing hardware integration.
- Automatic reconnect synchronization.
- BIR certification or production-ready BIR receipt identifiers.
- Complete tamper-evident auditing.
- Fifty-user load results, 99.5% availability, automated backups, or recovery objectives.
- Payment-gateway authorization, settlement, or installment-provider integration.
- Production data migration, eight-branch hardware rollout, training certification, or support SLAs.

### 3.5 Functional Requirements Traceability Matrix

| ID | RFP requirement | Current evidence | Production acceptance / remaining gap |
|---|---|---|---|
| **FR-01** | Process cash, debit/credit card, e-wallet, and installment payments. **Shall.** | **Partial — browser prototype:** Cash, `CARD`, `E_WALLET`, and `INSTALLMENT` can be selected. Cash validates tender and computes change. Card/e-wallet require an authorization reference. Installment displays an agreement-reference field but has no provider workflow. **API surface:** the same four enum values are accepted. | Integrate and reconcile real card, wallet, and installment providers; handle timeout, duplicate authorization, cancellation, settlement, and provider errors. Prove all four methods end to end. No payment-gateway transaction is currently demonstrated. |
| **FR-02** | Print BIR-compliant receipts and support void/refund with audit trail. **Shall.** | **Partial:** The browser displays a printable receipt using `window.print()`. It has no void/refund screen. API routes define void/refund with reasons and stock restoration. API receipt data contains placeholder TIN `000-000-000-000` and MIN `123456789`. | Configure verified company/branch registration data, required receipt fields and serial controls, accredited printing where applicable, and regulatory review. Test void/refund permissions, stock effects, accounting effects, and audit evidence. Placeholder values must not be used as evidence of BIR compliance or certification. |
| **FR-03** | Track inventory in real time across all branches. **Shall.** | **Partial:** Sales, counts, and receiving update one browser's WS01 stock immediately. The Prisma model and API queries include `branchId`; seed data defines three branches, not eight. | Connect every branch to a central authoritative store; test concurrent updates and fresh cross-branch visibility for all eight branches. Local browser updates are not real-time multi-branch synchronization. |
| **FR-04** | Track stock by batch and expiry and enforce FEFO issuing. **Shall.** | **Partial:** The browser shows one batch and expiry per product. API sales accept an optional `batchId`, check the selected batch's expiry, and sort some batch inquiries by expiry. The sale route does not select the earliest-expiry batch automatically. | Allocate available stock from the earliest unexpired eligible batch under concurrent checkout, record batch movements, prevent expired issue, and test ties and insufficient-batch quantities. Automatic FEFO must not be inferred from a caller-supplied `batchId`. |
| **FR-05** | Alert at reorder points or approaching expiry. **Shall.** | **Partial:** The browser computes low-stock, expiry-watch, and expired statuses and filters; expiry watch is 90 days. API stock inquiry computes a 30-day near-expiry flag and exposes reorder and expiry-report endpoints. | Agree thresholds and recipients, deliver visible/actionable notifications across roles and branches, test boundary dates, and avoid duplicate/unresolved alerts. No push notification, scheduled alert job, or automatic PO generation is demonstrated. |
| **FR-06** | Manage suppliers, purchase orders, and goods-received notes. **Shall.** | **Partial:** The browser has three fixed supplier names and one-line POs with `DRAFT → SENT → RECEIVED`; receiving adds full quantities to local stock. API adds supplier CRUD, multi-line POs, GRNs, and invoice comparison. API GRN creation records received quantities but does not create/update stock levels or product batches. | Add complete supplier maintenance UI, partial/discrepant receiving, batch creation, stock posting, approval controls, and accounting handoff. Verify GRN-to-stock behavior independently; browser receiving and API GRN behavior are not equivalent. |
| **FR-07** | Consolidate sales and inventory across branches into dashboards. **Shall.** | **Partial — API surface only for consolidation:** The browser reports only its local sales register. `GET /api/reports/dashboard/consolidated` contains cross-branch aggregates and an explicit head-office/administrator role check. Source review shows the route is statically reachable for those roles; it remains runtime-unverified and unused by the browser. | Verify authorization and branch scoping at runtime, integrate central data for eight branches, reconcile branch totals, and test freshness and date filtering. The browser must not be described as a consolidated dashboard. |
| **FR-08** | Enforce role-based access control and user permissions. **Shall.** | **Partial:** React hides navigation and disables actions using shared permissions; protected pages deny unauthorized roles. API uses JWT verification, fresh active-user checks, route-level permissions, and branch scoping. Several API mounts apply read permission to all HTTP methods rather than action-specific permissions. Demo identity is stored in `localStorage`. | Enforce method/action-specific server authorization on every mutation, test horizontal and vertical privilege escalation, secure sessions, and verify account lifecycle end to end. Browser checks alone are not a security boundary. |
| **FR-09** | Integrate with existing accounting software. **Shall.** | **Not demonstrated.** Environment examples contain commented accounting URL/key entries. Invoice matching writes an audit event when matched and contains a comment about a future accounting push; no accounting client or confirmed export exists. | Obtain the accounting API contract and credentials, map sales/tax/payables, implement authenticated delivery with idempotency/retry/reconciliation, and prove no manual re-keying in UAT. |
| **FR-10** | Operate offline and synchronize automatically when connectivity returns. **Should.** | **Partial:** A manual simulator switches the browser state. Offline sales are stored locally and stock is deducted once. After the user restores the simulated connection, the user must select **Sync**; this only changes local status and clears the local queue. An unconnected API `/sync` surface also exists. | Implement real connectivity detection, durable authenticated upload, automatic reconnect retry, idempotency, conflict handling, and server acknowledgement. Test duplicates, stock conflicts, expired sessions, and interrupted uploads. Do not describe manual local status changes as server synchronization. |
| **FR-11** | Support barcode scanning and optional RFID. **Shall for barcode; RFID optional.** | **Partial:** POS search matches the stored barcode field and inventory supports text search. A keyboard-wedge scanner may be able to type into search, but no scanner-specific integration or hardware test is present. No RFID implementation was found. | Test supported scanners, exact/full-code handling, scan focus, invalid codes, and receipt/label printers on branch hardware. Treat RFID as an optional separately evaluated component, not an implemented feature. |
| **FR-12** | Maintain a complete, tamper-evident audit trail. **Shall.** | **Partial:** The browser appends actor/timestamp events for major local actions, but reset or browser storage editing can remove/change them. API has an `AuditLog` model and request/manual logging. Audit write failures are logged without failing the request; no hash chain, signing, WORM storage, or equivalent tamper-evidence control was found. | Define audited events and retention, protect audit writes and reads, make tampering detectable, synchronize clocks, and test completeness during failures. Current event records must not be called a complete tamper-evident trail. |
| **FR-13** | Support price promotions, discounts, and loyalty functions. **Should.** | **Partial:** Browser senior/PWD selection applies a 20% discount and removes VAT. `LOYALTY` is selectable but has no points or member workflow in the browser. API calculates earned points but does not apply a promotion engine or a demonstrated points balance/redemption process. | Validate statutory calculations with compliance reviewers; implement promotion eligibility/stacking and loyalty enrollment, accrual, balance, redemption, expiry, and reversal. Reconcile different frontend/backend senior/PWD tax calculations before release. |

### 3.6 Measurable Non-Functional Requirements

| ID | Required target | Measurement and acceptance evidence | Current status |
|---|---|---|---|
| **PR-01** | POS transaction confirmation in **under 2 seconds**. | Time from checkout submission to confirmed receipt, including server/payment work in the production path. Report sample size, data volume, network, and p50/p95/p99; every mandatory acceptance sample must satisfy the agreed threshold, with any percentile stricter than the RFP recorded separately. | **Not verified.** The demo adds an artificial 350 ms login delay, which is not a POS benchmark. No payment-gateway timing exists. |
| **PR-02** | At least **50 concurrent users per branch**. | Run a representative 50-concurrent-user workload per branch with sales, stock reads, and reports; then test the agreed eight-branch profile. Meet PR-01 and the agreed error ceiling without data corruption. | **Not verified.** No load-test report or 50-user evidence exists. |
| **PR-03** | At least **99.5% availability during business hours**. | Define business hours and exclusions before measurement. Use independent monitoring and incident records over an agreed production window; `(available business minutes / total business minutes) × 100 ≥ 99.5`. | **Not verified.** No deployed service-level monitoring exists. |
| **PR-04** | Nightly cross-branch synchronization within **60 minutes**. | With production-representative data and eight branches, measure nightly start to all branches acknowledged/reconciled; complete within 60 minutes without unresolved conflicts. | **Not verified.** The browser has manual local synchronization only. |
| **PR-05** | Automated backups at least every **4 hours**. | Inspect scheduler and backup logs for at least 48 hours, confirm no gap exceeds four hours, validate backup integrity, and perform a test restore. | **Not implemented/proven.** `/api/admin/backup-status` returns generated placeholder values, not a backup-job query. |
| **PR-06** | Recovery from failure within **1 hour RTO**. | In an authorized isolated recovery exercise, record failure declaration to restored service and validate data consistency. Elapsed recovery must be ≤60 minutes. | **Not verified.** No recovery runbook or exercise evidence exists. |

---

## 4. Test Plan and QA Evidence

*Source: `docs/TEST_PLAN.md`*

### 4.1 Objectives

This plan provides reproducible checks for the submitted prototype and a controlled route to production acceptance. It preserves the exact distinction between observed behavior, source review, prepared tests, and production targets.

### 4.2 Evidence Legend

| Label | Meaning |
|---|---|
| **Passed — recorded** | Executed in the submission environment with the result stated in Section 4 |
| **Demonstrated — captured** | Observed in an isolated browser profile and supported by screenshots or recorded check counts |
| **Source finding** | Code inspection identified a behavior or risk; runtime exploit/integration proof was not performed |
| **Ready to run** | Procedure is defined but not executed in this submission |
| **Blocked** | A required service, migration baseline, provider, hardware model, or acceptance environment is unavailable |
| **Production target** | RFP/non-functional acceptance evidence required before release |

### 4.3 Recorded Verification Results

| Check | Recorded result | Evidence and limitation |
|---|---|---|
| Web unit tests | **Passed — 21/21**, 3 files | Sales calculations, dashboard derivations, local signup/login; not end-to-end server tests |
| API unit tests | **Passed — 4/4**, 2 files | JWT identity/malformed token and shared permission examples only |
| Production builds | **Passed** for API, web, shared | TypeScript/build verification only |
| Web ESLint | **Passed** | `apps/web/src` only |
| Root test command | API/web tests complete; shared reports **no test script** | Root command is not a clean all-workspace pass |
| Root lint command | **Failed** | API/shared ESLint configuration is missing |
| Authentication browser checks | **16/16 passed** in earlier browser QA | Prototype checks; exact environment versions not retained |
| Responsive browser checks | **28/28 passed** in earlier browser QA | Selected pages/device sizes; not a complete compatibility matrix |
| Captured sale | Receipt `WS-2026-01009`; Paracetamol **184 → 182**, alcohol **64 → 63** | One isolated local transaction; no concurrency/payment/accounting claim |
| Offline behavior | Pending local sale captured; queue/stock workflow observed | Manual local simulation; no server acknowledgement |
| Dependency audit | **4 moderate, 8 high, 2 critical** findings | `npm audit --json`; no blind force remediation applied |
| PostgreSQL/API integration | **Not executed / blocked** | No PostgreSQL runtime, migrations, seed, or API workflow evidence |

### 4.4 Reproducible Local Commands

```bash
npm ci
npm test --workspace=@wellspring/web
npm test --workspace=@wellspring/api
npm run build --workspace=@wellspring/shared
npm run build --workspace=@wellspring/api
npm run build --workspace=@wellspring/web
npm run lint --workspace=@wellspring/web
npm run dev --workspace=@wellspring/web -- --host 127.0.0.1
```

### 4.5 Functional Manual Test Cases (22 cases)

M-01 through M-22 covering: seeded login, local signup, authorization, dashboard reconciliation, cash sale, payment validation, discount/tax, prescription/receipt, stock boundaries, inventory, purchasing handoff, receiving boundaries, reports, administration/audit, offline sale, explicit Sync, interruption, responsive UI, scanner/receipt hardware, void/refund, batch/FEFO, accounting integration.

### 4.6 API, Database, and Integration Test Gate

Ready-to-run procedures for isolated PostgreSQL setup, migration baseline, vertical slice integration, two-client consistency, transactional rollback, and offline command replacement with idempotency/conflict testing.

### 4.7 Security, Accessibility, and Resilience Testing

Security: privilege escalation, secret leakage, token validation, audit completeness, dependency remediation.
Accessibility: keyboard navigation, screen readers, 200% zoom, reduced motion, touch targets, WCAG 2.2 AA.
Resilience: network interruption injection, backup integrity, restore, disaster declaration.

### 4.8 Non-Functional Acceptance Matrix (PR-01 through NFR-12)

All execution results are open. Test methods are defined without inventing results.

### 4.9 Requirement Traceability and Release Gates

Prototype demonstration entry criteria and production release exit criteria defined.

### 4.10 Known Defect and Risk Register (D-01 through D-13)

13 findings from Critical to Blocker with required dispositions.

### 4.11 Handover QA Checklist

9-item checklist for reproducible evidence preservation.

---

## 5. Defense Presentation Narrative

*Source: `docs/PRESENTATION.md`*

### Slide 1 — WellSpring One
**Subtitle:** One workstation for pharmacy sales, stock, and supply  
**Supporting line:** Functional browser prototype · Systems Integration and Architecture  
**Footer:** WS01 · Davao Main | November 2026  
**Visual:** Ocean cover with a cropped dashboard workstation and a small "functional prototype" label.

### Slide 2 — The Operational Gap
**Headline:** A sale is never just a sale.  
**Three points:** Stock must change immediately; Purchasing must respond to what is running low; Managers need the same transaction story.  
**Closing line:** Disconnected records create reconciliation work and delayed decisions.  
**Visual:** Sales → stock → purchasing → management chain with a highlighted break between separate records.

### Slide 3 — One Shared Operational Story
**Headline:** From login to decision, each module uses the same local demo state.  
**Four capabilities:** Sell and print; Count and replenish; Approve and receive; Report and audit.  
**Footer label:** DEMONSTRATED · browser prototype  
**Visual:** Dashboard capture with four concise capability callouts.

### Slide 4 — A Checkout That Updates the Operation
**Headline:** Cart → receipt → stock movement  
**Evidence:** Receipt `WS-2026-01009`; Paracetamol: **184 → 182**; Alcohol: **64 → 63**  
**Footer label:** OBSERVED · one captured local transaction  
**Visual:** POS checkout beside the receipt, with the stock-change figures as the dominant evidence.

### Slide 5 — Stock and Supply Stay Connected
**Headline:** Count what is on hand. Receive what was ordered.  
**Two workflows:** Inventory: filters, valuation, expiry watch, reasoned physical counts. Purchasing: draft → manager approval → receive → stock update.  
**Footer label:** DEMONSTRATED · role-aware local workflows  
**Visual:** Inventory and purchasing captures in a balanced two-column layout.

### Slide 6 — Offline Continuity, Honestly Labeled
**Headline:** Save locally. Deduct once. Sync on command.  
**Flow:** Simulate offline → save sale + queue → restore connection → select Sync  
**Boundary:** Local simulation only — no server upload or conflict resolution.  
**Footer label:** DEMONSTRATED · manual browser queue  
**Visual:** Four-state offline flow plus the pending-queue capture.

### Slide 7 — Two Layers, Not One Integrated System
**Headline:** The browser demo and PostgreSQL API are separate today.  
**Left layer:** React + localStorage; operational pages demonstrated locally.  
**Right layer:** Express + Prisma + PostgreSQL; 62 API handlers plus health in source.  
**Bridge:** API mode changes authentication only. Operational integration remains future work.  
**Footer label:** SOURCE-VERIFIED · database runtime unverified  
**Visual:** Split architecture diagram with a deliberately broken/unconnected bridge.

### Slide 8 — Evidence, Not Assumptions
**Headline:** What passed — and what did not.  
**Metrics:** 25 discovered unit tests passed (21 web + 4 API); 3 workspace builds passed; 12 final screens captured.  
**Qualification:** Web lint passed. Root lint is not green; API/shared config is missing.  
**Risk:** 14 dependency findings: 4 moderate · 8 high · 2 critical  
**Footer:** PostgreSQL integration, load, security, and production NFRs remain unverified.  
**Visual:** Three large evidence numbers with a clearly separated qualification band.

### Slide 9 — The Path from Prototype to Production
**Headline:** Integrate safely before scaling widely.  
**Three stages:** 1) Stabilize; 2) Integrate; 3) Prove.  
**Closing line:** No production-readiness claim is made today.  
**Visual:** Three gated milestones with explicit exit evidence.

### Slide 10 — One Coherent Workflow. A Clear Next Step.
**Takeaways:** Usable pharmacy operations prototype; Transparent evidence and documented boundaries; Practical path to a shared, production-ready system.  
**Closing line:** WellSpring One makes the daily workflow visible — and the remaining integration work explicit.  
**Visual:** Ocean closing field, small product montage, repository and documentation pointers.

---

## 6. Presenter and Live-Demo Script

*Source: `docs/PRESENTER_DEMO_SCRIPT.md`*

### Before the Defense

1. Use Node.js 20+, run `npm ci`, then start the browser prototype.
2. Open an isolated browser profile. Do not enable API mode.
3. Sign in as administrator, open **Offline & sync**, and reset demo data.
4. Verify Dashboard, POS, Inventory, Purchasing, Reports, and Offline & sync open.
5. Keep the PDF deck and screenshots available as a no-server fallback.
6. Do not enter real personal, patient, payment, or company data.

**Timing strategy:** ~8 minutes 25 seconds talk track. Optional 60-second live moment on Slide 6 for ~9 minutes 25 seconds total.

### Slide-by-Slide Talk Track

**Slide 1 (0:30):** "WellSpring One is a pharmacy operations prototype that brings sales, inventory, purchasing, reporting, and an offline workflow into one coherent workstation. I will show what works in the browser, then separate that evidence from the backend source and the production work still required."

**Slide 2 (0:45):** "A pharmacy sale affects more than revenue. Stock must change, purchasing must see what is running low, and managers need the same transaction history. When these records are disconnected, staff reconcile them manually and decisions arrive late."

**Slide 3 (0:45):** "From one login, an authorized user can sell and print, count and replenish, approve and receive, and report and audit. This dashboard is not a static mock-up: its metrics and alerts derive from the same local demo records used by the other pages. The important qualifier is 'local'; this is not yet a centralized eight-branch database."

**Slide 4 (1:10):** "In this captured transaction, two Paracetamol and one alcohol move through cart, payment, receipt, and stock update. Receipt WS-2026-01009 records the sale. Paracetamol falls from 184 to 182, and alcohol from 64 to 63. That demonstrates the intended sale-to-stock relationship, including one-time deduction. It does not prove concurrent tills, payment-provider settlement, or accounting integration."

**Slide 5 (0:50):** "Inventory supports search, low-stock and expiry filters, valuation, and physical counts with a reason. Purchasing uses a role handoff: purchasing drafts, a manager approves, and purchasing or inventory receives. Receiving updates local stock. Multi-line seeded orders are visible, although the new-order form creates one line. Partial receiving, supplier maintenance, and automatic multi-batch FEFO remain outside the browser demo."

**Slide 6 (1:00 + optional 1:00 live):** "When the user simulates offline mode, a sale is saved and queued in this browser, and stock is deducted immediately. After the user restores the simulated connection and selects Sync, the queue clears without a second stock deduction. This demonstrates state handling and duplicate-deduction prevention in the prototype. It is not real server synchronization."

**Optional live moment:** Show pending entry → state quantity → restore online → select Sync → show cleared queue and unchanged quantity → stop.

**Slide 7 (1:00):** "The repository has two layers. The React browser demonstrates operational workflows with localStorage. Separately, Express, Prisma, and PostgreSQL implement 62 API handlers plus health in source. API mode changes authentication only; it does not move POS or inventory onto the database. PostgreSQL runtime integration was not verified in this environment. Presenting these as one deployed system would be inaccurate."

**Slide 8 (0:55):** "All 25 discovered unit tests passed: 21 in the web workspace and four in the API. API, web, and shared builds passed, web lint passed, and twelve final screens were captured. But root lint is not green because API and shared lint configuration is missing, the shared workspace has no test script, and the dependency audit reports fourteen findings. These are recorded handover items, not hidden behind a success claim."

**Slide 9 (0:55):** "The first gate is stabilization: migrations, reproducible CI, complete lint and tests, and dependency remediation. The second is integration: one server-backed operational data path, strong action and branch authorization, consistent tax rules, and idempotent offline commands. The third is proof: eight-branch acceptance, recovery exercises, compliance review, and measured performance, availability, synchronization, and backup targets. None of those production claims is made today."

**Slide 10 (0:35):** "WellSpring One demonstrates a usable pharmacy workflow, supports it with transparent evidence, and documents the remaining integration and production gates. The next step is not more screens; it is a secure shared data path, proven end to end."

### Questions to Expect

1. **"Is this already connected to PostgreSQL?"** — No. Browser uses localStorage; Express/Prisma/PostgreSQL source exists but is not wired.
2. **"Does offline mode really synchronize?"** — Not to a server. Demonstrated queue is manual local simulation.
3. **"What was actually tested?"** — 25 unit tests, 3 builds, web lint, browser checks, captured workflows. Root lint/shared test script issues documented.
4. **"Can different branches use it now?"** — Not as centralized system. Each browser profile has own demo state.
5. **"What is the highest-risk next task?"** — Server-backed operational path: action/branch authorization, consistent tax, audit redaction, idempotent sync, migrations, integration tests.
6. **"Why are there dependency findings?"** — 14 findings disclosed. Remediation should be deliberate with compatibility testing.

---

## 7. Two-Week Sprint Gantt Chart — Editable Task Table

**Period:** November 25 – December 6, 2026 (10 working days)

**Team:** Christopher Lyod B. Mercado (CL), Frankie Dhon M. Pelayo (FP), Mark Steven S. Punto (MS), Rick Lorenz T. Perez (RP), Asaph Andrie R. Ildefonso (AI), Mave M. Ancog (MA), John Lloyd B. Otero (JO), Jannel C. Pondoyo (JP), Erlyn A. Ongcoy (EO), Bianca Benaldo (BB)

| ID | Task | Phase | Dur (d) | Start | End | Assignees |
|---|---|---|---|---|---|---|
| 1.1 | Sprint kickoff, scope freeze | Project Setup | 0.5 | Nov 25 | Nov 25 | CL, FP, MS, RP, AI, MA, JO, JP, EO, BB |
| 1.2 | Tech stack & repo setup | Project Setup | 1.0 | Nov 25 | Nov 25 | CL, MS, RP |
| 1.3 | UI/UX wireframes | Project Setup | 1.0 | Nov 25 | Nov 25 | FP, MA, JP |
| 1.4 | Database schema finalize | Project Setup | 0.5 | Nov 25 | Nov 25 | AI, EO, BB |
| 2.1 | Auth & RBAC | Core Backend | 1.5 | Nov 25 | Nov 26 | CL, RP, AI |
| 2.2 | Product & Inventory API | Core Backend | 1.5 | Nov 25 | Nov 26 | MS, EO, BB |
| 2.3 | Sales / POS API | Core Backend | 1.5 | Nov 25 | Nov 26 | CL, FP, MA |
| 2.4 | Purchasing API | Core Backend | 1.5 | Nov 25 | Nov 26 | MS, JP, AI |
| 2.5 | Reporting & Accounting Sync | Core Backend | 1.0 | Nov 25 | Nov 25 | RP, EO, BB |
| 3.1 | Layout & Auth screens | Frontend | 1.0 | Nov 25 | Nov 25 | FP, MA, JP |
| 3.2 | POS Screen | Frontend | 1.5 | Nov 25 | Nov 26 | CL, FP, MA |
| 3.3 | Inventory Screens | Frontend | 1.5 | Nov 25 | Nov 26 | MS, EO, JP |
| 3.4 | Purchasing Screens | Frontend | 1.0 | Nov 25 | Nov 25 | AI, RP, BB |
| 3.5 | Reports & Dashboards | Frontend | 1.0 | Nov 25 | Nov 25 | CL, MA, JP |
| 3.6 | Admin Screens | Frontend | 0.5 | Nov 25 | Nov 25 | RP, EO, BB |
| 4.1 | Service Worker + IndexedDB | Offline & Sync | 1.0 | Nov 25 | Nov 25 | CL, MS, RP |
| 4.2 | Conflict resolution | Offline & Sync | 0.5 | Nov 25 | Nov 25 | MS, AI, EO |
| 5.1 | Unit + Integration tests | Testing & QA | 1.0 | Nov 25 | Nov 25 | ALL |
| 5.2 | E2E flows (Playwright) | Testing & QA | 1.0 | Nov 25 | Nov 25 | CL, MS, FP |
| 5.3 | Offline scenario tests | Testing & QA | 0.5 | Nov 25 | Nov 25 | RP, MA, JP |
| 5.4 | Performance & BIR check | Testing & QA | 0.5 | Nov 25 | Nov 25 | AI, EO, BB |
| 6.1 | Docker / K8s manifests | Deployment | 0.5 | Nov 25 | Nov 25 | CL, RP |
| 6.2 | Staging deploy + UAT | Deployment | 1.0 | Nov 25 | Nov 25 | ALL |
| 6.3 | Production deploy | Deployment | 0.5 | Nov 25 | Nov 25 | CL, MS |
| 6.4 | Documentation & Handover | Deployment | 1.0 | Nov 25 | Nov 25 | ALL |
| 6.5 | Retrospective & Buffer | Deployment | 1.0 | Nov 25 | Nov 25 | ALL |

**Notes:**
- Working days only (Mon–Fri); weekends non-working.
- Duration in working days; 0.5 = half day (4 hrs).
- UAT = User Acceptance Testing with Branch Managers (Dec 3).
- BIR = Bureau of Internal Revenue compliance checks on receipt format.

---

## Appendix A. Gantt Chart — Original Document Facsimiles

The following two pages reproduce the original `GANTT_TWO_WEEK_PLAN.pdf` for layout fidelity. These are included as images in the DOCX/PDF versions of this document.

- `gantt-page-01.jpg` — Page 1 of the original Gantt chart
- `gantt-page-02.jpg` — Page 2 of the original Gantt chart

---

## Appendix B. RFP Use Case Specification — Original Document Facsimiles

The following 25 pages reproduce the original `USE_CASE_SPECIFICATION_RFP.pdf` for layout fidelity. This is a planning artifact, not production acceptance evidence.

- `use_case-page-01.jpg` through `use_case-page-25.jpg` — All 25 pages of the original use case specification

---

*End of combined documentation. The Markdown files remain the authoritative editable text sources. The DOCX/PPTX are editable presentation formats; PDFs are fixed reading copies. Regenerate all derived files after substantive edits so the evidence stays consistent.*