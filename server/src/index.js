import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservations.js';
import userRoutes from './routes/users.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname)
const app = express();

/* ---------- middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- serve static front-end ---------- */
app.use(express.static(path.join(__dirname, '../../client/dist')));

/* ---------- API routers ---------- */
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

/* ---------- SPA catch-all (MUST be last) ---------- */
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

/* ---------- start server ---------- */
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on :${PORT}`)))
  .catch(console.error);