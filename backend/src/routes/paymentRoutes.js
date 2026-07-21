const express = require('express');
const router = express.Router();
const { createPaymentBill, getPayments, payBill } = require('../controllers/paymentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, authorizeRoles('ADMIN'), createPaymentBill);
router.get('/', authenticateToken, getPayments);
router.post('/:id/pay', authenticateToken, payBill);

module.exports = router;
