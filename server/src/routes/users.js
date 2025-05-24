import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();
router.use(verifyToken);

// list staff
router.get('/', requireRole('ADMIN'), async (req, res) => {
  const staff = await User.find({ role: 'STAFF' }, 'username _id');
  res.json(staff);
});

// create staff
router.post('/', requireRole('ADMIN'), async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(409).json({ message: 'Username taken' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, passwordHash, role: 'STAFF' });
  res.status(201).json({ _id: user._id, username: user.username });
});

// delete staff
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role !== 'STAFF') return res.status(403).json({ message: 'Cannot delete admin' });
  await user.deleteOne();
  res.json({ message: 'Staff deleted' });
});

export default router;
