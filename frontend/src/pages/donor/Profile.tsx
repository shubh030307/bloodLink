import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Edit2, Shield, Heart, Droplet, Calendar } from 'lucide-react';
import api from '../../services/api';

const DonorProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mobileNumber: '',
    address: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    age: '',
    gender: ''
  });

  const fetchProfile = async () => {
    try {
      const [profileRes, eligibilityRes] = await Promise.all([
        api.get('/donors/profile'),
        api.get('/donors/eligibility')
      ]);
      setProfile(profileRes.data);
      setEligibility(eligibilityRes.data);
      setFormData({
        mobileNumber: profileRes.data.mobileNumber || '',
        address: profileRes.data.address || '',
        emergencyContactName: profileRes.data.emergencyContact?.name || '',
        emergencyContactRelationship: profileRes.data.emergencyContact?.relationship || '',
        emergencyContactNumber: profileRes.data.emergencyContact?.mobileNumber || '',
        age: profileRes.data.age?.toString() || '',
        gender: profileRes.data.gender || ''
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
    return <div className="text-center py-10 text-gray-500 dark:text-muted-foreground animate-pulse">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto -mt-4">
      <div className="flex justify-between items-end mb-8 mt-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-foreground tracking-tight">My Profile</h2>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">Manage your personal information and contact details</p>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isEditing ? 'bg-red-600 text-white shadow-red-500/30 dark:shadow-red-900/40' : 'bg-white dark:bg-card text-gray-700 dark:text-muted-foreground border border-gray-200 dark:border-border hover:bg-gray-50 dark:hover:bg-accent/50'}`}
        >
          {isEditing ? 'Save Changes' : <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Basic Info */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-white dark:bg-card rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-none flex flex-col items-center text-center relative overflow-hidden pt-32 pb-8 px-8">
             {/* Gradient Banner */}
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-red-700 to-red-500 rounded-t-[2rem]"></div>
             
             {/* Avatar Box */}
             <div className="relative -mt-16 mb-4 z-10">
               <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center p-1 shadow-md">
                 <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-5xl font-extrabold">
                   {profile?.user?.name?.[0] || 'D'}
                 </div>
               </div>
               {/* Blood Group Pill Overlap */}
               <div className="absolute bottom-1 -right-2 bg-white rounded-full p-1 shadow-sm">
                 <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold flex items-center border border-red-100">
                   <Droplet className="w-3 h-3 mr-1 fill-current" /> {profile?.bloodGroup || 'O+'}
                 </span>
               </div>
             </div>
             
             <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-1 tracking-tight">{profile?.user?.name}</h3>
             <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium mb-6">{profile?.user?.email}</p>
             
             {profile?.verificationStatus === 'Verified' && (
               <div className="w-full flex justify-center mb-6">
                 <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-sm font-bold flex items-center border border-green-100 shadow-sm">
                   <Shield className="w-4 h-4 mr-1.5" /> Verified Profile
                 </span>
               </div>
             )}
             
             <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-border pt-6">
                <div className="bg-red-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-red-50 dark:border-slate-700/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2 text-red-500 dark:text-red-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase font-bold tracking-widest mb-1">Age</p>
                  {isEditing ? (
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full text-center bg-transparent border-b border-red-200 dark:border-red-900/50 outline-none text-gray-900 dark:text-foreground font-semibold" placeholder="Age" />
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-foreground text-lg">{profile?.age ? `${profile.age} Years` : '-'}</p>
                  )}
                </div>
                <div className="bg-red-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-red-50 dark:border-slate-700/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2 text-red-500 dark:text-red-400">
                    <User className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase font-bold tracking-widest mb-1">Gender</p>
                  {isEditing ? (
                    <select name="gender" value={formData.gender} onChange={handleChange as any} className="w-full text-center bg-transparent border-b border-red-200 dark:border-red-900/50 outline-none text-gray-900 dark:text-foreground font-semibold">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-foreground text-lg">{profile?.gender || '-'}</p>
                  )}
                </div>
             </div>
          </div>

          {/* Bonus Widget: Next Eligible Donation */}
          {eligibility && (
            <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-none flex items-center space-x-6 border-l-4 border-l-red-500 transition-colors">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-100 dark:text-slate-800 transition-colors" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path 
                    className="text-red-500 transition-all duration-1000 ease-out" 
                    strokeDasharray={`${eligibility.status === 'Eligible' ? 100 : Math.max(0, 100 - (Math.ceil((new Date(eligibility.nextEligibleDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) / 90 * 100))}, 100`} 
                    strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  {eligibility.status === 'Eligible' ? (
                    <Droplet className="w-6 h-6 text-red-500" />
                  ) : (
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {Math.ceil((new Date(eligibility.nextEligibleDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-foreground mb-1">Next Donation</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                  {eligibility.status === 'Eligible' ? 'You are eligible to donate today!' : `Eligible in ${Math.ceil((new Date(eligibility.nextEligibleDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Info & Emergency Contact */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          <div className="bg-white dark:bg-card rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-none">
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-6 flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-3 text-red-600">
                  <User className="w-5 h-5" />
                </div>
                Contact Information
              </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-2">Mobile Number</label>
                {isEditing ? (
                  <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-border outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-foreground transition-all font-medium" />
                ) : profile?.mobileNumber ? (
                  <div className="flex items-center text-gray-900 dark:text-foreground bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl font-medium border border-transparent dark:border-slate-700/50 transition-colors">
                    <Phone className="w-5 h-5 mr-3 text-red-500 dark:text-red-400" /> {profile.mobileNumber}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-400 dark:text-muted-foreground bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 font-medium transition-colors">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3" /> Not provided
                    </div>
                    <button onClick={() => setIsEditing(true)} className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline">+ Add</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-2">Address</label>
                {isEditing ? (
                  <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-border outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-foreground transition-all font-medium" />
                ) : profile?.address ? (
                  <div className="flex items-center text-gray-900 dark:text-foreground bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl font-medium border border-transparent dark:border-slate-700/50 transition-colors">
                    <MapPin className="w-5 h-5 mr-3 text-red-500 dark:text-red-400 flex-shrink-0" /> {profile.address}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-400 dark:text-muted-foreground bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 font-medium transition-colors">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-3 flex-shrink-0" /> Not provided
                    </div>
                    <button onClick={() => setIsEditing(true)} className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline">+ Add</button>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:shadow-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-6 flex items-center relative z-10">
              <div className="bg-red-100 p-2 rounded-full mr-3 text-red-600">
                <Heart className="w-5 h-5" />
              </div>
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-2">Contact Name</label>
                {isEditing ? (
                  <input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-border outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-foreground transition-all font-medium" />
                ) : profile?.emergencyContact?.name ? (
                  <div className="text-gray-900 dark:text-foreground bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl font-medium border border-transparent dark:border-slate-700/50 transition-colors">
                    {profile.emergencyContact.name}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-400 dark:text-muted-foreground bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 font-medium transition-colors">
                    Not provided
                    <button onClick={() => setIsEditing(true)} className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline">+ Add</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-2">Relationship</label>
                {isEditing ? (
                  <input type="text" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-border outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-foreground transition-all font-medium" />
                ) : profile?.emergencyContact?.relationship ? (
                  <div className="text-gray-900 dark:text-foreground bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl font-medium border border-transparent dark:border-slate-700/50 transition-colors">
                    {profile.emergencyContact.relationship}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-400 dark:text-muted-foreground bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 font-medium transition-colors">
                    Not provided
                    <button onClick={() => setIsEditing(true)} className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline">+ Add</button>
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest mb-2">Emergency Number</label>
                {isEditing ? (
                  <input type="text" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} className="w-full p-4 rounded-xl bg-gray-50 dark:bg-background border border-gray-200 dark:border-border outline-none focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-800 text-gray-900 dark:text-foreground transition-all font-medium" />
                ) : profile?.emergencyContact?.mobileNumber ? (
                  <div className="flex items-center text-gray-900 dark:text-foreground bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl font-medium border border-transparent dark:border-slate-700/50 transition-colors">
                    <Phone className="w-5 h-5 mr-3 text-red-500 dark:text-red-400" /> {profile.emergencyContact.mobileNumber}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-400 dark:text-muted-foreground bg-gray-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 font-medium transition-colors">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 mr-3" /> Not provided
                    </div>
                    <button onClick={() => setIsEditing(true)} className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline">+ Add</button>
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
