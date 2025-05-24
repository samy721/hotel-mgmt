import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';
import StaffMgr from './pages/StaffMgr';

export default function App() {
  const { user } = useContext(AuthContext);

  const Private = ({ children }) =>
    user ? children : <Navigate to="/login" replace />;

  const AdminOnly = ({ children }) =>
    user && user.role === 'ADMIN' ? children : <Navigate to="/" replace />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Private><Dashboard /></Private>} />
      <Route path="/rooms" element={<Private><Rooms /></Private>} />
      <Route path="/reservations" element={<Private><Reservations /></Private>} />
      <Route path="/staff" element={<AdminOnly><StaffMgr /></AdminOnly>} />
    </Routes>
  );
}
