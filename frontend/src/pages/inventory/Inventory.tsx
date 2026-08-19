import { useState, useEffect } from 'react';
import { Activity, Plus, Filter, Search, X } from 'lucide-react';
import api from '../../services/api';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Stock Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({ bloodGroup: 'O+', quantity: 450, expiryDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setInventory(response.data.inventory || []);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inventory', newStock);
      setShowAddModal(false);
      fetchInventory(); // refresh list
    } catch (error) {
      console.error("Failed to add stock", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="text-blood-600" /> Inventory Management
        </h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="glass-button px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Stock
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by ID or Blood Group..." 
            className="w-full pl-10 pr-4 py-2 glass-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="glass-button-outline px-4 py-2 flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Inventory Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-blood-50/50 text-blood-900 text-sm border-b border-blood-100">
                <th className="p-4 font-semibold">Unit ID</th>
                <th className="p-4 font-semibold">Blood Group</th>
                <th className="p-4 font-semibold">Quantity (ml)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Expiry Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">Loading inventory...</td>
                </tr>
              ) : filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">{item.id.substring(0,8).toUpperCase()}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blood-100 text-blood-700 font-bold text-xs">
                      {item.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.quantity} ml</td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Available' ? 'bg-green-100 text-green-700' :
                      item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">View</button>
                  </td>
                </tr>
              ))}
              {!loading && filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">No inventory found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Add Blood Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  value={newStock.bloodGroup}
                  onChange={(e) => setNewStock({...newStock, bloodGroup: e.target.value})}
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (ml)</label>
                <input 
                  type="number" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  value={newStock.quantity}
                  onChange={(e) => setNewStock({...newStock, quantity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-500"
                  value={newStock.expiryDate}
                  onChange={(e) => setNewStock({...newStock, expiryDate: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blood-600 hover:bg-blood-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
