import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MapPin, Phone, Building2, Eye, ShieldAlert, Filter, User } from 'lucide-react';
import api from '../../services/api';

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [newStaffPassword, setNewStaffPassword] = useState<string | null>(null);

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await api.get('/staff');
      return res.data;
    }
  });

  const filteredStaff = staffList.filter((staff: any) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (staff.staffProfile?.employeeId && staff.staffProfile.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (staff.hospital?.registrationNumber && staff.hospital.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'All' || staff.role.name === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Staff & Facilities Management</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage system access for employees and hospitals</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setNewStaffPassword(null);
            setIsModalOpen(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-red-600/20 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register New
        </button>
      </div>

      {newStaffPassword && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-2xl flex items-start shadow-sm">
          <div className="bg-green-100 p-2 rounded-full mr-4">
            <ShieldAlert className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-green-800">Account Created Successfully!</h3>
            <p className="text-sm text-green-700 mt-1">Please securely share the following temporary password with the employee. They will be forced to change it upon their first login.</p>
            <div className="mt-3 p-3 bg-white rounded-xl border border-green-200 inline-block">
              <span className="font-mono text-xl font-bold tracking-widest text-gray-900">{newStaffPassword}</span>
            </div>
          </div>
          <button onClick={() => setNewStaffPassword(null)} className="text-green-600 hover:text-green-800 font-bold text-sm">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-gray-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none font-medium text-gray-700 bg-white"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Receptionist">Receptionist</option>
              <option value="CollectionStaff">Collection Staff</option>
              <option value="LabTechnician">Lab Technician</option>
              <option value="Hospital">Hospital</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role & ID</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location/Branch</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading staff data...</td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No records found matching your filters.</td>
                </tr>
              ) : (
                filteredStaff.map((staff: any) => (
                  <tr key={staff.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-500">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-md mb-1 ${
                        staff.role.name === 'Admin' ? 'bg-purple-100 text-purple-700' :
                        staff.role.name === 'Hospital' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {staff.role.name}
                      </span>
                      <div className="text-xs font-mono text-gray-500">
                        ID: {staff.hospital?.registrationNumber || staff.staffProfile?.employeeId || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        {staff.hospital?.contactDetails || staff.staffProfile?.contactNumber || 'N/A'}
                      </div>
                      {staff.hospital?.authorizedPerson && (
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          {staff.hospital.authorizedPerson}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-2">{staff.hospital?.address || staff.staffProfile?.branch || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <RegisterStaffModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(tempPass) => {
            setIsModalOpen(false);
            setNewStaffPassword(tempPass);
            queryClient.invalidateQueries({ queryKey: ['staff'] });
          }}
        />
      )}
    </div>
  );
};

const RegisterStaffModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: (pass: string) => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleName: 'Receptionist',
    employeeId: '',
    branch: '',
    contactNumber: '',
    address: '',
    age: '',
    hospitalRegistration: '',
    authorizedPerson: ''
  });
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: (data: any) => api.post('/staff', data),
    onSuccess: (res) => {
      onSuccess(res.data.temporaryPassword);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to register');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
          <h2 className="text-xl font-black text-gray-900">Register New Entity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Role Type *</label>
              <select 
                name="roleName" 
                value={formData.roleName} 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none text-gray-900 font-medium"
              >
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="CollectionStaff">Collection Staff</option>
                <option value="LabTechnician">Lab Technician</option>
                <option value="Hospital">Hospital</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">{formData.roleName === 'Hospital' ? 'Hospital Name *' : 'Full Name *'}</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            {formData.roleName === 'Hospital' ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Registration Number *</label>
                  <input type="text" name="hospitalRegistration" required value={formData.hospitalRegistration} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Authorized Person *</label>
                  <input type="text" name="authorizedPerson" required value={formData.authorizedPerson} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Employee ID (Optional)</label>
                  <input type="text" name="employeeId" placeholder="Auto-generated if blank" value={formData.employeeId} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Allotted Branch</label>
                  <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Contact Number *</label>
              <input type="tel" name="contactNumber" required value={formData.contactNumber} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Address *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={registerMutation.isPending} className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-70">
              {registerMutation.isPending ? 'Registering...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffManagement;
