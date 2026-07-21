const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get } = require('../db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register User
async function register(req, res) {
  try {
    const { name, email, phone, password, role, societyCode, flatNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    const existingUser = await get(`SELECT id FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let societyId = null;
    if (societyCode) {
      const society = await get(`SELECT id FROM societies WHERE code = ?`, [societyCode.trim().toUpperCase()]);
      if (!society) {
        return res.status(400).json({ error: 'Invalid Society Code' });
      }
      societyId = society.id;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      `INSERT INTO users (name, email, phone, password, role, society_id, flat_number, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, email.toLowerCase().trim(), phone || '', hashedPassword, role, societyId, flatNumber || '']
    );

    const user = await get(
      `SELECT users.id, users.name, users.email, users.phone, users.role, users.society_id, users.flat_number, users.is_approved, societies.name as society_name, societies.code as society_code
       FROM users LEFT JOIN societies ON users.society_id = societies.id WHERE users.id = ?`,
      [result.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, societyId: user.society_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

// Login User
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await get(
      `SELECT users.*, societies.name as society_name, societies.code as society_code
       FROM users LEFT JOIN societies ON users.society_id = societies.id
       WHERE users.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, societyId: user.society_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
}

// Get current user profile
async function me(req, res) {
  try {
    const user = await get(
      `SELECT users.id, users.name, users.email, users.phone, users.role, users.society_id, users.flat_number, users.is_approved, societies.name as society_name, societies.code as society_code
       FROM users LEFT JOIN societies ON users.society_id = societies.id
       WHERE users.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

module.exports = {
  register,
  login,
  me
};
