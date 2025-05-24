// server/src/models/Reservation.js
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guestName: { type: String, required: true },
  guestPhone: String,
  checkIn: Date, // Expected check-in date
  checkOut: Date, // Expected check-out date
  actualCheckIn: Date, // Actual check-in time
  actualCheckOut: Date, // Actual check-out time
  status: { 
    type: String, 
    enum: ['Reserved', 'Checked-In', 'Checked-Out', 'Cancelled'], // 'Checked-Out' status add kiya gaya
    default: 'Reserved' 
  },
  totalAmount: Number
}, { timestamps: true }); // createdAt aur updatedAt fields automatically add ho jayenge

export default mongoose.model('Reservation', reservationSchema);