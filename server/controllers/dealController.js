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


// Update deal
exports.updateDeal = async (req, res) => {
  try {
    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: req.params.id, owner: req.user },
      req.body,
      { new: true }
    );
    if (!updatedDeal) return res.status(404).json({ message: 'Deal not found' });
    res.json(updatedDeal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update deal' });
  }
};

// Delete deal
exports.deleteDeal = async (req, res) => {
  try {
    const deleted = await Deal.findOneAndDelete({ _id: req.params.id, owner: req.user });
    if (!deleted) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete deal' });
  }
};

// Update only the stage (for drag and drop)
exports.updateDealStage = async (req, res) => {
  try {
    const updatedDeal = await Deal.findOneAndUpdate(
      { _id: req.params.id, owner: req.user },
      { stage: req.body.stage },
      { new: true }
    );
    if (!updatedDeal) return res.status(404).json({ message: 'Deal not found' });
    res.json(updatedDeal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update deal stage' });
  }
};
