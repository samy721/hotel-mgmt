import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'STAFF'], default: 'STAFF' }
}, { timestamps: true });

userSchema.methods.validatePassword = function(pw) {
  return bcrypt.compare(pw, this.passwordHash);
};

export default mongoose.model('User', userSchema);
