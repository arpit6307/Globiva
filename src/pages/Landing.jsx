import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  Award, 
  Zap, 
  Shield, 
  Sparkles, 
  Heart, 
  Activity, 
  Briefcase, 
  User, 
  CheckCircle2, 
  ChevronDown, 
  HelpCircle,
  Clock,
  TrendingUp,
  Users,
  ChevronUp,
  Bookmark,
  Menu,
  X,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

export const Landing = () => {
  const navigate = useNavigate();

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  
  // Scroll position state for Scroll to Top Button
  const [showScrollTop, setShowScrollTop] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const faqs = [
    {
      q: "What is GlobivaLearn?",
      a: "GlobivaLearn is a custom, digitally-empowered Learning Management System designed specifically for BPO and BPM process operations. It replaces static training documents with level-based quest pathways, speed games, and scored MCQs."
    },
    {
      q: "How do BPO agents qualify for process guidelines?",
      a: "Agents play through designated guidelines, complete active recall matching and recall mini-games to earn XP, and then take a final scored MCQ test. Scoring above the target pass percentage unlocks their certificate."
    },
    {
      q: "Can trainers track compliance scores in real time?",
      a: "Yes. Every single quiz attempt, level completion, and XP score is synced instantly to the administrator console, giving operations managers full visibility into training quality."
    }
  ];

  // Globiva's BPO growth timeline milestones
  const timelineMilestones = [
    {
      year: "2017",
      title: "FOUNDING & VISION",
      desc: "Globiva was founded by Navneet Gupta, Vikram Singh Nathawat, and Ashish Goyal with an 'Employee First' culture to redefine business process management."
    },
    {
      year: "2018",
      title: "OPERATIONS COMMENCED",
      desc: "Opened operations in Gurugram, India, delivering high-value digital customer interaction services and intelligent back-office management."
    },
    {
      year: "2020",
      title: "ENTERPRISE SCALING",
      desc: "Expanded BPO services rapidly to cover tele-sales, quality assurance, and backoffice support for over 100 marquee enterprise clients."
    },
    {
      year: "2023",
      title: "15,000+ AGENTS & RECOGNITION",
      desc: "Recognized as one of India's fastest-growing BPM organizations, scaling to thousands of certified agents while delivering benchmark SLA quality."
    },
    {
      year: "2026",
      title: "GLOBIVA LEARN LAUNCHED",
      desc: "Built GlobivaLearn to gamify training, driving quality pass rates to 99.2% and helping agents solve client guidelines with ease."
    }
  ];

  // Mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-ink-black flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* 1. Sticky Floating Navbar (Centered and padded) */}
      <nav className="fixed top-4 left-0 right-0 px-4 z-40 max-w-6xl mx-auto">
        <div className="border-3 border-ink-black bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-brutal flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Globiva Logo" 
              className="h-9 sm:h-10 w-auto object-contain border border-ink-black rounded bg-white p-0.5" 
            />
            <div className="flex flex-col">
              <span className="font-heading font-black text-base sm:text-lg tracking-tighter leading-none text-ink-black">GLOBIVA</span>
              <span className="font-heading font-bold text-[9px] tracking-widest text-brand-red mt-1 uppercase">Passion to Perform</span>
            </div>
          </div>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-6 font-heading font-black text-xs uppercase tracking-wider text-gray-500">
            <a href="#why-us" className="hover:text-brand-red transition-colors">Why Globiva</a>
            <a href="#journey" className="hover:text-brand-red transition-colors">Our Journey</a>
            <a href="#metrics" className="hover:text-brand-red transition-colors">Metrics</a>
            <a href="#faq" className="hover:text-brand-red transition-colors">Guidelines FAQ</a>
          </div>

          {/* Desktop Login Button */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => navigate('/employee/login')}
              className="btn-brutal-primary py-2 px-4 shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
            >
              <User size={14} /> AGENT LOGIN
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden bg-brand-red text-white p-2 px-3 border-2 border-slate-800 rounded-xl shadow-[3px_3px_0px_#000] flex items-center gap-1.5 font-heading font-black text-xs cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="uppercase text-xs">{isMobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
          </button>

        </div>
      </nav>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 md:hidden flex flex-col bg-slate-900/80 backdrop-blur-md"
          >
            <div className="flex justify-between items-center p-5 bg-white border-b-3 border-slate-800">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="Globiva Logo" className="h-8 w-auto border border-slate-800 rounded p-0.5" />
                <span className="font-heading font-black text-sm uppercase">GLOBIVA LEARN</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 bg-brand-red text-white border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 bg-paper-white flex-1 overflow-y-auto">
              <span className="font-heading font-black text-xs text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">QUICK NAVIGATION</span>
              
              <a 
                href="#why-us" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="font-heading font-black text-sm uppercase text-slate-800 border-2 border-slate-800 p-3.5 rounded-xl bg-white shadow-[3px_3px_0px_#000] flex items-center gap-3 hover:bg-slate-50"
              >
                <Zap size={18} className="text-brand-red shrink-0" />
                <span>WHY GLOBIVA</span>
              </a>
              <a 
                href="#journey" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="font-heading font-black text-sm uppercase text-slate-800 border-2 border-slate-800 p-3.5 rounded-xl bg-white shadow-[3px_3px_0px_#000] flex items-center gap-3 hover:bg-slate-50"
              >
                <TrendingUp size={18} className="text-blue-600 shrink-0" />
                <span>OUR JOURNEY</span>
              </a>
              <a 
                href="#metrics" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="font-heading font-black text-sm uppercase text-slate-800 border-2 border-slate-800 p-3.5 rounded-xl bg-white shadow-[3px_3px_0px_#000] flex items-center gap-3 hover:bg-slate-50"
              >
                <BarChart3 size={18} className="text-green-600 shrink-0" />
                <span>METRICS & SLAs</span>
              </a>
              <a 
                href="#faq" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="font-heading font-black text-sm uppercase text-slate-800 border-2 border-slate-800 p-3.5 rounded-xl bg-white shadow-[3px_3px_0px_#000] flex items-center gap-3 hover:bg-slate-50"
              >
                <HelpCircle size={18} className="text-amber-500 shrink-0" />
                <span>GUIDELINES FAQ</span>
              </a>

              <div className="border-t-2 border-dashed border-slate-300 pt-5 flex flex-col gap-3 mt-auto">
                <span className="font-heading font-black text-xs text-slate-400 uppercase tracking-widest">PORTAL LOGIN</span>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/employee/login'); }}
                  className="btn-brutal-primary w-full py-4 text-sm font-black flex items-center justify-center gap-2"
                >
                  <User size={18} /> AGENT PORTAL LOGIN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Hero Section (Pushed down with pt-36 to avoid overlapping by fixed navbar) */}
      <header className="w-full max-w-6xl mx-auto px-4 pt-32 pb-12 md:pb-20 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Headline & CTA */}
        <div className="lg:col-span-6 text-left flex flex-col gap-6 items-start">
          <div className="badge-brutal bg-brand-red-light text-brand-red border-brand-red py-1.5 px-4 text-xs font-black gap-1.5">
            <Sparkles size={13} className="animate-pulse" /> DIGITAL BPM QUALITY HUB
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black uppercase text-ink-black leading-tight">
            PASSION TO PERFORM
          </h1>

          <p className="font-body text-sm md:text-base text-gray-600 font-bold leading-relaxed">
            Every BPO client interaction demands precision. GlobivaLearn translates static guideline documentation into active quest-maps, flashcards, and verified training evaluations.
          </p>

          <button 
            onClick={() => navigate('/employee/login')}
            className="btn-brutal-primary py-4 px-8 text-sm font-black flex items-center gap-2 shadow-brutal-sm group"
          >
            <Play size={16} fill="white" className="transition-transform group-hover:scale-110" /> START TRAINING QUEST
          </button>
        </div>

        {/* Right: Dashboard Preview Mockup */}
        <div className="lg:col-span-6 relative flex justify-center">
          
          <div className="w-full max-w-md card-brutal bg-white p-6 shadow-brutal relative bg-stripes-yellow border-3 border-ink-black">
            
            {/* Top Mockup Header */}
            <div className="flex justify-between items-center border-b-2 border-ink-black pb-3 mb-4">
              <span className="font-heading font-black text-[10px] text-brand-red uppercase">ACTIVE QUEST MAP</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-red border border-ink-black"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow border border-ink-black"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-success-green border border-ink-black"></span>
              </div>
            </div>

            {/* Dashboard Mock items */}
            <div className="flex flex-col gap-3">
              <div className="bg-white border-2 border-ink-black p-3.5 rounded-xl shadow-brutal-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center font-heading text-[10px] font-black">1</span>
                  <span className="font-heading font-bold text-xs uppercase text-ink-black">Introduction level</span>
                </div>
                <span className="badge-brutal py-0.5 px-2 bg-green-100 text-success-green border-success-green text-[8px]">PASSED</span>
              </div>

              <div className="bg-white border-2 border-ink-black p-3.5 rounded-xl shadow-brutal-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-warning-yellow text-ink-black flex items-center justify-center font-heading text-[10px] font-black animate-pulse">2</span>
                  <span className="font-heading font-bold text-xs uppercase text-ink-black">Matching challenge</span>
                </div>
                <span className="badge-brutal py-0.5 px-2 bg-amber-100 text-amber-600 border-amber-600 text-[8px] animate-pulse">PLAYING</span>
              </div>
            </div>

            {/* Mini floating mockup badge */}
            <div className="absolute bottom-[-15px] left-[-20px] bg-white border-3 border-ink-black p-3 rounded-xl shadow-brutal rotate-[-4deg] flex items-center gap-2">
              <Award size={16} className="text-warning-yellow fill-warning-yellow" />
              <span className="font-heading font-black text-[9px] uppercase tracking-wider text-ink-black">+150 XP EARNED</span>
            </div>

          </div>

        </div>

      </header>

      {/* 3. Features Grid Section ("Why Globiva Learn") */}
      <section id="why-us" className="w-full max-w-6xl mx-auto px-4 py-16 border-t-3 border-dashed border-ink-black/20">
        
        <div className="text-center mb-12 flex flex-col items-center">
          <h2 className="text-3xl font-heading font-black uppercase text-ink-black">DIGITALLY POWERED BPM TRAINING</h2>
          <p className="font-body text-xs text-gray-500 font-bold mt-2 max-w-md">How GlobivaLearn improves compliance and operational accuracy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="card-brutal bg-white flex flex-col justify-between h-72 shadow-brutal hover:-translate-y-1 duration-200">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-red-light border-2 border-ink-black flex items-center justify-center shadow-brutal-sm text-brand-red">
                <Briefcase size={20} />
              </div>
              <h3 className="font-heading font-black text-sm uppercase text-ink-black mt-2">Intelligent BPM Design</h3>
              <p className="font-body text-xs text-gray-500 font-bold leading-relaxed">
                Tailored for customer experience operations, CRM systems navigation, and guidelines checks.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-heading font-bold text-gray-400 uppercase">
              <CheckCircle2 size={10} /> Active recall matching
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-brutal bg-white flex flex-col justify-between h-72 shadow-brutal hover:-translate-y-1 duration-200">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning-yellow-light border-2 border-ink-black flex items-center justify-center shadow-brutal-sm text-ink-black">
                <Zap size={20} />
              </div>
              <h3 className="font-heading font-black text-sm uppercase text-ink-black mt-2">Gamified Map Progression</h3>
              <p className="font-body text-xs text-gray-500 font-bold leading-relaxed">
                Level-by-level boards with active feedback loops make studying compliance rules highly engaging.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-heading font-bold text-gray-400 uppercase">
              <CheckCircle2 size={10} /> Streak multipliers active
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-brutal bg-white flex flex-col justify-between h-72 shadow-brutal hover:-translate-y-1 duration-200">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 border-2 border-ink-black flex items-center justify-center shadow-brutal-sm text-success-green">
                <Award size={20} />
              </div>
              <h3 className="font-heading font-black text-sm uppercase text-ink-black mt-2">Certified Qualifications</h3>
              <p className="font-body text-xs text-gray-500 font-bold leading-relaxed">
                Complete and pass final exams to unlock downloadable, brand-bordered PDF certifications.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-heading font-bold text-gray-400 uppercase">
              <CheckCircle2 size={10} /> PDF Export backup
            </div>
          </div>

        </div>

      </section>

      {/* 4. Timeline Journey Section ("How Globiva Grew") */}
      <section id="journey" className="w-full max-w-6xl mx-auto px-4 py-16 border-t-3 border-dashed border-ink-black/20">
        
        <div className="text-center mb-16 flex flex-col items-center">
          <h2 className="text-3xl font-heading font-black uppercase text-ink-black">THE GLOBIVA JOURNEY</h2>
          <p className="font-body text-xs text-gray-500 font-bold mt-2 max-w-md">How Globiva grew to become one of India's fastest-growing BPM players.</p>
        </div>

        <div className="relative border-l-3 border-ink-black ml-4 md:ml-32 flex flex-col gap-10">
          
          {timelineMilestones.map((ms, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12 group select-text">
              
              {/* Dot indicator on the line */}
              <div className="absolute left-[-11px] top-1.5 w-5 h-5 rounded-full border-3 border-ink-black bg-white group-hover:bg-brand-red transition-colors duration-150 shadow-brutal-sm" />
              
              {/* Year Stamp */}
              <div className="absolute left-[-90px] md:left-[-120px] top-0.5 font-heading font-black text-base text-brand-red tracking-wider text-right w-16 md:w-24 select-none">
                {ms.year}
              </div>

              {/* Milestone Box Card */}
              <div className="card-brutal bg-white p-5 border-2 border-ink-black rounded-2xl shadow-brutal-sm max-w-2xl hover:shadow-brutal duration-200">
                <h4 className="font-heading font-black text-xs uppercase text-ink-black tracking-wide flex items-center gap-1.5">
                  <Bookmark size={12} className="text-brand-red" /> {ms.title}
                </h4>
                <p className="font-body text-xs text-gray-500 font-bold mt-2 leading-relaxed">
                  {ms.desc}
                </p>
              </div>

            </div>
          ))}

        </div>

      </section>

      {/* 5. Real-time Metrics Showcase */}
      <section id="metrics" className="w-full max-w-6xl mx-auto px-4 py-12 bg-ink-black text-white rounded-3xl border-3 border-ink-black shadow-brutal flex flex-col md:flex-row justify-around items-center gap-8 mb-16 select-none bg-stripes">
        <div className="flex flex-col items-center text-center">
          <Users size={28} className="text-warning-yellow" />
          <span className="font-heading font-black text-3xl mt-2">15,000+</span>
          <span className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mt-1">Certified BPO Associates</span>
        </div>
        <div className="flex flex-col items-center text-center border-y-2 md:border-y-0 md:border-x-2 border-white/10 py-6 md:py-0 md:px-12 w-full md:w-auto">
          <CheckCircle2 size={28} className="text-success-green" />
          <span className="font-heading font-black text-3xl mt-2">99.2%</span>
          <span className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mt-1">Process SLA Accuracy</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <TrendingUp size={28} className="text-brand-red" />
          <span className="font-heading font-black text-3xl mt-2">4.5x</span>
          <span className="text-[10px] font-heading font-bold text-gray-400 uppercase tracking-widest mt-1">Faster Training Cycle</span>
        </div>
      </section>

      {/* 6. Interactive FAQ Section (Brutalist Accordions) */}
      <section id="faq" className="w-full max-w-4xl mx-auto px-4 py-16 border-t-3 border-dashed border-ink-black/20">
        
        <div className="text-center mb-10 flex flex-col items-center">
          <h2 className="text-3xl font-heading font-black uppercase text-ink-black">COMPLIANCE FREQUENT QUESTIONS</h2>
          <p className="font-body text-xs text-gray-500 font-bold mt-2">Common answers regarding onboarding, testing, and system rules.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div 
                key={idx}
                className="border-3 border-ink-black rounded-2xl bg-white overflow-hidden shadow-brutal-sm"
              >
                {/* FAQ Header Click Bar */}
                <div 
                  onClick={() => toggleFaq(idx)}
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 select-none"
                >
                  <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-ink-black flex items-center gap-2">
                    <HelpCircle size={15} className="text-brand-red" /> {faq.q}
                  </h4>
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </div>

                {/* FAQ Collapsible Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t-2 border-ink-black bg-gray-50/50"
                    >
                      <p className="p-4 font-body text-xs text-gray-600 font-bold leading-relaxed select-text">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>

      </section>

      {/* 7. Corporate philosophy banner */}
      <section className="w-full max-w-3xl mx-auto px-4 py-12 text-center mb-12">
        <div className="card-brutal bg-white border-2 border-ink-black rounded-2xl p-6 shadow-brutal-sm">
          <div className="flex items-center justify-center gap-1.5 text-brand-red font-heading font-black text-xs uppercase mb-3">
            <Heart size={14} className="fill-brand-red animate-pulse" /> OUR WORK PRINCIPLE
          </div>
          <blockquote className="font-body text-sm text-ink-black italic font-black leading-relaxed">
            "Our singular goal is to WOW our clients – we believe it's all about doing above & beyond what's expected."
          </blockquote>
          <cite className="font-heading text-[10px] text-gray-400 font-bold uppercase mt-3 block not-italic tracking-widest">— GLOBIVA CORE PHILOSOPHY</cite>
        </div>
      </section>

      {/* 8. Detailed Footer */}
      <footer className="w-full max-w-6xl mx-auto py-6 text-center border-t-3 border-ink-black bg-ink-black text-white rounded-t-xl z-10 flex flex-col sm:flex-row justify-between items-center px-6 gap-4 text-xs font-heading font-bold tracking-wider">
        <div className="flex items-center gap-2">
          <img 
            src={logoImg} 
            alt="Globiva Logo" 
            className="h-6 w-auto object-contain bg-white rounded p-0.5 border border-white/20" 
          />
          <span className="text-gray-300">&copy; {new Date().getFullYear()} GLOBIVA LEARN. ALL RIGHTS RESERVED.</span>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-white shadow-sm font-heading font-black text-xs uppercase tracking-wider">
          <span>Developed with ❤️ by <span className="text-warning-yellow font-extrabold">Arpit Singh Yadav</span></span>
        </div>

        {/* Subtle Trainer Portal Login */}
        <Link 
          to="/admin/login" 
          className="text-gray-400 hover:text-white underline transition-colors text-[11px]"
          title="Trainer Access Only"
        >
          TRAINER ACCESS
        </Link>
      </footer>

      {/* 9. Premium Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ y: -4, scale: 1.05 }}
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="fixed bottom-6 right-6 z-50 w-12 h-12 border-3 border-ink-black bg-warning-yellow rounded-xl flex items-center justify-center shadow-brutal hover:shadow-brutal-lg transition-shadow cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <ChevronUp size={24} strokeWidth={3} className="text-ink-black" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Landing;
