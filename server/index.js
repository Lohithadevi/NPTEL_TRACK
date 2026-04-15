require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: FRONTEND_URL, credentials: true }
});

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: isProd,         // true on Render (HTTPS), false on localhost
    sameSite: isProd ? 'none' : 'lax',  // 'none' required for cross-origin on Render
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/matches', require('./routes/matches'));

require('./socket')(io);

// Auto-expire posts every 30 minutes
const TravelPost = require('./models/TravelPost');
const expireOldPosts = async () => {
  try {
    const batchEndTimes = {
      'Morning Batch': 12,
      'Afternoon Batch': 15,
      'Evening Batch': 23,
    };
    const now = new Date();
    const posts = await TravelPost.find({ status: 'open' });
    for (const post of posts) {
      const travelDay = new Date(post.travelDate);
      const expireHour = batchEndTimes[post.departureTime] ?? 23;
      travelDay.setHours(expireHour, 0, 0, 0);
      if (now > travelDay) await TravelPost.findByIdAndDelete(post._id);
    }
  } catch (err) {
    console.error('Auto-expire error:', err.message);
  }
};
setInterval(expireOldPosts, 30 * 60 * 1000);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    expireOldPosts();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
