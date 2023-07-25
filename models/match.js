const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  match_date: { type: Date, required: true },
  start_time: { type: String, required: true },
  score: { type: String, default: 'NA' },
  status: { type: String, enum: ['not-started', 'in-progress', 'ended'], default: 'not-started' },
  stadium: { type: String, required: true },
  teams: [{ type: String, required: true }],
});

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;