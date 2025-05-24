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
import dashboardRoutes from './routes/dashboard.js'; // Naya import
import pingRoutes from './routes/ping.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// console.log(__dirname) // Commented out as it's not essential for this change
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
app.use('/api/dashboard', dashboardRoutes); // Naya route
app.use('/ping', pingRoutes);

/* ---------- SPA catch-all (MUST be last) ---------- */
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

/* ---------- start server ---------- */
const PORT = process.env.PORT || 5000; // Default port 5000 agar env mein define nahi hai
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`Server chal raha hai port: ${PORT} par`)))
  .catch(error => { // Error ko log karein
    console.error('Database connection error:', error);
    process.exit(1); // Connection fail hone par exit karein
  });
