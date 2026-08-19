import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, XCircle, QrCode } from 'lucide-react';
import api from '../../services/api';
import QRCode from 'react-qr-code';

const DonorAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [activeAppt, setActiveAppt] = useState<string | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/my');
      setAppointments(response.data);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.post(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (error) {
      alert("Failed to cancel appointment");
    }
  };

  const handleShowQR = async (id: string) => {
    try {
      const response = await api.get(`/appointments/${id}/qr`);
      setQrToken(response.data.token);
      setActiveAppt(id);
    } catch (error: any) {
      alert(error.response?.data?.error || "Cannot generate QR code yet. Available 3 hours before slot.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="glass-card p-10 flex flex-col items-center justify-center text-gray-400">
          <Calendar className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg">No upcoming appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden group">
              <div className="flex-1 z-10">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${appt.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {appt.status}
                  </span>
                  <span className="text-sm font-medium text-gray-500">ID: {appt.id.substring(0,8).toUpperCase()}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{appt.bloodBank?.name || 'Blood Bank'}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-blood-500" />
                    {new Date(appt.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-blood-500" />
                    {appt.timeSlot}
                  </div>
                  <div className="flex items-center md:col-span-2">
                    <MapPin className="w-4 h-4 mr-2 text-blood-500 shrink-0" />
                    {appt.bloodBank?.address || 'Address not available'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full md:w-auto z-10">
                {appt.status === 'BOOKED' && (
                  <>
                    <button 
                      onClick={() => handleShowQR(appt.id)}
                      className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-medium shadow-md transition-all flex items-center justify-center"
                    >
                      <QrCode className="w-4 h-4 mr-2" /> Show QR Code
                    </button>
                    <button 
                      onClick={() => handleCancel(appt.id)}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Global Full-Screen QR Code Modal */}
      {activeAppt && qrToken && (
        <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button 
            onClick={() => setActiveAppt(null)} 
            className="absolute top-6 right-6 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-full p-2 shadow-sm transition-all"
          >
            <XCircle className="w-8 h-8" />
          </button>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-slate-700">
            <QRCode value={qrToken} size={250} />
          </div>
          <p className="mt-6 text-xl font-bold text-gray-800">Scan at reception</p>
          <p className="mt-2 text-sm text-gray-500 font-medium">Expires in 2 hours</p>
        </div>
      )}
    </div>
  );
};

export default DonorAppointments;
