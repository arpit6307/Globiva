import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useGameStore } from '../store/gameStore';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { InteractiveVideoPlayer } from '../components/shared/InteractiveVideoPlayer';
import { 
  ArrowLeft, 
  BookOpen, 
  Trophy, 
  Compass, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Target, 
  RotateCcw, 
  Zap,
  Sparkles,
  Lock,
  Tv
} from 'lucide-react';
import { motion } from 'framer-motion';

// A simple animated counter component
const AnimatedCounter = ({ from = 0, to }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime;
    const duration = 1200;
    const startValue = parseInt(from, 10) || 0;
    const endValue = parseInt(to, 10) || 0;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(startValue + (endValue - startValue) * ease));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [from, to]);

  return <span>{count}</span>;
};

export const CourseIntro = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const assignmentId = location.state?.assignmentId;

  const { startCourse } = useGameStore();

  useEffect(() => {
    const completedStorage = localStorage.getItem(`video_completed_${courseId}`) === 'true';
    if (completedStorage) {
      setIsVideoCompleted(true);
    }
  }, [courseId]);

  const handleVideoComplete = () => {
    setIsVideoCompleted(true);
    localStorage.setItem(`video_completed_${courseId}`, 'true');
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'courses', courseId));
        if (docSnap.exists()) {
          setCourse(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleStart = () => {
    if (!course) return;
    startCourse(course);
    navigate(`/employee/course/${courseId}/play`, { state: { assignmentId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
        <BackgroundParticles />
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center max-w-7xl w-full mx-auto z-10">
          <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-8 max-w-md w-full flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[3px_3px_0px_#000]" />
            <p className="font-heading font-black text-sm text-slate-800 uppercase tracking-wider animate-pulse">LOADING COURSE INFO...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
        <BackgroundParticles />
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center max-w-7xl w-full mx-auto z-10">
          <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-8 max-w-md w-full flex flex-col items-center text-center gap-6">
            <div className="p-4 bg-error-red text-white rounded-full border-3 border-slate-800 shadow-[3px_3px_0px_#000]">
              <ShieldAlert size={44} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-heading font-black text-2xl text-slate-800 uppercase">COURSE NOT FOUND</h2>
              <p className="font-body text-xs text-slate-500 font-bold leading-relaxed">
                The process guideline course you are trying to access doesn't exist or has been modified.
              </p>
            </div>
            <Link 
              to="/employee/dashboard" 
              className="bg-white text-slate-800 font-heading font-black uppercase tracking-wider text-xs px-6 py-3.5 border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-slate-50 select-none flex items-center justify-center gap-2 cursor-pointer w-full"
            >
              RETURN TO DASHBOARD
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
      <BackgroundParticles />
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 max-w-7xl w-full mx-auto z-10">
        
        {/* Top Header Card */}
        <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-6 md:p-8 flex flex-col gap-4">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <Link 
              to="/employee/dashboard" 
              className="bg-white text-slate-800 font-heading font-black uppercase tracking-wider text-xs px-4 py-2 border-2 border-slate-800 rounded-xl shadow-[3px_3px_0px_#000] transition-all duration-150 hover:-translate-x-[1.5px] hover:-translate-y-[1.5px] hover:shadow-[4.5px_4.5px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-slate-50 inline-flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} /> BACK TO DASHBOARD
            </Link>

            <span className="border-2 border-slate-800 bg-brand-red-light text-brand-red shadow-[2px_2px_0px_#000] rounded-full px-3.5 py-1 text-xs font-heading font-black tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles size={14} /> PROCESS GUIDELINE
            </span>
          </div>

          <div className="flex flex-col gap-1 border-t-2 border-slate-100 pt-4 mt-2">
            <span className="text-brand-red font-heading font-black text-xs md:text-sm tracking-wider uppercase">
              MODULE: {course.processName}
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-black uppercase tracking-tight text-slate-800 leading-tight">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Mission Objective Description Card */}
        <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-6 md:p-8 flex flex-col gap-3">
          <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 border-b-2 border-slate-100 pb-2 flex items-center gap-2">
            <BookOpen size={18} className="text-brand-red" /> Course Objective & Summary
          </h3>
          <p className="font-body text-sm md:text-base text-slate-700 font-bold leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Mandatory Interactive Video Module Section */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Tv size={18} className="text-brand-red" /> Interactive Video Module (Mandatory Learning)
            </h3>
            {!isVideoCompleted && (
              <span className="bg-red-100 text-brand-red border-2 border-slate-800 rounded-full px-3 py-0.5 text-[10px] font-heading font-black tracking-wider uppercase flex items-center gap-1">
                <Lock size={10} /> Complete to Unlock Levels
              </span>
            )}
          </div>
          
          {course.videoUrl ? (
            <div className="w-full aspect-video border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl overflow-hidden bg-slate-900 relative">
              <video 
                src={course.videoUrl} 
                controls 
                onEnded={handleVideoComplete}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <InteractiveVideoPlayer 
              videoUrl={course.videoUrl || "https://www.youtube.com/watch?v=cNOKQIw81SE"}
              videoModule={course.videoModule || {
                title: `${course?.title || 'Process Guideline'} - AI Animated Video`,
                description: "PDF-based character animated video module.",
                totalDurationSeconds: 120,
                scenes: [
                  {
                    sceneId: "scene-1",
                    title: "Welcome & Document Orientation",
                    subtitle: `Orientation: ${course?.processName || 'Standard Guidelines'}`,
                    visualTheme: "intro",
                    keyHighlights: [course?.title || "Process Guidelines", "Mandatory Training"],
                    dialogues: [
                      {
                        speaker: "Trainer Sarah",
                        role: "Lead Quality Trainer",
                        avatar: "👩‍💼",
                        voiceGender: "female",
                        text: `Welcome! Today we are reviewing the official process document "${course?.title || 'Guidelines'}". Are you ready?`
                      },
                      {
                        speaker: "Agent Alex",
                        role: "Operations Associate",
                        avatar: "👨‍💼",
                        voiceGender: "male",
                        text: `Hi Sarah! Yes, I'm ready to learn the key guidelines.`
                      },
                      {
                        speaker: "Trainer Sarah",
                        role: "Lead Quality Trainer",
                        avatar: "👩‍💼",
                        voiceGender: "female",
                        text: course?.description || `The primary objective is to maintain strict operational quality and follow standard compliance protocols.`
                      }
                    ]
                  }
                ]
              }} 
              onComplete={handleVideoComplete}
              initialCompleted={isVideoCompleted}
            />
          )}
        </div>

        {/* Course Statistics Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-2xl p-5 bg-white flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all">
            <Compass size={24} className="text-brand-red mb-2" />
            <span className="font-heading font-black text-3xl text-slate-800">
              <AnimatedCounter to={course.sections?.length || 2} />
            </span>
            <span className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider mt-1">2 Fun Mini-Games</span>
          </div>

          <div className="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-2xl p-5 bg-white flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all">
            <Target size={24} className="text-warning-yellow mb-2" />
            <span className="font-heading font-black text-3xl text-slate-800">
              <AnimatedCounter to={course.mcqs?.length || 20} />
            </span>
            <span className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider mt-1">Total MCQs</span>
          </div>

          <div className="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-2xl p-5 bg-white flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all">
            <Clock size={24} className="text-blue-500 mb-2" />
            <span className="font-heading font-black text-3xl text-slate-800">
              {course.mcqTimeLimitMinutes ? <><AnimatedCounter to={course.mcqTimeLimitMinutes} /><span className="text-sm ml-0.5">M</span></> : '15M'}
            </span>
            <span className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider mt-1">Time Limit</span>
          </div>

          <div className="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-2xl p-5 bg-white flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all">
            <RotateCcw size={24} className="text-purple-500 mb-2" />
            <span className="font-heading font-black text-3xl text-slate-800">
              <AnimatedCounter to={course.maxAttempts || 2} />
            </span>
            <span className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider mt-1">Max Attempts</span>
          </div>

          <div className="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-2xl p-5 bg-white flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all">
            <Trophy size={24} className="text-emerald-500 mb-2" />
            <span className="font-heading font-black text-3xl text-slate-800">
              <AnimatedCounter to={course.passPercentage || 75} /><span className="text-sm ml-0.5">%</span>
            </span>
            <span className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider mt-1">Passing Mark</span>
          </div>
        </div>

        {/* Rules of Engagement / Guidelines */}
        <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-warning-yellow p-6 md:p-8 flex flex-col gap-4">
          <h4 className="font-heading font-black text-base uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ShieldAlert size={20} className="text-slate-800" /> TRAINING RULES & GUIDELINES
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm font-bold text-slate-800">
            <div className="flex items-center gap-3 bg-white p-3.5 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]">
              <CheckCircle2 size={18} className="text-success-green shrink-0" />
              <span>Watch the mandatory PDF animated video module to unlock games & exam.</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-3.5 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]">
              <CheckCircle2 size={18} className="text-success-green shrink-0" />
              <span>Play 2 fun interactive mini-games to master key operating terms.</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-3.5 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]">
              <CheckCircle2 size={18} className="text-success-green shrink-0" />
              <span>Complete the 20 MCQ evaluation exam to demonstrate process mastery.</span>
            </div>
            <div className="flex items-center gap-3 bg-white p-3.5 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]">
              <CheckCircle2 size={18} className="text-success-green shrink-0" />
              <span>Score at least <strong className="text-brand-red font-heading">{course.passPercentage || 75}%</strong> to earn your completion certificate.</span>
            </div>
          </div>
        </div>

        {/* Launch Course Button */}
        <div className="w-full pb-8">
          {isVideoCompleted ? (
            <button
              onClick={handleStart}
              className="w-full bg-brand-red text-white py-5 md:py-6 text-xl md:text-3xl font-heading font-black uppercase tracking-wider flex items-center justify-center gap-4 rounded-2xl border-3 border-slate-800 shadow-[6px_6px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[8px_8px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-brand-red-dark cursor-pointer select-none"
            >
              <Play size={32} fill="currentColor" /> 
              LAUNCH COURSE & PLAY LEVELS
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-slate-200 text-slate-500 py-5 md:py-6 text-base md:text-xl font-heading font-black uppercase tracking-wider flex items-center justify-center gap-3 rounded-2xl border-3 border-slate-800 shadow-[4px_4px_0px_#000] cursor-not-allowed select-none opacity-80"
            >
              <Lock size={24} /> 
              COMPLETE INTERACTIVE VIDEO MODULE TO UNLOCK LEVELS & EXAM
            </button>
          )}
        </div>

      </main>
    </div>
  );
};

export default CourseIntro;
