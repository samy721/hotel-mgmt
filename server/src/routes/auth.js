import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await user.validatePassword(password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { username: user.username, role: user.role } });
});

// Simple seed admin route (remove in prod)
router.post('/seed-admin', async (req, res) => {
  const exists = await User.findOne({ role: 'ADMIN' });
  if (exists) return res.json({ message: 'Admin exists' });
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await User.create({ username: 'admin', passwordHash, role: 'ADMIN' });
  res.json({ message: 'Seeded admin', admin });
});

export default router;
