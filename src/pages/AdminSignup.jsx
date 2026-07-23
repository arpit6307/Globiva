import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, AlertTriangle, User, Mail, Lock, CheckCircle2, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import logoImg from '../assets/logo.png';

export const AdminSignup = () => {
  const { signupAdmin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [designation, setDesignation] = useState('Process Trainer');
  
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);
    try {
      await signupAdmin(name, email, password, designation);
      setSignupSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign up admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 md:p-6 relative overflow-hidden">
      
      {/* 3D Background Models */}
      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-[-40px] w-64 h-64 border-3 border-ink-black bg-brand-red shadow-brutal rounded-3xl -z-10 opacity-20 md:opacity-90"
      />
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-10 right-[-40px] w-72 h-72 border-3 border-ink-black bg-warning-yellow shadow-brutal rounded-3xl -z-10 opacity-20 md:opacity-90"
      />

      {/* Premium Back to Role Button */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: -2 }}
        className="mb-6 self-center md:absolute md:top-6 md:left-6 md:mb-0 z-20"
      >
        <Link to="/" className="btn-brutal-secondary py-3 px-5 shadow-brutal-sm flex items-center gap-2 text-xs font-black uppercase">
          <ArrowLeft size={16} strokeWidth={3} /> BACK TO ROLE
        </Link>
      </motion.div>

      {/* Dual Column Layout Grid (Stretched to normal scale) */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch z-10 mt-12 lg:mt-0">
        
        {/* Left Panel: Feature list styled in high-contrast solid dark text over light gray */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between card-brutal bg-gray-50 text-ink-black p-8 shadow-[8px_8px_0px_0px_#111111] border-3 border-ink-black">
          
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3 border-2 border-ink-black p-2.5 bg-white shadow-brutal-sm rounded-xl w-fit">
              <img src={logoImg} alt="Globiva Logo" className="h-9 w-auto object-contain" />
              <span className="font-heading font-black text-sm text-ink-black">GLOBIVA ADMIN</span>
            </div>

            <div>
              <h2 className="text-2xl font-heading font-black uppercase leading-tight text-ink-black">CREATE A TRAINER WORKSPACE</h2>
              <p className="font-body text-xs text-gray-600 font-bold mt-2 leading-relaxed">
                Configure guidelines, register employee lists, and download verified training reports.
              </p>
            </div>

            {/* Checklist */}
            <div className="flex flex-col gap-3 font-body text-xs font-bold bg-white p-4 rounded-xl border-2 border-ink-black shadow-brutal-sm">
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Custom Course builders</span>
              </div>
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Automated evaluation tests</span>
              </div>
              <div className="flex items-center gap-2.5 text-ink-black">
                <CheckCircle2 size={14} className="text-brand-red flex-shrink-0" />
                <span>Export reports to Excel / CSV</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-ink-black/10 pt-4 mt-6 text-[9px] font-mono text-gray-400 font-bold uppercase">
            Globiva Secure Training Infrastructure
          </div>

        </div>

        {/* Right Panel: Form / Success Card */}
        <div className="lg:col-span-7 flex items-center justify-center">
          {signupSuccess ? (
            <div className="w-full border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-8 relative flex flex-col items-center text-center gap-6">
              <div className="p-4 bg-warning-yellow rounded-full border-3 border-slate-800 shadow-[3px_3px_0px_#000] animate-bounce text-slate-800">
                <Shield size={36} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-heading font-black text-2xl text-slate-800 uppercase">Approval Pending</h3>
                <p className="font-body text-xs text-slate-500 font-bold leading-relaxed max-w-sm">
                  Your administrator account has been successfully registered. However, to access the workspace, you must be approved by the **Master Admin (admin@globiva.com)**.
                </p>
                <div className="bg-red-50 border-2 border-dashed border-error-red p-3 rounded-xl mt-2 text-[11px] font-body font-bold text-error-red leading-normal">
                  ⚠️ IMPORTANT: If not approved by the Master Admin within **24 hours**, this registration request will be automatically deleted.
                </div>
              </div>
              <Link 
                to="/admin/login" 
                className="bg-white text-slate-800 font-heading font-black uppercase tracking-wider text-xs px-6 py-3.5 border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-slate-50 select-none flex items-center justify-center gap-2 cursor-pointer w-full"
              >
                PROCEED TO LOGIN
              </Link>
            </div>
          ) : (
            <div className="w-full card-brutal bg-white p-6 md:p-8 relative">
              
              {/* Top Badge */}
              <div className="absolute top-[-18px] right-4 border-3 border-ink-black bg-brand-red py-1 px-3.5 rounded-full shadow-brutal-sm rotate-[-3deg] select-none text-white">
                <span className="font-heading font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Shield size={10} /> REGISTER PANEL
                </span>
              </div>

              {/* Mobile Header (Hidden on Desktop) */}
              <div className="flex lg:hidden items-center gap-3 justify-center mb-6 mt-2">
                <img src={logoImg} alt="Globiva Logo" className="h-10 w-auto object-contain border-2 border-ink-black rounded-lg p-0.5 bg-white shadow-brutal-sm" />
                <div>
                  <span className="font-heading font-black text-lg text-ink-black">GLOBIVA</span>
                  <span className="text-[9px] font-heading font-bold text-brand-red tracking-wider uppercase block">ADMIN SIGNUP</span>
                </div>
              </div>

              {error && (
                <div className="bg-error-red text-white p-3 border-3 border-ink-black rounded-xl font-heading font-bold text-xs mb-4 shadow-brutal-sm flex items-center gap-2">
                  <AlertTriangle size={16} className="flex-shrink-0" /> 
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Row 1: Name and Email in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Trainer Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      required 
                      placeholder="Trainer Name" 
                      className="input-brutal pl-11 w-full"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" 
                      required 
                      placeholder="e.g. name@globiva.com" 
                      className="input-brutal pl-11 w-full"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Password and Confirm Password in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      required 
                      placeholder="••••••••" 
                      className="input-brutal pl-11 w-full"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Designation Dropdown (Full width) */}
              <div className="flex flex-col gap-1.5">
                <label className="font-heading font-black text-[10px] uppercase tracking-wider text-gray-500">Designation / Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select 
                    value={designation} 
                    onChange={(e) => setDesignation(e.target.value)} 
                    className="input-brutal pl-11 w-full bg-white cursor-pointer"
                  >
                    <option value="Process Trainer">Process Trainer</option>
                    <option value="QA Lead / Manager">QA Lead / Manager</option>
                    <option value="Training Coordinator">Training Coordinator</option>
                    <option value="Operations Manager">Operations Manager</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="btn-brutal-primary mt-2 py-4 text-xs font-black shadow-brutal-sm"
              >
                {submitting ? 'CREATING ACCOUNT...' : 'REGISTER AS ADMIN'}
              </button>
            </form>

            <p className="text-center font-body text-xs font-bold mt-6">
              Already have an account? <Link to="/admin/login" className="text-brand-red underline hover:text-brand-red-dark">Log In here</Link>.
            </p>
          </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminSignup;
