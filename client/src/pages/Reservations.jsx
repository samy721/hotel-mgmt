import { useEffect, useState } from 'react';

export default function Reservations() {
  /* ---------- state ---------- */
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [reservations, setReservations] = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [form,         setForm]         = useState({
    roomId: '',
    guestName: '',
    checkIn: '',
    checkOut: ''
  });
  const [msg, setMsg] = useState(null);

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    loadReservations();
    loadAvailableRooms();
  }, []);

  /* ---------- helper functions ---------- */
  async function loadReservations() {
    const res = await fetch('/api/reservations', { headers });
    const data = await res.json();
    setReservations(data);
  }

  async function loadAvailableRooms() {
    const res = await fetch('/api/rooms', { headers });
    const data = await res.json();
    setRooms(data.filter(r => r.status === 'Available'));
  }

  async function handleCreateReservation() {
    setMsg(null);
    const res = await fetch('/api/reservations', {
      method: 'POST',
      headers,
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const err = await res.json();
      return setMsg(`❌ ${err.message}`);
    }
    const newRes = await res.json();
    setReservations(prev => [...prev, newRes]);
    setRooms(prev => prev.filter(r => r._id !== form.roomId));
    setForm({ roomId: '', guestName: '', checkIn: '', checkOut: '' });
    setMsg('✅ Booking created!');
  }

  async function handleCancelReservation(id) {
    await fetch(`/api/reservations/${id}/cancel`, {
      method: 'PUT',
      headers
    });
    setReservations(prev =>
      prev.map(r => (r._id === id ? { ...r, status: 'Cancelled' } : r))
    );
  }

  /* ---------- JSX ---------- */
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Reservations</h2>

      {/* New-booking form */}
      <div className="mb-6 border p-4 rounded bg-gray-50">
        <h4 className="font-medium mb-2">New Reservation</h4>

        <select
          className="border p-2 mr-2 mb-2"
          value={form.roomId}
          onChange={e => setForm({ ...form, roomId: e.target.value })}
        >
          <option value="">Select Room</option>
          {rooms.map(r => (
            <option key={r._id} value={r._id}>
              {r.number} – {r.type}
            </option>
          ))}
        </select>

        <input
          className="border p-2 mr-2 mb-2"
          placeholder="Guest name"
          value={form.guestName}
          onChange={e => setForm({ ...form, guestName: e.target.value })}
        />

        <input
          type="date"
          className="border p-2 mr-2 mb-2"
          value={form.checkIn}
          onChange={e => setForm({ ...form, checkIn: e.target.value })}
        />

        <input
          type="date"
          className="border p-2 mr-2 mb-2"
          value={form.checkOut}
          onChange={e => setForm({ ...form, checkOut: e.target.value })}
        />

        <button
          className="bg-blue-600 text-white px-4 py-2"
          disabled={!form.roomId || !form.guestName || !form.checkIn || !form.checkOut}
          onClick={handleCreateReservation}
        >
          Book
        </button>

        {msg && <p className="mt-2">{msg}</p>}
      </div>

      {/* Existing bookings list */}
      <table className="border-collapse w-full">
        <thead>
          <tr className="border">
            <th className="p-2">Room</th>
            <th className="p-2">Guest</th>
            <th className="p-2">Check-In</th>
            <th className="p-2">Check-Out</th>
            <th className="p-2">Status</th>
            <th className="p-2">Total</th>
            <th className="p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(r => (
            <tr key={r._id} className="border">
              <td className="p-2">{r.roomId?.number}</td>
              <td className="p-2">{r.guestName}</td>
              <td className="p-2">{new Date(r.checkIn).toLocaleDateString()}</td>
              <td className="p-2">{new Date(r.checkOut).toLocaleDateString()}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.totalAmount}</td>
              <td className="p-2 text-center">
                {r.status !== 'Cancelled' && (
                  <button
                    className="bg-red-600 text-white px-2 py-1 text-sm"
                    onClick={() => handleCancelReservation(r._id)}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}