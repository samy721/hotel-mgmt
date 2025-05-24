import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="space-y-2">
        <li><Link to="/rooms" className="text-blue-600">Room Management</Link></li>
        <li><Link to="/reservations" className="text-blue-600">Reservations</Link></li>
        {user.role === 'ADMIN' && (
          <li><Link to="/staff" className="text-blue-600">Staff Management</Link></li>
        )}
      </ul>
    </div>
  );
}
