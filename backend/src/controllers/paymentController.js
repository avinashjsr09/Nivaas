const { run, get, all } = require('../db');
const crypto = require('crypto');

// Create Maintenance Bill (ADMIN only)
async function createPaymentBill(req, res) {
  try {
    const { title, amount, dueDate, targetFlatNumber } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }

    const societyId = req.user.societyId;

    let targetResidents = [];
    if (targetFlatNumber) {
      targetResidents = await all(
        `SELECT id FROM users WHERE society_id = ? AND flat_number = ? AND role = 'RESIDENT'`,
        [societyId, targetFlatNumber.trim()]
      );
    } else {
      // Issue to all residents in society
      targetResidents = await all(
        `SELECT id FROM users WHERE society_id = ? AND role = 'RESIDENT'`,
        [societyId]
      );
    }

    if (targetResidents.length === 0) {
      return res.status(404).json({ error: 'No matching residents found to issue bill' });
    }

    for (const resItem of targetResidents) {
      await run(
        `INSERT INTO payments (society_id, resident_id, title, amount, due_date, status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [societyId, resItem.id, title, parseFloat(amount), dueDate || 'End of Month']
      );
    }

    res.status(201).json({
      message: `Maintenance bill issued successfully to ${targetResidents.length} resident(s).`
    });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ error: 'Failed to create maintenance bill' });
  }
}

// Get Payments List
async function getPayments(req, res) {
  try {
    const societyId = req.user.societyId;
    let payments;

    if (req.user.role === 'ADMIN') {
      payments = await all(
        `SELECT p.*, u.name as resident_name, u.flat_number
         FROM payments p
         JOIN users u ON p.resident_id = u.id
         WHERE p.society_id = ?
         ORDER BY p.created_at DESC`,
        [societyId]
      );
    } else {
      payments = await all(
        `SELECT p.*, u.name as resident_name, u.flat_number
         FROM payments p
         JOIN users u ON p.resident_id = u.id
         WHERE p.society_id = ? AND p.resident_id = ?
         ORDER BY p.created_at DESC`,
        [societyId, req.user.id]
      );
    }

    res.json({ payments });
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

// Pay Bill (Resident)
async function payBill(req, res) {
  try {
    const { id } = req.params;

    const payment = await get(`SELECT * FROM payments WHERE id = ? AND society_id = ?`, [
      id,
      req.user.societyId
    ]);

    if (!payment) {
      return res.status(404).json({ error: 'Payment bill not found' });
    }

    if (payment.status === 'PAID') {
      return res.status(400).json({ error: 'Bill has already been paid' });
    }

    const transactionRef = 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    await run(
      `UPDATE payments SET status = 'PAID', paid_at = CURRENT_TIMESTAMP, transaction_ref = ? WHERE id = ?`,
      [transactionRef, id]
    );

    const updated = await get(`SELECT * FROM payments WHERE id = ?`, [id]);

    res.json({
      message: 'Payment completed successfully!',
      payment: updated
    });
  } catch (error) {
    console.error('Pay bill error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
}

module.exports = {
  createPaymentBill,
  getPayments,
  payBill
};
