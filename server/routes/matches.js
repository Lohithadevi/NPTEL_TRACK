const router = require('express').Router();
const auth = require('../middleware/auth');
const MatchRequest = require('../models/MatchRequest');
const Message = require('../models/Message');
const User = require('../models/User');
const TravelPost = require('../models/TravelPost');
const { sendMatchNotification } = require('../mailer');

// Send a match request
router.post('/', auth, async (req, res) => {
  try {
    const { postId } = req.body;
    const existing = await MatchRequest.findOne({ post: postId, requester: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already requested' });
    const request = await MatchRequest.create({ post: postId, requester: req.user.id });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get incoming requests for my posts
router.get('/incoming', auth, async (req, res) => {
  try {
    const requests = await MatchRequest.find()
      .populate({ path: 'post', match: { creator: req.user.id } })
      .populate('requester', 'name email');
    const filtered = requests.filter(r => r.post !== null);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my sent requests
router.get('/sent', auth, async (req, res) => {
  try {
    const requests = await MatchRequest.find({ requester: req.user.id })
      .populate('post', '_id');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept or reject a request
router.put('/:id', auth, async (req, res) => {
  try {
    const request = await MatchRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('requester', 'name email').populate('post');

    // Send email notification to requester when accepted
    if (req.body.status === 'accepted' && request.requester && request.post) {
      const creator = await User.findById(request.post.creator).select('name');
      sendMatchNotification(
        request.requester.email,
        request.requester.name,
        creator?.name || 'Your travel partner',
        request.post.examName,
        request.post.destination,
        request.post.departureTime
      ).catch(() => {}); // non-blocking, don't fail the request if mail fails
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chat messages for a room + mark all as read
router.get('/chat/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    // Mark all messages in this room as read by current user
    await Message.updateMany(
      { roomId: req.params.roomId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get total unread message count across all rooms
router.get('/unread', auth, async (req, res) => {
  try {
    const myPosts = await TravelPost.find({ creator: req.user.id }).select('_id');
    const myPostIds = myPosts.map(p => p._id);
    const rooms = await MatchRequest.find({
      status: 'accepted',
      $or: [{ requester: req.user.id }, { post: { $in: myPostIds } }]
    }).select('_id');
    const roomIds = rooms.map(r => r._id.toString());
    const count = await Message.countDocuments({
      roomId: { $in: roomIds },
      sender: { $ne: req.user.id },
      readBy: { $ne: req.user.id }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get per-room unread counts
router.get('/unread/rooms', auth, async (req, res) => {
  try {
    const myPosts = await TravelPost.find({ creator: req.user.id }).select('_id');
    const myPostIds = myPosts.map(p => p._id);
    const rooms = await MatchRequest.find({
      status: 'accepted',
      $or: [{ requester: req.user.id }, { post: { $in: myPostIds } }]
    }).select('_id');
    const roomIds = rooms.map(r => r._id.toString());
    // Count unread per room
    const results = await Message.aggregate([
      { $match: { roomId: { $in: roomIds }, sender: { $ne: require('mongoose').Types.ObjectId.createFromHexString(req.user.id) }, readBy: { $ne: require('mongoose').Types.ObjectId.createFromHexString(req.user.id) } } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } }
    ]);
    const map = {};
    results.forEach(r => { map[r._id] = r.count; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get accepted matches (my chat rooms) — for BOTH creator and requester
router.get('/accepted', auth, async (req, res) => {
  try {
    // Get all accepted requests where I am the requester
    const asRequester = await MatchRequest.find({ status: 'accepted', requester: req.user.id })
      .populate({ path: 'post', populate: { path: 'creator', select: 'name email' } })
      .populate('requester', 'name email');

    // Get all accepted requests where I am the post creator
    const myPosts = await require('../models/TravelPost').find({ creator: req.user.id }).select('_id');
    const myPostIds = myPosts.map(p => p._id);
    const asCreator = await MatchRequest.find({ status: 'accepted', post: { $in: myPostIds } })
      .populate({ path: 'post', populate: { path: 'creator', select: 'name email' } })
      .populate('requester', 'name email');

    // Merge and deduplicate
    const all = [...asRequester, ...asCreator];
    const unique = all.filter((r, i, self) => self.findIndex(x => x._id.toString() === r._id.toString()) === i);
    res.json(unique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
