import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { ArrowRight, HelpCircle, Info, Clock, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MCQTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const assignmentId = location.state?.assignmentId;

  const { currentUser } = useAuth();
  const { currentCourse, xp, submitMcqAnswer, answerLog } = useGameStore();

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  
  // Attempt state
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  
  const maxAttempts = currentCourse?.maxAttempts || 2;
  const timeLimitMinutes = currentCourse?.mcqTimeLimitMinutes || 0;
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);

  useEffect(() => {
    if (!currentCourse) {
      navigate('/employee/dashboard');
    }
  }, [currentCourse, navigate]);

  useEffect(() => {
    if (!currentCourse || !currentUser) return;
    const checkAttempts = async () => {
      try {
        const resultsQuery = query(
          collection(db, 'results'),
          where('employeeId', '==', currentUser.uid),
          where('courseId', '==', courseId)
        );
        const resultsSnap = await getDocs(resultsQuery);
        const previousAttempts = resultsSnap.size;
        
        if (previousAttempts >= maxAttempts) {
          setMaxAttemptsReached(true);
        } else {
          setAttemptNumber(previousAttempts + 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAttemptsLoading(false);
      }
    };
    checkAttempts();
  }, [currentCourse, currentUser, courseId, maxAttempts]);

  useEffect(() => {
    if (timeLimitMinutes === 0 || maxAttemptsReached || attemptsLoading || submitting) return;
    
    if (timeLeft <= 0) {
      saveResults(true);
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, timeLimitMinutes, maxAttemptsReached, attemptsLoading, submitting]);

  if (!currentCourse) return null;

  const rawMcqs = currentCourse.mcqs || [];
  const mcqs = [...rawMcqs];
  if (mcqs.length > 0 && mcqs.length < 20) {
    while (mcqs.length < 20) {
      const baseQ = rawMcqs[mcqs.length % rawMcqs.length];
      mcqs.push({
        ...baseQ,
        id: `q-pad-${mcqs.length + 1}`,
        question: `Question ${mcqs.length + 1}: ${baseQ.question.replace(/^Q\d+:\s*/, '')}`
      });
    }
  }

  const currentQuestion = mcqs[activeIndex];
  const totalQuestions = mcqs.length;

  const handleOptionSelect = (idx) => {
    setSelectedOptionIdx(idx);
  };

  const handleNext = async () => {
    if (selectedOptionIdx === null) return;

    const isCorrect = (selectedOptionIdx === currentQuestion.correctIndex);
    submitMcqAnswer(currentQuestion.id, selectedOptionIdx, isCorrect);

    setSelectedOptionIdx(null);
    
    if (activeIndex < totalQuestions - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      await saveResults(false);
    }
  };

  const saveResults = async (isTimeout = false) => {
    setSubmitting(true);
    try {
      let finalLog = [...answerLog];
      
      if (!isTimeout) {
        const finalIsCorrect = (selectedOptionIdx === currentQuestion.correctIndex);
        finalLog.push({ 
          questionId: currentQuestion.id, 
          selectedIndex: selectedOptionIdx, 
          correct: finalIsCorrect 
        });
      } else {
        // Timeout logic: process remaining questions
        for (let i = activeIndex; i < totalQuestions; i++) {
          let q = mcqs[i];
          if (i === activeIndex && selectedOptionIdx !== null) {
            finalLog.push({
              questionId: q.id,
              selectedIndex: selectedOptionIdx,
              correct: selectedOptionIdx === q.correctIndex
            });
          } else {
            finalLog.push({
              questionId: q.id,
              selectedIndex: null,
              correct: false
            });
          }
        }
      }

      const correctCount = finalLog.filter(log => log.correct).length;
      const pointsPerQuestion = currentCourse.pointsPerQuestion || 10;
      const passingScore = currentCourse.passingScore || 70;

      const pointsScored = correctCount * pointsPerQuestion;
      const totalPoints = totalQuestions * pointsPerQuestion;
      const passed = pointsScored >= passingScore;

      const mcqScore = Math.round((correctCount / totalQuestions) * 100);
      const timeTaken = timeLimitMinutes > 0 
        ? (timeLimitMinutes * 60) - Math.max(0, timeLeft) 
        : Math.round((Date.now() - startTime) / 1000);

      const resultData = {
        employeeId: currentUser.uid,
        courseId,
        assignmentId: assignmentId || 'self-enrolled',
        gameScore: xp,
        mcqScore, 
        pointsScored,
        totalPoints, 
        pointsPerQuestion,
        passingScore,
        correctAnswers: correctCount,
        totalQuestions,
        passed,
        timeTakenSeconds: timeTaken,
        answerLog: finalLog,
        attemptNumber,
        attemptedAt: new Date().toISOString()
      };

      const resultRef = collection(db, 'results');
      const resultDoc = await addDoc(resultRef, resultData);

      if (assignmentId && assignmentId !== 'self-enrolled') {
        const assignmentRef = doc(db, 'assignments', assignmentId);
        const newStatus = passed ? 'completed' : (attemptNumber >= maxAttempts ? 'failed' : 'in-progress');
        await updateDoc(assignmentRef, { status: newStatus });
      }

      navigate(`/employee/course/${courseId}/result`, { 
        state: { 
          resultId: resultDoc.id,
          assignmentId
        } 
      });
    } catch (error) {
      console.error("Error saving assessment results:", error);
      alert("Failed to save results. Check network and try again.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLast60 = timeLimitMinutes > 0 && timeLeft <= 60 && timeLeft > 0;
  const isLast30 = timeLimitMinutes > 0 && timeLeft <= 30 && timeLeft > 0;
  const timerPercentage = timeLimitMinutes > 0 ? (timeLeft / (timeLimitMinutes * 60)) * 100 : 100;

  if (attemptsLoading) {
    return (
      <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
        <BackgroundParticles />
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center max-w-7xl w-full mx-auto z-10">
          <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-8 max-w-md w-full flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[3px_3px_0px_#000]" />
            <p className="font-heading font-black text-sm text-slate-800 uppercase tracking-wider animate-pulse">LOADING ASSESSMENT...</p>
          </div>
        </main>
      </div>
    );
  }

  if (maxAttemptsReached) {
    return (
      <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
        <BackgroundParticles />
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 flex items-center justify-center max-w-7xl w-full mx-auto z-10">
          <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-8 max-w-md w-full flex flex-col items-center text-center gap-6">
            <div className="p-5 bg-error-red text-white rounded-full border-3 border-slate-800 shadow-[4px_4px_0px_#000]">
              <Lock size={44} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="font-heading font-black text-2xl text-slate-800 uppercase">Max Attempts Reached</h2>
              <p className="font-body text-xs text-slate-500 font-bold leading-relaxed">
                You have used all {maxAttempts} attempts for this course. Please contact your trainer or administrator to request an extra attempt.
              </p>
            </div>
            <button 
              onClick={() => navigate('/employee/dashboard')}
              className="bg-white text-slate-800 font-heading font-black uppercase tracking-wider text-xs px-6 py-3.5 border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-slate-50 select-none flex items-center justify-center gap-2 cursor-pointer w-full"
            >
              RETURN TO DASHBOARD
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden select-none">
      <BackgroundParticles />
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 max-w-5xl w-full mx-auto z-10">
        
        {/* Top Sticky Timer Progress Line (if timed) */}
        {timeLimitMinutes > 0 && (
          <div className="w-full h-3 border-3 border-slate-800 bg-slate-100 rounded-full overflow-hidden shadow-[2px_2px_0px_#000]">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${isLast60 ? 'bg-error-red animate-pulse' : 'bg-brand-red'}`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        )}

        {/* MCQ Header Bar */}
        <header className="w-full border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-4 md:p-6 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="bg-brand-red-light p-2 border-2 border-slate-800 shadow-[2px_2px_0px_#000] rounded-lg shrink-0">
              <HelpCircle className="w-5 h-5 text-brand-red" />
            </div>
            <span className="font-heading font-black text-sm md:text-base uppercase tracking-wider text-slate-800 line-clamp-1">
              {currentCourse.title}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="border-2 border-slate-800 bg-brand-red-light text-brand-red shadow-[2px_2px_0px_#000] rounded-full px-3 py-1 text-xs font-heading font-black tracking-wider">
              ATTEMPT {attemptNumber} OF {maxAttempts}
            </span>
            <span className="border-2 border-slate-800 bg-slate-800 text-white shadow-[2px_2px_0px_#000] rounded-full px-3 py-1 text-xs font-heading font-black tracking-wider">
              Q {activeIndex + 1} OF {totalQuestions}
            </span>
            {timeLimitMinutes > 0 && (
              <motion.div 
                animate={isLast30 ? { x: [-3, 3, -3, 3, 0] } : {}}
                transition={{ repeat: isLast30 ? Infinity : 0, duration: 0.3 }}
                className={`border-2 border-slate-800 shadow-[2px_2px_0px_#000] rounded-full px-3 py-1 text-xs font-heading font-black flex items-center gap-1.5 ${
                  isLast60 ? 'bg-error-red text-white' : 'bg-warning-yellow text-slate-800'
                }`}
              >
                <Clock size={14} className={isLast60 ? "animate-pulse" : ""} />
                {formatTime(timeLeft)}
              </motion.div>
            )}
          </div>
        </header>

        {/* Main Question Window */}
        <div className="flex-1 flex flex-col items-center w-full relative">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div 
                key={activeIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white flex flex-col p-6 md:p-8"
              >
                
                {/* Question Progress Line */}
                <div className="w-full h-3 border-2 border-slate-800 bg-slate-100 rounded-full overflow-hidden mb-6 shadow-[2px_2px_0px_#000]">
                  <div 
                    className="h-full bg-brand-red border-r-2 border-slate-800 transition-all duration-300"
                    style={{ width: `${((activeIndex + 1) / totalQuestions) * 100}%` }}
                  />
                </div>

                {/* Question Info */}
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center gap-2 text-brand-red font-heading font-black text-xs uppercase tracking-wider">
                    <HelpCircle size={14} /> QUESTION {activeIndex + 1} OF {totalQuestions}
                  </div>
                  <h3 className="font-body font-black text-lg md:text-2xl text-slate-800 leading-relaxed select-text">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Option Choices */}
                <div className="flex flex-col gap-4 mb-8">
                  {currentQuestion.options.map((opt, optIdx) => {
                    const isSelected = selectedOptionIdx === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(optIdx)}
                        className={`w-full p-4 md:p-5 border-2 md:border-3 text-left font-body text-sm md:text-base rounded-xl transition-all duration-150 leading-relaxed select-none flex items-start gap-4 cursor-pointer ${
                          isSelected 
                            ? 'bg-brand-red-light border-brand-red text-slate-800 font-bold shadow-[4px_4px_0px_#000] translate-x-[1px] translate-y-[1px]' 
                            : 'bg-white border-slate-800 hover:bg-slate-50 text-slate-800 shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000]'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg border-2 border-slate-800 flex items-center justify-center font-heading font-black text-sm shrink-0 transition-colors ${
                          isSelected ? 'bg-brand-red text-white' : 'bg-slate-100 text-brand-red'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 mt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Card Footer / Submit Action */}
                <div className="border-t-2 border-dashed border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-5 md:p-6 rounded-b-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-heading font-bold uppercase hidden sm:flex">
                    <Info size={14} className="text-slate-500" /> Progress locked upon selection
                  </div>
                  <div className="w-full sm:w-auto">
                    <button
                      disabled={selectedOptionIdx === null || submitting}
                      onClick={handleNext}
                      className="bg-brand-red text-white font-heading font-black uppercase tracking-wider text-xs md:text-sm px-8 py-3.5 border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-brand-red-dark select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                      {submitting 
                        ? 'SUBMITTING...' 
                        : activeIndex === totalQuestions - 1 
                        ? 'SUBMIT ASSESSMENT' 
                        : 'NEXT QUESTION'} 
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default MCQTest;
