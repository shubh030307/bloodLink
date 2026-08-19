import React, { useState, useEffect } from 'react';
import { Activity, Plus, FileText, CheckCircle, XCircle, Clock, Calendar, User as UserIcon } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // Form State
  const [newRequest, setNewRequest] = useState({
    bloodGroup: 'O+',
    quantity: 1,
    urgency: 'Routine', // Routine, Urgent, Critical
    patientDetails: '',
    requiredDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const endpoint = user?.role === 'Hospital' ? '/requests/hospital' : '/requests';
      const response = await api.get(endpoint);
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/requests', newRequest);
      setShowRequestModal(false);
      setNewRequest({ 
        bloodGroup: 'O+', 
        quantity: 1, 
        urgency: 'Routine', 
        patientDetails: '',
        requiredDate: new Date().toISOString().split('T')[0] 
      });
      fetchRequests();
    } catch (error) {
      console.error("Failed to submit request", error);
      alert("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessRequest = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/process`, { action });
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error(`Failed to ${action} request`, error);
      alert(error.response?.data?.message || `Failed to process request.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueBlood = async (id: string) => {
    setActionLoading(true);
    try {
      await api.post(`/requests/${id}/issue`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error(`Failed to issue blood`, error);
      alert(error.response?.data?.error || `Failed to issue blood.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Blood Requests</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage and track hospital blood requirements</p>
          </div>
        </div>
        {user?.role === 'Hospital' && (
          <button 
            onClick={() => setShowRequestModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-red-600/20 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-600 text-sm border-b border-gray-100">
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-500">Req ID</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-500">Hospital</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-500">Blood Req</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-500">Urgency</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-500">Status</th>
                <th className="p-4 font-bold uppercase tracking-wider text-xs text-gray-500 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500 font-medium">Loading requests...</td>
                </tr>
              ) : requests.map((req) => (
                <tr 
                  key={req.id} 
                  className="hover:bg-red-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedRequest(req)}
                >
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {req.requestNumber || req.id.substring(0,8).toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{req.hospital?.user?.name || req.hospital?.name || 'Your Hospital'}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-black text-sm">
                        {req.bloodGroup}
                      </span>
                      <span className="text-sm font-bold text-gray-700">x {req.quantity} {req.component}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.urgency === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                      req.urgency === 'Urgent' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {req.urgency}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'RESERVED' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right font-medium text-gray-500">
                    {new Date(req.requestedAt || req.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!loading && requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500 font-medium">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Creation Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900">Request Blood</h3>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Blood Group *</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    value={newRequest.bloodGroup}
                    onChange={(e) => setNewRequest({...newRequest, bloodGroup: e.target.value})}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Quantity *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                    value={newRequest.quantity}
                    onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Urgency Level *</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  value={newRequest.urgency}
                  onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Required By Date *</label>
                <input 
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-gray-700"
                  value={newRequest.requiredDate}
                  onChange={(e) => setNewRequest({...newRequest, requiredDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Patient Details / Notes</label>
                <textarea 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  rows={3}
                  placeholder="Any specific instructions or patient information..."
                  value={newRequest.patientDetails}
                  onChange={(e) => setNewRequest({...newRequest, patientDetails: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-sm shadow-red-600/20 disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Details Modal (View & Approve/Reject) */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="font-mono text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                    {selectedRequest.requestNumber || selectedRequest.id.substring(0,8).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedRequest.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    selectedRequest.status === 'RESERVED' ? 'bg-blue-100 text-blue-700' :
                    selectedRequest.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    selectedRequest.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mt-2">Request Details</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600 p-2 bg-white rounded-full shadow-sm">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hospital</p>
                  <p className="font-bold text-gray-900">{selectedRequest.hospital?.user?.name || selectedRequest.hospital?.name || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Urgency</p>
                  <p className="font-bold text-gray-900">{selectedRequest.urgency}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Blood Required</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600 font-black">{selectedRequest.bloodGroup}</span>
                    <span className="text-gray-400">•</span>
                    <span className="font-bold text-gray-900">{selectedRequest.quantity} {selectedRequest.component}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Required By</p>
                  <p className="font-bold text-gray-900">{new Date(selectedRequest.requiredDate).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedRequest.patientDetails && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Details / Notes</p>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700">
                    {selectedRequest.patientDetails}
                  </div>
                </div>
              )}

              {/* Approval Info */}
              {selectedRequest.approvedBy && (
                <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Approved by {selectedRequest.approvedBy.name}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      on {new Date(selectedRequest.approvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons for Admin */}
              {user?.role === 'Admin' && selectedRequest.status === 'PENDING' && (
                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => handleProcessRequest(selectedRequest.id, 'APPROVE')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm disabled:opacity-70"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Approve & Reserve
                  </button>
                  <button 
                    onClick={() => handleProcessRequest(selectedRequest.id, 'REJECT')}
                    disabled={actionLoading}
                    className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm disabled:opacity-70"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject Request
                  </button>
                </div>
              )}

              {user?.role === 'Admin' && selectedRequest.status === 'RESERVED' && (
                <div className="flex space-x-3 pt-2">
                  <button 
                    onClick={() => handleIssueBlood(selectedRequest.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-colors shadow-sm disabled:opacity-70"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Issue Blood (Mark Completed)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
