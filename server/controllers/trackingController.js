const Tracking = require('../models/Tracking');

exports.saveTracking = async (req, res) => {
  try {
    const tracking = await Tracking.create({ ...req.body, userId: req.userId });
    res.status(201).json(tracking);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save tracking', error: err.message });
  }
};

exports.getTracking = async (req, res) => {
  try {
    const data = await Tracking.find({ userId: req.userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get tracking data', error: err.message });
  }
};
