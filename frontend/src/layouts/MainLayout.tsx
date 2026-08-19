import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users, Activity, Calendar, Settings, FileText, Search, Award, Clock, User, Moon, Sun, ClipboardList, Microscope, Bell, Gift, HelpCircle, Plus } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
          </>
        );

      case 'CollectionStaff':
        return (
          <>
            <NavItem to="/" icon={<Home />} label="Dashboard" active={location.pathname === '/'} />
            <NavItem to="/collection" icon={<ClipboardList />} label="Collection" active={location.pathname === '/collection'} />
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

  return (
    <div className="h-screen overflow-hidden flex bg-[#f8f9fc] dark:bg-background font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white dark:bg-card m-4 rounded-[2rem] flex flex-col justify-between overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-border print:hidden">
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-center mb-8">
            {/* Provide the dark mode logo if applicable */}
            <img src={darkMode ? "/dark-mode-2.png" : "/logo-chatgpt.png"} alt="bloodLink" className="h-14 w-auto object-contain rounded-md mix-blend-multiply dark:mix-blend-normal" />
          </div>

          <nav className="space-y-1">
            {renderNavLinks()}
          </nav>
        </div>

        <div className="p-4 bg-white dark:bg-card border-t border-gray-50 dark:border-border space-y-4">



          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-muted rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-accent transition-colors" onClick={logout}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-destructive font-bold overflow-hidden">
                  {/* Using an avatar placeholder or initial */}
                  {user?.name?.[0] || 'S'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success/100 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-foreground">{user?.name || 'Sarthak Singh'}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{user?.role || 'Collection Staff'}</p>
              </div>
            </div>
            <div className="text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-auto flex flex-col print:p-0 print:overflow-visible">
        <header className="flex justify-between items-center mb-8 px-4 mt-2 print:hidden">
          {/* Top Left: Search Bar or Title */}
          <div className="flex-1">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-muted-foreground" />
              <input
                type="text"
                placeholder="Search donors, ID, phone..."
                className="w-full pl-10 pr-16 py-3 rounded-full bg-gray-50 dark:bg-card border border-gray-100 dark:border-border shadow-inner text-sm focus:ring-2 focus:ring-red-500 outline-none text-gray-900 dark:text-foreground placeholder-gray-400 dark:placeholder-slate-500"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                <span className="text-xs font-bold text-gray-400 dark:text-muted-foreground bg-gray-50 dark:bg-muted px-2 py-1 rounded-md border border-gray-100 dark:border-border">Ctrl K</span>
              </div>
            </div>
          </div>

          {/* Top Right: Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 bg-white dark:bg-card rounded-full shadow-sm border border-gray-100 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-3 bg-white dark:bg-card rounded-full shadow-sm border border-gray-100 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive/100 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse"></span>
            </button>

            <div className="flex items-center space-x-2 bg-white dark:bg-card px-4 py-2.5 rounded-full shadow-sm border border-gray-100 dark:border-border">
              <Calendar className="w-5 h-5 text-gray-400 dark:text-muted-foreground" />
              <span className="text-sm font-bold text-gray-700 dark:text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-3 bg-white dark:bg-card rounded-full shadow-sm border border-gray-100 dark:border-border text-gray-600 dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, label, active = false }: { to: string, icon: React.ReactNode, label: string, active?: boolean }) => {
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 mb-1 border-l-4 ${active ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/20 border-red-800' : 'border-transparent text-gray-500 dark:text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-accent dark:hover:text-red-400 font-medium'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
      <span>{label}</span>
    </Link>
  );
};

export default MainLayout;
