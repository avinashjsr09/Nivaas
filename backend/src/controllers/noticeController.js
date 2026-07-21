const { run, get, all } = require('../db');

// Create society notice (ADMIN only)
async function createNotice(req, res) {
  try {
    const { title, content, priority } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const result = await run(
      `INSERT INTO notices (society_id, author_id, title, content, priority) VALUES (?, ?, ?, ?, ?)`,
      [req.user.societyId, req.user.id, title, content, priority || 'NORMAL']
    );

    const notice = await get(
      `SELECT n.*, u.name as author_name
       FROM notices n
       JOIN users u ON n.author_id = u.id
       WHERE n.id = ?`,
      [result.id]
    );

    res.status(201).json({
      message: 'Notice published successfully',
      notice
    });
  } catch (error) {
    console.error('Create notice error:', error);
    res.status(500).json({ error: 'Failed to publish notice' });
  }
}

// Get all notices for the user's society
async function getNotices(req, res) {
  try {
    const societyId = req.user.societyId;

    const notices = await all(
      `SELECT n.*, u.name as author_name
       FROM notices n
       JOIN users u ON n.author_id = u.id
       WHERE n.society_id = ?
       ORDER BY CASE WHEN n.priority = 'URGENT' THEN 0 ELSE 1 END, n.created_at DESC`,
      [societyId]
    );

    res.json({ notices });
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
}

// Delete notice (ADMIN only)
async function deleteNotice(req, res) {
  try {
    const { id } = req.params;

    await run(`DELETE FROM notices WHERE id = ? AND society_id = ?`, [id, req.user.societyId]);

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
}

module.exports = {
  createNotice,
  getNotices,
  deleteNotice
};
