import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Edit2, Shield, Heart , Droplet} from 'lucide-react';
import api from '../../services/api';

const DonorProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: ''
  });

  const fetchProfile = async () => {
    try {
      const response = await api.get('/donors/profile');
      setProfile(response.data);
      setFormData({
        mobileNumber: response.data.mobileNumber || '',
        address: response.data.address || '',
        emergencyContactName: response.data.emergencyContact?.name || '',
        emergencyContactRelationship: response.data.emergencyContact?.relationship || '',
        emergencyContactNumber: response.data.emergencyContact?.mobileNumber || '',
      });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      // In a real app, sensitive changes would trigger an OTP here.
      await api.put('/donors/profile', formData);
      alert('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500 animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto -mt-4">
      <div className="flex justify-between items-end mb-8 mt-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Profile</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your personal information and contact details</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isEditing ? 'bg-red-600 text-white shadow-red-500/30 dark:shadow-red-900/40' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
        >
          {isEditing ? 'Save Changes' : <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden">
             {/* Subtle background glow */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
             
             <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-5xl font-extrabold shadow-xl shadow-red-500/30 dark:shadow-red-900/50 mb-6 border-4 border-white dark:border-slate-800">
                {profile?.user?.name?.[0] || 'D'}
             </div>
             
             <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1 tracking-tight">{profile?.user?.name}</h3>
             <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mb-6">{profile?.user?.email}</p>
             
             <div className="w-full flex justify-center space-x-3 mb-8">
                <span className="px-4 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-bold flex items-center border border-red-100 dark:border-red-900/30 shadow-sm dark:shadow-none">
                  <Droplet className="w-4 h-4 mr-1.5 fill-current" /> {profile?.bloodGroup || 'Unknown'}
                </span>
                {profile?.verificationStatus === 'Verified' && (
                  <span className="px-4 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-bold flex items-center border border-green-100 dark:border-green-900/30 shadow-sm dark:shadow-none">
                    <Shield className="w-4 h-4 mr-1.5" /> Verified
                  </span>
                )}
             </div>
             
             <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-slate-700 pt-6">
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center border border-gray-100 dark:border-slate-600">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-1">Age</p>
                  <p className="font-extrabold text-gray-900 dark:text-white text-lg">{profile?.age ? `${profile.age} Years` : '-'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 text-center border border-gray-100 dark:border-slate-600">
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest mb-1">Gender</p>
                  <p className="font-extrabold text-gray-900 dark:text-white text-lg">{profile?.gender || '-'}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Editable Info & Emergency Contact */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden">
            <img src="/dark-form-bg.png" className="absolute inset-0 w-full h-full object-cover opacity-20 hidden dark:block pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
                <User className="w-5 h-5 mr-3 text-red-500" /> Contact Information
              </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Mobile Number</label>
                {isEditing ? (
                  <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white transition-all font-medium" />
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 font-medium">
                    <Phone className="w-5 h-5 mr-3 text-gray-400 dark:text-slate-500" /> {profile?.mobileNumber || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Address</label>
                {isEditing ? (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white transition-all font-medium" />
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 font-medium">
                    <MapPin className="w-5 h-5 mr-3 text-gray-400 dark:text-slate-500" /> {profile?.address || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          <div className="relative bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-red-100 dark:border-red-900/30 overflow-hidden">
            <img src="/dark-form-bg.png" className="absolute inset-0 w-full h-full object-cover opacity-20 hidden dark:block pointer-events-none" />
            
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center relative z-10">
              <Heart className="w-5 h-5 mr-3 text-red-500" /> Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Contact Name</label>
                {isEditing ? (
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white transition-all font-medium" />
                ) : (
                  <div className="text-gray-900 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 font-medium">
                    {profile?.emergencyContact?.name || 'Not provided'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Relationship</label>
                {isEditing ? (
                  <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white transition-all font-medium" />
                ) : (
                  <div className="text-gray-900 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 font-medium">
                    {profile?.emergencyContact?.relationship || 'Not provided'}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Emergency Number</label>
                {isEditing ? (
                  <input type="text" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-white transition-all font-medium" />
                ) : (
                  <div className="flex items-center text-gray-900 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700 font-medium">
                    <Phone className="w-5 h-5 mr-3 text-red-400" /> {profile?.emergencyContact?.mobileNumber || 'Not provided'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;
