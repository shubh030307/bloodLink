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

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error: any) {
        console.error('Failed to fetch user', error);
        if (error.response?.status === 401) {
          logout();
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
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
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
