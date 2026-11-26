# WellSpring One — Requirements Specification

**Project:** WellSpring One integrated pharmacy POS, inventory, and supplier management  
**Course:** Systems Integration and Architecture  
**Instructor:** Jessa May Condino  
**Version:** 1.0 documentation baseline  
**Source-review date:** November 25, 2026  
**Status:** Prototype requirements and production gap analysis; not a production acceptance certificate

## 1. Purpose and sources

This specification translates the WellSpring Request for Proposal (RFP) into verifiable system requirements and distinguishes them from the current implementation. It uses two authorities:

1. The 16-page RFP dated November 10, 2026, especially FR-01–FR-13 and PR-01–PR-06.
2. The WellSpring One source tree, including the React prototype, Express routes, shared permission matrix, Prisma schema, seed data, and existing unit-test files.

Source review establishes what code exists. It does **not** establish that a workflow has passed runtime testing, that the browser uses an API route, or that a production control is operational.

### 1.1 Evidence terms used in this document

| Term | Meaning |
|---|---|
| **Browser prototype** | Behavior implemented by the React pages and contexts. Its operational data is stored in browser `localStorage` by default. |
| **API surface** | Express/Prisma code that defines a backend capability. The route still requires integration, migration, and runtime verification. |
| **Production target** | An RFP obligation or proposed future capability that is not demonstrated by the current prototype. |
| **Partial** | Some useful behavior exists, but one or more mandatory parts of the RFP requirement remain open. |
| **Not demonstrated** | No adequate implementation or objective evidence was found. |

## 2. Project team

Christopher Lyod B. Mercado, Frankie Dhon M. Pelayo, Mark Steven S. Punto, Rick Lorenz T. Perez, Asaph Andrie R. Ildefonso, Mave M. Ancog, John Lloyd B. Otero, Jannel C. Pondoyo, Erlyn A. Ongcoy, and Bianca Benaldo.

## 3. Business context and objectives

WellSpring Pharmacy & Retail Corp. operates eight branches in the Davao Region and has about 120 staff. Standalone POS terminals, spreadsheets, and manual logs currently separate sales, stock, supplier, and accounting work.

The desired system shall:

- give branch staff and head office a shared view of sales and inventory;
- track medicine batches and expiry dates and enforce first-expiry-first-out (FEFO) issuing;
- support controlled purchasing, receiving, void/refund, and user administration;
- reduce manual consolidation and accounting re-keying;
- provide accurate, legally compliant receipts and reports; and
- maintain service during connectivity interruptions.

The current browser prototype demonstrates a **single WS01 Davao Main workflow**. It is not an eight-branch deployment.

## 4. Scope

### 4.1 Current browser-prototype scope

- Sign-in using eight seeded demo identities, or API authentication when `VITE_USE_API=true`.
- Point of sale: product/SKU/barcode text search, cart, customer type, payment selection, prescription confirmation, browser receipt display, and browser printing.
- Inventory: one batch/expiry record per demo product, stock and expiry filters, physical-count adjustment, and recent stock movements.
- Purchasing: a fixed supplier list, one-line purchase orders, draft approval, and full receipt into stock.
- Reports: local sales metrics, charts, a transaction register, and CSV export.
- Administration: local staff records, activation/deactivation, and a local operational event list.
- Offline demonstration: a manual connection simulator, offline sale queue, explicit user-triggered synchronization, and demo reset.

### 4.2 Separate Express/PostgreSQL API surface

The repository also contains API routes for authentication, users, branches, products, inventory, sales, purchasing, reports, administration, and synchronization. These routes use PostgreSQL through Prisma. They are **not proof of an integrated production system**: except for optional login/logout, the prototype pages continue to use their local state rather than these resources.

### 4.3 Not established by the current implementation

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

## 5. Stakeholders and role-based user requirements

The shared role names below are used by both the browser and backend. “Prototype access” describes the page and action checks in source; it is not a security certification.

| Stakeholder / role | User requirements | Prototype access |
|---|---|---|
| **Cashier** (`CASHIER`) | Find items quickly, sell available stock, calculate totals and change, record payment references, confirm prescription review, and issue a receipt. | POS create/read; Offline & sync. No Inventory, Purchasing, Reports, or Administration page. |
| **Store supervisor** (`STORE_SUPERVISOR`) | Sell, supervise branch sales, adjust stock, and review branch reports. | POS create; Inventory read/adjust; Sales reports; Offline & sync. No Administration page. |
| **Pharmacist** (`PHARMACIST`) | Support prescription sales and inspect batch/expiry information without unnecessary stock-editing rights. | POS create/read; Inventory page through `inventory:batch_manage`, read-only count controls; Offline & sync. |
| **Inventory staff** (`INVENTORY_STAFF`) | Inspect stock and batches, record counts and adjustments, receive goods, and view inventory-related reports. | Read-only POS; Inventory count/adjust; Purchasing receiving only; Reports; Offline & sync. |
| **Purchasing officer** (`PURCHASING_OFFICER`) | Draft supplier orders and receive goods; approval remains with a manager unless an administrator is used. | Purchasing create/receive; Offline & sync. No POS, Inventory, Reports, or Administration page. |
| **Branch manager** (`BRANCH_MANAGER`) | Review branch sales/stock, approve purchase orders, and inspect local audit events without system-wide user administration. | Read-only POS; Inventory read-only; Purchasing approval; Reports; Audit & controls; Offline & sync. |
| **Head-office manager** (`HEAD_OFFICE_MANAGER`) | Review cross-branch performance and inventory while retaining branch purchasing oversight. | Read-only POS; Inventory read-only; Purchasing approval; local Sales reports; Offline & sync. The browser does not provide consolidated eight-branch data. |
| **System administrator** (`SYSTEM_ADMIN`) | Administer users and branches, inspect audit records, configure the system, and support every operational role. | All prototype pages and actions through the administrator bypass. |
| **Buyer / business owner** | Obtain measurable stock, reporting, compliance, availability, and financial outcomes within the approved schedule and budget. | No separate prototype identity; evaluates requirements and acceptance evidence. |
| **Auditor / compliance reviewer** | Trace transactions and access changes, protect personal data, and validate receipt/report compliance. | Branch manager and administrator can inspect the local event list; tamper evidence and legal compliance remain production work. |
| **API integrator / IT support** | Use documented REST interfaces, secure credentials, isolate branches, diagnose health, and recover data safely. | Express routes and health endpoints exist; integration and operational readiness require verification. |

### 5.1 Cross-role workflow requirements

- A normal, non-administrator purchasing demonstration requires role handoff: purchasing officer drafts, branch or head-office manager approves, and purchasing officer or inventory staff receives.
- Every stock-changing action should identify the actor, timestamp, product, quantity change, and reason.
- Users must see only the navigation and actions allowed to their role, but server-side authorization must remain authoritative in production.
- Head-office consolidation must use central data rather than another browser’s local demo records.

## 6. Functional requirements and prototype-versus-production traceability matrix

“Current evidence” is deliberately limited to observed source behavior. “Production acceptance / remaining gap” states what must still be proven.

| ID | RFP requirement | Current evidence | Production acceptance / remaining gap |
|---|---|---|---|
| **FR-01** | Process cash, debit/credit card, e-wallet, and installment payments. **Shall.** | **Partial — browser prototype:** Cash, `CARD`, `E_WALLET`, and `INSTALLMENT` can be selected. Cash validates tender and computes change. Card/e-wallet require an authorization reference. Installment displays an agreement-reference field but has no provider workflow. **API surface:** the same four enum values are accepted. | Integrate and reconcile real card, wallet, and installment providers; handle timeout, duplicate authorization, cancellation, settlement, and provider errors. Prove all four methods end to end. No payment-gateway transaction is currently demonstrated. |
| **FR-02** | Print BIR-compliant receipts and support void/refund with audit trail. **Shall.** | **Partial:** The browser displays a printable receipt using `window.print()`. It has no void/refund screen. API routes define void/refund with reasons and stock restoration. API receipt data contains placeholder TIN `000-000-000-000` and MIN `123456789`. | Configure verified company/branch registration data, required receipt fields and serial controls, accredited printing where applicable, and regulatory review. Test void/refund permissions, stock effects, accounting effects, and audit evidence. Placeholder values must not be used as evidence of BIR compliance or certification. |
| **FR-03** | Track inventory in real time across all branches. **Shall.** | **Partial:** Sales, counts, and receiving update one browser’s WS01 stock immediately. The Prisma model and API queries include `branchId`; seed data defines three branches, not eight. | Connect every branch to a central authoritative store; test concurrent updates and fresh cross-branch visibility for all eight branches. Local browser updates are not real-time multi-branch synchronization. |
| **FR-04** | Track stock by batch and expiry and enforce FEFO issuing. **Shall.** | **Partial:** The browser shows one batch and expiry per product. API sales accept an optional `batchId`, check the selected batch’s expiry, and sort some batch inquiries by expiry. The sale route does not select the earliest-expiry batch automatically. | Allocate available stock from the earliest unexpired eligible batch under concurrent checkout, record batch movements, prevent expired issue, and test ties and insufficient-batch quantities. Automatic FEFO must not be inferred from a caller-supplied `batchId`. |
| **FR-05** | Alert at reorder points or approaching expiry. **Shall.** | **Partial:** The browser computes low-stock, expiry-watch, and expired statuses and filters; expiry watch is 90 days. API stock inquiry computes a 30-day near-expiry flag and exposes reorder and expiry-report endpoints. | Agree thresholds and recipients, deliver visible/actionable notifications across roles and branches, test boundary dates, and avoid duplicate/unresolved alerts. No push notification, scheduled alert job, or automatic PO generation is demonstrated. |
| **FR-06** | Manage suppliers, purchase orders, and goods-received notes. **Shall.** | **Partial:** The browser has three fixed supplier names and one-line POs with `DRAFT → SENT → RECEIVED`; receiving adds full quantities to local stock. API adds supplier CRUD, multi-line POs, GRNs, and invoice comparison. API GRN creation records received quantities but does not create/update stock levels or product batches. | Add complete supplier maintenance UI, partial/discrepant receiving, batch creation, stock posting, approval controls, and accounting handoff. Verify GRN-to-stock behavior independently; browser receiving and API GRN behavior are not equivalent. |
| **FR-07** | Consolidate sales and inventory across branches into dashboards. **Shall.** | **Partial — API surface only for consolidation:** The browser reports only its local sales register. `GET /api/reports/dashboard/consolidated` contains cross-branch aggregates and an explicit head-office/administrator role check. Source review shows the route is statically reachable for those roles; it remains runtime-unverified and unused by the browser. | Verify authorization and branch scoping at runtime, integrate central data for eight branches, reconcile branch totals, and test freshness and date filtering. The browser must not be described as a consolidated dashboard. |
| **FR-08** | Enforce role-based access control and user permissions. **Shall.** | **Partial:** React hides navigation and disables actions using shared permissions; protected pages deny unauthorized roles. API uses JWT verification, fresh active-user checks, route-level permissions, and branch scoping. Several API mounts apply read permission to all HTTP methods rather than action-specific permissions. Demo identity is stored in `localStorage`. | Enforce method/action-specific server authorization on every mutation, test horizontal and vertical privilege escalation, secure sessions, and verify account lifecycle end to end. Browser checks alone are not a security boundary. |
| **FR-09** | Integrate with existing accounting software. **Shall.** | **Not demonstrated.** Environment examples contain commented accounting URL/key entries. Invoice matching writes an audit event when matched and contains a comment about a future accounting push; no accounting client or confirmed export exists. | Obtain the accounting API contract and credentials, map sales/tax/payables, implement authenticated delivery with idempotency/retry/reconciliation, and prove no manual re-keying in UAT. |
| **FR-10** | Operate offline and synchronize automatically when connectivity returns. **Should.** | **Partial:** A manual simulator switches the browser state. Offline sales are stored locally and stock is deducted once. After the user restores the simulated connection, the user must select **Sync**; this only changes local status and clears the local queue. An unconnected API `/sync` surface also exists. | Implement real connectivity detection, durable authenticated upload, automatic reconnect retry, idempotency, conflict handling, and server acknowledgement. Test duplicates, stock conflicts, expired sessions, and interrupted uploads. Do not describe manual local status changes as server synchronization. |
| **FR-11** | Support barcode scanning and optional RFID. **Shall for barcode; RFID optional.** | **Partial:** POS search matches the stored barcode field and inventory supports text search. A keyboard-wedge scanner may be able to type into search, but no scanner-specific integration or hardware test is present. No RFID implementation was found. | Test supported scanners, exact/full-code handling, scan focus, invalid codes, and receipt/label printers on branch hardware. Treat RFID as an optional separately evaluated component, not an implemented feature. |
| **FR-12** | Maintain a complete, tamper-evident audit trail. **Shall.** | **Partial:** The browser appends actor/timestamp events for major local actions, but reset or browser storage editing can remove/change them. API has an `AuditLog` model and request/manual logging. Audit write failures are logged without failing the request; no hash chain, signing, WORM storage, or equivalent tamper-evidence control was found. | Define audited events and retention, protect audit writes and reads, make tampering detectable, synchronize clocks, and test completeness during failures. Current event records must not be called a complete tamper-evident trail. |
| **FR-13** | Support price promotions, discounts, and loyalty functions. **Should.** | **Partial:** Browser senior/PWD selection applies a 20% discount and removes VAT. `LOYALTY` is selectable but has no points or member workflow in the browser. API calculates earned points but does not apply a promotion engine or a demonstrated points balance/redemption process. | Validate statutory calculations with compliance reviewers; implement promotion eligibility/stacking and loyalty enrollment, accrual, balance, redemption, expiry, and reversal. Reconcile different frontend/backend senior/PWD tax calculations before release. |

## 7. Business and data rules

These are current prototype rules unless explicitly identified as targets:

- Currency is Philippine pesos (PHP), displayed to two decimals.
- Regular sales treat entered product prices as VAT-exclusive: `total = subtotal − discount + VAT`, with a 12% VAT rate.
- Browser senior/PWD sales apply 20% of the after-item-discount subtotal as statutory discount and set VAT to zero.
- Browser quantities must be positive whole numbers and cannot exceed available stock.
- A cart containing a prescription item requires explicit confirmation that a pharmacist checked the prescription and patient details.
- Card and e-wallet checkout requires a nonblank reference. Cash tendered must cover the total.
- Browser stock counts require a nonnegative whole-number counted quantity and a reason.
- The browser’s new-PO form creates one product line; seeded demo orders may contain multiple lines. Browser orders progress only from draft to sent to received.
- The RFP’s target stock accuracy is at least 98%, reporting consolidation under two hours, and POS confirmation under two seconds; these are not measured prototype results.
- Shared constants mention backup, retry, retention, and recovery values. Constants alone are not operating controls or evidence.

## 8. Measurable non-functional requirements

All execution results are open. The test methods below make the RFP measurable without inventing results.

| ID | Required target | Measurement and acceptance evidence | Current status |
|---|---|---|---|
| **PR-01** | POS transaction confirmation in **under 2 seconds**. | Time from checkout submission to confirmed receipt, including server/payment work in the production path. Report sample size, data volume, network, and p50/p95/p99; every mandatory acceptance sample must satisfy the agreed threshold, with any percentile stricter than the RFP recorded separately. | **Not verified.** The demo adds an artificial 350 ms login delay, which is not a POS benchmark. No payment-gateway timing exists. |
| **PR-02** | At least **50 concurrent users per branch**. | Run a representative 50-concurrent-user workload per branch with sales, stock reads, and reports; then test the agreed eight-branch profile. Meet PR-01 and the agreed error ceiling without data corruption. | **Not verified.** No load-test report or 50-user evidence exists. |
| **PR-03** | At least **99.5% availability during business hours**. | Define business hours and exclusions before measurement. Use independent monitoring and incident records over an agreed production window; `(available business minutes / total business minutes) × 100 ≥ 99.5`. | **Not verified.** No deployed service-level monitoring exists. |
| **PR-04** | Nightly cross-branch synchronization within **60 minutes**. | With production-representative data and eight branches, measure nightly start to all branches acknowledged/reconciled; complete within 60 minutes without unresolved conflicts. | **Not verified.** The browser has manual local synchronization only. |
| **PR-05** | Automated backups at least every **4 hours**. | Inspect scheduler and backup logs for at least 48 hours, confirm no gap exceeds four hours, validate backup integrity, and perform a test restore. | **Not implemented/proven.** `/api/admin/backup-status` returns generated placeholder values, not a backup-job query. |
| **PR-06** | Recovery from failure within **1 hour RTO**. | In an authorized isolated recovery exercise, record failure declaration to restored service and validate data consistency. Elapsed recovery must be ≤60 minutes. | **Not verified.** No recovery runbook or exercise evidence exists. |
| **NFR-07** | Encrypt branch/head-office communication and remote administration with TLS. | Deployment inspection and TLS scan show HTTPS-only external access, valid certificates, secure redirect/policy, and no plaintext credentials. | **Production target.** Local development uses HTTP. |
| **NFR-08** | Support RA 10173 and applicable BIR duties. | Complete data inventory, minimization, retention/deletion rules, access review, incident process, and legal/compliance sign-off; test that logs/exports expose only necessary data. | **Not assessed or certified.** No real patient data should be entered in the demo. |
| **NFR-09** | Run on current supported operating systems and browsers. | Publish a support matrix and pass smoke tests on the agreed current browser/OS combinations and branch screen sizes. | **Not verified.** No compatibility matrix or results are included. |
| **NFR-10** | Achieve at least **98% real-time stock accuracy**. | Reconcile system quantities with independent physical counts by SKU/batch/branch using a documented formula and sample; achieve ≥98% at all eight branches. | **Not verified.** Local demo calculations do not prove store accuracy. |
| **NFR-11** | Train and certify at least **90% of users before full rollout**. | Attendance and role-based assessment records show at least 90% of the intended roster passed before full deployment. | **Production target.** No training records are included. |
| **NFR-12** | Provide open, documented APIs and editable English documentation. | Review versioned REST documentation against implemented paths and execute integration examples; deliver editable user, admin, architecture, test, and API documents. | **Partially satisfied by source/docs only.** No generated OpenAPI specification or external integration certification is present. |

## 9. Assumptions and dependencies

### 9.1 Assumptions requiring confirmation

- WS01 Davao Main is the demonstration branch; the RFP’s eight actual branch identities, locations, and migration sources are not supplied in the repository.
- Product prices in the browser are VAT-exclusive. Compliance reviewers must confirm receipt and senior/PWD tax treatment before production.
- The accounting vendor, interface version, authentication method, chart-of-accounts mapping, and sandbox were not provided.
- Hardware models, network capacity, business hours, deployment region, data volumes, retention policy, and recovery infrastructure remain to be confirmed.
- Demo identities and `password123` are for local evaluation only, never production credentials.
- No real customer, patient, payment, or employee information is required for the prototype.

### 9.2 Technical dependencies

- Node.js 20 or later and npm workspaces for local setup.
- A modern browser with JavaScript and `localStorage` enabled for the prototype.
- PostgreSQL for every Prisma-backed API operation; the provided Compose file selects PostgreSQL 16.
- API environment values including `DATABASE_URL`, a strong `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, and `FRONTEND_URL`.
- `VITE_USE_API=true` to use API login; `VITE_API_URL` identifies the API origin. Other prototype workflows remain local even in this mode.
- Future production dependencies include TLS termination, accounting/payment provider contracts, centralized deployment, monitoring, backup infrastructure, and approved branch hardware.

## 10. Acceptance and release boundaries

A prototype demonstration may accept only the explicitly observed local workflows and their test evidence. Production acceptance must separately include:

1. Every mandatory **shall** requirement, with FR-10 and FR-13 tracked as **should** items rather than silently dropped.
2. Functional, integration, security, performance, migration, and UAT evidence.
3. No critical defects at UAT sign-off and a buyer-defined acceptance period, as required by the RFP.
4. Reconciliation across all eight branches and the accounting system.
5. Independent evidence for PR-01–PR-06; configuration values or placeholder endpoints are insufficient.
6. Privacy/BIR review, approved support and recovery procedures, and role-based training records.

See [TEST_PLAN.md](TEST_PLAN.md) for reproducible, unexecuted test cases and [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md) for implementation boundaries and known mismatches.
