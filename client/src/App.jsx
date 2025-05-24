// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';
import StaffMgr from './pages/StaffMgr';
import Layout from './components/Layout'; 

export default function App() {
  const { user } = useContext(AuthContext);

  const PrivateRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return <Layout>{children}</Layout>;
  };

  const AdminOnlyRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (user.role !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }
    return <Layout>{children}</Layout>;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
      <Route path="/reservations" element={<PrivateRoute><Reservations /></PrivateRoute>} />
      <Route path="/staff" element={<AdminOnlyRoute><StaffMgr /></AdminOnlyRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
