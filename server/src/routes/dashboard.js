// server/src/routes/dashboard.js
import { Router } from 'express';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Sabhi dashboard routes ko token verification se protect karein
router.use(verifyToken);

router.get('/stats', async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const activeReservations = await Reservation.countDocuments({ 
      status: { $in: ['Reserved', 'Checked-In'] } 
    });
    const staffMembers = await User.countDocuments({ role: 'STAFF' });
    const currentlyCheckedInGuests = await Reservation.countDocuments({ status: 'Checked-In' }); // Naya statistic

    let occupancyRate = 0;
    if (totalRooms > 0) {
      occupancyRate = parseFloat(((occupiedRooms / totalRooms) * 100).toFixed(1));
    }

    const recentActivityDocs = await Reservation.find()
      .sort({ createdAt: -1 }) 
      .limit(3)
      .populate('roomId', 'number type'); 

    const recentActivities = recentActivityDocs.map(act => {
      let message = `New reservation by ${act.guestName}`;
      if (act.roomId) {
        message += ` for Room ${act.roomId.number} (${act.roomId.type})`;
      }
      message += ` on ${new Date(act.createdAt).toLocaleDateString()}.`; 
      return {
        id: act._id,
        message: message,
        timestamp: act.createdAt 
      };
    });


    res.json({
      totalRooms,
      activeReservations,
      staffMembers,
      occupancyRate,
      currentlyCheckedInGuests, // Response mein add kiya gaya
      recentActivities 
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

export default router;