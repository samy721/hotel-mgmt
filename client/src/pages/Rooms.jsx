import { useEffect, useState } from 'react';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ number: '', type: '', pricePerNight: '' });

  useEffect(() => {
    fetch('/api/rooms', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json())
      .then(setRooms);
  }, []);

  const addRoom = async () => {
    const res = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    });
    const newRoom = await res.json();
    setRooms(prev => [...prev, newRoom]);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-3">Rooms</h2>
      <input placeholder="Number" className="border p-1 mr-2" onChange={e => setForm({ ...form, number: e.target.value })} />
      <input placeholder="Type" className="border p-1 mr-2" onChange={e => setForm({ ...form, type: e.target.value })} />
      <input placeholder="Price" className="border p-1 mr-2" onChange={e => setForm({ ...form, pricePerNight: e.target.value })} />
      <button className="bg-green-600 text-white px-3 py-1" onClick={addRoom}>Add</button>

      <table className="mt-4 border-collapse w-full">
        <thead><tr><th>#</th><th>Type</th><th>Price</th><th>Status</th></tr></thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r._id} className="border"><td>{r.number}</td><td>{r.type}</td><td>{r.pricePerNight}</td><td>{r.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
