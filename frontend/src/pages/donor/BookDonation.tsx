import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ChevronRight, Search } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const BookDonation = () => {
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [date, setDate] = useState<string>('');
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // For now we'll fetch all hospitals as blood banks since we haven't populated BloodBank table
    // In a real app we would have an endpoint specifically for DonationSlots
    const fetchBanks = async () => {
      try {
        const response = await api.get('/appointments/blood-banks');
        setBloodBanks(response.data);
      } catch (error) {
        console.error("Failed to fetch blood banks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const handleBook = async () => {
    if (!selectedBank || !date || !timeSlot) return;
    setBooking(true);
    try {
      await api.post('/appointments/book', {
        bloodBankId: selectedBank.id,
        date,
        timeSlot,
        donationSlotId: 'dummy-slot-id' // Ideally we fetch slots first
      });
      navigate('/donor/appointments');
    } catch (error) {
      console.error("Failed to book", error);
      alert("Failed to book appointment. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const filteredBanks = bloodBanks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    bank.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Book Donation Appointment</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Select Blood Bank */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by city or blood bank name..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blood-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">Finding nearby centers...</div>
            ) : filteredBanks.map((bank) => (
              <div 
                key={bank.id} 
                onClick={() => setSelectedBank(bank)}
                className={`glass-card p-4 cursor-pointer transition-all ${selectedBank?.id === bank.id ? 'ring-2 ring-blood-500 bg-blood-50/30' : 'hover:bg-white'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{bank.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 shrink-0 mt-0.5" /> 
                      {bank.address}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${selectedBank?.id === bank.id ? 'text-blood-500' : 'text-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Select Date & Time */}
        <div className="glass-card p-6">
          {!selectedBank ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MapPin className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a blood bank to view available slots</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{selectedBank.name}</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> Select Date
                </label>
                <input 
                  type="date" 
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blood-500 outline-none"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> Select Time Slot
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM', '09:30 PM'].map((time) => (
                      <button
                        key={time}
                        onClick={() => setTimeSlot(time)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${timeSlot === time ? 'bg-blood-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100">
                <button 
                  onClick={handleBook}
                  disabled={!date || !timeSlot || booking}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${date && timeSlot && !booking ? 'bg-blood-600 hover:bg-blood-700 text-white shadow-blood-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {booking ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDonation;
