import { useState, useEffect } from 'react';
import { Activity, Plus, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    bloodGroup: 'O+',
    quantity: 1,
    emergencyLevel: 'Normal',
    patientDetails: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests');
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/requests', newRequest);
      setShowRequestModal(false);
      setNewRequest({ bloodGroup: 'O+', quantity: 1, emergencyLevel: 'Normal', patientDetails: '' });
      fetchRequests();
    } catch (error) {
      console.error("Failed to submit request", error);
      alert("Failed to submit request. Only registered hospitals can submit requests.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      fetchRequests();
    } catch (error) {
      console.error(`Failed to mark request as ${status}`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-blood-600" /> Blood Requests
        </h2>
        {user?.role === 'Hospital' && (
          <button 
            onClick={() => setShowRequestModal(true)}
            className="glass-button px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Request Blood
          </button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Req ID</th>
                <th className="p-4 font-medium">Hospital</th>
                <th className="p-4 font-medium">Blood Group</th>
                <th className="p-4 font-medium">Qty</th>
                <th className="p-4 font-medium">Emergency Level</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">Loading requests...</td>
                </tr>
              ) : requests.map((req) => (
                <tr key={req.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">{req.id.substring(0,8).toUpperCase()}</td>
                  <td className="p-4 text-sm text-gray-700">{req.hospital?.user?.name || 'Unknown'}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blood-50 text-blood-700 font-bold text-xs">
                      {req.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium">{req.quantity}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      req.emergencyLevel === 'Critical' ? 'bg-red-100 text-red-700' :
                      req.emergencyLevel === 'Urgent' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {req.emergencyLevel}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right space-x-2">
                    {user?.role === 'Admin' && req.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(req.id, 'Approved')}
                          className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors" title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                          className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-4 text-gray-500">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Request Blood</h3>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  value={newRequest.bloodGroup}
                  onChange={(e) => setNewRequest({...newRequest, bloodGroup: e.target.value})}
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Units)</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  value={newRequest.quantity}
                  onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Level</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  value={newRequest.emergencyLevel}
                  onChange={(e) => setNewRequest({...newRequest, emergencyLevel: e.target.value})}
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Details (Optional)</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  rows={3}
                  value={newRequest.patientDetails}
                  onChange={(e) => setNewRequest({...newRequest, patientDetails: e.target.value})}
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
