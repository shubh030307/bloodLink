import { useState, useEffect } from 'react';
import api from '../../services/api';

const HospitalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [quantity, setQuantity] = useState(1);
  const [urgency, setUrgency] = useState('NORMAL');
  const [patientDetails, setPatientDetails] = useState('');
  const [requiredDate, setRequiredDate] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get('/requests/hospital');
        setRequests(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRequests();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/requests', {
        bloodGroup, quantity, urgency, patientDetails, requiredDate
      });
      window.location.reload();
    } catch (error) {
      alert("Failed to submit request");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground">Hospital Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">Request Blood</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm">Blood Group</label>
              <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)} className="w-full border p-2 rounded">
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Quantity (Units)</label>
              <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm">Urgency</label>
              <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full border p-2 rounded">
                <option>NORMAL</option><option>URGENT</option><option>EMERGENCY</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Patient Details</label>
              <input type="text" value={patientDetails} onChange={e => setPatientDetails(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm">Required Date</label>
              <input type="date" value={requiredDate} onChange={e => setRequiredDate(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <button type="submit" className="w-full bg-blood-600 text-white p-2 rounded">Submit Request</button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4">My Requests</h3>
          <ul className="space-y-2">
            {requests.map((r: any) => (
              <li key={r.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <div className="font-bold text-blood-600">{r.bloodGroup} <span className="text-gray-500 dark:text-muted-foreground font-normal">x {r.quantity}</span></div>
                  <div className="text-sm text-gray-500 dark:text-muted-foreground">{r.status} - {r.urgency}</div>
                </div>
                <div className="text-sm text-gray-400">{new Date(r.requestedAt).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
