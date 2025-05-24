import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guestName: { type: String, required: true },
  guestPhone: String,
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['Reserved', 'Checked-In', 'Cancelled'], default: 'Reserved' },
  totalAmount: Number
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
