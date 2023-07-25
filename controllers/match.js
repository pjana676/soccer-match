const Match = require('../models/match');

exports.getDashboard = async (req, res) => {
  try {
    const matches = await Match.find();
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the match dashboard' });
  }
};

