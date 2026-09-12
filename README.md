# SettleX

### Trust Every Deal. Settle Every Milestone.

SettleX is a **Digital Escrow and Trust Platform for MSME Transactions** designed to make business transactions safer, more transparent, and milestone-driven.

Small businesses often face delayed payments, incomplete deliveries, disputes, unclear agreements, and a lack of trust between buyers and sellers.

SettleX addresses this problem by combining:

- 🔐 Digital Escrow
- 🤖 AI-powered Document Intelligence
- 📊 Trust Scoring
- 📦 Milestone-based Transactions
- ⚖️ Structured Dispute Resolution
- 🧾 Evidence Verification
- 🔍 Complete Transaction Audit Trail

> **AI understands. Rules decide. Money moves only when conditions are satisfied.**

---

## 🚀 Problem

MSME transactions commonly depend on trust between two parties.

A typical transaction may involve:

1. Buyer places an order.
2. Seller starts production.
3. Payment is made before completion.
4. Delivery or quality issues occur.
5. One party disputes the transaction.
6. Payment gets delayed or becomes difficult to recover.

This creates risks for both buyers and sellers.

### Major challenges

- Delayed payments
- Incomplete deliveries
- Quality disputes
- Unclear milestones
- Lack of transaction transparency
- Limited trust history
- Manual document verification
- Difficult dispute resolution

SettleX introduces a structured digital workflow where every transaction has clearly defined milestones, evidence, and payment conditions.

---

# 💡 Our Solution

SettleX creates a controlled transaction environment where money is associated with specific milestones.

Instead of releasing the complete payment upfront:

```text
Buyer
  │
  ▼
Create Deal
  │
  ▼
Fund Escrow
  │
  ▼
Milestone Created
  │
  ▼
Seller Completes Milestone
  │
  ▼
Upload Evidence
  │
  ▼
AI Document Analysis
  │
  ▼
Buyer Review
  │
  ├── Approve ──► Release Milestone Payment
  │
  └── Dispute ──► Human Review


⭐ Key Features
🔐 Digital Escrow

Funds remain locked until the required milestone conditions are satisfied.

SettleX uses a simulated escrow ledger for the hackathon demonstration.

📦 Milestone-Based Payments

A deal can be divided into multiple milestones with separate:

Amounts
Due dates
Deliverables
Evidence requirements
Approval states
🤖 AI Document Intelligence

Gemini AI analyzes uploaded transaction documents and extracts structured information such as:

Order ID
Seller
Quantity
Date
Amount
Confidence score
Potential inconsistencies
⚖️ Dispute Resolution

Buyers can raise disputes when evidence does not match the expected transaction details.

AI can summarize the dispute and highlight inconsistencies for human review.

📊 Trust Score

Businesses build a trust profile based on transaction history, including:

Successful completions
On-time completion
Dispute rate
Cancellation rate
Response behaviour
🧾 Evidence Management

Sellers can upload documents such as:

Invoices
Delivery receipts
Challans
Production evidence
🔍 Audit Trail

Important transaction events are recorded to provide better transparency and traceability.

👥 Role-Based Access

SettleX supports:

Buyer
Seller
Admin

Each role receives appropriate permissions and workflows.

🧠 AI Safety Architecture

A core principle of SettleX is that AI never directly controls money.

Evidence
   ↓
Gemini AI
   ↓
Extracted Information
   ↓
Deterministic Backend Rules
   ↓
Escrow State Machine
   ↓
Settlement
AI does:
Understand documents
Extract information
Detect inconsistencies
Summarize disputes
Provide trust insights
AI does NOT:
Directly release money
Directly refund money
Directly change escrow state

Financial transitions are controlled by deterministic backend rules.

If AI fails, the workflow can continue through manual review.

🔄 Escrow Lifecycle
CREATED
   ↓
FUNDED
   ↓
LOCKED
   ↓
MILESTONE_IN_PROGRESS
   ↓
EVIDENCE_SUBMITTED
   ↓
UNDER_REVIEW
   ↓
APPROVED
   ↓
RELEASED
Dispute Flow
EVIDENCE_SUBMITTED
        ↓
     DISPUTED
        ↓
   HUMAN REVIEW
      ↙     ↘
 RELEASE    REFUND
🏗️ Architecture
                 ┌─────────────────┐
                 │   React + Vite  │
                 │    Frontend     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Express REST   │
                 │      API        │
                 └────────┬────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
      ┌───────┐       ┌────────┐     ┌──────────┐
      │ Auth  │       │ Deals  │     │ Evidence │
      │ JWT   │       │        │     │ Upload   │
      └───────┘       └────────┘     └─────┬────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  Gemini AI  │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │ Rule Engine │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │    Escrow   │
                                    │    Ledger   │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   MongoDB   │
                                    └─────────────┘
🛠️ Tech Stack
Frontend
React
Vite
Tailwind CSS
JavaScript
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
REST APIs
AI
Google Gemini API
Document Intelligence
Evidence Analysis
Dispute Summarization
Security
JWT Authentication
Role-Based Access Control
Request Validation
Rate Limiting
Audit Logging
Idempotency Protection
Backend-controlled Financial Transitions


🔮 Future Scope

SettleX can be extended with:

Real payment gateway integration
Production-grade escrow partnerships
GST invoice verification
Digital signatures
UPI/payment reconciliation
Advanced fraud detection
Automated business verification
Multi-language document processing
MSME credit scoring
Supplier discovery
Enterprise integrations
🌍 Impact
Buyers
Lower payment risk
Transparent milestones
Evidence-backed approvals
Structured dispute handling
Sellers
Faster milestone payments
Clear transaction conditions
Reputation building
Digital trust history
MSME Ecosystem
Better payment confidence
Reduced disputes
Improved transparency
Digital trust infrastructure
🏆 Vision

SettleX aims to make business transactions:

Verifiable.
Transparent.
Milestone-driven.
Trustworthy.

Agreement
    ↓
Milestones
    ↓
Escrow
    ↓
Evidence
    ↓
AI Understanding
    ↓
Rule Validation
    ↓
Human Approval
    ↓
Settlement