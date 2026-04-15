require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:3000', credentials: true } });

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Session middleware — stored in MongoDB so it survives server restarts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: false,       // set true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  }
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/matches', require('./routes/matches'));

require('./socket')(io);

// Auto-expire posts: runs every 30 minutes, deletes posts whose travel date has passed
const TravelPost = require('./models/TravelPost');
const expireOldPosts = async () => {
  try {
    const batchEndTimes = {
      'Morning Batch': 12,    // expires after 12 PM
      'Afternoon Batch': 15,  // expires after 3 PM
      'Evening Batch': 23,    // expires after 11 PM
    };
    const now = new Date();
    const posts = await TravelPost.find({ status: 'open' });
    for (const post of posts) {
      const travelDay = new Date(post.travelDate);
      const expireHour = batchEndTimes[post.departureTime] ?? 23;
      travelDay.setHours(expireHour, 0, 0, 0);
      if (now > travelDay) {
        await TravelPost.findByIdAndDelete(post._id);
      }
    }
  } catch (err) {
    console.error('Auto-expire error:', err.message);
  }
};
setInterval(expireOldPosts, 30 * 60 * 1000); // every 30 min
expireOldPosts(); // run once on startup too

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error(err));
