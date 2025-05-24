import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';

export default function App() {
  const { user } = useContext(AuthContext);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/rooms"
        element={user ? <Rooms /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/reservations"
        element={user ? <Reservations /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
