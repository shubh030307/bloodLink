import { useState, useEffect } from 'react';
import { Calendar, Droplet, Award, Bell, CheckCircle, Clock, AlertTriangle, Users, Heart, FileText, ChevronRight, AlertCircle, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eligibilityRes, apptRes, milestonesRes, notificationsRes] = await Promise.all([
          api.get('/donors/eligibility'),
          api.get('/appointments/my'),
          api.get('/donors/me/milestones'),
          api.get('/notifications')
        ]);
        setEligibility(eligibilityRes.data);
        setAppointments(apptRes.data);
        setMilestones(milestonesRes.data);
        setNotifications(notificationsRes.data || []);
      } catch (error) {
        console.error("Error fetching donor dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Droplet className="w-10 h-10 text-destructive mb-2 animate-bounce" />
          <span className="text-gray-500 dark:text-muted-foreground font-medium">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const nextAppt = appointments.length > 0 ? appointments[0] : null;
  const activeOtpAppt = appointments.find(a => a.visit?.donation?.otpVerification?.status === 'OTP_PENDING');

  return (
    <div className="max-w-7xl mx-auto space-y-6 -mt-4">

      {/* Welcome Header */}
      <div className="flex justify-between items-end mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-foreground tracking-tight flex items-center">
            Hello, {user?.name?.split(' ')[0] || 'Donor'}! <span className="ml-2 text-2xl">👋</span>
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">Thank you for being a life saver. Your generosity brings hope.</p>
        </div>
        {/* The mockup has a hand holding a blood drop graphic floating on the right side of the header */}
        <div className="absolute -bottom-4 -right-4 opacity-90 w-40 h-40">
          <img src="/bg.png" className="w-full h-full object-cover rounded-tl-full opacity-50 dark:hidden" style={{clipPath: "circle(50% at right bottom)"}} />
          <img src="/dark-bg.png" className="w-full h-full object-cover rounded-tl-full opacity-50 hidden dark:block" style={{clipPath: "circle(50% at right bottom)"}} />
        </div>
      </div>

      {/* Global OTP Alert */}
      {activeOtpAppt && (
        <div className="bg-destructive/10 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 shadow-lg flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-1 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              Collection In Progress - Action Required
            </h2>
            <p className="text-destructive dark:text-red-300 font-medium">Please provide this OTP to the collection staff to verify your blood donation.</p>
          </div>
          <div className="bg-white dark:bg-card border-2 border-red-300 dark:border-red-500/50 rounded-xl px-8 py-4 shadow-inner">
            <span className="text-4xl font-mono font-black tracking-[0.2em] text-gray-900 dark:text-foreground">
              {activeOtpAppt.visit.donation.otpVerification.otpHash}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Donation Status (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-card rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-border flex justify-between relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-center">
            <h3 className="text-gray-400 dark:text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">Donation Status</h3>

            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className={`w-8 h-8 ${eligibility?.status === 'Eligible' ? 'text-success' : 'text-gray-400 dark:text-muted-foreground'}`} />
              <h2 className={`text-3xl font-extrabold ${eligibility?.status === 'Eligible' ? 'text-success' : 'text-gray-600 dark:text-muted-foreground'}`}>
                {eligibility?.status || 'Unknown'}
              </h2>
            </div>

            <p className="text-gray-500 dark:text-muted-foreground mb-8 max-w-sm text-sm">
              You are currently eligible to donate blood and save lives!
            </p>

            <Link to="/donor/book" className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-red-500/30 dark:shadow-red-900/40 transition-all w-max">
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Professional Abstract Graphic */}
          <div className="absolute right-0 bottom-0 top-0 w-1/2 flex items-center justify-end overflow-hidden z-0 pointer-events-none rounded-r-[2rem]">
            {/* Soft background glows */}
            <div className="absolute w-64 h-64 bg-destructive/10 dark:bg-destructive/100/10 rounded-full -right-10 -top-10 opacity-70 blur-3xl"></div>
            <div className="absolute w-48 h-48 bg-red-100 dark:bg-red-600/10 rounded-full -bottom-10 right-20 opacity-40 blur-2xl"></div>
            
            <div className="relative w-48 h-48 flex items-center justify-center mr-8">
              {/* Core circular background with premium inner shadow/gradient */}
              <div className="absolute inset-2 bg-gradient-to-br from-white to-red-50 dark:from-slate-800 dark:to-slate-700 rounded-full shadow-[inset_0_-10px_20px_rgba(254,226,226,0.8),0_15px_35px_rgba(239,68,68,0.1)] dark:shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5),0_15px_35px_rgba(0,0,0,0.5)] border border-red-50 dark:border-border"></div>
              
              {/* Main Droplet */}
              <Droplet className="w-20 h-20 text-destructive z-10 fill-red-500" style={{ filter: 'drop-shadow(0 10px 15px rgba(239,68,68,0.3))' }} />
              
              {/* Floating accent elements to create a 3D spatial feel */}
              <div className="absolute top-8 right-10 w-3 h-3 bg-red-400 rounded-full opacity-60 blur-[1px] animate-pulse"></div>
              <div className="absolute bottom-12 left-10 w-5 h-5 bg-red-300 dark:bg-destructive/100 rounded-full opacity-40 blur-[2px]"></div>
              <Droplet className="absolute top-10 left-12 w-6 h-6 text-red-300 dark:text-destructive z-0 fill-red-300 dark:fill-red-500 opacity-50 dark:opacity-30" style={{ transform: 'rotate(-15deg)' }} />
            </div>
          </div>
        </div>

        {/* Strict Donor Milestone Card (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-card rounded-[2rem] p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-border flex flex-col justify-between">
          
          {milestones?.currentLevel && milestones.currentLevel.code === 'BLOODLINK_LEGEND' ? (
            // LEGEND STATE
            <div className="h-full flex flex-col justify-center text-center items-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">👑</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-foreground tracking-tight uppercase mb-1">
                BLOODLINK LEGEND
              </h3>
              <p className="text-sm font-bold text-blood-600 dark:text-blood-400 uppercase tracking-widest mb-6">
                {milestones.verifiedDonations}+ VERIFIED DONATIONS
              </p>
              <div className="bg-slate-50 dark:bg-muted p-4 rounded-xl border border-slate-100 dark:border-border w-full mb-6">
                <p className="text-sm text-gray-700 dark:text-muted-foreground font-medium leading-relaxed">
                  You've reached the highest<br/>BloodLink milestone.
                </p>
              </div>
              <Link to="/donor/milestones" className="w-full py-3 bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-accent text-gray-800 dark:text-foreground text-sm font-bold rounded-xl transition-colors">
                VIEW REWARDS
              </Link>
            </div>
          ) : (
            // NORMAL STATE
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-col items-center text-center mb-6 border-b border-gray-100 dark:border-border pb-6">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl">
                      {!milestones?.currentLevel ? '🩸' : 
                       milestones.currentLevel.code === 'FIRST_DROP' ? '🩸' : 
                       milestones.currentLevel.code === 'LIFE_SAVER' ? '🛡️' : '🏆'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-foreground tracking-tight uppercase mb-1">
                    {milestones?.currentLevel?.name || 'NO MILESTONE'}
                  </h3>
                  <p className="text-xs font-bold text-blood-600 dark:text-blood-400 uppercase tracking-widest">
                    {milestones?.verifiedDonations || 0} VERIFIED DONATIONS
                  </p>
                </div>
                
                {milestones?.nextLevel && (
                  <div>
                    <p className="text-xs text-gray-400 dark:text-muted-foreground font-bold uppercase tracking-widest mb-2 text-center">Next milestone:</p>
                    <div className="bg-slate-50 dark:bg-muted p-4 rounded-xl border border-slate-100 dark:border-border mb-6 text-center">
                      <h4 className="font-bold text-gray-900 dark:text-foreground uppercase">{milestones.nextLevel.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground font-medium mb-3">{milestones.nextLevel.requiredDonations} DONATIONS</p>
                      
                      <p className="text-xs text-gray-600 dark:text-muted-foreground font-bold mb-2">
                        {milestones.nextLevel.requiredDonations - (milestones.verifiedDonations || 0)} more verified donations
                      </p>
                      
                      <div className="w-full bg-gray-200 dark:bg-accent rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-blood-500 h-2.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(((milestones.verifiedDonations || 0) / milestones.nextLevel.requiredDonations) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Link to="/donor/milestones" className="w-full py-3 bg-gray-100 dark:bg-muted hover:bg-gray-200 dark:hover:bg-accent text-gray-800 dark:text-foreground text-sm font-bold rounded-xl transition-colors text-center block">
                [VIEW MILESTONES]
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">

          {/* Upcoming Appointment */}
          <div className="bg-white dark:bg-card rounded-[2rem] shadow-sm dark:shadow-none border border-gray-100 dark:border-border overflow-hidden">
            <div className="p-6 pb-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-destructive" />
                Upcoming Appointment
              </h3>
              <Link to="/donor/appointments" className="text-sm font-bold text-destructive dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">View all</Link>
            </div>

            <div className="p-6 pt-0">
              {nextAppt ? (
                <div className="border border-gray-100 dark:border-border rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-center hover:shadow-md transition-shadow bg-white dark:bg-card/50 relative overflow-hidden">
                  {/* Subtle background glow for the card */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-50 dark:from-red-900/20 to-transparent rounded-full opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none blur-3xl"></div>
                  
                  {/* Premium Hospital Icon Placeholder */}
                  <div className="w-full md:w-40 h-32 rounded-[1.25rem] shrink-0 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-card dark:from-muted to-white dark:to-card border border-gray-100 dark:border-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full blur-2xl opacity-60 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-destructive/10 dark:bg-red-800/20 rounded-full blur-xl opacity-80 -translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative w-16 h-16 bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-50 dark:border-border flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-destructive" style={{ filter: 'drop-shadow(0 4px 6px rgba(239,68,68,0.2))' }} />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full relative z-10">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h4 className="font-extrabold text-gray-900 dark:text-foreground text-xl tracking-tight mb-1">{nextAppt.bloodBank?.name || 'Central Blood Bank'}</h4>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400 dark:text-muted-foreground" />
                          {nextAppt.bloodBank?.address || '789 Life Rd, City Center'}
                        </p>
                      </div>
                      <span className="bg-gradient-to-r from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100 dark:border-green-800 shadow-sm">
                        CHECKED IN
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-white dark:bg-muted px-5 py-2.5 rounded-xl border border-gray-100 dark:border-border text-sm font-bold text-gray-700 dark:text-foreground shadow-sm">
                        <Calendar className="w-4 h-4 mr-2 text-destructive" />
                        {new Date(nextAppt.date).toLocaleDateString('en-GB')}
                      </div>
                      <div className="flex items-center bg-white dark:bg-muted px-5 py-2.5 rounded-xl border border-gray-100 dark:border-border text-sm font-bold text-gray-700 dark:text-foreground shadow-sm">
                        <Clock className="w-4 h-4 mr-2 text-destructive" />
                        {nextAppt.timeSlot}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-muted-foreground bg-gray-50 dark:bg-card/50 rounded-2xl border border-dashed border-gray-200 dark:border-border">
                  <Calendar className="w-10 h-10 mx-auto text-gray-300 dark:text-muted-foreground mb-2" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>

            {/* Alert Strip */}
            <div className="bg-destructive/10 dark:bg-destructive/100/10 px-6 py-4 flex items-center border-t border-red-100 dark:border-red-900/30 text-sm">
              <AlertCircle className="w-4 h-4 text-destructive dark:text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-800 dark:text-red-300 font-medium">Don't forget to eat healthy and drink plenty of water before donating.</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-sm dark:shadow-none border border-gray-100 dark:border-border">
            <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-6">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-4">
              <Link to="/donor/book" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 dark:border-border hover:shadow-md dark:hover:bg-accent/50 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-destructive/10 dark:bg-muted flex items-center justify-center mb-3 group-hover:bg-red-100 dark:group-hover:bg-slate-600 transition-colors">
                  <Calendar className="w-5 h-5 text-destructive dark:text-red-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-muted-foreground text-center">Book Donation</span>
              </Link>
              <Link to="/search" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 dark:border-border hover:shadow-md dark:hover:bg-accent/50 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-destructive/10 dark:bg-muted flex items-center justify-center mb-3 group-hover:bg-red-100 dark:group-hover:bg-slate-600 transition-colors">
                  <Droplet className="w-5 h-5 text-destructive dark:text-red-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-muted-foreground text-center">Find Blood</span>
              </Link>
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 dark:border-border hover:shadow-md dark:hover:bg-accent/50 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-destructive/10 dark:bg-muted flex items-center justify-center mb-3 group-hover:bg-red-100 dark:group-hover:bg-slate-600 transition-colors">
                  <Users className="w-5 h-5 text-destructive dark:text-red-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-muted-foreground text-center">Invite Friends</span>
              </div>
              <Link to="/donor/history" className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 dark:border-border hover:shadow-md dark:hover:bg-accent/50 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-destructive/10 dark:bg-muted flex items-center justify-center mb-3 group-hover:bg-red-100 dark:group-hover:bg-slate-600 transition-colors">
                  <FileText className="w-5 h-5 text-destructive dark:text-red-400" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-muted-foreground text-center">Donation History</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-sm dark:shadow-none border border-gray-100 dark:border-border flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground flex items-center">
                <Bell className="w-5 h-5 mr-2 text-destructive" />
                Recent Notifications
              </h3>
              <button className="text-sm font-bold text-destructive dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors">View all</button>
            </div>

            <div className="space-y-6">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-sm text-gray-500 dark:text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-muted-foreground mb-2" />
                  No recent notifications.
                </div>
              ) : (
                notifications.slice(0, 3).map((notification: any) => (
                  <div key={notification.id} className="flex items-start pb-6 border-b border-gray-50 dark:border-border/50 last:border-0 last:pb-0">
                    <div className="w-10 h-10 rounded-full bg-info/10 dark:bg-muted flex items-center justify-center text-info dark:text-blue-400 shrink-0 mr-4">
                      {notification.type === 'InApp' ? <Bell className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-foreground">{notification.type || 'Notification'}</h4>
                      <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1 mb-2 leading-relaxed">{notification.message}</p>
                      <p className="text-[10px] font-bold text-gray-400 dark:text-muted-foreground uppercase tracking-widest">{new Date(notification.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Card - Every Drop Counts */}
          {/* Note: The user mockup shows this on the left sidebar bottom for Donor, but Collection Staff has it here. 
              If the layout is strictly identical for both roles, I am putting it here to balance the columns. 
              Wait, the Donor mockup actually shows "Every Drop Counts" inside the sidebar! 
              But my MainLayout is shared. I can conditionally render it in MainLayout. */}
        </div>

      </div>
    </div>
  );
};

export default DonorDashboard;
