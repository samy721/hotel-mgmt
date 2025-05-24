import { Router } from 'express';
import Room from '../models/Room.js';
import { verifyToken, requireRole } from '../middlewares/auth.js';

const router = Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

router.post('/', requireRole('ADMIN'), async (req, res) => {
  const room = await Room.create(req.body);
  res.status(201).json(room);
});

router.put('/:id', requireRole('ADMIN'), async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
});

router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

export default router;
