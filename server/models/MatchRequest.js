const mongoose = require('mongoose');

const matchRequestSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'TravelPost', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('MatchRequest', matchRequestSchema);
