const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  score: { type: String, default: 'NA' },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['not-started', 'in-progress', 'ended', 'cancelled'], default: 'not-started' },
  stadium: { type: String, required: true },
  teams: [{ type: String, required: true }],
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;