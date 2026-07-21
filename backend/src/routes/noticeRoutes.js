const express = require('express');
const router = express.Router();
const { createNotice, getNotices, deleteNotice } = require('../controllers/noticeController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getNotices);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createNotice);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteNotice);

module.exports = router;
