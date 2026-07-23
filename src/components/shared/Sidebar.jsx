import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  UserPlus, 
  BarChart3, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Sliders
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const Sidebar = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  
  // Mobile drawer toggle
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Desktop collapse state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const role = userData?.role;

  // Sync collapse state with document.body class
  useEffect(() => {
    if (isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navItems = role === 'admin' 
    ? [
        { name: 'DASHBOARD', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'EMPLOYEES', path: '/admin/employees', icon: <Users size={20} /> },
        { name: 'COURSES', path: '/admin/courses', icon: <BookOpen size={20} /> },
        { name: 'ASSIGN COURSE', path: '/admin/assign', icon: <UserPlus size={20} /> },
        { name: 'ANSWER KEY', path: '/admin/answer-key', icon: <KeyRound size={20} /> },
        { name: 'REPORTS', path: '/admin/reports', icon: <BarChart3 size={20} /> },
      ]
    : [
        { name: 'MY COURSES', path: '/employee/dashboard', icon: <BookOpen size={20} /> },
      ];

  // Refined NavLink Styles: Premium Brutalist Cards with lift animations
  const activeStyle = "bg-brand-red text-white border-3 border-slate-800 shadow-none translate-x-[3px] translate-y-[3px]";
  const inactiveStyle = "bg-white text-slate-800 border-3 border-slate-800 shadow-brutal-sm hover:-translate-x-[2.5px] hover:-translate-y-[2.5px] hover:shadow-brutal hover:bg-brand-red-light hover:text-brand-red active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

  const sidebarContent = (isMobileLayout = false) => {
    const collapsed = isMobileLayout ? false : isCollapsed;
    
    return (
      <div className="h-full flex flex-col justify-between bg-paper-white p-5 border-r-3 border-slate-800 select-none relative transition-all duration-200">
        
        {/* Floating Edge Slider Handle */}
        {!isMobileLayout && (
          <button
            onClick={toggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-14 border-3 border-slate-800 bg-brand-red text-white rounded-r-xl flex items-center justify-center shadow-[3px_3px_0px_#000] z-40 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            title={collapsed ? "Slide open sidebar" : "Slide close sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} strokeWidth={3} className="text-white group-hover:scale-125 transition-transform" />
            ) : (
              <ChevronLeft size={18} strokeWidth={3} className="text-white group-hover:scale-125 transition-transform" />
            )}
          </button>
        )}

        <div className="flex flex-col gap-6">
          
          {/* Header Logo Card */}
          <div className={`flex items-center gap-3 border-3 border-slate-800 p-2.5 bg-white shadow-brutal-sm rounded-xl transition-all ${collapsed ? 'justify-center p-2' : ''}`}>
            <img 
              src={logoImg} 
              alt="Globiva Logo" 
              className="h-10 w-auto object-contain border border-slate-850 rounded bg-white p-0.5" 
            />
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-black text-lg tracking-tighter leading-none text-slate-800">GLOBIVA</span>
                <span className="font-heading font-bold text-[9px] tracking-widest text-brand-red mt-1">LEARN HUB</span>
              </div>
            )}
          </div>

          {/* Interactive Sidebar Slider Switch */}
          {!isMobileLayout && (
            <div 
              onClick={toggleCollapse}
              className={`border-3 border-slate-800 rounded-xl p-2.5 bg-slate-100 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-200 select-none shadow-[2px_2px_0px_#000] ${
                collapsed ? 'flex-col gap-1 py-3' : 'px-3'
              }`}
              title={collapsed ? "Click slider to expand sidebar" : "Click slider to collapse sidebar"}
            >
              {!collapsed && (
                <span className="font-heading font-black text-[10px] uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} className="text-brand-red animate-pulse" /> SIDEBAR SLIDER
                </span>
              )}
              <div className={`relative w-11 h-6 bg-slate-300 border-2 border-slate-800 rounded-full transition-colors ${!collapsed ? 'bg-brand-red/20' : ''}`}>
                <div 
                  className={`absolute top-0.5 w-4.5 h-4.5 bg-brand-red border border-slate-800 rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center text-white text-[8px] font-bold ${
                    !collapsed ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                >
                  {!collapsed ? <ChevronLeft size={10} /> : <ChevronRight size={10} />}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links formatted as Premium Brutalist Cards */}
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => `flex items-center rounded-xl font-heading font-black text-xs tracking-wider transition-all duration-150 py-3.5 ${
                  collapsed 
                    ? 'justify-center w-12 h-12 mx-auto' 
                    : 'px-4 gap-3'
                } ${isActive ? activeStyle : inactiveStyle}`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Profile & Logout Section */}
        <div className="flex flex-col gap-4 border-t-3 border-dashed border-slate-800/20 pt-6">
          
          {/* Profile Card */}
          <div className={`flex items-center gap-3 border-3 border-slate-800 p-2.5 bg-white rounded-xl shadow-brutal-sm ${collapsed ? 'justify-center p-1.5' : ''}`}>
            <div className="w-10 h-10 rounded-full border-2 border-slate-800 bg-brand-red-light flex items-center justify-center font-heading font-black text-brand-red text-sm uppercase flex-shrink-0">
              {userData?.name ? userData.name.substring(0, 2) : 'US'}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-bold text-xs truncate leading-none uppercase text-slate-800">{userData?.name || 'User'}</span>
                <span className="text-[9px] text-gray-500 font-mono mt-1.5 truncate">
                  {role === 'admin' ? 'TRAINER' : `${userData?.employeeId || 'AGENT'}`}
                </span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title={collapsed ? "Log Out" : undefined}
            className={`flex items-center justify-center bg-error-red text-white border-3 border-slate-800 rounded-xl font-heading font-black text-xs uppercase tracking-wider transition-all shadow-brutal-sm hover:bg-red-800 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none py-3.5 ${
              collapsed ? 'w-12 h-12 mx-auto' : 'w-full gap-2'
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span>LOG OUT</span>}
          </button>

        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden w-full h-16 bg-white border-b-3 border-slate-800 px-6 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2">
          <img 
            src={logoImg} 
            alt="Globiva Logo" 
            className="h-8 w-auto object-contain border border-slate-800 rounded bg-white p-0.5" 
          />
          <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-800">GLOBIVA LEARN</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Close mobile menu" : "Open mobile menu"}
          className="p-2 border-2 border-slate-800 rounded-xl bg-white shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
          <div className="relative w-72 h-full z-50 animate-slide-in">
            {sidebarContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed top-0 bottom-0 left-0 z-20 transition-all duration-200 ${isCollapsed ? 'w-22' : 'w-72'}`}>
        {sidebarContent(false)}
      </div>
    </>
  );
};

export default Sidebar;
