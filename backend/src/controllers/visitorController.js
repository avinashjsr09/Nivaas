const { run, get, all } = require('../db');
const crypto = require('crypto');

// Generate unique QR code pass string
function generateQrPassCode() {
  return 'NV-PASS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Create Visitor Pass / Log Visitor Request
async function createVisitorPass(req, res) {
  try {
    const { guestName, phone, purpose, visitorCount, flatNumber, residentId: reqResidentId } = req.body;

    if (!guestName) {
      return res.status(400).json({ error: 'Guest name is required' });
    }

    const societyId = req.user.societyId;
    let targetResidentId = req.user.role === 'RESIDENT' ? req.user.id : reqResidentId;

    // If security guard logs visitor for a specific flat, find resident
    if (req.user.role === 'SECURITY' && flatNumber) {
      const targetRes = await get(
        `SELECT id FROM users WHERE society_id = ? AND flat_number = ? AND role = 'RESIDENT'`,
        [societyId, flatNumber.trim()]
      );
      if (targetRes) {
        targetResidentId = targetRes.id;
      }
    }

    const qrCode = generateQrPassCode();

    // Default status: If created by resident -> APPROVED; If created by security -> PENDING approval
    const initialStatus = req.user.role === 'RESIDENT' ? 'APPROVED' : 'PENDING';

    const result = await run(
      `INSERT INTO visitors (society_id, resident_id, guest_name, phone, purpose, visitor_count, status, qr_code, entry_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        societyId,
        targetResidentId || null,
        guestName,
        phone || '',
        purpose || 'Guest Visit',
        visitorCount || 1,
        initialStatus,
        qrCode
      ]
    );

    const visitor = await get(
      `SELECT v.*, u.name as resident_name, u.flat_number
       FROM visitors v
       LEFT JOIN users u ON v.resident_id = u.id
       WHERE v.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Visitor pass created',
      visitor
    });
  } catch (error) {
    console.error('Create visitor error:', error);
    res.status(500).json({ error: 'Failed to create visitor pass' });
  }
}

// Fetch visitor log list
async function getVisitors(req, res) {
  try {
    const societyId = req.user.societyId;
    let visitors;

    if (req.user.role === 'RESIDENT') {
      visitors = await all(
        `SELECT v.*, u.name as resident_name, u.flat_number
         FROM visitors v
         LEFT JOIN users u ON v.resident_id = u.id
         WHERE v.society_id = ? AND (v.resident_id = ? OR v.resident_id IS NULL)
         ORDER BY v.created_at DESC`,
        [societyId, req.user.id]
      );
    } else {
      // SECURITY or ADMIN sees full gate log
      visitors = await all(
        `SELECT v.*, u.name as resident_name, u.flat_number
         FROM visitors v
         LEFT JOIN users u ON v.resident_id = u.id
         WHERE v.society_id = ?
         ORDER BY v.created_at DESC`,
        [societyId]
      );
    }

    res.json({ visitors });
  } catch (error) {
    console.error('Fetch visitors error:', error);
    res.status(500).json({ error: 'Failed to fetch visitors' });
  }
}

// Update visitor status (APPROVED, REJECTED, INSIDE, EXITED)
async function updateVisitorStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'INSIDE', 'EXITED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    let extraUpdate = '';
    const params = [status, id, req.user.societyId];

    if (status === 'EXITED') {
      extraUpdate = ', exit_time = CURRENT_TIMESTAMP';
    } else if (status === 'INSIDE') {
      extraUpdate = ', entry_time = CURRENT_TIMESTAMP';
    }

    await run(
      `UPDATE visitors SET status = ? ${extraUpdate} WHERE id = ? AND society_id = ?`,
      params
    );

    const updated = await get(`SELECT * FROM visitors WHERE id = ?`, [id]);

    res.json({
      message: `Visitor status updated to ${status}`,
      visitor: updated
    });
  } catch (error) {
    console.error('Update visitor status error:', error);
    res.status(500).json({ error: 'Failed to update visitor status' });
  }
}

// Verify QR Pass (Security)
async function verifyQrCode(req, res) {
  try {
    const { qrCode } = req.params;

    const visitor = await get(
      `SELECT v.*, u.name as resident_name, u.flat_number
       FROM visitors v
       LEFT JOIN users u ON v.resident_id = u.id
       WHERE v.qr_code = ? AND v.society_id = ?`,
      [qrCode.trim(), req.user.societyId]
    );

    if (!visitor) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired QR Pass Code' });
    }

    res.json({
      valid: true,
      visitor
    });
  } catch (error) {
    console.error('Verify QR error:', error);
    res.status(500).json({ error: 'Failed to verify QR pass' });
  }
}

module.exports = {
  createVisitorPass,
  getVisitors,
  updateVisitorStatus,
  verifyQrCode
};
