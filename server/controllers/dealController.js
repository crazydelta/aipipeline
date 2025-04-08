const mongoose = require('mongoose'); 
const Deal = require('../models/Deal');


exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ owner: new mongoose.Types.ObjectId(req.user) });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
};

exports.createDeal = async (req, res) => {
  const {
    title,
    company,
    contactName,
    contactEmail,
    contactPhone,
    value,
    stage,
    probability,
    notes,
    expectedCloseDate
  } = req.body;

  try {
    const deal = await Deal.create({
      title,
      company,
      contactName,
      contactEmail,
      contactPhone,
      value,
      stage,
      probability,
      notes,
      expectedCloseDate,
      owner: new mongoose.Types.ObjectId(req.user), // ✅ Convert to ObjectId
    });

    res.status(201).json(deal);
  } catch (err) {
    console.error("❌ Error creating deal:", err.message);
    res.status(500).json({ message: 'Failed to create deal', error: err.message });
  }
};