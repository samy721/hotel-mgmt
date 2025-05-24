import { Router } from 'express';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();
router.use(verifyToken);

router.get('/', async (req, res) => {
  const reservations = await Reservation.find().populate('roomId', 'number');
  res.json(reservations);
});

router.post('/', async (req, res) => {
  const { roomId, checkIn, checkOut, guestName } = req.body;
  const room = await Room.findById(roomId);
  if (!room || room.status !== 'Available')
    return res.status(400).json({ message: 'Room not available' });

  const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
  const totalAmount = nights * room.pricePerNight;

  const reservation = await Reservation.create({ ...req.body, totalAmount });
  room.status = 'Occupied';
  await room.save();

  res.status(201).json(reservation);
});

router.put('/:id/cancel', async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) return res.status(404).json({ message: 'Not found' });
  reservation.status = 'Cancelled';
  await reservation.save();

  const room = await Room.findById(reservation.roomId);
  if (room) {
    room.status = 'Available';
    await room.save();
  }

  res.json(reservation);
});

export default router;
