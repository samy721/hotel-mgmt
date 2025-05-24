import { useEffect, useState } from 'react';

export default function Reservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetch('/api/reservations', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(setReservations);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl mb-3">Reservations</h2>
      <table className="border-collapse w-full">
        <thead>
          <tr><th>Room</th><th>Guest</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Total</th></tr>
        </thead>
        <tbody>
          {reservations.map(res => (
            <tr key={res._id} className="border">
              <td>{res.roomId?.number}</td>
              <td>{res.guestName}</td>
              <td>{new Date(res.checkIn).toLocaleDateString()}</td>
              <td>{new Date(res.checkOut).toLocaleDateString()}</td>
              <td>{res.status}</td>
              <td>{res.totalAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
