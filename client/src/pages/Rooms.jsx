// client/src/pages/Rooms.jsx
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle, Edit3, Trash2, Bed, Tag, DollarSign } from 'lucide-react';

export default function Rooms() {
  const { user } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ number: '', type: '', pricePerNight: '' });
  const [editingRoom, setEditingRoom] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms', { headers });
      if (!res.ok) throw new Error('Failed to load rooms');
      const data = await res.json();
      setRooms(data);
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const payload = {
      number: form.number,
      type: form.type,
      pricePerNight: Number(form.pricePerNight)
    };

    if (!payload.number || !payload.type || !payload.pricePerNight || payload.pricePerNight <= 0) {
      setMsg({ type: 'error', text: 'Please fill all fields correctly. Price must be positive.' });
      return;
    }
    
    const url = editingRoom ? `/api/rooms/${editingRoom._id}` : '/api/rooms';
    const method = editingRoom ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `Failed to ${editingRoom ? 'update' : 'add'} room`);
      }
      const savedRoom = await res.json();
      if (editingRoom) {
        setRooms(prev => prev.map(r => r._id === savedRoom._id ? savedRoom : r));
        setMsg({ type: 'success', text: 'Room updated successfully!' });
      } else {
        setRooms(prev => [...prev, savedRoom]);
        setMsg({ type: 'success', text: 'Room added successfully!' });
      }
      setForm({ number: '', type: '', pricePerNight: '' });
      setEditingRoom(null);
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    }
  };
  
  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setForm({ number: room.number, type: room.type, pricePerNight: room.pricePerNight });
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) return;
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE', headers });
      if (!res.ok) {
         const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete room');
      }
      setRooms(prev => prev.filter(r => r._id !== roomId));
      setMsg({ type: 'success', text: 'Room deleted successfully!' });
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Occupied': return 'bg-yellow-100 text-yellow-700';
      case 'Maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Room Management</h1>
      </div>

      {msg.text && (
        <div className={`p-4 rounded-md text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
          {msg.text}
        </div>
      )}

      {user.role === 'ADMIN' && (
        <form onSubmit={handleSubmitRoom} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">{editingRoom ? 'Edit Room' : 'Add New Room'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input
                type="text" name="number" id="number" placeholder="e.g., 101"
                value={form.number} onChange={handleInputChange}
                className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <input
                type="text" name="type" id="type" placeholder="e.g., Deluxe, Standard"
                value={form.type} onChange={handleInputChange}
                className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700 mb-1">Price per Night ($)</label>
              <input
                type="number" name="pricePerNight" id="pricePerNight" placeholder="e.g., 150"
                value={form.pricePerNight} onChange={handleInputChange}
                className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0.01" step="0.01"
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            {editingRoom && (
              <button type="button" onClick={() => { setEditingRoom(null); setForm({ number: '', type: '', pricePerNight: '' }); }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150"
            >
              {editingRoom ? <Edit3 size={18} className="mr-2"/> : <PlusCircle size={18} className="mr-2"/>}
              {editingRoom ? 'Save Changes' : 'Add Room'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-500">Loading rooms...</p>
      ) : rooms.length === 0 ? (
         <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <Bed size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No rooms found.</p>
            {user.role === 'ADMIN' && <p className="text-sm text-gray-400 mt-2">Click "Add New Room" to get started.</p>}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full min-w-max text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3"><Bed size={16} className="inline mr-1" /> Room #</th>
                <th scope="col" className="px-6 py-3"><Tag size={16} className="inline mr-1" /> Type</th>
                <th scope="col" className="px-6 py-3"><DollarSign size={16} className="inline mr-1" /> Price/Night</th>
                <th scope="col" className="px-6 py-3">Status</th>
                {user.role === 'ADMIN' && <th scope="col" className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.number}</td>
                  <td className="px-6 py-4">{r.type}</td>
                  <td className="px-6 py-4">${Number(r.pricePerNight).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  {user.role === 'ADMIN' && (
                    <td className="px-6 py-4 text-center space-x-2">
                      <button onClick={() => handleEditRoom(r)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => handleDeleteRoom(r._id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}