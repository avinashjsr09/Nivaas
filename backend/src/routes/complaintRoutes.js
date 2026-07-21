const express = require('express');
const router = express.Router();
const { createComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createComplaint);
router.get('/', authenticateToken, getComplaints);
router.patch('/:id/status', authenticateToken, updateComplaintStatus);

module.exports = router;
