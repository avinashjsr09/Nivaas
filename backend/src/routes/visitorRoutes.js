const express = require('express');
const router = express.Router();
const {
  createVisitorPass,
  getVisitors,
  updateVisitorStatus,
  verifyQrCode
} = require('../controllers/visitorController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/create-pass', authenticateToken, createVisitorPass);
router.get('/', authenticateToken, getVisitors);
router.patch('/:id/status', authenticateToken, updateVisitorStatus);
router.get('/verify/:qrCode', authenticateToken, verifyQrCode);

module.exports = router;
