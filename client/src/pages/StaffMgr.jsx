import { useEffect, useState } from 'react';

export default function StaffMgr() {
  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' };

  const [form, setForm] = useState({ username: '', password: '' });
  const [staff, setStaff] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch('/api/users', { headers })
      .then(r => r.json())
      .then(setStaff);
  }, []);

  const createStaff = async () => {
    setMsg(null);
    const res = await fetch('/api/users', { method: 'POST', headers, body: JSON.stringify(form) });
    if (res.ok) {
      const user = await res.json();
      setStaff(prev => [...prev, user]);
      setForm({ username: '', password: '' });
      setMsg('✅ Staff created');
    } else {
      const err = await res.json();
      setMsg(`❌ ${err.message}`);
    }
  };

  const deleteStaff = async id => {
    if (!confirm('Delete this staff user?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers });
    if (res.ok) setStaff(prev => prev.filter(u => u._id !== id));
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
      <div className="mb-6">
        <input className="border p-2 mr-2" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <input className="border p-2 mr-2" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button className="bg-blue-600 text-white px-3 py-2" onClick={createStaff}>Create Staff</button>
        {msg && <p className="mt-2">{msg}</p>}
      </div>
      <table className="border-collapse w-full">
        <thead><tr className="border"><th className="p-2 text-left">Username</th><th className="p-2 text-center">Action</th></tr></thead>
        <tbody>
          {staff.map(u => (
            <tr key={u._id} className="border">
              <td className="p-2">{u.username}</td>
              <td className="p-2 text-center">
                <button className="bg-red-600 text-white px-2 py-1 text-sm" onClick={() => deleteStaff(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
