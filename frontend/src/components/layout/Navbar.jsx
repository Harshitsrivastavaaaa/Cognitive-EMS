import React from 'react';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../../assets/logo.svg';

const Navbar = ({ scrolled }) => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch {
      // Demo mode is disabled on the backend; fall back to the normal login page
      navigate('/login');
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 py-3 shadow-xs' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="w-full px-6 lg:px-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link 
          to="/" 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src={BrandLogo} alt="Cognitive EMS logo" className="w-9 h-9 rounded-xl shadow-xs group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tighter text-slate-900 leading-tight">
              COGNITIVE
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">E M S</span>
          </div>
        </Link>

        {/* Navigation Links - Centered Clean Pill Style */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <Link to="/product" className="px-5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all">Product</Link>
          <Link to="/aboutpage" className="px-5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all">About</Link>
          <Link to="/contact" className="px-5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all">Contact</Link>
          <Link to="/docs" className="px-5 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-white rounded-xl transition-all">Docs</Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDirectLogin}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <span>Live Demo</span>
          </button>
          
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-slate-900/10 active:scale-95"
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;