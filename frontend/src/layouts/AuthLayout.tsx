import { Outlet } from 'react-router-dom';
import { Heart } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-white dark:bg-slate-900">
      
      {/* Left Side - Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "url('/donor-bg.png')" }}
        ></div>
        
        {/* Dynamic Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blood-900/90 via-blood-800/60 to-slate-900/90"></div>
        
        {/* Decorative Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blood-500 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blood-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>

        {/* Content */}
        <div className="relative z-10 p-12 text-center max-w-xl">
          <div className="mb-8 inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
            <img src="/logo.png" alt="BloodLink Logo" className="h-20 w-auto object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight drop-shadow-lg">
            Every drop is a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-blood-400">beacon of hope.</span>
          </h1>
          <p className="text-lg text-slate-300 font-medium leading-relaxed">
            Join the national network of life-savers. Your contribution ensures that no one has to wait for a miracle.
          </p>
          
          <div className="mt-12 flex items-center justify-center space-x-2 text-sm font-bold text-blood-200 bg-black/20 py-2 px-4 rounded-full backdrop-blur-sm border border-white/10 w-max mx-auto">
             <Heart className="w-4 h-4 fill-blood-400 text-blood-400 animate-pulse" />
             <span>Over 10,000+ lives saved this year</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-900">
        
        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blood-400/20 dark:bg-blood-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob pointer-events-none"></div>
        <div className="lg:hidden absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blood-500/20 dark:bg-blood-800/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md p-8 md:p-12">
           <Outlet />
        </div>
      </div>
      
    </div>
  );
};

export default AuthLayout;
