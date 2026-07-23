import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { generateCertificatePDF } from '../utils/pdfCertificate';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Award, 
  XCircle, 
  CheckCircle, 
  ArrowLeft, 
  Download, 
  HelpCircle,
  Clock,
  BookOpen,
  RotateCcw,
  Sparkles,
  Check,
  X,
  Trophy,
  Shield,
  Lock
} from 'lucide-react';

const AnimatedCounter = ({ from = 0, to, duration = 1.5 }) => {
  const [count, setCount] = useState(from);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * (to - from) + from));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [from, to, duration]);

  return <span>{count}</span>;
};

export const ResultPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();
  
  const resultId = location.state?.resultId;
  const assignmentId = location.state?.assignmentId;

  const [result, setResult] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openQuestionIdx, setOpenQuestionIdx] = useState(null);
  const [gaugeOffset, setGaugeOffset] = useState(0);

  useEffect(() => {
    const fetchResultAndCourse = async () => {
      if (!resultId) {
        setLoading(false);
        return;
      }
      
      try {
        const resultSnap = await getDoc(doc(db, 'results', resultId));
        if (resultSnap.exists()) {
          const resData = resultSnap.data();
          setResult(resData);

          const courseSnap = await getDoc(doc(db, 'courses', resData.courseId));
          if (courseSnap.exists()) {
            setCourse(courseSnap.data());
          }
        }
      } catch (err) {
        console.error("Error loading result details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResultAndCourse();
  }, [resultId]);

  useEffect(() => {
    if (result && result.passed) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
          zIndex: 100
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
          zIndex: 100
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [result]);

  const radius = 50;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    if (result) {
      const targetScore = result.pointsScored !== undefined ? result.pointsScored : result.mcqScore;
      const totalTarget = result.pointsScored !== undefined ? result.totalPoints : 100;
      const finalOffset = circumference - (targetScore / totalTarget) * circumference;
      
      setGaugeOffset(circumference); // Start empty
      
      setTimeout(() => {
        setGaugeOffset(finalOffset);
      }, 100);
    }
  }, [result, circumference]);

  const handleDownloadCert = () => {
    if (!result || !course || !userData) return;

    generateCertificatePDF(
      userData.name || 'Globiva Associate',
      course.title,
      result.mcqScore,
      result.gameScore, 
      new Date(result.attemptedAt).toLocaleDateString()
    );
  };

  const handleToggleAccordion = (idx) => {
    setOpenQuestionIdx(openQuestionIdx === idx ? null : idx);
  };

  if (loading) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center">
        <div class="w-12 h-12 border-4 border-ink-black border-t-brand-red rounded-full animate-spin bg-white shadow-brutal mb-4"></div>
        <p class="font-heading font-black text-sm tracking-wider uppercase animate-pulse">Calculating Score Sheets...</p>
      </div>
    );
  }

  if (!result || !course) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center p-4">
        <div class="card-brutal bg-white text-center max-w-sm">
          <XCircle size={48} class="text-error-red mx-auto mb-3" />
          <h2 class="text-2xl font-heading font-black text-error-red mb-2 uppercase">RESULT ERROR</h2>
          <p class="font-body text-xs text-gray-500 mb-6 leading-relaxed">We couldn't retrieve the quiz result details. Please return to the dashboard.</p>
          <Link to="/employee/dashboard" class="btn-brutal-secondary text-xs">BACK TO DASHBOARD</Link>
        </div>
      </div>
    );
  }

  const secondsToMinutes = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const targetScore = result.pointsScored !== undefined ? result.pointsScored : result.mcqScore;
  const totalTarget = result.pointsScored !== undefined ? result.totalPoints : 100;
  
  const attemptNumber = result.attemptNumber || 1;
  const maxAttempts = course.maxAttempts || 2;
  const hasMoreAttempts = attemptNumber < maxAttempts;
  const containerClass = result.passed 
    ? 'bg-gradient-to-br from-green-50 to-emerald-100' 
    : 'animate-shake';

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-paper-white bg-dots">
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 flex flex-col max-w-5xl w-full mx-auto">
        {/* Title & Attempt Badge */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-ink-black pb-6 mb-8 gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-5xl font-heading font-black uppercase text-ink-black">EVALUATION SUMMARY</h1>
            <div className="flex items-center gap-3">
              <div className="badge-brutal bg-ink-black text-white text-xs px-3 py-1">
                ATTEMPT {attemptNumber} OF {maxAttempts}
              </div>
              {!result.passed && !hasMoreAttempts && (
                <div className="badge-brutal bg-error-red text-white text-xs px-3 py-1 font-black animate-pulse">
                  STATUS: FAILED (NO ATTEMPTS REMAIN)
                </div>
              )}
              {result.passed && (
                <div className="badge-brutal bg-success-green text-white text-xs px-3 py-1 font-black">
                  STATUS: PASSED & CERTIFIED
                </div>
              )}
            </div>
          </div>
          <Link to="/employee/dashboard" className="btn-brutal-secondary text-xs px-4 py-2 flex items-center gap-2">
            <ArrowLeft size={16} /> RETURN TO DASHBOARD
          </Link>
        </div>

        {/* Result Card Details */}
        <div class="card-brutal bg-white flex flex-col items-center p-6 md:p-8 relative overflow-hidden gap-6 bg-dots">
          
          {/* Animated Trophy for Pass */}
          {result.passed && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
              class="absolute top-4 left-4 text-warning-yellow drop-shadow-md z-10"
            >
              <Trophy size={48} strokeWidth={2.5} />
            </motion.div>
          )}

          {/* Brutalist Stamp: PASS/FAIL with spring scale-in slam effect */}
          <motion.div 
            initial={{ scale: 3, rotate: 45, opacity: 0 }}
            animate={{ scale: 1, rotate: result.passed ? 6 : -6, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 80, delay: 0.2 }}
            class="absolute top-4 right-4 z-10"
          >
            {result.passed ? (
              <div class="border-3 border-ink-black bg-success-green text-white font-heading font-black text-sm uppercase tracking-widest px-4 py-2 rounded-xl shadow-brutal-sm flex items-center gap-1">
                <Check size={16} strokeWidth={3} /> CERTIFIED
              </div>
            ) : (
              <div class="border-3 border-ink-black bg-error-red text-white font-heading font-black text-sm uppercase tracking-widest px-4 py-2 rounded-xl shadow-brutal-sm flex items-center gap-1">
                <X size={16} strokeWidth={3} /> FAILED
              </div>
            )}
          </motion.div>

          {/* 1. Score Circle Gauge SVG */}
          <div class="flex flex-col items-center mt-8">
            <div class="relative w-40 h-40 flex items-center justify-center bg-white rounded-full border-3 border-ink-black shadow-brutal-sm">
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r={normalizedRadius} 
                  stroke="#F1F5F9" 
                  stroke-width={strokeWidth} 
                  fill="transparent" 
                />
                <circle 
                  cx="80" 
                  cy="80" 
                  r={normalizedRadius} 
                  stroke={result.passed ? '#1F9D55' : '#D7263D'} 
                  stroke-width={strokeWidth} 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={gaugeOffset || circumference}
                  strokeLinecap="round"
                  class="transition-all duration-[1500ms] ease-out"
                />
              </svg>
              <div class="flex flex-col items-center">
                <span class="font-heading font-black text-3xl leading-none flex items-baseline">
                  <AnimatedCounter from={0} to={targetScore} duration={1.5} />/{totalTarget}
                </span>
                <span class="text-[9px] text-gray-400 font-heading font-bold uppercase mt-1.5">
                  {result.pointsScored !== undefined ? 'POINTS' : 'ACCURACY'}
                </span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div class="text-center max-w-md bg-white border-2 border-ink-black p-4 rounded-xl shadow-brutal-sm">
            <h2 class="text-xl font-heading font-black uppercase leading-tight">{course.title}</h2>
            <p class="font-body text-xs text-gray-500 font-bold mt-2 leading-relaxed">
              {result.passed 
                ? `Outstanding performance! You've successfully conquered this quest. Download your official certification.`
                : `Target not reached. You need ${course.passingScore || Math.round((course.passPercentage / 100) * (result.totalQuestions * (course.pointsPerQuestion || 10)))} Points out of ${result.totalQuestions * (course.pointsPerQuestion || 10)} to pass.`
              }
            </p>
          </div>

          {/* Stat Grid */}
          <div class="grid grid-cols-3 gap-4 w-full border-2 border-ink-black rounded-xl p-4 bg-gray-50 border-dashed">
            
            <div class="flex flex-col items-center text-center">
              <span class="text-[9px] text-gray-400 font-heading font-bold uppercase leading-none">ANSWERS</span>
              <span class="font-heading font-black text-sm text-ink-black mt-1.5"><AnimatedCounter from={0} to={result.correctAnswers} duration={1.5}/> / {result.totalQuestions}</span>
            </div>

            <div class="flex flex-col items-center text-center border-x-2 border-ink-black/10 px-2">
              <span class="text-[9px] text-gray-400 font-heading font-bold uppercase leading-none">TIME SPENT</span>
              <span class="font-heading font-black text-sm text-ink-black mt-1.5 flex items-center gap-1 justify-center">
                <Clock size={12} /> {secondsToMinutes(result.timeTakenSeconds)}
              </span>
            </div>

            <div class="flex flex-col items-center text-center">
              <span class="text-[9px] text-gray-400 font-heading font-bold uppercase leading-none">BONUS XP</span>
              <span class="font-heading font-black text-sm text-warning-yellow mt-1.5 flex items-center gap-1 justify-center">
                <Sparkles size={12} class="text-warning-yellow" /> <AnimatedCounter from={0} to={result.gameScore} duration={1.5}/>
              </span>
            </div>

          </div>

          {/* CTAs */}
          <div class="flex flex-col sm:flex-row gap-4 w-full mt-2">
            <Link to="/employee/dashboard" class="flex-1 btn-brutal-secondary py-3 text-center flex items-center justify-center">
              RETURN TO DASHBOARD
            </Link>
            
            {result.passed ? (
              <button 
                onClick={handleDownloadCert}
                class="flex-1 btn-brutal-green py-3 flex items-center justify-center gap-1.5 animate-pulse-border"
              >
                <Download size={15} /> EXPORT CERTIFICATE
              </button>
            ) : hasMoreAttempts ? (
              <button 
                onClick={() => navigate(`/employee/course/${courseId}/quiz`, { state: { assignmentId } })}
                class="flex-1 btn-brutal-primary py-3 bg-brand-red text-center flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} /> RETAKE QUIZ
              </button>
            ) : (
              <div class="flex-1 border-3 border-ink-black bg-gray-200 text-ink-black font-heading font-black text-xs uppercase py-3 flex items-center justify-center gap-1 shadow-brutal">
                <Lock size={15} /> NO MORE ATTEMPTS - CONTACT TRAINER
              </div>
            )}
          </div>

        </div>

        {/* 2. Questions Accordion Review */}
        <div class="flex flex-col gap-4">
          <h3 class="font-heading font-black text-base uppercase mt-4 flex items-center gap-1.5"><HelpCircle size={18} /> Evaluation breakdown</h3>
          
          <div class="flex flex-col gap-3">
            {course.mcqs.map((mcq, idx) => {
              const answerLogItem = result.answerLog?.find(log => log.questionId === mcq.id) || {};
              const isCorrect = answerLogItem.correct;
              const isOpen = openQuestionIdx === idx;

              return (
                <div 
                  key={mcq.id}
                  class={`border-2 border-ink-black rounded-xl bg-white overflow-hidden shadow-brutal-sm transition-all border-l-8 ${isCorrect ? 'border-l-success-green' : 'border-l-error-red'}`}
                >
                  {/* Header click bar */}
                  <div 
                    onClick={() => handleToggleAccordion(idx)}
                    class="p-4 flex justify-between items-center cursor-pointer select-none hover:bg-gray-50/50"
                  >
                    <div class="flex items-center gap-3">
                      <span class={`w-6 h-6 rounded-full border-2 border-ink-black flex items-center justify-center text-[10px] font-heading font-black ${isCorrect ? 'bg-green-100 text-success-green border-success-green' : 'bg-red-100 text-error-red border-error-red'}`}>
                        {isCorrect ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
                      </span>
                      <h4 class="font-body font-bold text-xs text-ink-black truncate max-w-[200px] md:max-w-lg">Question {idx + 1}: {mcq.question}</h4>
                    </div>
                    <span class="text-[9px] font-heading font-black text-gray-400 uppercase tracking-widest">{isOpen ? 'COLLAPSE' : 'REVEAL'}</span>
                  </div>

                  {/* Collapsed Detail Pane */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        class="border-t-2 border-ink-black bg-gray-50"
                      >
                        <div class="p-4 flex flex-col gap-3 text-xs leading-relaxed font-body font-bold">
                          <p class="text-ink-black select-text">Full Question: <span class="text-gray-600 font-medium">{mcq.question}</span></p>
                          
                          {/* Restricted Answer Key Notice for Students */}
                          <div className="bg-slate-100 border-2 border-slate-800 p-3.5 rounded-xl font-body text-xs text-slate-600 font-bold flex items-center justify-between gap-2">
                            <span>Status: {isCorrect ? <strong className="text-success-green">Correct Answer</strong> : <strong className="text-error-red">Incorrect Answer</strong>}</span>
                            <span className="text-[10px] font-heading font-black text-slate-500 uppercase flex items-center gap-1 bg-white px-2.5 py-1 border border-slate-300 rounded-lg">
                              <Lock size={12} /> Trainer-Only Answer Key
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
