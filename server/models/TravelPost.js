const mongoose = require('mongoose');

const travelPostSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examName: { type: String, required: true },
  destination: { type: String, required: true },
  travelDate: { type: Date, required: true },
  departureTime: { type: String, required: true }, // "HH:MM" format
  seatsAvailable: { type: Number, default: 1 },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('TravelPost', travelPostSchema);
