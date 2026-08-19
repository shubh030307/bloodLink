import { useState } from 'react';
import { Search, MapPin, Droplet, Clock } from 'lucide-react';
import api from '../../services/api';

const FindBlood = () => {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/inventory/search?bloodGroup=${encodeURIComponent(bloodGroup)}`);
      setResults(response.data);
    } catch (error) {
      console.error("Failed to search inventory", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="text-blood-600" /> Find Available Blood
        </h2>
      </div>

      {/* Search Filter */}
      <div className="glass-card p-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Blood Group</label>
            <select 
              className="w-full px-4 py-3 glass-input text-gray-900"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            >
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 glass-button font-medium flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Searching...' : (
              <>
                <Search className="w-5 h-5" /> Search Inventory
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {searched && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {results.length} Available Units Found for {bloodGroup}
          </h3>
          
          {results.length === 0 ? (
            <div className="glass-card p-8 text-center text-gray-500">
              <Droplet className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No available units found for {bloodGroup} at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((unit) => (
                <div key={unit.id} className="glass-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-blood-100 flex items-center justify-center text-blood-600 font-bold text-xl">
                        {unit.bloodGroup}
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {unit.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600 text-sm">
                      <Droplet className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{unit.quantity} ml - Whole Blood</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Expires: {new Date(unit.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>ID: {unit.id.substring(0,8).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <button className="w-full py-2 glass-button-outline text-sm font-medium">
                    Request This Unit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FindBlood;
