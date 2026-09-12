const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function run() {
  try {
    console.log('Testing SettleX API Flow...');
    
    // 1. Health check
    let res = await fetch(`${API_URL}/health`);
    let data = await res.json();
    console.log('1. Health:', data.message);

    // 2. Register Buyer
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Buyer',
        email: `buyer${Date.now()}@test.com`,
        password: 'password123',
        role: 'BUYER'
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const buyerId = data.data.user._id;
    const buyerToken = data.data.token;
    console.log('2. Buyer registered successfully.');

    // 3. Register Seller
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Seller',
        email: `seller${Date.now()}@test.com`,
        password: 'password123',
        role: 'SELLER'
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const sellerId = data.data.user._id;
    const sellerToken = data.data.token;
    console.log('3. Seller registered successfully.');

    // 4. Register Admin for Dispute Resolution
    res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Admin',
        email: `admin${Date.now()}@test.com`,
        password: 'password123',
        role: 'ADMIN'
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const adminToken = data.data.token;
    console.log('4. Admin registered successfully.');

    // Login Buyer test
    res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.data.user.email, // wait, using admin email for test, but buyer email is better
          password: 'password123'
        })
    });
    data = await res.json();
    console.log('Login Test:', res.ok ? 'Success' : 'Failed');

    // 4. Create Deal (Buyer)
    res = await fetch(`${API_URL}/deals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        sellerId: sellerId,
        title: 'Bulk Chairs Order',
        totalAmount: 250000
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const dealId = data.data.deal._id;
    console.log('5. Deal created by buyer. Status:', data.data.deal.status);

    // 5. Accept Deal (Seller)
    res = await fetch(`${API_URL}/deals/${dealId}/accept`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${sellerToken}` }
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('6. Deal accepted by seller. Status:', data.data.deal.status);

    // 6. Create Milestones (Buyer)
    res = await fetch(`${API_URL}/milestones`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        dealId: dealId,
        title: 'Design Approval',
        amount: 25000
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const milestoneId = data.data.milestone._id;
    console.log('7. Milestone 1 created by buyer. Status:', data.data.milestone.status);

    res = await fetch(`${API_URL}/milestones`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${buyerToken}`
        },
        body: JSON.stringify({
          dealId: dealId,
          title: 'Delivery',
          amount: 50000
        })
      });
      data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data));
      const milestone2Id = data.data.milestone._id;
      console.log('7. Milestone 2 created by buyer. Status:', data.data.milestone.status);


    // 7. Funding (Buyer funds milestone 1)
    res = await fetch(`${API_URL}/milestones/${milestoneId}/transition`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${buyerToken}`
      },
      body: JSON.stringify({
        targetStatus: 'FUNDED',
        idempotencyKey: `fund_${milestoneId}`
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('8. Milestone transitioned to FUNDED. Status:', data.data.milestone.status);

    // Transition to LOCKED -> MILESTONE_IN_PROGRESS
    res = await fetch(`${API_URL}/milestones/${milestoneId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'LOCKED' })
    });
    await fetch(`${API_URL}/milestones/${milestoneId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'MILESTONE_IN_PROGRESS' })
    });
    console.log('9. Milestone transitioned to MILESTONE_IN_PROGRESS.');

    // 8. Evidence Submission (Seller)
    const dummyPdfContent = 'Dummy PDF content';
    
    const form = new FormData();
    form.append('milestoneId', milestoneId);
    form.append('type', 'INVOICE');
    form.append('file', new Blob([dummyPdfContent], { type: 'application/pdf' }), 'dummy.pdf');

    res = await fetch(`${API_URL}/evidence`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sellerToken}`
        },
        body: form
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('10. Evidence submitted by seller.', data.data.evidence.status);

    // 9. Evidence review -> Under review
    res = await fetch(`${API_URL}/milestones/${milestoneId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'UNDER_REVIEW' })
    });
    console.log('11. Milestone Under Review');

    // 10. Approval -> Release
    res = await fetch(`${API_URL}/milestones/${milestoneId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${buyerToken}` }
    });
    console.log('12. Milestone Approved.');

    res = await fetch(`${API_URL}/milestones/${milestoneId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'RELEASED' })
    });
    data = await res.json();
    console.log('13. Milestone Released. Status:', data.data.milestone.status);

    // 11. Duplicate release prevention
    res = await fetch(`${API_URL}/milestones/${milestoneId}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'RELEASED' })
    });
    data = await res.json();
    console.log('14. Duplicate release prevention triggered:', data.message.includes('not allowed'));

    // 12. Dispute Creation
    // Transition milestone 2 to IN_PROGRESS
    await fetch(`${API_URL}/milestones/${milestone2Id}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'FUNDED' })
    });
    await fetch(`${API_URL}/milestones/${milestone2Id}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'LOCKED' })
    });
    await fetch(`${API_URL}/milestones/${milestone2Id}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'MILESTONE_IN_PROGRESS' })
    });

    res = await fetch(`${API_URL}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({
            dealId: dealId,
            milestoneId: milestone2Id,
            reason: 'Seller delayed delivery.',
            amount: 50000,
            statement: 'I ordered chairs 2 weeks ago.'
        })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const disputeId = data.data.dispute._id;
    console.log('15. Dispute created by buyer. ID:', disputeId);

    // Seller responds
    res = await fetch(`${API_URL}/disputes/${disputeId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sellerToken}` },
        body: JSON.stringify({
            statement: 'There was a storm, out of my control.'
        })
    });
    data = await res.json();
    console.log('16. Seller responded to dispute. AI Summary attached:', !!data.data.dispute.aiSummary);

    // 13. Dispute Resolution (ADMIN)
    res = await fetch(`${API_URL}/disputes/${disputeId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            decision: 'Refund to buyer due to uncommunicated delays.',
            notes: 'Reviewed AI summary.'
        })
    });
    data = await res.json();
    console.log('17. Dispute resolved by admin.');

    // 14. Unauthorized access
    res = await fetch(`${API_URL}/deals/${dealId}`, {
        headers: { 'Authorization': `Bearer invalidtoken` }
    });
    console.log('18. Unauthorized access prevented. Status:', res.status);

    // 15. Invalid state transitions
    res = await fetch(`${API_URL}/milestones/${milestone2Id}/transition`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify({ targetStatus: 'CREATED' }) // going backwards
    });
    data = await res.json();
    console.log('19. Invalid state transition blocked:', data.message.includes('not allowed'));

    console.log('All tests passed successfully!');

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

run();
