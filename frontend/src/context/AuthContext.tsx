import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';
import { Droplet } from 'lucide-react';

export type UserRole = 'Admin' | 'Receptionist' | 'CollectionStaff' | 'LabTechnician' | 'Hospital' | 'Donor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        setAuthError(null);
      } catch (error: any) {
        console.error('Failed to fetch user', error);
        if (error.response?.status === 401) {
          logout();
        } else {
          // Backend is down, network error, or 500 error
          setAuthError('Unable to connect to the server. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    setAuthError(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <div className="relative flex items-center justify-center w-20 h-20 bg-blood-100 rounded-full mb-4 animate-pulse">
          <Droplet className="w-10 h-10 text-blood-600 absolute animate-bounce" fill="currentColor" />
        </div>
        <div className="text-lg font-medium text-gray-600 dark:text-muted-foreground animate-pulse tracking-wide">Loading Blood Bank...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-8">{authError}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-blood-600 hover:bg-blood-700 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              Retry Connection
            </button>
            <button 
              onClick={logout}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
