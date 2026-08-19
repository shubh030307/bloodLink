import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Droplet, Activity, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DonorDashboard from '../donor/DonorDashboard.tsx';
import ReceptionDashboard from './ReceptionDashboard.tsx';

import CollectionDashboard from '../collection/CollectionDashboard.tsx';
import LabDashboard from '../lab/LabDashboard.tsx';
import HospitalDashboard from './HospitalDashboard.tsx';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/admin');
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500 dark:text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Blood Units" 
          value={stats?.availableUnits || 0} 
          change="Available" 
          isPositive={true} 
          icon={<Droplet className="text-blood-500" />} 
        />
        <StatCard 
          title="Total Donors" 
          value={stats?.totalDonors || 0} 
          change="Registered" 
          isPositive={true} 
          icon={<Users className="text-info" />} 
        />
        <StatCard 
          title="Pending Requests" 
          value={stats?.pendingRequests || 0} 
          change="Needs Action" 
          isPositive={false} 
          icon={<Activity className="text-amber-500" />} 
        />
        <StatCard 
          title="Emergency Requests" 
          value={stats?.emergencyRequests || 0} 
          change="Critical Priority" 
          isPositive={false} 
          icon={<AlertTriangle className="text-destructive" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-foreground mb-4">Donations vs Requests (Mock)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.chartData || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Line type="monotone" dataKey="donations" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-foreground mb-4">Available Blood Groups</h3>
          <div className="h-[300px] w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.inventoryByGroup || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-2xl font-bold text-gray-800 dark:text-foreground">{stats?.availableUnits || 0}</span>
              <span className="text-xs text-gray-500 dark:text-muted-foreground">Units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'Donor') return <DonorDashboard />;
  if (user?.role === 'Receptionist') return <ReceptionDashboard />;

  if (user?.role === 'CollectionStaff') return <CollectionDashboard />;
  if (user?.role === 'LabTechnician') return <LabDashboard />;
  if (user?.role === 'Hospital') return <HospitalDashboard />;
  
  return <AdminDashboard />;
};

const StatCard = ({ title, value, change, isPositive, icon }: any) => (
  <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/50 rounded-xl shadow-sm backdrop-blur-md z-10">
        {icon}
      </div>
      <span className={`text-sm font-medium px-2 py-1 rounded-full z-10 ${isPositive ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
        {change}
      </span>
    </div>
    <div className="z-10">
      <h4 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-1">{value}</h4>
      <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">{title}</p>
    </div>
    {/* Decorative blur in background */}
    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blood-100 rounded-full blur-2xl opacity-50 group-hover:bg-blood-200 transition-colors duration-300 z-0"></div>
  </div>
);

export default Dashboard;


