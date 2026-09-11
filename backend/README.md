# SettleX Backend

**"Trust Every Deal. Settle Every Milestone."**

Digital Escrow and Trust Platform for MSME Transactions — Backend API.

---

## Architecture Overview

```
backend/
├── src/
│   ├── config/
│   │   ├── constants.js    # Enums, state machine, trust weights
│   │   ├── db.js           # MongoDB connection
│   │   └── env.js          # Centralised environment config
│   ├── controllers/        # Request handlers (thin — delegate to services)
│   ├── middleware/
│   │   ├── auth.js         # JWT authentication
│   │   ├── authorize.js    # Role-based access control
│   │   ├── errorHandler.js # Global error handler
│   │   └── validate.js     # express-validator result checker
│   ├── models/
│   │   ├── User.js         # Users + business verification
│   │   ├── Deal.js         # Deals + embedded escrow ledger
│   │   ├── Milestone.js    # Milestones with state machine status
│   │   ├── Transaction.js  # Simulated escrow transactions
│   │   ├── Evidence.js     # Evidence files + AI analysis results
│   │   ├── Dispute.js      # Structured dispute workflow
│   │   ├── TrustEvent.js   # Trust score events
│   │   ├── AuditLog.js     # Immutable audit trail
│   │   └── index.js        # Barrel export
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── deal.routes.js
│   │   ├── milestone.routes.js
│   │   ├── transaction.routes.js
│   │   ├── evidence.routes.js
│   │   ├── dispute.routes.js
│   │   ├── trust.routes.js
│   │   ├── admin.routes.js
│   │   ├── ai.routes.js
│   │   └── index.js        # Central route registry
│   ├── services/
│   │   ├── ai.service.js      # LLM abstraction (isolated, fail-safe)
│   │   ├── audit.service.js   # Audit logging
│   │   └── escrow.service.js  # State machine validator
│   ├── utils/
│   │   ├── ApiResponse.js  # Consistent JSON responses
│   │   ├── AppError.js     # Custom error class
│   │   └── catchAsync.js   # Async error wrapper
│   └── app.js              # Express application assembly
├── server.js               # Entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Core Design Principles

| Principle | Implementation |
|---|---|
| **AI understands, rules decide** | AI service is isolated; it can never authorise financial transitions |
| **Backend-only financial logic** | State transitions, release, refund are validated exclusively on the backend |
| **Double-release protection** | Strict state machine + idempotency keys prevent duplicate releases |
| **Simulated escrow** | No real money — a ledger tracks locked / released / refunded amounts |
| **Deterministic state machine** | `MILESTONE_TRANSITIONS` in `constants.js` defines every legal transition |
| **AI failure tolerance** | If the LLM API is down, the escrow workflow continues unblocked |

---

## Escrow State Machine

```
CREATED → FUNDED → LOCKED → MILESTONE_IN_PROGRESS → EVIDENCE_SUBMITTED → UNDER_REVIEW → APPROVED → RELEASED

                                                      EVIDENCE_SUBMITTED → DISPUTED → HUMAN_REVIEW → RELEASED / REFUNDED
```

---

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, AI key, etc.
```

### 3. Start the server

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

### 4. Verify

```
GET http://localhost:5000/api/health
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `NODE_ENV` | No | `development` / `production` / `test` |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default `7d`) |
| `AI_PROVIDER` | No | `gemini` / `openai` / `azure` |
| `AI_API_KEY` | No | API key for the LLM provider |
| `AI_MODEL` | No | Model identifier |
| `UPLOAD_DIR` | No | Directory for evidence files |
| `MAX_FILE_SIZE_MB` | No | Max upload size (default `10`) |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default 15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window (default `100`) |
| `CORS_ORIGIN` | No | Allowed frontend origin |

---

## API Endpoints (Placeholder Architecture)

| Prefix | Purpose |
|---|---|
| `/api/auth` | Register, login, current user |
| `/api/users` | User profiles |
| `/api/deals` | Create / list / accept / reject deals, escrow status |
| `/api/milestones` | Create milestones, state transitions, approvals |
| `/api/transactions` | Simulated escrow transaction history |
| `/api/evidence` | Upload, list, download evidence |
| `/api/disputes` | Raise, respond, resolve disputes |
| `/api/trust` | Trust profile and event history |
| `/api/admin` | Admin dashboard APIs |
| `/api/ai` | AI-assisted features (suggestions, analysis, summaries) |
| `/api/health` | Health check |

---

## Roles

| Role | Capabilities |
|---|---|
| **BUYER** | Create deals, define milestones, review evidence, approve milestones, raise disputes |
| **SELLER** | View incoming deals, accept/reject, upload evidence, respond to disputes |
| **ADMIN** | Manage users, verification, disputes, escrow overview, audit logs, trust analytics |

---

## What's Next

1. **Auth controllers** — register, login, JWT issuance
2. **Deal + milestone controllers** — full CRUD with state machine enforcement
3. **Escrow ledger service** — fund, lock, release, refund with idempotency
4. **Evidence upload** — multer integration + secure file access
5. **Dispute engine** — structured workflow with locked amounts
6. **Trust scoring engine** — weighted calculation with configurable weights
7. **AI service implementation** — LLM calls with structured outputs
8. **Admin controllers** — dashboard, verification, audit log viewer
9. **Validation chains** — express-validator rules per route
10. **Testing** — unit + integration tests

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcryptjs
- **Security**: Helmet, CORS, rate limiting, RBAC
- **AI**: LLM API (Gemini / OpenAI) behind isolated service layer
- **File uploads**: Multer
- **Validation**: express-validator
