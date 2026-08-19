import { useState, useEffect } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import api from '../../services/api';
import BookAppointmentModal from '../../components/BookAppointmentModal';

const Donors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [donors, setDonors] = useState<any[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState<string | undefined>();

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await api.get('/donors/all');
      setDonors(response.data);
    } catch (error) {
      console.error("Failed to fetch donors", error);
    }
  };

  const handleBookClick = (id: string) => {
    setSelectedDonorId(id);
    setIsBookModalOpen(true);
  };

  const filteredDonors = donors.filter(d => 
    d.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.donorNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground flex items-center gap-2">
          <Users className="text-blood-600" /> Donor Management
        </h2>
        <button className="glass-button px-4 py-2 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Register Donor
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by Name, ID, or Blood Group..." 
            className="w-full pl-10 pr-4 py-2 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Donors Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 dark:text-muted-foreground text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Donor ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Blood Group</th>
                <th className="p-4 font-medium">Last Donation</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDonors.map((donor) => (
                <tr key={donor.id} className="hover:bg-white/40 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-foreground">{donor.donorNumber}</td>
                  <td className="p-4 text-sm text-gray-800 dark:text-foreground font-medium">{donor.user?.name}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blood-50 text-blood-700 font-bold text-xs">
                      {donor.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-muted-foreground">N/A</td>
                  <td className="p-4 text-sm">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Eligible
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <button className="text-info hover:text-blue-800 font-medium text-sm mr-3">View</button>
                    <button 
                      onClick={() => handleBookClick(donor.id)} 
                      className="text-blood-600 hover:text-blood-800 font-medium text-sm"
                    >
                      Book
                    </button>
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
        donorId={selectedDonorId}
        onSuccess={() => {
          // Could refresh data here if needed
          alert("Appointment Booked Successfully!");
        }}
      />
    </div>
  );
};

export default Donors;
