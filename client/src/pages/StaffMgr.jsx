// client/src/pages/StaffMgr.jsx
import { useEffect, useState } from 'react';
import { UserPlus, Users ,Trash2, AlertTriangle } from 'lucide-react'; 
import Modal from '../components/Modal'; 

export default function StaffMgr() {
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' };

  const [form, setForm] = useState({ username: '', password: '' });
  const [staff, setStaff] = useState([]);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);


  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { headers });
      if (!res.ok) throw new Error('Failed to load staff members');
      const data = await res.json();
      setStaff(data);
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

  const createStaff = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    if (!form.username || !form.password) {
        setMsg({type: 'error', text: 'Username and password are required.'});
        return;
    }
    try {
      const res = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify(form) });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create staff');
      }
      const user = await res.json();
      setStaff(prev => [...prev, user]);
      setForm({ username: '', password: '' });
      setMsg({ type: 'success', text: 'Staff member created successfully!' });
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    }
  };

  const openDeleteModal = (staffMember) => {
    setStaffToDelete(staffMember);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setStaffToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDeleteStaff = async () => {
    if (!staffToDelete) return;
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`/api/users/${staffToDelete._id}`, { method: 'DELETE', headers });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to delete staff member');
      }
      setStaff(prev => prev.filter(u => u._id !== staffToDelete._id));
      setMsg({ type: 'success', text: 'Staff member deleted successfully!' });
    } catch (error) {
      setMsg({ type: 'error', text: error.message });
    } finally {
      closeDeleteModal();
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>

      {msg.text && (
        <div className={`p-4 rounded-md text-sm ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
          {msg.text}
        </div>
      )}

      <form onSubmit={createStaff} className="bg-white p-6 rounded-xl shadow-lg space-y-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Add New Staff Member</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" id="username" placeholder="staff_username"
              value={form.username} onChange={handleInputChange} required
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" id="password" placeholder="••••••••"
              value={form.password} onChange={handleInputChange} required
              className="border border-gray-300 w-full p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <button type="submit"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 h-10"
          >
            <UserPlus size={20} className="mr-2"/> Create Staff
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center text-gray-500">Loading staff...</p>
      ) : staff.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-lg">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No staff members found.</p>
             <p className="text-sm text-gray-400 mt-2">Use the form above to add a new staff member.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full min-w-max text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3">Username</th>
                <th scope="col" className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(u => (
                <tr key={u._id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => openDeleteModal(u)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteStaff}
        title="Confirm Deletion"
      >
        <div className="flex items-start space-x-3">
            <AlertTriangle size={48} className="text-red-500 flex-shrink-0" />
            <div>
                <p className="font-medium">Are you sure you want to delete staff member "{staffToDelete?.username}"?</p>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone.</p>
            </div>
        </div>
      </Modal>
    </div>
  );
}