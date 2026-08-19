import { useState, useEffect } from 'react';
import { Award, Shield, Droplet, Crown, Lock, Gift, CheckCircle, AlertCircle, X, Download } from 'lucide-react';
import api from '../../services/api';
import CertificateModal from '../../components/donor/CertificateModal';
import { useAuth } from '../../context/AuthContext';

const DonorMilestones = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showTshirtModal, setShowTshirtModal] = useState(false);
  const [selectedTshirtSize, setSelectedTshirtSize] = useState('L');
  const [activeClaimId, setActiveClaimId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const [showCelebration, setShowCelebration] = useState<any>(null);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const response = await api.get('/milestones/donor');
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch milestones", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (claimId: string, tshirtSize?: string) => {
    try {
      setClaiming(claimId);
      await api.post('/milestones/claim', { claimId, tshirtSize });
      await fetchMilestones(); // Refresh to update status
      setShowTshirtModal(false);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const initiateClaim = (claim: any, milestoneCode: string) => {
    if (milestoneCode === 'BLOOD_GUARDIAN') {
      setActiveClaimId(claim.id);
      setShowTshirtModal(true);
    } else {
      handleClaimReward(claim.id);
    }
  };

  const downloadCertificate = async (milestoneId: string) => {
    try {
      const response = await api.post('/certificates/milestone', { milestoneId });
      setSelectedCertificate(response.data.certificate);
    } catch (error) {
      alert('Failed to generate certificate');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500 dark:text-muted-foreground animate-pulse">Loading strict milestone data...</div>;
  }

  const { verifiedDonations, allMilestones, achievements, rewardClaims } = data;

  const getMilestoneIcon = (code: string) => {
    switch (code) {
      case 'FIRST_DROP': return <Droplet className="w-8 h-8 text-red-500" />;
      case 'LIFE_SAVER': return <Shield className="w-8 h-8 text-blue-500" />;
      case 'BLOOD_GUARDIAN': return <Award className="w-8 h-8 text-purple-500" />;
      case 'BLOODLINK_LEGEND': return <Crown className="w-8 h-8 text-yellow-500" />;
      default: return <Award className="w-8 h-8 text-gray-500" />;
    }
  };

  const getMilestoneColor = (code: string) => {
    switch (code) {
      case 'FIRST_DROP': return 'bg-red-100 border-red-500';
      case 'LIFE_SAVER': return 'bg-blue-100 border-blue-500';
      case 'BLOOD_GUARDIAN': return 'bg-purple-100 border-purple-500';
      case 'BLOODLINK_LEGEND': return 'bg-yellow-100 border-yellow-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-foreground tracking-tight">Milestones & Rewards</h2>
          <p className="text-gray-500 dark:text-muted-foreground mt-1 font-medium">Your journey as a life saver.</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 text-blood-600 dark:text-red-400 px-6 py-3 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col items-center justify-center">
          <span className="text-3xl font-black">{verifiedDonations}</span>
          <span className="text-xs font-bold uppercase tracking-widest">Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {allMilestones.map((milestone: any) => {
          const isUnlocked = verifiedDonations >= milestone.requiredDonations;
          const achievement = achievements.find((a: any) => a.milestoneId === milestone.id);
          const claims = rewardClaims.filter((rc: any) => rc.milestoneId === milestone.id);

          return (
            <div key={milestone.id} className={`glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-l-8 ' + getMilestoneColor(milestone.code).split(' ')[1] : 'opacity-80 grayscale-[0.5] border-l-8 border-gray-300 dark:border-slate-600'}`}>
              
              {!isUnlocked && (
                <div className="absolute top-6 right-6 text-gray-400 flex items-center bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium text-sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Locked
                </div>
              )}
              
              {isUnlocked && (
                <div className="absolute top-6 right-6 text-green-600 dark:text-green-400 flex flex-col items-end">
                   <div className="flex items-center bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full font-bold text-sm">
                     <CheckCircle className="w-4 h-4 mr-2" />
                     UNLOCKED
                   </div>
                   {achievement && <span className="text-xs text-gray-500 mt-2 font-medium">Unlocked on: {new Date(achievement.unlockedAt).toLocaleDateString()}</span>}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className={`p-5 rounded-3xl mr-6 flex-shrink-0 ${isUnlocked ? getMilestoneColor(milestone.code).split(' ')[0] : 'bg-gray-100 dark:bg-muted'}`}>
                  {getMilestoneIcon(milestone.code)}
                </div>
                <div className="flex-1 mt-4 md:mt-0">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-foreground uppercase tracking-tight">{milestone.name}</h3>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-muted text-slate-600 dark:text-muted-foreground rounded-lg text-sm font-bold">
                      {milestone.requiredDonations} {milestone.requiredDonations === 1 ? 'Donation' : 'Donations'}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-slate-400 font-medium mb-4">{milestone.description}</p>
                  
                  {/* Progress Bar */}
                  {!isUnlocked && (
                    <div className="mb-6 max-w-md">
                      <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                        <span>Progress</span>
                        <span>{verifiedDonations} / {milestone.requiredDonations}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gray-400 h-2.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min((verifiedDonations / milestone.requiredDonations) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Rewards Section */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center">
                      <Gift className="w-4 h-4 mr-2 text-blood-500" /> Included Rewards
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Physical Rewards */}
                      {milestone.rewards.filter((r: any) => r.rewardType === 'PHYSICAL').map((reward: any) => {
                        const claim = claims.find((c: any) => c.rewardId === reward.id);
                        
                        return (
                          <div key={reward.id} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{reward.rewardName}</p>
                            
                            {isUnlocked && claim ? (
                              <div className="mt-3">
                                {claim.status === 'ELIGIBLE' && (
                                  <button 
                                    onClick={() => initiateClaim(claim, milestone.code)}
                                    disabled={claiming === claim.id}
                                    className="w-full py-1.5 bg-blood-600 hover:bg-blood-700 text-white text-xs font-bold rounded-lg transition-colors"
                                  >
                                    {claiming === claim.id ? 'Claiming...' : 'CLAIM REWARD'}
                                  </button>
                                )}
                                {claim.status === 'CLAIMED' && <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold rounded-md">CLAIMED</span>}
                                {claim.status === 'READY_FOR_COLLECTION' && <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold rounded-md">READY FOR COLLECTION</span>}
                                {claim.status === 'COLLECTED' && <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 text-xs font-bold rounded-md">COLLECTED</span>}
                                {claim.status === 'OUT_OF_STOCK' && (
                                  <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                                    <AlertCircle className="w-3 h-3 mr-1" /> Temporarily out of stock
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2">
                                <span className="text-xs text-gray-400 font-medium">{reward.rewardType} ITEM</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Certificates & Badges */}
                      {milestone.rewards.filter((r: any) => r.rewardType === 'DIGITAL').map((reward: any) => (
                        <div key={reward.id} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{reward.rewardName}</p>
                          {isUnlocked && <span className="inline-block px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-md mt-2 self-start">UNLOCKED</span>}
                        </div>
                      ))}

                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 p-4 rounded-xl flex flex-col justify-between">
                        <p className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">{milestone.code === 'BLOODLINK_LEGEND' ? 'Premium Certificate' : 'Digital Certificate'}</p>
                        {isUnlocked ? (
                          <button 
                            onClick={() => downloadCertificate(milestone.id)}
                            className="mt-3 w-full py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-800/40 dark:hover:bg-indigo-700/50 dark:text-indigo-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                          >
                            <Download className="w-3 h-3 mr-1.5" /> DOWNLOAD
                          </button>
                        ) : (
                          <span className="text-xs text-indigo-400 font-medium mt-2">DIGITAL REWARD</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* T-Shirt Size Modal */}
      {showTshirtModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select T-Shirt Size</h3>
              <button onClick={() => setShowTshirtModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-slate-400 mb-6 font-medium">Please select your preferred size for the BloodLink Branded T-Shirt.</p>
              
              <div className="grid grid-cols-3 gap-3 mb-8">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedTshirtSize(size)}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      selectedTshirtSize === size 
                        ? 'bg-blood-600 text-white shadow-md shadow-blood-500/30' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => activeClaimId && handleClaimReward(activeClaimId, selectedTshirtSize)}
                disabled={claiming !== null}
                className="w-full py-4 bg-blood-600 hover:bg-blood-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blood-500/20"
              >
                {claiming ? 'Confirming...' : 'Confirm & Claim'}
              </button>
            </div>
          </div>
        </div>
      )}

      <CertificateModal 
        isOpen={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        certificateData={selectedCertificate}
        donorName={user?.name || 'Valued Donor'}
      />
    </div>
  );
};

export default DonorMilestones;
