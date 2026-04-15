const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../mailer');

// In-memory OTP store: { email: { otp, expiresAt, userData } }
// Simple and sufficient — resets on server restart (fine for dev)
const otpStore = {};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Step 1: Validate details + send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email.endsWith('@stjosephs.ac.in'))
      return res.status(400).json({ message: 'Only @stjosephs.ac.in emails allowed' });

    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: 'Enter a valid name' });

    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const otp = generateOTP();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      userData: { name, email, password }
    };

    await sendOTP(email, otp);
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP. Check mail config.' });
  }
});

// Step 2: Verify OTP + create account
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) return res.status(400).json({ message: 'No OTP requested for this email' });
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP expired. Please register again.' });
    }
    if (record.otp !== otp.trim()) return res.status(400).json({ message: 'Invalid OTP' });

    // OTP valid — create user
    const { name, email: userEmail, password } = record.userData;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: userEmail, password: hashed, isVerified: true });
    delete otpStore[email];

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set session
    req.session.userId = user._id.toString();
    req.session.email = user.email;

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login with validation
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    if (!email.endsWith('@stjosephs.ac.in'))
      return res.status(400).json({ message: 'Only @stjosephs.ac.in emails allowed' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'No account found with this email' });

    if (!user.isVerified)
      return res.status(400).json({ message: 'Email not verified. Please register again.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set session
    req.session.userId = user._id.toString();
    req.session.email = user.email;

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout — destroy session
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const record = otpStore[email];
    if (!record) return res.status(400).json({ message: 'No pending registration for this email' });

    const otp = generateOTP();
    record.otp = otp;
    record.expiresAt = Date.now() + 10 * 60 * 1000;

    await sendOTP(email, otp);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

module.exports = router;
