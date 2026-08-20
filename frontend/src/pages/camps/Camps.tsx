import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, MapPin, Clock, Users, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

const Camps = () => {
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: 100,
    slotDuration: 30
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/camps');
      setCamps(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        ...formData,
        startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.date}T${formData.endTime}`).toISOString(),
      };
      
      await api.post('/camps', payload);
      setIsModalOpen(false);
      fetchCamps();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to create camp');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!window.confirm(`Change camp status to ${status}?`)) return;
    try {
      await api.patch(`/camps/${id}/status`, { status });
      fetchCamps();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground flex items-center gap-2">
          <CalendarIcon className="text-blood-600" /> Blood Donation Camps
        </h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="glass-button px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Camp
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10">Loading camps...</div>
        ) : camps.length === 0 ? (
          <div className="col-span-full glass-card p-10 text-center text-gray-500">
            No camps scheduled. Create one to start accepting bookings.
          </div>
        ) : camps.map(camp => (
          <div key={camp.id} className="glass-card p-5 relative overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-foreground">{camp.name}</h3>
              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                camp.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                camp.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {camp.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 dark:text-muted-foreground flex-grow">
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-blood-500" />
                {new Date(camp.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-blood-500" />
                {new Date(camp.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(camp.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blood-500" />
                {camp.location}
              </div>
              <div className="flex items-center pt-2 border-t border-gray-100 dark:border-border mt-2">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span>Bookings: <strong>{camp._count?.appointments || 0}</strong> / {camp.capacity}</span>
              </div>
            </div>

            {camp.status === 'OPEN' && (
              <div className="mt-4 flex gap-2 pt-4">
                <button onClick={() => updateStatus(camp.id, 'COMPLETED')} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors">
                  Mark Completed
                </button>
                <button onClick={() => updateStatus(camp.id, 'CANCELLED')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Schedule New Camp</h3>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start">
                <ShieldAlert className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Camp Name</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input required type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input required type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Capacity</label>
                  <input required type="number" min="1" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slot Duration (min)</label>
                  <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blood-500 outline-none" value={formData.slotDuration} onChange={e => setFormData({...formData, slotDuration: parseInt(e.target.value)})}>
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="60">60 mins</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white rounded-xl font-bold transition-colors shadow-md">
                  {submitting ? 'Creating...' : 'Create & Generate Slots'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Camps;
