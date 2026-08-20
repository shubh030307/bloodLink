import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Bell, Shield, Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setDarkMode(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        
        {/* Navigation Sidebar for Settings */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col space-y-1">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold' 
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700/50 font-medium'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 border-b border-gray-50 dark:border-slate-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Update your basic profile details.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-2xl font-bold uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{user?.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" disabled value={user?.email || ''} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-700 dark:text-slate-300 opacity-70 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Role</label>
                    <input type="text" disabled value={user?.role || ''} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-gray-700 dark:text-slate-300 opacity-70 cursor-not-allowed" />
                  </div>
                </div>
                
                {user?.role === 'Donor' && (
                  <div className="pt-4">
                    <Link to="/donor/profile" className="inline-flex justify-center items-center px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                      Edit Detailed Profile
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 border-b border-gray-50 dark:border-slate-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Choose how you want to be notified.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Email Notifications</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Receive alerts via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">In-App Alerts</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Show notification dot in sidebar</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-6 border-b border-gray-50 dark:border-slate-700/50">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Security</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your password and security options.</p>
                </div>
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Password</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Regularly changing your password helps keep your account secure.</p>
                  </div>
                  <Link to="/change-password" className="shrink-0 ml-4 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                    Change Password
                  </Link>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-6 border-b border-red-50 dark:border-red-900/20">
                  <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h3>
                </div>
                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Log Out</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Sign out of your account on this device.</p>
                  </div>
                  <button onClick={handleLogout} className="shrink-0 flex items-center ml-4 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm shadow-red-500/30">
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
              <div className="p-6 border-b border-gray-50 dark:border-slate-700/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Customize how BloodLink looks on your device.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center">
                      {darkMode ? <Moon className="w-4 h-4 mr-2 text-indigo-400" /> : <Sun className="w-4 h-4 mr-2 text-orange-400" />}
                      Dark Mode
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Toggle dark theme across the application</p>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-red-600' : 'bg-gray-200'}`}
                  >
                    <span className="sr-only">Toggle Dark Mode</span>
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
