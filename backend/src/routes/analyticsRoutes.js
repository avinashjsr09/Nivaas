const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAnalytics);

module.exports = router;
