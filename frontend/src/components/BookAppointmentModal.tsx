import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
import api from '../services/api';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorId?: string; // Pre-selected donor if booking from Donors table
  onSuccess: () => void;
}

const BookAppointmentModal = ({ isOpen, onClose, donorId, onSuccess }: BookAppointmentModalProps) => {
  const [donors, setDonors] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  
  const [selectedDonorId, setSelectedDonorId] = useState<string>(donorId || '');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset state if reopened with a different donor
    if (donorId) setSelectedDonorId(donorId);

    const fetchData = async () => {
      try {
        const banksRes = await api.get('/appointments/blood-banks');
        setBloodBanks(banksRes.data);

        // If no donor is pre-selected, we need to fetch all donors to populate the dropdown
        if (!donorId) {
          const donorsRes = await api.get('/donors/all');
          setDonors(donorsRes.data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, [isOpen, donorId]);

  const handleBook = async () => {
    if (!selectedDonorId || !selectedBankId || !date || !timeSlot) return;
    setLoading(true);
    try {
      await api.post('/appointments/staff-book', {
        donorId: selectedDonorId,
        bloodBankId: selectedBankId,
        date,
        timeSlot
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Failed to book appointment");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blood-600 p-4 flex justify-between items-center text-white">
          <h2 className="font-bold text-lg">Book Appointment</h2>
          <button onClick={onClose} className="hover:bg-blood-700 p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!donorId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Donor</label>
              <select 
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blood-500 outline-none"
                value={selectedDonorId}
                onChange={(e) => setSelectedDonorId(e.target.value)}
              >
                <option value="">-- Choose a Donor --</option>
                {donors.map(d => (
                  <option key={d.id} value={d.id}>{d.donorNumber} - {d.user?.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Blood Bank Center
            </label>
            <select 
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blood-500 outline-none"
              value={selectedBankId}
              onChange={(e) => setSelectedBankId(e.target.value)}
            >
              <option value="">-- Choose a Center --</option>
              {bloodBanks.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Date
            </label>
            <input 
              type="date" 
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blood-500 outline-none"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Time Slot
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'].map(time => (
                <button
                  key={time}
                  onClick={() => setTimeSlot(time)}
                  className={`py-2 text-xs font-medium rounded-lg border transition-colors ${timeSlot === time ? 'bg-blood-100 border-blood-500 text-blood-700' : 'border-gray-200 text-gray-600 dark:text-muted-foreground hover:bg-gray-50'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-muted-foreground font-medium hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleBook}
            disabled={!selectedDonorId || !selectedBankId || !date || !timeSlot || loading}
            className="px-6 py-2 bg-blood-600 text-white font-medium rounded-lg hover:bg-blood-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentModal;
