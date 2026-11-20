const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT =5000;

app.use(cors());
app.use(express.json());
mongoose
  .connect('mongodb+srv://nirikshakotianb:yuyuyuhh@cluster0.pvk0ift.mongodb.net/signup_db?compressors=zlib')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

app.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'Account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    await user.save();

    return res.status(201).json({
      message: 'Account created successfully!',
      user: { id: user._id, email: user.email, createdAt: user.createdAt },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running at http://localhost:${PORT}`);
});