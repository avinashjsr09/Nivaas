const { run, get, all } = require('../db');
const { analyzeComplaintText } = require('../services/aiService');

// Create complaint (Resident)
async function createComplaint(req, res) {
  try {
    const { title, description, category: userCategory, priority: userPriority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Run AI analysis
    const aiAnalysis = analyzeComplaintText(title, description);

    const category = userCategory || aiAnalysis.category;
    const priority = userPriority || aiAnalysis.priority;
    const aiSummary = aiAnalysis.aiSummary;

    const result = await run(
      `INSERT INTO complaints (society_id, resident_id, title, description, category, priority, status, ai_summary)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [req.user.societyId, req.user.id, title, description, category, priority, aiSummary]
    );

    const complaint = await get(
      `SELECT c.*, u.name as resident_name, u.flat_number
       FROM complaints c
       JOIN users u ON c.resident_id = u.id
       WHERE c.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Complaint lodged successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to lodge complaint' });
  }
}

// Get complaints list (Residents see their own, Admin sees all in society)
async function getComplaints(req, res) {
  try {
    const societyId = req.user.societyId;
    let complaints;

    if (req.user.role === 'ADMIN') {
      complaints = await all(
        `SELECT c.*, u.name as resident_name, u.flat_number, u.phone as resident_phone
         FROM complaints c
         JOIN users u ON c.resident_id = u.id
         WHERE c.society_id = ?
         ORDER BY c.created_at DESC`,
        [societyId]
      );
    } else {
      complaints = await all(
        `SELECT c.*, u.name as resident_name, u.flat_number
         FROM complaints c
         JOIN users u ON c.resident_id = u.id
         WHERE c.society_id = ? AND c.resident_id = ?
         ORDER BY c.created_at DESC`,
        [societyId, req.user.id]
      );
    }

    res.json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

// Update complaint status (ADMIN only or Resident closing their own)
async function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    await run(
      `UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND society_id = ?`,
      [status, id, req.user.societyId]
    );

    const updated = await get(`SELECT * FROM complaints WHERE id = ?`, [id]);

    res.json({
      message: `Complaint status updated to ${status}`,
      complaint: updated
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaintStatus
};
