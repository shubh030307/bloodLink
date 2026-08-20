import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Microscope, Activity, AlertCircle, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';

export default function LabDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/lab/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch lab stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-muted-foreground">Loading laboratory dashboard...</div>;
  }

  const statCards = [
    { label: 'Pending Testing', value: stats?.pendingTesting || 0, icon: <Clock className="w-8 h-8 text-warning" />, color: 'bg-warning/10 dark:bg-yellow-900/20', path: '/lab/queue' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: <Activity className="w-8 h-8 text-info" />, color: 'bg-info/10 dark:bg-blue-900/20' },
    { label: 'Pending Review', value: stats?.pendingReview || 0, icon: <Search className="w-8 h-8 text-purple-500" />, color: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Exceptions', value: stats?.exceptions || 0, icon: <AlertCircle className="w-8 h-8 text-destructive" />, color: 'bg-destructive/10 dark:bg-red-900/20' },
    { label: 'Approved Today', value: stats?.approvedToday || 0, icon: <CheckCircle2 className="w-8 h-8 text-success" />, color: 'bg-success/10 dark:bg-green-900/20' },
    { label: 'Rejected Today', value: stats?.rejectedToday || 0, icon: <XCircle className="w-8 h-8 text-rose-500" />, color: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
            <Microscope className="w-6 h-6 text-destructive" />
            Laboratory Operations
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">
            Overview of blood unit testing and screening.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/lab/scan')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Scan Blood Bag
          </button>
          <button 
            onClick={() => navigate('/lab/queue')}
            className="px-4 py-2 bg-gray-100 dark:bg-card text-gray-700 dark:text-muted-foreground rounded-lg hover:bg-gray-200 dark:hover:bg-accent font-medium flex items-center gap-2"
          >
            View Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            onClick={() => card.path && navigate(card.path)}
            className={`p-6 rounded-xl border border-gray-100 dark:border-border bg-white dark:bg-background shadow-sm ${card.path ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-muted-foreground mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-foreground">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-background border border-gray-100 dark:border-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-foreground mb-4">Laboratory Workflow</h2>
        <div className="flex items-center justify-between opacity-80 mt-8 mb-4">
           {/* Simple step visualizer */}
           {['Blood Collection', 'Queue', 'Testing', 'Reporting', 'Inventory'].map((step, idx, arr) => (
             <React.Fragment key={idx}>
               <div className="flex flex-col items-center">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 
                    ${idx === 2 ? 'border-red-500 bg-destructive/10 text-destructive' : 'border-gray-300 bg-white dark:bg-card text-gray-500 dark:text-muted-foreground'}`}>
                   {idx + 1}
                 </div>
                 <span className={`text-xs mt-2 font-medium ${idx === 2 ? 'text-destructive' : 'text-gray-500 dark:text-muted-foreground'}`}>{step}</span>
               </div>
               {idx < arr.length - 1 && <div className="flex-1 h-0.5 bg-gray-200 dark:bg-muted mx-2"></div>}
             </React.Fragment>
           ))}
        </div>
      </div>
    </div>
  );
}
