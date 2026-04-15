const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String, required: true, unique: true,
    validate: {
      validator: v => v.endsWith('@stjosephs.ac.in'),
      message: 'Only @stjosephs.ac.in emails are allowed'
    }
  },
  password: { type: String, required: true },
  college: { type: String, default: "St. Joseph's College of Engineering" },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
