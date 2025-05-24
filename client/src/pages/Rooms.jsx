import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Rooms() {
  /* ---------- context & state ---------- */
  const { user } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [form,  setForm]  = useState({
    number: '',
    type: '',
    pricePerNight: ''
  });

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    loadRooms();
  }, []);

  /* ---------- helper functions ---------- */
  async function loadRooms() {
    const res  = await fetch('/api/rooms', { headers });
    const data = await res.json();
    setRooms(data);
  }

  async function handleAddRoom() {
    const payload = {
      number:        form.number,
      type:          form.type,
      pricePerNight: Number(form.pricePerNight)
    };
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const room = await res.json();
      setRooms(prev => [...prev, room]);
      setForm({ number: '', type: '', pricePerNight: '' });
    }
  }

  /* ---------- JSX ---------- */
  return (
    <div className="p-6">
      <h2 className="text-xl mb-3">Rooms</h2>

      {/* Add-room form – Admin only */}
      {user.role === 'ADMIN' && (
        <div className="mb-4">
          <input
            className="border p-1 mr-2"
            placeholder="Number"
            value={form.number}
            onChange={e => setForm({ ...form, number: e.target.value })}
          />
          <input
            className="border p-1 mr-2"
            placeholder="Type"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
          />
          <input
            className="border p-1 mr-2"
            placeholder="Price"
            value={form.pricePerNight}
            onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
          />
          <button
            className="bg-green-600 text-white px-3 py-1"
            disabled={!form.number || !form.type || !form.pricePerNight}
            onClick={handleAddRoom}
          >
            Add
          </button>
        </div>
      )}

      {/* Rooms list */}
      <table className="border-collapse w-full">
        <thead>
          <tr><th>#</th><th>Type</th><th>Price</th><th>Status</th></tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r._id} className="border">
              <td>{r.number}</td>
              <td>{r.type}</td>
              <td>{r.pricePerNight}</td>
              <td>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}