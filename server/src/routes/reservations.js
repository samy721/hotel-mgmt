// server/src/routes/reservations.js
import { Router } from 'express';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();
router.use(verifyToken); // Sabhi reservation routes ko protect karein

// GET all reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('roomId', 'number type pricePerNight'); // Room details ko populate karein
    res.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ message: 'Failed to fetch reservations' });
  }
});

// POST a new reservation
router.post('/', async (req, res) => {
  const { roomId, checkIn, checkOut, guestName, guestPhone } = req.body;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
        return res.status(404).json({ message: 'Room not found' });
    }
    // Room availability check (overlapping reservations)
    const overlappingReservations = await Reservation.find({
        roomId: roomId,
        status: { $in: ['Reserved', 'Checked-In'] },
        $or: [
            // New reservation starts during an existing one
            { checkIn: { $lt: new Date(checkOut) }, $expr: { $gt: ["$checkOut", new Date(checkIn)] } },
             // New reservation ends during an existing one (covered by above)
            // New reservation completely encloses an existing one (covered by above)
            // Existing reservation completely encloses new one
            { $expr: { $lte: ["$checkIn", new Date(checkIn)] }, $expr: { $gte: ["$checkOut", new Date(checkOut)]} }
        ]
    });

    if(overlappingReservations.length > 0){
        return res.status(400).json({ message: 'Room is not available for the selected dates. It is already booked or reserved.' });
    }
    
    // Also check room's own status if it's not 'Available' for other reasons (e.g. Maintenance)
    // This check is secondary to the overlapping check if we assume 'Available' means no active bookings.
    if (room.status !== 'Available' && overlappingReservations.length === 0) {
        // This case might indicate a room is under maintenance or some other non-booking related status.
        // However, the overlapping check is more crucial for booking conflicts.
        // If the previous logic was to only rely on room.status, this check is important.
        // For now, if overlapping check passes, we assume the room can be booked if it's not 'Maintenance' etc.
        // The primary source of truth for booking availability should be existing reservations.
    }


    if (new Date(checkOut) <= new Date(checkIn)) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date.' });
    }

    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        return res.status(400).json({ message: 'Duration of stay must be at least 1 night.' });
    }
    const totalAmount = nights * room.pricePerNight;

    const reservation = await Reservation.create({ 
        roomId, 
        guestName, 
        guestPhone, 
        checkIn, 
        checkOut, 
        totalAmount // Initial total amount
    });
    
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: 'Failed to create reservation' });
  }
});

// PUT to cancel a reservation
router.put('/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id).populate('roomId', 'pricePerNight'); // Populate room for price
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (reservation.status === 'Cancelled' || reservation.status === 'Checked-Out') {
        return res.status(400).json({ message: `Cannot cancel a reservation that is already ${reservation.status.toLowerCase()}.` });
    }

    const oldStatus = reservation.status;
    reservation.status = 'Cancelled';
    // Agar guest ne check-in kiya tha aur fir cancel kar raha hai (depends on hotel policy, usually not allowed or has charges)
    // For simplicity, we are not recalculating any cancellation charges here.
    await reservation.save();

    if (oldStatus === 'Checked-In' || oldStatus === 'Reserved') {
        const room = await Room.findById(reservation.roomId);
        if (room) {
            const otherActiveReservations = await Reservation.countDocuments({
                roomId: reservation.roomId,
                _id: { $ne: reservation._id }, 
                status: { $in: ['Reserved', 'Checked-In'] }
            });

            if (otherActiveReservations === 0) {
                room.status = 'Available';
                await room.save();
            }
        }
    }
    res.json(reservation);
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ message: 'Failed to cancel reservation' });
  }
});

// PUT to check-in a reservation
router.put('/:id/checkin', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('roomId', 'pricePerNight');
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        if (reservation.status !== 'Reserved') {
            return res.status(400).json({ message: `Only 'Reserved' bookings can be checked-in. Current status: ${reservation.status}` });
        }
        if (!reservation.roomId || !reservation.roomId.pricePerNight) {
            return res.status(500).json({ message: 'Room details or price per night not found for this reservation.' });
        }

        reservation.status = 'Checked-In';
        reservation.actualCheckIn = new Date(); 
        
        // Total amount ko original booked duration ke liye re-confirm karein
        // Yeh tab zaroori hai agar booking ke time price change ho sakta tha ya koi discount tha
        // Abhi ke liye, hum assume kar rahe hain ki booking ke time ka amount sahi tha.
        const nightsBooked = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));
        reservation.totalAmount = nightsBooked * reservation.roomId.pricePerNight;

        await reservation.save();

        const room = await Room.findById(reservation.roomId._id); // Use _id from populated roomId
        if (room) {
            room.status = 'Occupied';
            await room.save();
        } else {
            console.warn(`Room not found for reservation ${reservation._id} during check-in.`);
        }
        
        res.json(reservation);
    } catch (error) {
        console.error("Error during check-in:", error);
        res.status(500).json({ message: 'Failed to process check-in' });
    }
});

// PUT to check-out a reservation
router.put('/:id/checkout', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('roomId', 'pricePerNight'); // Room details (price) populate karein
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }
        if (reservation.status !== 'Checked-In') {
            return res.status(400).json({ message: `Only 'Checked-In' bookings can be checked-out. Current status: ${reservation.status}` });
        }
        if (!reservation.actualCheckIn) {
            return res.status(400).json({ message: 'Cannot checkout as actual check-in time is not recorded.' });
        }
        if (!reservation.roomId || !reservation.roomId.pricePerNight) {
            return res.status(500).json({ message: 'Room details or price per night not found for this reservation.' });
        }

        reservation.status = 'Checked-Out';
        reservation.actualCheckOut = new Date(); 

        // Actual nights stayed calculate karein
        // Ensure dates are treated as date objects and time components are handled correctly for night calculation.
        // For simplicity, we'll compare dates directly. A more robust solution might involve a date library.
        const actualCheckInDate = new Date(reservation.actualCheckIn);
        const actualCheckOutDate = new Date(reservation.actualCheckOut);

        // Normalize dates to midnight for day difference calculation to ensure full days are counted
        const startOfDayActualCheckIn = new Date(actualCheckInDate.getFullYear(), actualCheckInDate.getMonth(), actualCheckInDate.getDate());
        const startOfDayActualCheckOut = new Date(actualCheckOutDate.getFullYear(), actualCheckOutDate.getMonth(), actualCheckOutDate.getDate());

        let actualNightsStayed = Math.ceil((startOfDayActualCheckOut - startOfDayActualCheckIn) / (1000 * 60 * 60 * 24));
        
        // Agar check-in aur check-out same din hain, toh 1 night consider karein (hotel policy par depend karta hai)
        if (actualNightsStayed <= 0) {
            actualNightsStayed = 1; 
        }
        
        // Total amount recalculate karein based on actual stay
        reservation.totalAmount = actualNightsStayed * reservation.roomId.pricePerNight;

        await reservation.save();

        const room = await Room.findById(reservation.roomId._id); // Use _id from populated roomId
        if (room) {
            const otherActiveReservations = await Reservation.countDocuments({
                roomId: reservation.roomId._id,
                _id: { $ne: reservation._id }, 
                status: { $in: ['Reserved', 'Checked-In'] }
            });

            if (otherActiveReservations === 0) { 
                room.status = 'Available'; 
                await room.save();
            }
        } else {
            console.warn(`Room not found for reservation ${reservation._id} during check-out.`);
        }
        
        res.json(reservation);
    } catch (error) {
        console.error("Error during check-out:", error);
        res.status(500).json({ message: 'Failed to process check-out' });
    }
});


export default router;