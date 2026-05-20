const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const authMiddleware = require('../middleware/auth');

// GET /api/deals - Get all deals with filters
router.get('/', async (req, res) => {
  try {
    const { platform, brand, category, featured, search, page = 1, limit = 20 } = req.query;
    const query = { active: true };

    if (platform) query.platform = platform;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Deal.countDocuments(query);
    const deals = await Deal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      deals,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/deals/featured - Today's Greatest Collection
router.get('/featured', async (req, res) => {
  try {
    const deals = await Deal.find({ featured: true, active: true })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, deals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/deals/brands - Get unique brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Deal.distinct('brand', { active: true });
    res.json({ success: true, brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/deals/:id - Get single deal
router.get('/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, deal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/deals/:id/click - Track affiliate click
router.post('/:id/click', async (req, res) => {
  try {
    await Deal.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN ROUTES (protected)

// POST /api/deals - Create new deal
router.post('/', authMiddleware, async (req, res) => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    res.status(201).json({ success: true, deal, message: 'Deal created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/deals/:id - Update deal
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, deal, message: 'Deal updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/deals/:id - Delete deal
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ success: false, message: 'Deal not found' });
    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/deals/admin/all - Get all deals for admin (including inactive)
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Deal.countDocuments();
    const deals = await Deal.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ success: true, deals, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;