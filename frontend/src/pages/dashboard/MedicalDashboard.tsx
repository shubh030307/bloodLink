import { useState, useEffect } from 'react';
import api from '../../services/api';

const MedicalDashboard = () => {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get('/medical/pending');
        setPending(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPending();
  }, []);

  const handleComplete = async (visitId: string, decision: string) => {
    try {
      await api.post(`/medical/${visitId}/complete`, { decision, remarks: 'Screened' });
      window.location.reload();
    } catch (error) {
      alert("Failed to complete screening");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Medical Screening</h2>
      
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4">Pending Screenings</h3>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>Visit #</th>
              <th>Donor Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((visit: any) => (
              <tr key={visit.id} className="border-t">
                <td className="py-2">{visit.visitNumber}</td>
                <td>{visit.appointment.donor.user.name}</td>
                <td>
                  <button onClick={() => handleComplete(visit.id, 'MEDICALLY_CLEARED')} className="bg-green-600 text-white px-3 py-1 rounded mr-2">Clear</button>
                  <button onClick={() => handleComplete(visit.id, 'DEFERRED')} className="bg-red-600 text-white px-3 py-1 rounded">Defer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicalDashboard;


