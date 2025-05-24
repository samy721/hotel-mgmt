// client/src/components/Layout.jsx
import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, BedDouble, CalendarCheck, Users, LogOut, Hotel } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', text: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/rooms', text: 'Room Management', icon: <BedDouble size={20} /> },
    { to: '/reservations', text: 'Reservations', icon: <CalendarCheck size={20} /> },
  ];

  if (user && user.role === 'ADMIN') {
    navItems.push({ to: '/staff', text: 'Staff Management', icon: <Users size={20} /> });
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-gray-700">
          <Hotel size={32} className="text-blue-400 mr-2" />
          <h1 className="text-2xl font-semibold">Hotel Admin</h1>
        </div>
        <nav className="flex-grow mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'} // Dashboard ke liye exact match
              className={({ isActive }) =>
                `flex items-center py-3 px-6 transition-colors duration-200 hover:bg-gray-700 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
                }`
              }
            >
              {item.icon && <span className="mr-3">{item.icon}</span>}
              {item.text}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
          {user && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              Logged in as: {user.username} ({user.role})
            </p>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700">Welcome, {user?.username}!</h2>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}