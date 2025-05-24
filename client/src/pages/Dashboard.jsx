// client/src/pages/Dashboard.jsx (Existing file - updated)
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BarChart, BedDouble, CalendarCheck, Users, ListChecks, AlertTriangle } from 'lucide-react';

// Default structure for stats, values will be updated from API
const initialDashboardStats = [
  { key: 'totalRooms', name: 'Total Rooms', value: '0', icon: <BedDouble className="text-blue-500" size={24} />, color: 'blue' },
  { key: 'activeReservations', name: 'Active Reservations', value: '0', icon: <CalendarCheck className="text-green-500" size={24} />, color: 'green' },
  { key: 'staffMembers', name: 'Staff Members', value: '0', icon: <Users className="text-yellow-500" size={24} />, color: 'yellow' },
  { key: 'occupancyRate', name: 'Occupancy Rate', value: '0%', icon: <BarChart className="text-purple-500" size={24} />, color: 'purple' },
];

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState({
    stats: initialDashboardStats,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token'); // Auth token fetch karein

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}` // Token include karein
          }
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard data');
        }
        const data = await res.json();
        
        // API se mile data ke saath stats ko update karein
        const updatedStats = initialDashboardStats.map(stat => {
          if (Object.prototype.hasOwnProperty.call(data, stat.key)) {
            return { ...stat, value: stat.key === 'occupancyRate' ? `${data[stat.key]}%` : data[stat.key].toString() };
          }
          return stat;
        });

        setDashboardData({
          stats: updatedStats,
          recentActivities: data.recentActivities || []
        });

      } catch (err) {
        setError(err.message);
        // Error hone par default stats rakhein
        setDashboardData({ stats: initialDashboardStats, recentActivities: [] });
      } finally {
        setLoading(false);
      }
    };

    if (token) { // Token hone par hi fetch karein
        fetchDashboardData();
    } else {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
    }
  }, [token]); // Token change hone par re-fetch karein

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Hotel Dashboard</h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center" role="alert">
          <AlertTriangle size={20} className="mr-2 text-red-600" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat) => (
          <div key={stat.name} className={`bg-white p-6 rounded-xl shadow-lg border-l-4 border-${stat.color}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">{stat.name}</p>
                <p className="text-3xl font-semibold text-gray-800">{stat.value}</p>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <ListChecks size={24} className="text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-700">Recent Activity</h2>
          </div>
          {dashboardData.recentActivities.length > 0 ? (
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {dashboardData.recentActivities.map((activity) => (
                <li key={activity.id} className="text-gray-600 text-sm border-b border-gray-200 pb-2 last:border-b-0">
                  {activity.message}
                  <span className="block text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent activities to display.</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Links</h2>
          <div className="space-y-2">
             <p className="text-gray-600">Welcome, {user?.username}! Use the sidebar to navigate.</p>
             {/* Aap yahan aur bhi relevant quick links add kar sakte hain */}
          </div>
        </div>
      </div>
    </div>
  );
}