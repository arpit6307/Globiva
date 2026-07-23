import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ensureDemoEmployeeExists } from '../utils/seedData';
import { auth, db } from '../firebase/config';
import { ArrowLeft, Sparkles, AlertTriangle, Zap, User, Lock, CheckCircle2, Trophy, Flame } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';

export const EmployeeLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [idOrEmail, setIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let emailToLogin = idOrEmail.trim();

      if (!idOrEmail.includes('@')) {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef, 
          where('employeeId', '==', idOrEmail.trim().toUpperCase()), 
          where('role', '==', 'employee')
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(`No employee found with Employee ID: "${idOrEmail.trim().toUpperCase()}"`);
        }
        
        const employeeDoc = querySnapshot.docs[0];
        emailToLogin = employeeDoc.data().email;
      }

      await login(emailToLogin, password);
      navigate('/employee/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed. Please verify your Employee ID and password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Demo Employee Auto-Creation & Login
  const handleQuickLogin = async () => {
    setError('');
    setDemoLoading(true);
    try {
      await ensureDemoEmployeeExists(auth);
      navigate('/employee/dashboard');
    } catch (err) {
      console.error("Demo login error:", err);
      setError("Failed to create/login to demo employee account. Check Firebase config.");
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
        className="absolute top-10 left-[-40px] w-56 h-56 border-3 border-ink-black bg-warning-yellow shadow-brutal rounded-3xl -z-10 opacity-20 md:opacity-90"
      />
      <motion.div 
        animate={{ y: [0, -15, 0], rotate: [12, 10, 12] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-10 right-[-40px] w-60 h-60 border-3 border-ink-black bg-brand-red shadow-brutal rounded-3xl -z-10 opacity-20 md:opacity-90"
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
        
        {/* Left Side: Game Theme Showcase (High-Contrast Solid Text for perfect readability) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between card-brutal bg-gray-50 text-ink-black p-8 shadow-[8px_8px_0px_0px_#111111] border-3 border-ink-black">
          
          <div className="flex flex-col gap-6">
            
            {/* Logo */}
            <div className="flex items-center gap-3 border-2 border-ink-black p-2.5 bg-white shadow-brutal-sm rounded-xl w-fit">
              <img 
                src={logoImg} 
                alt="Globiva Logo" 
                className="h-9 w-auto object-contain p-0.5" 
              />
              <span className="font-heading font-black text-base text-ink-black">GLOBIVA AGENT</span>
            </div>

            {/* Header info */}
            <div>
              <h2 className="text-2xl font-heading font-black uppercase leading-tight text-ink-black">PLAY & EXCEL</h2>
              <p className="font-body text-xs text-gray-600 font-bold mt-2 leading-relaxed">
                Unlock active-recall challenge modes, maintain streak multipliers, and download verified certifications.
              </p>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3 font-body text-xs font-bold bg-white p-4 rounded-xl border-2 border-ink-black shadow-brutal-sm">
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Level-Based Quest Pathway</span>
              </div>
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Speed Recall & Matching games</span>
              </div>
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Gain XP Bonuses & Badges</span>
              </div>
            </div>

          </div>

          {/* Stats / Game Badges Showcase */}
          <div className="grid grid-cols-2 gap-4 border-2 border-ink-black rounded-2xl p-4 bg-white text-ink-black shadow-brutal-sm mt-6">
            <div className="flex flex-col items-center text-center">
              <Flame size={20} className="text-orange-500 animate-pulse" />
              <span className="font-heading font-black text-base mt-1.5 leading-none">ACTIVE</span>
              <span className="text-[8px] font-heading font-bold text-gray-400 uppercase tracking-wider mt-1">Streak System</span>
            </div>
            <div className="flex flex-col items-center text-center border-l-2 border-gray-150 pl-2">
              <Trophy size={20} className="text-warning-yellow" />
              <span className="font-heading font-black text-base mt-1.5 leading-none">+100 XP</span>
              <span className="text-[8px] font-heading font-bold text-gray-400 uppercase tracking-wider mt-1">Per Map Node</span>
            </div>
          </div>

        </div>

        {/* Right Side: Login Form Card (Spans 7 cols) */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="w-full card-brutal bg-white relative">
            
            {/* Top Badge */}
            <div className="absolute top-[-18px] right-4 border-3 border-ink-black bg-brand-red-light py-1 px-3.5 rounded-full shadow-brutal-sm rotate-[-3deg] select-none text-brand-red">
              <span className="font-heading font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                <User size={10} className="text-brand-red" /> LEARNER MODE
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
                <span className="text-[10px] font-heading font-bold text-brand-red tracking-widest uppercase mt-1 block">LEARNER PANEL</span>
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
                Instant learner login as <strong>Arun Kumar (GLB1001)</strong>. Playing the course updates active results.
              </p>
              <button 
                type="button"
                onClick={handleQuickLogin}
                disabled={demoLoading || submitting}
                className="btn-brutal-primary text-[10px] py-2.5 px-4 w-full shadow-brutal-sm bg-brand-red hover:bg-brand-red-dark mt-1 flex items-center justify-center gap-1.5"
              >
                <Zap size={12} fill="white" /> {demoLoading ? 'PREPARING TRAINING...' : 'ONE-CLICK DEMO LOGIN'}
              </button>
            </div>

            <div className="relative flex items-center justify-center my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-ink-black"></div></div>
              <span className="relative px-3 bg-white text-[10px] font-heading font-bold text-gray-500 uppercase">OR USE CREDENTIALS</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Employee ID or Email</label>
                  <span className="text-[9px] text-gray-400 font-mono italic">(e.g. GLB1001)</span>
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. GLB1001" 
                    className="input-brutal pl-11 w-full uppercase"
                    value={idOrEmail} 
                    onChange={(e) => setIdOrEmail(e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
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
                LOG IN TO PLAY
              </button>
            </form>

            <div className="mt-6 border-t-2 border-ink-black pt-4 text-center">
              <p className="font-body text-[10px] text-gray-500 leading-normal font-bold">
                New employees must be registered by an administrator. Contact your Training Lead to set up your profile.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EmployeeLogin;
