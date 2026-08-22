import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users, Activity, Calendar, Settings, FileText, Search, Award, Clock, User, Moon, Sun, ClipboardList, Microscope, Bell, HelpCircle, Plus, MapPin } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dark mode effect

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  const renderNavLinks = () => {
    switch (user?.role) {
      case 'Donor':
        return (
          <>
            <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/donor/profile" icon={<User />} label="My Profile" active={location.pathname === '/donor/profile'} />
            <NavItem to="/donor/book" icon={<Calendar />} label="Book Donation" active={location.pathname === '/donor/book'} />
            <NavItem to="/donor/appointments" icon={<Clock />} label="Appointments" active={location.pathname === '/donor/appointments'} />
            <NavItem to="/donor/history" icon={<FileText />} label="History" active={location.pathname === '/donor/history'} />
            <NavItem to="/donor/milestones" icon={<Award />} label="Milestones" active={location.pathname === '/donor/milestones'} />
            <NavItem to="/support" icon={<HelpCircle />} label="Help & Support" active={location.pathname === '/support'} />
          </>
        );
      case 'Admin':
        return (
          <>
            <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/search" icon={<Search />} label="Find Blood" active={location.pathname === '/search'} />
            <NavItem to="/inventory" icon={<Activity />} label="Inventory" active={location.pathname === '/inventory'} />
            <NavItem to="/requests" icon={<FileText />} label="Requests" active={location.pathname === '/requests'} />
            <NavItem to="/staff" icon={<Users />} label="Staff & Facilities" active={location.pathname === '/staff'} />
            <NavItem to="/camps" icon={<MapPin />} label="Donation Camps" active={location.pathname === '/camps'} />
            <NavItem to="/reports" icon={<FileText />} label="Reports" active={location.pathname === '/reports'} />
            <NavItem to="/settings" icon={<Settings />} label="Settings" active={location.pathname === '/settings'} />
          </>
        );
      case 'Receptionist':
        return (
          <>
            <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/appointments" icon={<Calendar />} label="Appointments" active={location.pathname === '/appointments'} />
            <NavItem to="/appointments" icon={<Plus />} label="Book Appointment" active={false} />
            <NavItem to="/donors" icon={<Users />} label="Donors" active={location.pathname === '/donors'} />
            <NavItem to="/camps" icon={<MapPin />} label="Donation Camps" active={location.pathname === '/camps'} />
          </>
        );

      case 'CollectionStaff':
        return (
          <>
            <NavItem to="/appointments" icon={<Calendar />} label="Appointments" active={location.pathname === '/appointments'} />
            <NavItem to="/camps" icon={<MapPin />} label="Donation Camps" active={location.pathname === '/camps'} />
            <NavItem to="/collection" icon={<ClipboardList />} label="Collections" active={location.pathname === '/collection'} />
          </>
        );
      case 'LabTechnician':
        return (
          <>
            <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/lab/dashboard" icon={<Microscope />} label="Laboratory" active={location.pathname === '/lab/dashboard' || location.pathname === '/lab/queue'} />
            <NavItem to="/lab/history" icon={<FileText />} label="Lab History" active={location.pathname === '/lab/history'} />
            <NavItem to="/lab/exceptions" icon={<HelpCircle />} label="Lab Exceptions" active={location.pathname === '/lab/exceptions'} />
          </>
        );
      case 'Hospital':
        return (
          <>
            <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/search" icon={<Search />} label="Find Blood" active={location.pathname === '/search'} />
            <NavItem to="/requests" icon={<FileText />} label="Requests" active={location.pathname === '/requests'} />
          </>
        );
      default:
        return (
          <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
        );
    }
  };

  const renderBottomNavLinks = () => {
    switch (user?.role) {
      case 'Donor':
        return (
          <>
            <BottomNavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
            <BottomNavItem to="/donor/book" icon={<Calendar />} label="Book" active={location.pathname === '/donor/book'} />
            <BottomNavItem to="/donor/appointments" icon={<Clock />} label="Appts" active={location.pathname === '/donor/appointments'} />
            <BottomNavItem to="/donor/profile" icon={<User />} label="Profile" active={location.pathname === '/donor/profile'} />
          </>
        );
      case 'Admin':
        return (
          <>
            <BottomNavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
            <BottomNavItem to="/inventory" icon={<Activity />} label="Inventory" active={location.pathname === '/inventory'} />
            <BottomNavItem to="/requests" icon={<FileText />} label="Requests" active={location.pathname === '/requests'} />
            <BottomNavItem to="/settings" icon={<Settings />} label="Settings" active={location.pathname === '/settings'} />
          </>
        );
      case 'Receptionist':
        return (
          <>
            <BottomNavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
            <BottomNavItem to="/appointments" icon={<Calendar />} label="Appts" active={location.pathname === '/appointments'} />
            <BottomNavItem to="/donors" icon={<Users />} label="Donors" active={location.pathname === '/donors'} />
            <BottomNavItem to="/camps" icon={<MapPin />} label="Camps" active={location.pathname === '/camps'} />
          </>
        );
      case 'CollectionStaff':
        return (
          <>
            <BottomNavItem to="/appointments" icon={<Calendar />} label="Appts" active={location.pathname === '/appointments'} />
            <BottomNavItem to="/camps" icon={<MapPin />} label="Camps" active={location.pathname === '/camps'} />
            <BottomNavItem to="/collection" icon={<ClipboardList />} label="Collect" active={location.pathname === '/collection'} />
          </>
        );
      case 'LabTechnician':
        return (
          <>
            <BottomNavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
            <BottomNavItem to="/lab/dashboard" icon={<Microscope />} label="Lab" active={location.pathname === '/lab/dashboard' || location.pathname === '/lab/queue'} />
            <BottomNavItem to="/lab/history" icon={<FileText />} label="History" active={location.pathname === '/lab/history'} />
          </>
        );
      case 'Hospital':
        return (
          <>
            <BottomNavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
            <BottomNavItem to="/search" icon={<Search />} label="Search" active={location.pathname === '/search'} />
            <BottomNavItem to="/requests" icon={<FileText />} label="Requests" active={location.pathname === '/requests'} />
          </>
        );
      default:
        return (
          <BottomNavItem to="/" icon={<Home />} label="Home" active={location.pathname === '/'} />
        );
    }
  };

  return (
    <div className="min-h-dvh h-dvh overflow-hidden flex bg-[#f8f9fc] dark:bg-background font-sans relative">
      {/* Left Sidebar */}
      <aside className={`
        hidden lg:flex
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-64 bg-white dark:bg-card 
        lg:m-4 m-0 lg:rounded-[2rem] rounded-none
        flex-col justify-between overflow-hidden 
        shadow-2xl lg:shadow-sm dark:shadow-none 
        border-r lg:border border-gray-100 dark:border-border print:hidden
        translate-x-0
      `}>
        <div className="p-6 overflow-y-auto custom-scrollbar hidden lg:block">
          <div className="flex items-center justify-between lg:justify-center mb-8">
            <Link to="/">
              <img src={darkMode ? "/dark-mode-2.png" : "/logo-chatgpt.png"} alt="bloodLink" className="h-10 lg:h-14 w-auto object-contain rounded-md mix-blend-multiply dark:mix-blend-normal" />
            </Link>
          </div>

          <nav className="space-y-1">
            {renderNavLinks()}
          </nav>
        </div>

        <div className="p-4 bg-white dark:bg-card border-t border-gray-50 dark:border-border space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-accent transition-colors" onClick={logout}>
            <div className="flex items-center space-x-3 truncate">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-destructive font-bold overflow-hidden">
                  {user?.name?.[0] || 'S'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success/100 border-2 border-white rounded-full"></div>
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-gray-900 dark:text-foreground truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">{user?.role || 'Staff'}</p>
              </div>
            </div>
            <div className="text-gray-400 shrink-0 ml-2">
              <LogOut className="w-5 h-5" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-hidden flex flex-col print:p-0 print:overflow-visible relative">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 lg:p-6 mb-2 lg:mb-4 shrink-0 border-b lg:border-none border-gray-200 dark:border-border bg-white lg:bg-transparent dark:bg-card lg:dark:bg-transparent print:hidden gap-4">
          
          <div className="flex items-center w-full sm:w-auto gap-3">
            {/* Top Left: Search Bar or Title */}
            <div className="relative flex-1 sm:max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 sm:pr-16 py-2.5 sm:py-3 rounded-full bg-gray-100 sm:bg-gray-50 dark:bg-muted sm:dark:bg-card border-none sm:border sm:border-gray-100 dark:border-border shadow-none sm:shadow-inner text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-foreground placeholder-gray-500 dark:placeholder-slate-400"
              />
              <div className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 items-center">
                <span className="text-xs font-bold text-gray-400 dark:text-muted-foreground bg-gray-50 dark:bg-muted px-2 py-1 rounded-md border border-gray-100 dark:border-border">Ctrl K</span>
              </div>
            </div>
          </div>

          {/* Top Right: Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-end overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 sm:p-3 bg-gray-100 sm:bg-white dark:bg-muted sm:dark:bg-card rounded-full shadow-none sm:shadow-sm border-none sm:border sm:border-gray-100 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive transition-colors shrink-0"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-2.5 sm:p-3 bg-gray-100 sm:bg-white dark:bg-muted sm:dark:bg-card rounded-full shadow-none sm:shadow-sm border-none sm:border sm:border-gray-100 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive transition-colors shrink-0">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive/100 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
            </button>
            
            {/* Mobile Logout Button */}
            <button 
              onClick={logout}
              className="lg:hidden p-2.5 sm:p-3 bg-gray-100 sm:bg-white dark:bg-muted sm:dark:bg-card rounded-full shadow-none sm:shadow-sm border-none sm:border sm:border-gray-100 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive transition-colors shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <div className="hidden md:flex items-center space-x-2 bg-white dark:bg-card px-4 py-2.5 rounded-full shadow-sm border border-gray-100 dark:border-border shrink-0">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
              <span className="text-sm font-bold text-gray-700 dark:text-muted-foreground whitespace-nowrap">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 lg:px-6 overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 lg:pb-6 pt-[env(safe-area-inset-top)] page-transition" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around p-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full">
          {renderBottomNavLinks()}
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label, active = false }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => {
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 mb-1 border-l-4 ${active ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/20 border-red-800' : 'border-transparent text-gray-600 dark:text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-accent dark:hover:text-red-400 font-medium'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5 shrink-0' })}
      <span className="truncate">{label}</span>
    </Link>
  );
};

const BottomNavItem = ({ to, icon, label, active = false }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => {
  return (
    <Link to={to} className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${active ? 'text-red-600 bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700' : 'text-gray-500 hover:text-gray-700 dark:text-muted-foreground'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: `w-5 h-5 ${active ? 'scale-110 drop-shadow-sm' : ''}` })}
      <span className="text-[10px] font-semibold tracking-wide mt-1">{label}</span>
    </Link>
  );
};

export default MainLayout;
