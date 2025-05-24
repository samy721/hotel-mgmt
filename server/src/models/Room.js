import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  type: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Occupied', 'Maintenance'], default: 'Available' }
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);
