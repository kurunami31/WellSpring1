# WellSpring One

A responsive pharmacy POS, inventory, purchasing, reporting, administration, and offline-workflow prototype built with React, TypeScript, Express, Prisma, and PostgreSQL.

> **Current boundary:** the demonstrated browser workflows use `localStorage`. The Express/PostgreSQL layer is present in source but is not the operational data source for those pages and was not runtime-verified with PostgreSQL for this submission.

## Run the browser prototype

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev --workspace=@wellspring/web -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`.

- Administrator: `admin@wellspring.ph`
- Demo password: `password123`
- Branch: `WS01 · Davao Main`

These are demo-only credentials. Use synthetic data only. No PostgreSQL server is needed for the local browser demonstration.

## Documentation

Start with **[docs/SUBMISSION_GUIDE.md](docs/SUBMISSION_GUIDE.md)**.

| Document | Purpose |
|---|---|
| [Requirements](docs/REQUIREMENTS.md) | RFP traceability, measurable targets, implementation gaps |
| [Test plan](docs/TEST_PLAN.md) | Executed evidence, ready-to-run cases, defects, acceptance gates |
| [Technical guide](docs/TECHNICAL_GUIDE.md) | Architecture, all API handlers, data model, security, handover |
| [Presentation source](docs/PRESENTATION.md) | Ten-slide defense narrative |
| [Presenter/demo script](docs/PRESENTER_DEMO_SCRIPT.md) | Timed talk track and fallback demo |

The combined `docs/WELLSPRING_ONE_SYSTEM_DOCUMENTATION.docx/.pdf` contains the full user, requirements, technical, QA, Gantt, use-case, and defense documentation. Its Markdown source is included. The RFP use-case and two-week Gantt files are also retained separately as planning artifacts, not production acceptance evidence. The editable defense PPTX and fixed PDF copies are in `docs/`.

## Verification snapshot

- 21/21 web unit tests and 4/4 API unit tests passed.
- API, web, and shared builds passed; web lint passed.
- Root lint is not green because API/shared ESLint configuration is missing.
- Root test execution also reports that the shared workspace has no test script.
- `npm audit --json` reported 4 moderate, 8 high, and 2 critical findings; no automatic force fix was applied.

See the test plan before interpreting these results as anything beyond prototype evidence.

## Handover priorities

1. Reproducible CI, lint configuration, migration baseline, and dependency remediation.
2. Backend action/branch authorization, session restoration, audit redaction, consistent tax rules, and idempotent sync.
3. One server-backed operational data path, followed by pharmacy controls and offline integration.
4. Eight-branch UAT, measured PR-01–PR-06, recovery, compliance, and production operations evidence.

Do not commit `.env` files or secrets. The existing Compose and CI/CD definitions are drafts; see the technical guide before using them.
