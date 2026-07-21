const { all, get, run } = require('../db');

// List residents in current user's society
async function getResidents(req, res) {
  try {
    const societyId = req.user.societyId;
    if (!societyId) {
      return res.status(400).json({ error: 'User does not belong to a society' });
    }

    const residents = await all(
      `SELECT id, name, email, phone, role, flat_number, is_approved, created_at
       FROM users
       WHERE society_id = ?
       ORDER BY flat_number ASC, name ASC`,
      [societyId]
    );

    res.json({ residents });
  } catch (error) {
    console.error('Fetch residents error:', error);
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
}

// Approve pending resident join request (Admin only)
async function approveResident(req, res) {
  try {
    const { residentId } = req.params;
    const { isApproved } = req.body;

    await run(`UPDATE users SET is_approved = ? WHERE id = ? AND society_id = ?`, [
      isApproved ? 1 : 0,
      residentId,
      req.user.societyId
    ]);

    res.json({ message: `Resident approval status updated to ${isApproved ? 'Approved' : 'Pending'}` });
  } catch (error) {
    console.error('Approve resident error:', error);
    res.status(500).json({ error: 'Failed to update resident status' });
  }
}

module.exports = {
  getResidents,
  approveResident
};
