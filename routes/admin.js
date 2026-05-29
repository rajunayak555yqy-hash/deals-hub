const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    req.session.adminToken = token;
    res.json({ success: true, token, message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/admin/verify
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// GET /api/admin/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const Deal = require('../models/Deal');
    const totalDeals = await Deal.countDocuments();
    const activeDeals = await Deal.countDocuments({ active: true });
    const featuredDeals = await Deal.countDocuments({ featured: true });
    const totalClicks = await Deal.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);
    
    const platformStats = await Deal.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalDeals,
        activeDeals,
        featuredDeals,
        totalClicks: totalClicks[0]?.total || 0,
        platformStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;