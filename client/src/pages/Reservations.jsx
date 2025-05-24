// client/src/pages/Reservations.jsx
import { useEffect, useState } from 'react';
import { PlusCircle, CalendarDays, User, Phone, DollarSign, XCircle, Sparkles } from 'lucide-react';

export default function Reservations() {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomId: '', guestName: '', guestPhone: '', checkIn: '', checkOut: ''
  });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    loadReservations();
    loadAvailableRooms();
  }, []);

  async function loadReservations() {
    setLoading(true);
    try {
      const res = await fetch('/api/reservations', { headers });
      if(!res.ok) throw new Error('Failed to load reservations');
      const data = await res.json();
      setReservations(data);
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableRooms() {
    setLoadingRooms(true);
    try {
      const res = await fetch('/api/rooms', { headers });
      if(!res.ok) throw new Error('Failed to load rooms');
      const data = await res.json();
      setRooms(data.filter(r => r.status === 'Available'));
    } catch (error) {
      setMsg({ type: 'error', text: `Error loading rooms: ${error.message}` });
    } finally {
      setLoadingRooms(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!form.roomId || !form.guestName || !form.checkIn || !form.checkOut) {
      setMsg({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }
    if (new Date(form.checkOut) <= new Date(form.checkIn)) {
        setMsg({ type: 'error', text: 'Check-out date must be after check-in date.' });
        return;
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST', headers, body: JSON.stringify(form)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create reservation');
      }
      setMsg({ type: 'success', text: 'Reservation created successfully!' });
      loadReservations(); 
      loadAvailableRooms(); 
      setForm({ roomId: '', guestName: '', guestPhone: '', checkIn: '', checkOut: '' });
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    }
  };

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'PUT', headers });
       if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to cancel reservation');
      }
      setMsg({ type: 'success', text: 'Reservation cancelled successfully!' });
      loadReservations(); 
      loadAvailableRooms(); 
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Reserved': return 'bg-blue-100 text-blue-700';
      case 'Checked-In': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reservations Management</h1>

      {msg.text && (
        <div className={`p-4 rounded-md text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
          {msg.text}
        </div>
      )}

      <form onSubmit={handleCreateReservation} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Create New Reservation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <select name="roomId" id="roomId" value={form.roomId} onChange={handleInputChange} required
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option value="">{loadingRooms ? "Loading rooms..." : "Select a Room"}</option>
              {rooms.map(r => (
                <option key={r._id} value={r._id}>
                  Room {r.number} ({r.type}) - ${r.pricePerNight}/night
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
            <input type="text" name="guestName" id="guestName" placeholder="John Doe"
              value={form.guestName} onChange={handleInputChange} required
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="guestPhone" className="block text-sm font-medium text-gray-700 mb-1">Guest Phone (Optional)</label>
            <input type="tel" name="guestPhone" id="guestPhone" placeholder="123-456-7890"
              value={form.guestPhone} onChange={handleInputChange}
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-1">Check-In Date</label>
            <input type="date" name="checkIn" id="checkIn" value={form.checkIn} onChange={handleInputChange} required
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-1">Check-Out Date</label>
            <input type="date" name="checkOut" id="checkOut" value={form.checkOut} onChange={handleInputChange} required
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit"
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
            disabled={!form.roomId || !form.guestName || !form.checkIn || !form.checkOut || loadingRooms}
          >
            <PlusCircle size={20} className="mr-2"/> Create Reservation
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <CalendarCheck size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No reservations found.</p>
            <p className="text-sm text-gray-400 mt-2">Use the form above to create a new reservation.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full min-w-max text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Room</th>
                <th scope="col" className="px-6 py-3"><User size={16} className="inline mr-1" /> Guest</th>
                <th scope="col" className="px-6 py-3"><Phone size={16} className="inline mr-1" /> Phone</th>
                <th scope="col" className="px-6 py-3"><CalendarDays size={16} className="inline mr-1" /> Check-In</th>
                <th scope="col" className="px-6 py-3"><CalendarDays size={16} className="inline mr-1" /> Check-Out</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3"><DollarSign size={16} className="inline mr-1" /> Total</th>
                <th scope="col" className="px-6 py-3 text-center" colSpan={2}>Actions</th> {/* Colspan updated */}
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.roomId?.number || 'N/A'}</td>
                  <td className="px-6 py-4">{r.guestName}</td>
                  <td className="px-6 py-4">{r.guestPhone || '-'}</td>
                  <td className="px-6 py-4">{new Date(r.checkIn).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(r.checkOut).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">${Number(r.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    {r.status !== 'Cancelled' && (
                      <button onClick={() => handleCancelReservation(r._id)}
                        className="flex items-center mx-auto text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors text-xs"
                      >
                        <XCircle size={16} className="mr-1"/> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}