import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      login(token, user);
      
      navigate('/');
    } catch (err: any) {
      console.error("Login failed", err);
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Mobile Logo (Only visible on small screens since left panel is hidden) */}
      <div className="lg:hidden mb-10 flex flex-col items-center">
        <img src="/logo.png" alt="BloodLink Logo" className="h-20 w-auto object-contain drop-shadow-md mb-2" />
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">BloodLink</h2>
      </div>

      <div className="w-full mb-10 text-center lg:text-left">
        <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Welcome Back</h2>
        <p className="text-gray-500 dark:text-slate-400 font-medium">Enter your credentials to access your account.</p>
      </div>

      {error && (
        <div className="w-full mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center border border-red-100 dark:border-red-900/50 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="w-full space-y-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blood-500 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blood-500 focus:ring-4 focus:ring-blood-500/10 transition-all font-medium placeholder:text-gray-400 shadow-sm" 
              placeholder="you@example.com"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Password</label>
            <a href="#" className="text-blood-600 hover:text-blood-700 dark:text-blood-400 font-bold text-xs transition-colors">Forgot password?</a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blood-500 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-blood-500 focus:ring-4 focus:ring-blood-500/10 transition-all font-medium placeholder:text-gray-400 shadow-sm" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 px-6 bg-blood-600 hover:bg-blood-700 text-white rounded-xl font-bold flex justify-center items-center shadow-lg shadow-blood-500/30 hover:shadow-blood-500/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              Sign In <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
      
      <div className="mt-10 text-center text-sm font-medium text-gray-600 dark:text-slate-400">
        Don't have an account? <Link to="/register" className="font-bold text-blood-600 dark:text-blood-400 hover:text-blood-700 dark:hover:text-blood-300 ml-1">Create one now</Link>
      </div>
    </div>
  );
};

export default Login;
