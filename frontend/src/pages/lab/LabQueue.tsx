import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Clock, CheckCircle } from 'lucide-react';

export default function LabQueue() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/lab/queue', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQueue(response.data);
      } catch (error) {
        console.error('Failed to fetch lab queue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
  }, []);

  const filteredQueue = queue.filter(unit => 
    unit.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-red-600" />
            Laboratory Queue
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Blood units awaiting initial laboratory testing and screening.
          </p>
        </div>
        <button 
          onClick={() => navigate('/lab/scan')}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Scan to Start
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search unit number or blood group..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-3">Unit ID</th>
                <th className="px-6 py-3">Collection Date</th>
                <th className="px-6 py-3">Component</th>
                <th className="px-6 py-3">Collection Center</th>
                <th className="px-6 py-3 text-center">Blood Group</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <p>Loading queue...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900 dark:text-white">Queue is clear</p>
                    <p>No blood units are currently waiting for testing.</p>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((unit) => (
                  <tr key={unit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {unit.unitNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {unit.donation?.collectionDate ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(unit.donation.collectionDate)) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {unit.component}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {unit.collectionCenter?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {unit.bloodGroup || 'Unconfirmed'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate('/lab/scan')}
                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400"
                      >
                        Verify & Start
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
