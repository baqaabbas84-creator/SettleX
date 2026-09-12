/**
 * SettleX Mock Data
 *
 * Clearly marked demo data for initial UI development.
 * Replace with backend API responses once connected.
 *
 * ⚠️ DEMO DATA — Not connected to backend
 */

// ── Buyer Dashboard KPIs ──
export const buyerDashboardData = {
  activeDeals: 24,
  totalEscrowValue: 1840000, // ₹18.4L
  lockedAmount: 720000,      // ₹7.2L
  releasedAmount: 1120000,   // ₹11.2L
  successRate: 96.8,
  activeDisputes: 3,
};

// ── Seller Dashboard KPIs ──
export const sellerDashboardData = {
  incomingDeals: 5,
  acceptedDeals: 18,
  activeMilestones: 12,
  lockedAmount: 520000,
  releasedAmount: 890000,
  pendingEvidence: 4,
  activeDisputes: 2,
  trustScore: 87,
};

// ── Demo Deal (the hackathon story: ₹2.5L furniture order) ──
export const demoDeal = {
  id: 'deal_001',
  title: '500 Wooden Chairs — Office Furniture Order',
  description: '500 chairs chahiye; first design approval, then manufacturing, then delivery.',
  buyer: {
    id: 'usr_buyer_001',
    name: 'Rajesh Kumar',
    company: 'Kumar Trading Co.',
  },
  seller: {
    id: 'usr_seller_001',
    name: 'Priya Sharma',
    company: 'Sharma Furniture Works',
  },
  totalAmount: 250000,
  status: 'IN_PROGRESS',
  createdAt: '2026-09-01T10:00:00Z',
  milestones: [
    {
      id: 'ms_001',
      title: 'Design Approval',
      description: 'Submit and approve furniture design specifications',
      amount: 25000,
      dueDate: '2026-09-10',
      conditions: 'Design document reviewed and approved by buyer',
      status: 'APPROVED',
      evidence: [
        {
          id: 'ev_001',
          filename: 'design_spec_v2.pdf',
          type: 'document',
          uploadedBy: 'Priya Sharma',
          uploadDate: '2026-09-08T14:30:00Z',
          status: 'VERIFIED',
        },
      ],
    },
    {
      id: 'ms_002',
      title: 'Manufacturing Complete',
      description: 'Complete manufacturing of 500 wooden chairs',
      amount: 125000,
      dueDate: '2026-09-25',
      conditions: 'Manufacturing completion report with quality inspection',
      status: 'EVIDENCE_SUBMITTED',
      evidence: [
        {
          id: 'ev_002',
          filename: 'manufacturing_invoice.pdf',
          type: 'invoice',
          uploadedBy: 'Priya Sharma',
          uploadDate: '2026-09-20T11:00:00Z',
          status: 'UNDER_REVIEW',
        },
      ],
    },
    {
      id: 'ms_003',
      title: 'Delivery Confirmed',
      description: 'Deliver 500 chairs to buyer warehouse',
      amount: 100000,
      dueDate: '2026-10-05',
      conditions: 'Delivery receipt signed by buyer representative',
      status: 'PENDING',
      evidence: [],
    },
  ],
};

// ── Escrow Snapshots ──
export const escrowSnapshots = {
  deal_001: {
    total: 250000,
    locked: 225000,
    released: 25000,
    refunded: 0,
    history: [
      { date: '2026-09-01', event: 'FUNDED', amount: 250000, locked: 250000, released: 0 },
      { date: '2026-09-10', event: 'M1 APPROVED — Released', amount: 25000, locked: 225000, released: 25000 },
    ],
  },
};

// ── Recent Deals ──
export const recentDeals = [
  {
    id: 'deal_001',
    title: '500 Wooden Chairs — Office Furniture Order',
    seller: 'Sharma Furniture Works',
    buyer: 'Kumar Trading Co.',
    amount: 250000,
    status: 'IN_PROGRESS',
    milestoneProgress: '1/3',
    createdAt: '2026-09-01',
  },
  {
    id: 'deal_002',
    title: 'Steel Shelving Units — Warehouse Storage',
    seller: 'MetalCraft Industries',
    buyer: 'Kumar Trading Co.',
    amount: 180000,
    status: 'FUNDED',
    milestoneProgress: '0/2',
    createdAt: '2026-08-28',
  },
  {
    id: 'deal_003',
    title: 'Custom Packaging Materials',
    seller: 'PackRight Solutions',
    buyer: 'Kumar Trading Co.',
    amount: 45000,
    status: 'COMPLETED',
    milestoneProgress: '2/2',
    createdAt: '2026-08-15',
  },
  {
    id: 'deal_004',
    title: 'Office Desk Set — 50 Units',
    seller: 'Sharma Furniture Works',
    buyer: 'Kumar Trading Co.',
    amount: 375000,
    status: 'IN_PROGRESS',
    milestoneProgress: '2/4',
    createdAt: '2026-08-10',
  },
];

// ── AI Evidence Verification (demo) ──
export const aiVerificationResult = {
  evidenceId: 'ev_002',
  confidence: 0.87,
  extractedData: {
    orderId: 'ORD-2026-4521',
    quantity: 450,
    seller: 'Sharma Furniture Works',
    date: '2026-09-20',
  },
  expectedData: {
    quantity: 500,
  },
  inconsistencies: [
    {
      field: 'quantity',
      expected: 500,
      found: 450,
      severity: 'HIGH',
      message: 'Document shows 450 units, expected 500 units. Discrepancy of 50 units.',
    },
  ],
};

// ── Dispute ──
export const demoDispute = {
  id: 'disp_1024',
  dealId: 'deal_001',
  milestoneId: 'ms_002',
  dealTitle: '500 Wooden Chairs — Office Furniture Order',
  status: 'OPEN',
  createdAt: '2026-09-21T09:00:00Z',
  expected: { quantity: 500 },
  buyerClaim: { quantity: 450, statement: 'Received invoice showing only 450 units manufactured. 50 units short of the agreed 500.' },
  sellerClaim: { quantity: 500, statement: 'All 500 units have been manufactured. The invoice covers the first batch of 450, remaining 50 units are in final quality check.' },
  difference: { quantity: 50 },
  disputedAmount: 100000,
  lockedStatus: 'LOCKED',
  aiSummary: 'Invoice evidence shows 450 units vs expected 500. Seller claims remaining 50 units are in QC. Recommend holding funds until seller provides updated completion report covering all 500 units.',
  timeline: [
    { date: '2026-09-21T09:00:00Z', event: 'Dispute raised by buyer', actor: 'Rajesh Kumar' },
    { date: '2026-09-21T10:30:00Z', event: 'Seller response submitted', actor: 'Priya Sharma' },
    { date: '2026-09-21T11:00:00Z', event: 'AI analysis completed', actor: 'SettleX AI' },
  ],
  evidence: ['ev_002'],
};

// ── Trust Profile ──
export const demoTrustProfile = {
  userId: 'usr_seller_001',
  name: 'Priya Sharma',
  company: 'Sharma Furniture Works',
  trustScore: 87,
  isNewBusiness: false,
  metrics: {
    successfulCompletion: 94,
    onTimeDelivery: 89,
    disputeRate: 6,
    cancellationRate: 2,
    responseBehaviour: 92,
  },
  scoreExplanation: 'Based on 47 completed transactions over 18 months. Strong completion rate with occasional delivery delays. Low dispute rate.',
  events: [
    { date: '2026-09-10', event: 'Milestone completed on time', deal: 'deal_001', impact: '+2' },
    { date: '2026-09-01', event: 'New deal accepted', deal: 'deal_001', impact: '+1' },
    { date: '2026-08-25', event: 'Deal completed successfully', deal: 'deal_005', impact: '+3' },
    { date: '2026-08-10', event: 'Late delivery (2 days)', deal: 'deal_006', impact: '-1' },
  ],
};

export const newBusinessTrustProfile = {
  userId: 'usr_new_001',
  name: 'New Business',
  company: 'New Corp',
  trustScore: null,
  isNewBusiness: true,
  metrics: null,
  scoreExplanation: 'New / Insufficient History — This business has fewer than 5 completed transactions.',
  events: [],
};

// ── Transactions ──
export const demoTransactions = [
  { id: 'txn_001', date: '2026-09-01', deal: '500 Wooden Chairs', type: 'FUND', amount: 250000, status: 'COMPLETED', reference: 'TXN-2026-001' },
  { id: 'txn_002', date: '2026-09-10', deal: '500 Wooden Chairs', type: 'RELEASE', amount: 25000, status: 'COMPLETED', reference: 'TXN-2026-002' },
  { id: 'txn_003', date: '2026-08-28', deal: 'Steel Shelving Units', type: 'FUND', amount: 180000, status: 'COMPLETED', reference: 'TXN-2026-003' },
  { id: 'txn_004', date: '2026-08-20', deal: 'Custom Packaging', type: 'RELEASE', amount: 22500, status: 'COMPLETED', reference: 'TXN-2026-004' },
  { id: 'txn_005', date: '2026-08-25', deal: 'Custom Packaging', type: 'RELEASE', amount: 22500, status: 'COMPLETED', reference: 'TXN-2026-005' },
  { id: 'txn_006', date: '2026-09-21', deal: '500 Wooden Chairs', type: 'HOLD', amount: 100000, status: 'LOCKED', reference: 'TXN-2026-006' },
];

// ── Admin Analytics ──
export const adminAnalytics = {
  totalUsers: 342,
  activeDeals: 89,
  totalTransactionValue: 4250000,
  lockedAmount: 1850000,
  releasedAmount: 2400000,
  totalDisputes: 12,
  openDisputes: 5,
  resolvedDisputes: 7,
  avgTrustScore: 82,
  successRate: 94.2,
  monthlyVolume: [
    { month: 'Apr', value: 320000 },
    { month: 'May', value: 450000 },
    { month: 'Jun', value: 380000 },
    { month: 'Jul', value: 520000 },
    { month: 'Aug', value: 610000 },
    { month: 'Sep', value: 480000 },
  ],
};

// ── Admin Users ──
export const adminUsers = [
  { id: 'usr_buyer_001', name: 'Rajesh Kumar', email: 'rajesh@kumartrading.in', role: 'BUYER', company: 'Kumar Trading Co.', verified: true, deals: 24, trustScore: 91 },
  { id: 'usr_seller_001', name: 'Priya Sharma', email: 'priya@sharmafurniture.in', role: 'SELLER', company: 'Sharma Furniture Works', verified: true, deals: 47, trustScore: 87 },
  { id: 'usr_seller_002', name: 'Amit Patel', email: 'amit@metalcraft.in', role: 'SELLER', company: 'MetalCraft Industries', verified: true, deals: 31, trustScore: 79 },
  { id: 'usr_buyer_002', name: 'Sunita Verma', email: 'sunita@vermaexports.in', role: 'BUYER', company: 'Verma Exports', verified: false, deals: 8, trustScore: 65 },
];

// ── AI Milestone Suggestions ──
export const aiMilestoneSuggestions = [
  {
    title: 'Design Approval',
    description: 'Submit and approve furniture design specifications',
    amount: 25000,
    conditions: 'Design document reviewed and approved by buyer',
  },
  {
    title: 'Manufacturing Complete',
    description: 'Complete manufacturing of 500 wooden chairs',
    amount: 125000,
    conditions: 'Manufacturing completion report with quality inspection',
  },
  {
    title: 'Delivery Confirmed',
    description: 'Deliver 500 chairs to buyer warehouse',
    amount: 100000,
    conditions: 'Delivery receipt signed by buyer representative',
  },
];
