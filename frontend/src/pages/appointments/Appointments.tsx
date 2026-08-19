import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, Search, Clock } from 'lucide-react';
import api from '../../services/api';
import BookAppointmentModal from '../../components/BookAppointmentModal';

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments/all');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(apt => 
    apt.appointmentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    apt.donor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground flex items-center gap-2">
          <CalendarIcon className="text-blood-600" /> Appointments
        </h2>
        <button 
          onClick={() => setIsBookModalOpen(true)}
          className="glass-button px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-info rounded-full">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">Today's Appointments</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-foreground">
              {appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium">Pending Approvals</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-foreground">{appointments.filter(a => a.status === 'PENDING').length}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Donor Name or ID..." 
            className="w-full pl-10 pr-4 py-2 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass-button-outline px-4 py-2 flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4" /> Date Filter
        </button>
      </div>

      {/* Appointments Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 dark:text-muted-foreground text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Appointment ID</th>
                <th className="p-4 font-medium">Donor Name</th>
                <th className="p-4 font-medium">Blood Group</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-white/40 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-foreground">{apt.appointmentNumber}</td>
                  <td className="p-4 text-sm text-gray-800 dark:text-foreground font-medium">{apt.donor?.user?.name}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blood-50 text-blood-700 font-bold text-xs">
                      {apt.donor?.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{new Date(apt.date).toLocaleDateString()}</span>
                      <span className="text-gray-400">|</span>
                      <span>{apt.timeSlot}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex flex-col gap-2 items-start">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        apt.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                        apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.visit?.donation?.otpVerification?.status === 'OTP_PENDING' ? 'OTP Verification' : apt.status}
                      </span>
                      
                      {apt.visit?.donation?.otpVerification?.status === 'OTP_PENDING' && (
                        <div className="bg-destructive/10 border border-red-200 rounded px-2 py-1 mt-1 text-center">
                          <p className="text-[10px] text-destructive font-bold mb-1">Verify Donation</p>
                          <span className="text-sm font-mono font-bold tracking-widest text-gray-900 dark:text-foreground bg-white dark:bg-card px-2 py-0.5 rounded border border-red-300">
                            {apt.visit.donation.otpVerification.otpHash}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-right">
                    {apt.status === 'BOOKED' && (
                      <button className="text-blood-600 hover:text-blood-800 font-medium text-sm mr-3">Cancel</button>
                    )}
                    <button className="text-info hover:text-blue-800 font-medium text-sm">Reschedule</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <BookAppointmentModal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)} 
        onSuccess={() => {
          fetchAppointments();
          alert("Appointment Booked Successfully!");
        }}
      />
    </div>
  );
};

export default Appointments;
