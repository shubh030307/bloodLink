import { useState, useEffect } from 'react';
import { Activity, Plus, Filter, Search, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Stock Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStock, setNewStock] = useState({ bloodGroup: 'O+', quantity: 450, expiryDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View Details Modal State
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground flex items-center gap-2">
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
                  <td colSpan={6} className="text-center p-4 text-gray-500 dark:text-muted-foreground">Loading inventory...</td>
                </tr>
              ) : filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-white/60 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-foreground">{item.id.substring(0,8).toUpperCase()}</td>
                  <td className="p-4 text-sm">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blood-100 text-blood-700 font-bold text-xs">
                      {item.bloodGroup}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-muted-foreground">{item.quantity} ml</td>
                  <td className="p-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'Available' ? 'bg-green-100 text-green-700' :
                      item.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500 dark:text-muted-foreground">{new Date(item.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-right">
                    <button 
                      onClick={() => setSelectedUnit(item)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500 dark:text-muted-foreground">No inventory found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-card rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-foreground">Add Blood Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 dark:text-muted-foreground hover:text-gray-700">
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
                  className="px-4 py-2 text-gray-600 dark:text-muted-foreground hover:bg-gray-100 rounded-lg font-medium transition-colors"
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

      {/* View Unit Details Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
            <div className="sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur border-b border-gray-100 dark:border-slate-700 p-6 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                Blood Unit Details
                <span className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-bold">
                  {selectedUnit.bloodGroup}
                </span>
              </h3>
              <button onClick={() => setSelectedUnit(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors bg-gray-100 dark:bg-slate-700 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Unit ID</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedUnit.id.substring(0,8).toUpperCase()}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Quantity</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedUnit.quantity} ml</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{selectedUnit.status}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Expiry</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(selectedUnit.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Lab Report Section */}
              <div className="border-t border-gray-100 dark:border-slate-700 pt-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-500" />
                  Attached Lab Report
                </h4>
                
                {selectedUnit.labReport ? (
                  <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30 overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
                      <div>
                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-bold uppercase tracking-wider mb-1">Report No.</p>
                        <p className="font-bold text-indigo-900 dark:text-indigo-300">{selectedUnit.labReport.reportNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-bold uppercase tracking-wider mb-1">Decision</p>
                        <p className={`font-bold ${selectedUnit.labReport.decision === 'APPROVED' ? 'text-green-600' : 'text-amber-600'}`}>
                          {selectedUnit.labReport.decision}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 font-bold uppercase tracking-wider mb-1">Generated</p>
                        <p className="font-medium text-indigo-900 dark:text-indigo-300">{new Date(selectedUnit.labReport.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-3">Screening Results</p>
                      {selectedUnit.labReport.testResults ? (
                        <div className="space-y-2">
                          {Object.entries(selectedUnit.labReport.testResults).map(([test, result]: [string, any]) => (
                            <div key={test} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{test.replace(/_/g, ' ')}</span>
                              <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                                result === 'NEGATIVE' || result === 'NORMAL' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                result === 'POSITIVE' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {String(result)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-slate-400 italic">No detailed test results available in the report.</p>
                      )}
                      
                      {selectedUnit.labReport.internalRemarks && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700/50">
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Technician Remarks</p>
                          <p className="text-sm text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-100 dark:border-slate-700">
                            {selectedUnit.labReport.internalRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-900/30 text-center">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-amber-800 dark:text-amber-400 font-medium">No lab report attached to this unit.</p>
                    <p className="text-sm text-amber-600/80 dark:text-amber-500/80 mt-1">This unit might have been added manually or is still pending evaluation.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
