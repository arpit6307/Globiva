import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ensureDemoAdminExists } from '../utils/seedData';
import { auth } from '../firebase/config';
import { ArrowLeft, Sparkles, AlertTriangle, Zap, Mail, Lock, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Incorrect email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo Admin Auto-Creation & Login
  const handleQuickLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await ensureDemoAdminExists(auth);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Demo login error:", err);
      setError("Failed to create/login to demo admin account. Check Firebase config.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">
      
      {/* 3D Animated Background Shapes */}
      <motion.div 
        animate={{ y: [0, 15, 0], rotate: [-8, -6, -8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-[-40px] w-56 h-56 border-3 border-ink-black bg-brand-red shadow-brutal rounded-3xl -z-10 opacity-20 md:opacity-90"
      />
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [12, 10, 12] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-10 right-[-40px] w-60 h-60 border-3 border-ink-black bg-warning-yellow shadow-brutal rounded-3xl -z-10 opacity-20 md:opacity-90"
      />

      {/* Back to Role Button */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: -2 }}
        className="mb-8 self-center md:absolute md:top-6 md:left-6 md:mb-0 z-20"
      >
        <Link to="/" className="btn-brutal-secondary py-3 px-5 shadow-brutal-sm flex items-center gap-2 text-xs font-black uppercase">
          <ArrowLeft size={16} strokeWidth={3} /> BACK TO ROLE
        </Link>
      </motion.div>

      {/* Dual Column Layout Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10 mt-12 md:mt-0">
        
        {/* Left Side: Features & Stats card (High-Contrast Solid Text for perfect readability) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between card-brutal bg-gray-50 text-ink-black p-8 shadow-[8px_8px_0px_0px_#111111] border-3 border-ink-black">
          
          <div className="flex flex-col gap-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3 border-2 border-ink-black p-2.5 bg-white shadow-brutal-sm rounded-xl w-fit">
              <img 
                src={logoImg} 
                alt="Globiva Logo" 
                className="h-9 w-auto object-contain p-0.5" 
              />
              <span className="font-heading font-black text-base text-ink-black">GLOBIVA ADMIN</span>
            </div>

            {/* Header info */}
            <div>
              <h2 className="text-2xl font-heading font-black uppercase leading-tight text-ink-black">EMPOWERING BPO QUALITY</h2>
              <p className="font-body text-xs text-gray-600 font-bold mt-2 leading-relaxed">
                Design custom process guidelines, run automated evaluation tests, and audit training certificates centrally.
              </p>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3 font-body text-xs font-bold bg-white p-4 rounded-xl border-2 border-ink-black shadow-brutal-sm">
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>100% Compliance Adherence</span>
              </div>
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Interactive Learning maps</span>
              </div>
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>One-Click Audits & Reporting</span>
              </div>
            </div>

          </div>

          {/* Stats Showcase */}
          <div className="grid grid-cols-2 gap-4 border-2 border-ink-black rounded-2xl p-4 bg-white text-ink-black shadow-brutal-sm mt-6">
            <div className="flex flex-col items-center text-center">
              <Users size={20} className="text-brand-red" />
              <span className="font-heading font-black text-base mt-1.5 leading-none">98.4%</span>
              <span className="text-[8px] font-heading font-bold text-gray-400 uppercase tracking-wider mt-1">Pass Ratio</span>
            </div>
            <div className="flex flex-col items-center text-center border-l-2 border-gray-150 pl-2">
              <TrendingUp size={20} className="text-success-green" />
              <span className="font-heading font-black text-base mt-1.5 leading-none">4.5x</span>
              <span className="text-[8px] font-heading font-bold text-gray-400 uppercase tracking-wider mt-1">Faster Onboard</span>
            </div>
          </div>

        </div>

        {/* Right Side: Form Card (Spans 7 cols) */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="w-full card-brutal bg-white relative">
            
            {/* Top Badge */}
            <div className="absolute top-[-18px] right-4 border-3 border-ink-black bg-warning-yellow py-1 px-3.5 rounded-full shadow-brutal-sm rotate-3 select-none">
              <span className="font-heading font-black text-[9px] uppercase tracking-wider text-ink-black flex items-center gap-1">
                <Sparkles size={10} /> TRAINER MODE
              </span>
            </div>

            {/* Mobile Header (Hidden on Desktop) */}
            <div className="flex items-center gap-3 justify-center mb-6 mt-2">
              <img 
                src={logoImg} 
                alt="Globiva Logo" 
                className="h-11 w-auto object-contain border-2 border-ink-black rounded-lg p-1 bg-white shadow-brutal-sm"
              />
              <div>
                <h1 className="text-2xl font-heading font-black leading-none uppercase text-ink-black">GLOBIVA</h1>
                <span className="text-[10px] font-heading font-bold text-brand-red tracking-widest uppercase mt-1 block">ADMIN PANEL</span>
              </div>
            </div>

            {error && (
              <div className="bg-error-red text-white p-3.5 border-3 border-ink-black rounded-xl font-heading font-bold text-xs mb-4 shadow-brutal-sm flex items-center gap-2">
                <AlertTriangle className="flex-shrink-0" size={16} /> 
                <span>{error}</span>
              </div>
            )}

            {/* Demo Fast Login Banner */}
            <div className="border-3 border-ink-black bg-warning-yellow-light bg-stripes-yellow p-4 rounded-xl shadow-brutal-sm mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-heading font-black text-xs uppercase text-ink-black">
                <Sparkles size={16} className="text-brand-red animate-pulse" /> DEMO PORTAL QUICK PLAY
              </div>
              <p className="font-body text-[10px] text-ink-black/85 font-bold leading-normal">
                Instant admin log in with pre-seeded dashboards, sample employee lists, and process courses.
              </p>
              <button 
                type="button"
                onClick={handleQuickLogin}
                disabled={demoLoading || submitting}
                className="btn-brutal-primary text-[10px] py-2.5 px-4 w-full shadow-brutal-sm bg-brand-red hover:bg-brand-red-dark mt-1 flex items-center justify-center gap-1.5"
              >
                <Zap size={12} fill="white" /> {demoLoading ? 'PREPARING DASHBOARDS...' : 'ONE-CLICK DEMO LOGIN'}
              </button>
            </div>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-ink-black"></div></div>
              <span className="relative px-3 bg-white text-[10px] font-heading font-bold text-gray-500 uppercase">OR USE ACCOUNT</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g. trainer@globiva.com" 
                    className="input-brutal pl-11 w-full"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    className="input-brutal pl-11 w-full"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting || demoLoading}
                className="btn-brutal-primary mt-2 py-4 text-xs font-black shadow-brutal-sm"
              >
                {submitting ? 'SIGNING IN...' : 'LOG IN AS ADMIN'}
              </button>
            </form>

            <p className="text-center font-body text-xs font-bold mt-6">
              Need a trainer account? <Link to="/admin/signup" className="text-brand-red underline hover:text-brand-red-dark">Register here</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
