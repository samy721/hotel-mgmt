import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <ul className="space-y-2">
        <li><Link className="text-blue-600" to="/rooms">Room Management</Link></li>
        <li><Link className="text-blue-600" to="/reservations">Reservations</Link></li>
      </ul>
    </div>
  );
}
