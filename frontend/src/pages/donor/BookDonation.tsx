import { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, ChevronRight, Search, Info } from 'lucide-react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const BookDonation = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [date, setDate] = useState<string>('');
  
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  
  const [booking, setBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [banksRes, campsRes] = await Promise.allSettled([
          api.get('/appointments/blood-banks'),
          api.get('/camps') 
        ]);
        
        let banks = [];
        let camps = [];
        
        if (banksRes.status === 'fulfilled') {
          banks = banksRes.value.data.map((b: any) => ({ ...b, type: 'bank', displayName: b.name, displayAddress: b.address }));
        }
        
        if (campsRes.status === 'fulfilled') {
          camps = campsRes.value.data
            .filter((c: any) => c.status === 'OPEN')
            .map((c: any) => ({ ...c, type: 'camp', displayName: `[CAMP] ${c.name}`, displayAddress: c.location }));
        }
        
        setLocations([...banks, ...camps]);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!selectedLocation) return;
    
    // For camps, date is fixed
    if (selectedLocation.type === 'camp') {
      const campDate = new Date(selectedLocation.date).toISOString().split('T')[0];
      setDate(campDate);
      fetchSlots(selectedLocation.id, 'camp', campDate);
    } else {
      // If bank and date is selected, fetch slots
      if (date) {
        fetchSlots(selectedLocation.id, 'bank', date);
      } else {
        setSlots([]);
      }
    }
    setSelectedSlotId('');
    setErrorMsg('');
  }, [selectedLocation, date]);

  const fetchSlots = async (id: string, type: string, targetDate: string) => {
    setLoadingSlots(true);
    try {
      const endpoint = type === 'camp' 
        ? `/appointments/slots?campId=${id}` 
        : `/appointments/slots?centerId=${id}&date=${targetDate}`;
      
      const res = await api.get(endpoint);
      setSlots(res.data);
    } catch (err) {
      console.error("Failed to fetch slots", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlotId) return;
    setBooking(true);
    setErrorMsg('');
    try {
      await api.post('/appointments/book', {
        donationSlotId: selectedSlotId
      });
      navigate('/donor/appointments');
    } catch (error: any) {
      console.error("Failed to book", error);
      setErrorMsg(error.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  const filteredLocations = locations.filter(loc => 
    loc.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.displayAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground">Book Donation Appointment</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Left Column - Select Location */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search centers or camps..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blood-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-10 text-gray-500 dark:text-muted-foreground animate-pulse">Finding nearby centers...</div>
            ) : filteredLocations.map((loc) => (
              <div 
                key={loc.id} 
                onClick={() => { setSelectedLocation(loc); if(loc.type==='bank') setDate(''); }}
                className={`glass-card p-4 cursor-pointer transition-all ${selectedLocation?.id === loc.id ? 'ring-2 ring-blood-500 bg-blood-50/30' : 'hover:bg-white dark:bg-card'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-foreground">{loc.displayName}</h4>
                    <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 shrink-0 mt-0.5" /> 
                      {loc.displayAddress}
                    </p>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${selectedLocation?.id === loc.id ? 'text-blood-500' : 'text-gray-300'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Select Date & Time */}
        <div className="glass-card p-6">
          {!selectedLocation ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MapPin className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a location to view available slots</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-4">{selectedLocation.displayName}</h3>
              
              {selectedLocation.type === 'bank' ? (
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
              ) : (
                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl flex items-center mb-4">
                  <Calendar className="w-5 h-5 mr-2 shrink-0" />
                  <span className="font-semibold">Camp Date: {new Date(selectedLocation.date).toLocaleDateString()}</span>
                </div>
              )}

              {date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" /> Available Time Slots
                  </label>
                  
                  {loadingSlots ? (
                    <div className="text-sm text-gray-500 py-4">Loading slots...</div>
                  ) : slots.length === 0 ? (
                    <div className="text-sm text-gray-500 py-4">No slots available for this date.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {slots.map((slot) => {
                        const isFull = slot.availableCapacity <= 0;
                        const isSelected = selectedSlotId === slot.id;
                        return (
                          <button
                            key={slot.id}
                            onClick={() => !isFull && setSelectedSlotId(slot.id)}
                            disabled={isFull}
                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                              isSelected ? 'bg-blood-600 text-white shadow-md' : 
                              isFull ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60' : 
                              'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>{formatTime(slot.startTime)}</span>
                              {isFull && <span className="text-xs bg-gray-200 px-1 rounded">FULL</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start">
                  <Info className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  {errorMsg}
                </div>
              )}

              <div className="pt-6 mt-6 border-t border-gray-100">
                <button 
                  onClick={handleBook}
                  disabled={!selectedSlotId || booking}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${selectedSlotId && !booking ? 'bg-blood-600 hover:bg-blood-700 text-white shadow-blood-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
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
