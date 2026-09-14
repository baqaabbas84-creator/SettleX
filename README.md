# SettleX

## Trust Every Deal. Settle Every Milestone.

SettleX is a Digital Escrow and Trust Platform designed for MSME transactions.

It helps buyers and sellers conduct safer, transparent, and milestone-based business transactions using:

- Digital Escrow
- Milestone-Based Payments
- AI-Powered Document Intelligence
- Evidence Verification
- Dispute Resolution
- Business Trust Scores
- Transaction Audit Trails

> AI understands. Rules decide. Money moves only when conditions are satisfied.

---

# Problem

MSME transactions often depend heavily on trust between buyers and sellers.

Common problems include:

- Delayed payments
- Incomplete deliveries
- Quantity or quality mismatches
- Payment disputes
- Lack of reliable business history
- Manual document verification
- Poor transaction transparency

For example, a buyer may pay a large amount upfront, while the seller may fail to deliver the agreed quantity or quality.

On the other hand, sellers may complete their work but still face delayed payments because the buyer does not approve the transaction on time.

SettleX addresses this problem by connecting:

Payment + Milestones + Evidence + Trust + Dispute Resolution

into one structured transaction workflow.

---

# Solution

SettleX introduces a milestone-based digital escrow workflow.

Instead of releasing the complete payment upfront, a transaction is divided into multiple milestones.

Each milestone can have:

- Defined payment amount
- Due date
- Deliverable
- Evidence requirements
- Approval status

The payment associated with a milestone remains locked until the required conditions are satisfied.

## Transaction Flow

Buyer
  |
  v
Create Deal
  |
  v
Fund Escrow
  |
  v
Milestone Starts
  |
  v
Seller Completes Work
  |
  v
Seller Uploads Evidence
  |
  v
AI Document Analysis
  |
  v
Backend Validation
  |
  +-------------------+
  |                   |
  v                   v
Approve             Dispute
  |                   |
  v                   v
Release           Human Review
Payment

---

# Key Features

## 1. Digital Escrow

SettleX locks the payment associated with a deal and releases it only through controlled backend transaction states.

For the hackathon demonstration, SettleX uses a simulated escrow ledger rather than holding real customer funds.

This allows us to demonstrate the complete escrow workflow without handling real money.

---

## 2. Milestone-Based Payments

A large transaction can be divided into smaller milestones.

Example:

| Milestone | Amount |
|---|---:|
| Design Approval | Rs. 25,000 |
| Manufacturing | Rs. 1,25,000 |
| Delivery | Rs. 1,00,000 |
| Total | Rs. 2,50,000 |

This reduces the risk of releasing the entire transaction amount before the work is completed.

---

## 3. AI-Powered Document Intelligence

SettleX uses Google Gemini 2.0 Flash for document intelligence.

The AI analyzes uploaded transaction evidence such as:

- Invoices
- Delivery challans
- Receipts
- Production documents
- Transaction-related evidence

The AI can extract structured information such as:

- Order ID
- Seller
- Quantity
- Date
- Amount
- Confidence score
- Potential inconsistencies

### Example

A seller uploads a delivery document:

```text
Delivery Challan

Order ID: ORD-1234
Seller: Sharma Furniture Works
Quantity: 500 Units
Amount: Rs. 1,25,000
Date: 12/09/2026


Gemini converts the document into structured information:

{
  "orderId": "ORD-1234",
  "seller": "Sharma Furniture Works",
  "quantity": 500,
  "amount": 125000,
  "date": "2026-09-12",
  "confidence": 96
}

This structured information is then passed to the backend validation layer.

4. Deterministic Escrow State Machine

The escrow workflow is controlled by backend-defined states.

CREATED
   |
   v
FUNDED
   |
   v
LOCKED
   |
   v
MILESTONE_IN_PROGRESS
   |
   v
EVIDENCE_SUBMITTED
   |
   v
UNDER_REVIEW
   |
   v
APPROVED
   |
   v
RELEASED


5. Dispute Resolution

SettleX detects inconsistencies between transaction requirements and submitted evidence.

Example:

Expected Quantity: 500 Units
Seller Evidence:  500 Units
Buyer Received:   450 Units

The system identifies:

500 != 450

The corresponding milestone payment remains locked.

AI can generate a concise dispute summary:

Quantity mismatch detected.

Seller evidence indicates 500 units,
while the buyer reports receiving 450 units.

Further human review is required.

The AI assists the reviewer but does not make the final financial decision.

6. Business Trust Score

SettleX provides a trust profile for businesses based on transaction history.

The trust system can consider:

Factor	Weight
Successful Completion	40%
On-Time Completion	20%
Dispute Rate	20%
Cancellation Rate	10%
Response Behaviour	10%

Businesses with insufficient transaction history are shown as:

NEW / INSUFFICIENT HISTORY

This prevents a new business from receiving an unreliable trust score based on limited transaction history.

7. Evidence Management

Sellers can submit evidence for milestone completion.

Supported evidence can include:

-Invoices
-Delivery receipts
-Challans
-Production proof
-Other transaction documents

Evidence follows this workflow:

Deal
  |
  v
Milestone
  |
  v
Evidence Upload
  |
  v
AI Analysis
  |
  v
Backend Validation
  |
  v
Buyer Review

8. Audit Trail

Important transaction events can be recorded for traceability.

Examples include:

-Deal creation
-Deal acceptance
-Escrow funding
-Milestone progress
-Evidence submission
-AI analysis
-Approval
-Dispute creation
-Settlement

This provides a clear history of what happened during a transaction.

User Roles
Buyer

Buyers can:

-Create deals
-Select sellers
-Define milestones
-Fund escrow
-Review evidence
-Approve milestones
-Raise disputes
-View transaction history
-View business trust profiles

Seller

Sellers can:

-View incoming deals
-Accept or reject deals
-Work on milestones
-Upload evidence
-Track milestone status
-View transaction history
-View trust profiles

Admin

Admins can:

-Monitor platform activity
-Review transactions
-Monitor disputes
-View trust events
-Inspect platform activity

System Architecture

                    +--------------------+
                    |     React UI       |
                    |    Vite + React    |
                    +---------+----------+
                              |
                              v
                    +--------------------+
                    |   Express REST API |
                    +---------+----------+
                              |
            +-----------------+-----------------+
            |                 |                 |
            v                 v                 v
       +----------+      +----------+      +-----------+
       |   Auth   |      |  Deals   |      | Evidence  |
       | JWT/RBAC |      |Milestones|      |  Upload   |
       +----------+      +----------+      +-----+-----+
                                                |
                                                v
                                       +----------------+
                                       |   Gemini AI    |
                                       |    Analysis    |
                                       +-------+--------+
                                               |
                                               v
                                       +----------------+
                                       | Rule Engine    |
                                       | + Validation   |
                                       +-------+--------+
                                               |
                                               v
                                       +----------------+
                                       | Escrow State   |
                                       |    Machine     |
                                       +-------+--------+
                                               |
                                               v
                                       +----------------+
                                       |    MongoDB     |
                                       +----------------+


🛠️ Technology Stack

🎨 Frontend
-React.js — Component-based user interface
-Vite — Fast frontend development and build tool
-Tailwind CSS — Responsive and modern UI styling
-JavaScript (ES6+) — Application logic
-React Router — Client-side routing
-Fetch API — Frontend-backend communication


⚙️ Backend
-Node.js — Backend runtime environment 
-Express.js — REST API framework
-MongoDB — NoSQL database
-Mongoose — MongoDB object modeling
-JWT — Secure authentication
-Express Validator — API request validation
-Multer — Evidence and document file uploads

🤖 Artificial Intelligence
-Google Gemini 2.0 Flash — AI document intelligence
-Gemini API — Backend communication with the AI model
-Structured JSON Extraction — Converts unstructured documents into structured transaction data
-AI Evidence Analysis — Extracts order ID, seller, quantity, date, amount and confidence
-AI Dispute Summarization — Summarizes transaction discrepancies
-AI Trust Insights — Provides analytical insights from transaction history

🔐 Security
-JWT Authentication — Secure user authentication
-Role-Based Access Control (RBAC) — Buyer, Seller and Admin permissions
-Express Validator — Input validation
-Rate Limiting — Protection against excessive API requests
-Idempotency Protection — Prevents duplicate financial operations
-Audit Logging — Tracks important transaction events
-Backend-Controlled Escrow — Financial transitions cannot be controlled from the frontend

💰 Escrow & Transaction Engine
-Deterministic State Machine — Controls deal and milestone lifecycle
-Milestone-Based Payments — Associates payments with specific milestones
-Simulated Escrow Ledger — Demonstrates locked and released funds for the hackathon
-Transaction Management — Tracks escrow and settlement history
-Dispute Workflow — Keeps disputed funds locked until resolution

🗄️ Database
-MongoDB — Primary application database
-Mongoose — Database schema and data modeling
-Users — Buyer, Seller and Admin accounts
-Deals — Transaction agreements
-Milestones — Milestone requirements and statuses
-Evidence — Uploaded documents and AI analysis
-Transactions — Escrow and settlement records
-Disputes — Transaction dispute records
-Trust Events — Business trust history

🔧 Development Tools
-Git — Version control
-GitHub — Source code hosting and collaboration
-VS Code — Development environment
-Postman — API testing
-npm — Package management