const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidence.controller');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload'); // Assuming upload middleware exists

router.use(authenticate);

// ── POST /api/evidence ───────────────────────────────────────
router.post('/', authorize('SELLER'), upload.single('file'), evidenceController.submitEvidence);

// ── GET /api/evidence/milestone/:milestoneId ─────────────────
router.get('/milestone/:milestoneId', evidenceController.listMilestoneEvidence);

// ── GET /api/evidence/:id ────────────────────────────────────
router.get('/:id', evidenceController.getEvidence);

// ── GET /api/evidence/:id/download ───────────────────────────
router.get('/:id/download', (req, res) => {
  // TODO: Implement actual file download stream
  res.status(501).json({ status: 'fail', message: 'Not implemented' });
});

module.exports = router;
