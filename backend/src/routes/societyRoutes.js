const express = require('express');
const router = express.Router();
const { createSociety, joinSociety, getMySociety, listSocieties } = require('../controllers/societyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/list', listSocieties);
router.post('/create', authenticateToken, createSociety);
router.post('/join', authenticateToken, joinSociety);
router.get('/my-society', authenticateToken, getMySociety);

module.exports = router;
