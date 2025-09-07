require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

let mongoReadyPromise = null;
let memoryServer = null; // reference to in-memory mongo for cleanup
async function connectDB() {
  if (mongoReadyPromise) return mongoReadyPromise;
  // Prefer the real MongoDB when available. For tests we always use an
  // in-memory server. For local development, if the configured MONGO_URI
  // (e.g. Atlas) fails to connect we fall back to an in-memory MongoDB
  // so the app remains usable without external network access.
  const { MongoMemoryServer } = require('mongodb-memory-server');
  if (process.env.NODE_ENV === 'test') {
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    mongoReadyPromise = mongoose.connect(uri, {});
    return mongoReadyPromise;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb';
  const connectOpts = { serverSelectionTimeoutMS: 5000 };
  try {
    mongoReadyPromise = mongoose.connect(uri, connectOpts);
    await mongoReadyPromise;
    console.log('Connected to MongoDB');
    return mongoReadyPromise;
  } catch (err) {
    console.error('Primary MongoDB connection failed — falling back to in-memory MongoDB:', err.message);
    // start an in-memory mongo for local/dev use
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    mongoReadyPromise = mongoose.connect(memUri, {});
    await mongoReadyPromise;
    console.log('Connected to in-memory MongoDB');
    return mongoReadyPromise;
  }
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
  mongoReadyPromise = null;
}

// DB connection will be established right before the server starts.

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String // NOTE: Store hashed passwords in production
});
const User = mongoose.model('User', userSchema);

// Task schema
const taskSchema = new mongoose.Schema({
  userId: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

// Register
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hash });
    await user.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  let ok = false;
  try {
    ok = await bcrypt.compare(password, user.password);
  } catch (e) {
    ok = false;
  }
  // fallback for users created before password hashing was added
  if (!ok) {
    if (user.password === password) {
      // stored password appears to be plaintext - migrate to bcrypt
      const newHash = await bcrypt.hash(password, 10);
      user.password = newHash;
      await user.save();
      ok = true;
      console.log(`Migrated password for user ${username} to bcrypt hash`);
    }
  }
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// CRUD for tasks
app.get('/tasks', auth, async (req, res) => {
  const q = req.query.q || '';
  const sort = req.query.sort || '';
  const filter = q ? { userId: req.userId, text: { $regex: q, $options: 'i' } } : { userId: req.userId };
  let cursor = Task.find(filter);
  if (sort === 'asc') cursor = cursor.sort({ text: 1 });
  else if (sort === 'desc') cursor = cursor.sort({ text: -1 });
  else cursor = cursor.sort({ createdAt: -1 });
  const tasks = await cursor.exec();
  res.json(tasks);
});
app.post('/tasks', auth, async (req, res) => {
  if (!req.body.text) return res.status(400).json({ error: 'Missing text' });
  const task = new Task({ userId: req.userId, text: req.body.text });
  await task.save();
  res.json(task);
});
app.put('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { text: req.body.text }, { new: true });
  if (!task) return res.status(404).json({ error: 'Not found' });
  res.json(task);
});
app.delete('/tasks/:id', auth, async (req, res) => {
  const deleted = await Task.deleteOne({ _id: req.params.id, userId: req.userId });
  if (!deleted.deletedCount) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(port, () => console.log('Server running on port ' + port));
  });
}

module.exports = { app, connectDB, disconnectDB };
