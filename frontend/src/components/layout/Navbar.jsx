import React from 'react';
import { ArrowRight, LogIn, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

const Navbar = ({ scrolled }) => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleDirectLogin = (e) => {
    e.preventDefault();
    demoLogin();
    navigate('/dashboard');
  };

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 py-4 shadow-sm' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full px-8 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link 
          to="/" 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-10 h-10 flex items-center justify-center">
             <img 
               src={logo} 
               alt="Hash# Logo" 
               className="w-full h-full object-contain" 
             />
          </div>
          <span className="hidden md:block font-black text-xl tracking-tight text-slate-900">
            Hash# <span className="text-blue-600 font-bold">HRMS</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold text-slate-600 tracking-[0.2em] uppercase">
          <Link to="/product" className="hover:text-blue-600 transition-all duration-300">Product</Link>
          <Link to="/aboutpage" className="hover:text-blue-600 transition-all duration-300">About</Link>
          <Link to="/contact" className="hover:text-blue-600 transition-all duration-300">Contact</Link>
          <Link to="/docs" className="hover:text-blue-600 transition-all duration-300">Docs</Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-slate-200 bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shadow-xs"
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