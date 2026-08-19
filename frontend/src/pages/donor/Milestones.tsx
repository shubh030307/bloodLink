import { useState, useEffect } from 'react';
import { Award, Shield, Heart, Zap, Lock } from 'lucide-react';
import api from '../../services/api';

const milestonesData = [
  { level: 1, title: 'Life Saver', description: 'Complete your first blood donation', required: 1, icon: Heart, color: 'text-red-500', bg: 'bg-red-100' },
  { level: 2, title: 'Consistent Giver', description: '5 Donations within 1 year (Priority Request Access)', required: 5, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  { level: 3, title: 'Blood Hero', description: 'Complete 10 total donations (Special Badge)', required: 10, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100' },
  { level: 4, title: 'Blood Champion', description: 'Complete 25 total donations', required: 25, icon: Award, color: 'text-purple-500', bg: 'bg-purple-100' },
];

const DonorMilestones = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/donors/profile');
        setProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500 animate-pulse">Loading milestones...</div>;
  }

  const totalDonations = profile?.donations?.filter((d: any) => d.status === 'Completed').length || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Milestones</h2>
      </div>

      <div className="glass-card p-8 mb-8 text-center flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          {/* Circular Progress SVG */}
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
            <circle 
              cx="64" 
              cy="64" 
              r="60" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - Math.min(totalDonations / 25, 1))}
              className="text-blood-500 transition-all duration-1000 ease-out" 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{totalDonations}</span>
            <span className="text-xs text-gray-500 font-medium">Donations</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Keep up the great work!</h3>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">Every drop counts. Unlock higher levels and special privileges by continuing your donation journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestonesData.map((milestone) => {
          const isUnlocked = totalDonations >= milestone.required;
          const Icon = milestone.icon;
          
          return (
            <div key={milestone.level} className={`glass-card p-6 relative overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-l-4 border-blood-500' : 'opacity-70 grayscale-[0.5]'}`}>
              {!isUnlocked && (
                <div className="absolute top-4 right-4 text-gray-300">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              
              <div className="flex items-start">
                <div className={`p-4 rounded-2xl mr-4 ${isUnlocked ? milestone.bg : 'bg-gray-100'}`}>
                  <Icon className={`w-8 h-8 ${isUnlocked ? milestone.color : 'text-gray-400'}`} />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Level {milestone.level}</span>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h4>
                  <p className="text-sm text-gray-500 mb-4">{milestone.description}</p>
                  
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-1 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${isUnlocked ? 'bg-green-500' : 'bg-blood-400'}`} 
                      style={{ width: `${Math.min((totalDonations / milestone.required) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs font-medium text-gray-400">
                    {Math.min(totalDonations, milestone.required)} / {milestone.required}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DonorMilestones;
