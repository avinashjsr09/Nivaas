const { run, get, all } = require('../db');

// Helper to generate random 6-character uppercase code
function generateSocietyCode(name) {
  const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase() || 'NV';
  const num = Math.floor(100 + Math.random() * 900);
  return `${prefix}${num}`;
}

// Create new society
async function createSociety(req, res) {
  try {
    const { name, address, city, totalFlats } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Society name is required' });
    }

    let code = generateSocietyCode(name);
    let attempts = 0;
    while (attempts < 5) {
      const existing = await get(`SELECT id FROM societies WHERE code = ?`, [code]);
      if (!existing) break;
      code = generateSocietyCode(name);
      attempts++;
    }

    const result = await run(
      `INSERT INTO societies (name, code, address, city, total_flats) VALUES (?, ?, ?, ?, ?)`,
      [name, code, address || '', city || '', totalFlats || 50]
    );

    // If user is currently logged in, update their society_id
    if (req.user && req.user.id) {
      await run(`UPDATE users SET society_id = ? WHERE id = ?`, [result.id, req.user.id]);
    }

    const society = await get(`SELECT * FROM societies WHERE id = ?`, [result.id]);

    res.status(201).json({
      message: 'Society created successfully',
      society
    });
  } catch (error) {
    console.error('Create society error:', error);
    res.status(500).json({ error: 'Failed to create society' });
  }
}

// Join society by code
async function joinSociety(req, res) {
  try {
    const { code, flatNumber } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Society code is required' });
    }

    const society = await get(`SELECT * FROM societies WHERE code = ?`, [code.trim().toUpperCase()]);
    if (!society) {
      return res.status(404).json({ error: 'Society not found with provided code' });
    }

    await run(
      `UPDATE users SET society_id = ?, flat_number = ? WHERE id = ?`,
      [society.id, flatNumber || '', req.user.id]
    );

    res.json({
      message: `Successfully joined ${society.name}`,
      society
    });
  } catch (error) {
    console.error('Join society error:', error);
    res.status(500).json({ error: 'Failed to join society' });
  }
}

// Get current society details
async function getMySociety(req, res) {
  try {
    if (!req.user.societyId) {
      return res.status(400).json({ error: 'User is not linked to any society' });
    }

    const society = await get(`SELECT * FROM societies WHERE id = ?`, [req.user.societyId]);
    if (!society) {
      return res.status(404).json({ error: 'Society not found' });
    }

    const residentCount = await get(
      `SELECT COUNT(*) as count FROM users WHERE society_id = ? AND role = 'RESIDENT'`,
      [req.user.societyId]
    );

    res.json({
      society: {
        ...society,
        resident_count: residentCount ? residentCount.count : 0
      }
    });
  } catch (error) {
    console.error('Get society error:', error);
    res.status(500).json({ error: 'Failed to fetch society details' });
  }
}

// List all societies (for dropdowns / quick access)
async function listSocieties(req, res) {
  try {
    const societies = await all(`SELECT id, name, code, city, total_flats FROM societies ORDER BY name ASC`);
    res.json({ societies });
  } catch (error) {
    console.error('List societies error:', error);
    res.status(500).json({ error: 'Failed to list societies' });
  }
}

module.exports = {
  createSociety,
  joinSociety,
  getMySociety,
  listSocieties
};
