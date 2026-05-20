const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');

// POST /api/chatbot - AI chatbot for deal recommendations
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message required' });

    // Fetch relevant deals from DB based on keywords
    const keywords = message.toLowerCase().split(' ').filter(w => w.length > 2);
    const searchQuery = {
      active: true,
      $or: keywords.map(k => ({
        $or: [
          { title: new RegExp(k, 'i') },
          { brand: new RegExp(k, 'i') },
          { category: new RegExp(k, 'i') }
        ]
      }))
    };

    // Extract price constraint if mentioned
    const priceMatch = message.match(/under\s+(\d+)|below\s+(\d+)|less\s+than\s+(\d+)/i);
    if (priceMatch) {
      const maxPrice = parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]);
      searchQuery.newPrice = { $lte: maxPrice };
    }

    let deals = await Deal.find(searchQuery).sort({ clicks: -1 }).limit(5);

    // Fallback: fetch trending deals if no matches
    if (deals.length === 0) {
      deals = await Deal.find({ active: true }).sort({ clicks: -1 }).limit(3);
    }

    // Build chatbot response
    let responseText = '';
    let suggestedDeals = [];

    if (deals.length > 0) {
      responseText = `Here are the best deals I found for "${message}":`;
      suggestedDeals = deals.map(d => ({
        id: d._id,
        title: d.title,
        newPrice: d.newPrice,
        oldPrice: d.oldPrice,
        imageUrl: d.imageUrl,
        affiliateLink: d.affiliateLink,
        platform: d.platform,
        discount: d.discountPercent
      }));
    } else {
      responseText = `I couldn't find specific deals for "${message}". Here are today's top deals:`;
      const topDeals = await Deal.find({ active: true }).sort({ createdAt: -1 }).limit(3);
      suggestedDeals = topDeals.map(d => ({
        id: d._id,
        title: d.title,
        newPrice: d.newPrice,
        oldPrice: d.oldPrice,
        imageUrl: d.imageUrl,
        affiliateLink: d.affiliateLink,
        platform: d.platform,
        discount: d.discountPercent
      }));
    }

    res.json({
      success: true,
      response: responseText,
      deals: suggestedDeals
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;