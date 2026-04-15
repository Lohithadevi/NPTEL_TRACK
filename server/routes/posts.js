const router = require('express').Router();
const auth = require('../middleware/auth');
const TravelPost = require('../models/TravelPost');

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const post = await TravelPost.create({ ...req.body, creator: req.user.id });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get matching posts (same destination, same batch, same date)
router.get('/matches', auth, async (req, res) => {
  try {
    const { destination, travelDate, departureTime } = req.query;
    const startOfDay = new Date(travelDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(travelDate);
    endOfDay.setHours(23, 59, 59, 999);

    const posts = await TravelPost.find({
      destination: { $regex: destination, $options: 'i' },
      travelDate: { $gte: startOfDay, $lte: endOfDay },
      departureTime,
      creator: { $ne: req.user.id },
      status: 'open'
    }).populate('creator', 'name email');

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my posts
router.get('/my', auth, async (req, res) => {
  try {
    const posts = await TravelPost.find({ creator: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all open posts (feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await TravelPost.find({ status: 'open', creator: { $ne: req.user.id } })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete my post (only creator)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await TravelPost.findOne({ _id: req.params.id, creator: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });
    await TravelPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
