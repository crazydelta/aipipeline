const Deal = require('../models/Deal');

exports.getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ createdBy: req.user });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
};

exports.createDeal = async (req, res) => {
  const { title, description } = req.body;
  try {
    const deal = await Deal.create({ title, description, createdBy: req.user });
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create deal' });
  }
};
