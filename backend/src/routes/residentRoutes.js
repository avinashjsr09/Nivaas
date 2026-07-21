const express = require('express');
const router = express.Router();
const { getResidents, approveResident } = require('../controllers/residentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getResidents);
router.patch('/:residentId/approve', authenticateToken, authorizeRoles('ADMIN'), approveResident);

module.exports = router;
