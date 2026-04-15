const Message = require('./models/Message');
const MatchRequest = require('./models/MatchRequest');
const User = require('./models/User');
const TravelPost = require('./models/TravelPost');
const { sendMessageNotification } = require('./mailer');

// Track which user is active in which room: { userId: roomId }
const activeRooms = {};

module.exports = (io) => {
  io.on('connection', (socket) => {

    // User registers their userId with socket
    socket.on('register', (userId) => {
      socket.userId = userId;
    });

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      if (socket.userId) activeRooms[socket.userId] = roomId;
    });

    socket.on('sendMessage', async ({ roomId, senderId, senderName, text }) => {
      try {
        const message = await Message.create({
          roomId,
          sender: senderId,
          text,
          readBy: [senderId] // sender has already "read" their own message
        });

        const msgPayload = {
          _id: message._id,
          sender: { _id: senderId, name: senderName },
          text,
          createdAt: message.createdAt,
          roomId
        };

        // Emit message to everyone in the room
        io.to(roomId).emit('receiveMessage', msgPayload);

        // Find the recipient (the other user in this match room)
        const matchRequest = await MatchRequest.findById(roomId)
          .populate('requester', 'name email')
          .populate({ path: 'post', populate: { path: 'creator', select: 'name email' } });

        if (!matchRequest) return;

        const creatorId = matchRequest.post?.creator?._id?.toString();
        const requesterId = matchRequest.requester?._id?.toString();
        const recipientId = senderId === creatorId ? requesterId : creatorId;
        const recipient = senderId === creatorId ? matchRequest.requester : matchRequest.post?.creator;

        if (!recipientId || !recipient) return;

        // Emit unread badge to recipient (works across all pages via socket)
        // Find recipient's socket and emit badge update
        const sockets = await io.fetchSockets();
        const recipientSocket = sockets.find(s => s.userId === recipientId);

        // Mark as read if recipient is currently in this room
        const recipientActiveRoom = activeRooms[recipientId];
        if (recipientActiveRoom === roomId) {
          // They're looking at this chat — mark as read, no badge
          await Message.findByIdAndUpdate(message._id, { $addToSet: { readBy: recipientId } });
        } else {
          // They're not in this room — send badge update
          if (recipientSocket) {
            // Count total unread across all their rooms
            const unreadCount = await getUnreadCount(recipientId);
            recipientSocket.emit('unreadCount', unreadCount);
          }

          // Send email notification (non-blocking)
          sendMessageNotification(
            recipient.email,
            recipient.name,
            senderName,
            text,
            matchRequest.post?.examName
          ).catch(() => {});
        }
      } catch (err) {
        console.error('Socket sendMessage error:', err.message);
      }
    });

    // Mark all messages in a room as read when user opens it
    socket.on('markRead', async ({ roomId, userId }) => {
      await Message.updateMany(
        { roomId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
      // Send updated unread count back
      const unreadCount = await getUnreadCount(userId);
      socket.emit('unreadCount', unreadCount);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      if (socket.userId) delete activeRooms[socket.userId];
    });

    socket.on('disconnect', () => {
      if (socket.userId) delete activeRooms[socket.userId];
    });
  });
};

// Count unread messages across all rooms for a user
async function getUnreadCount(userId) {
  // Get all rooms this user is part of
  const TravelPost = require('./models/TravelPost');
  const myPosts = await TravelPost.find({ creator: userId }).select('_id');
  const myPostIds = myPosts.map(p => p._id);

  const rooms = await MatchRequest.find({
    status: 'accepted',
    $or: [{ requester: userId }, { post: { $in: myPostIds } }]
  }).select('_id');

  const roomIds = rooms.map(r => r._id.toString());

  const count = await Message.countDocuments({
    roomId: { $in: roomIds },
    sender: { $ne: userId },
    readBy: { $ne: userId }
  });

  return count;
}
