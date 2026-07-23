import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Lock, 
  Check, 
  ChevronRight, 
  HelpCircle,
  Play,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Bookmark,
  ChevronLeft
} from 'lucide-react';

export const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const assignmentId = location.state?.assignmentId;

  const {
    currentCourse,
    currentLevelIndex,
    completedLevels,
    xp,
    streak,
    isMcqUnlocked,
    startCourse,
    completeLevel,
    nextLevel,
    selectLevelIndex,
    addXp,
    incrementStreak,
    resetStreak
  } = useGameStore();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [levelCompletedNow, setLevelCompletedNow] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(!currentCourse);

  useEffect(() => {
    if (!currentCourse && courseId) {
      const fetchCourseDoc = async () => {
        setLoadingCourse(true);
        try {
          const docSnap = await getDoc(doc(db, 'courses', courseId));
          if (docSnap.exists()) {
            startCourse({ id: docSnap.id, ...docSnap.data() });
          } else {
            navigate('/employee/dashboard');
          }
        } catch (err) {
          console.error("Error fetching course in player:", err);
          navigate('/employee/dashboard');
        } finally {
          setLoadingCourse(false);
        }
      };
      fetchCourseDoc();
    } else {
      setLoadingCourse(false);
    }
  }, [currentCourse, courseId, startCourse, navigate]);
  
  const fallbackLevel = {
    id: 'sec-fallback-1',
    title: 'Game 1: Interactive Term Flashcard Challenge',
    gameType: 'flashcards',
    content: currentCourse?.description || 'Review operational process guidelines extracted from process documentation.',
    keyTerms: [
      { term: "Standard Operating Procedure", definition: "Mandatory instructions to execute daily tasks efficiently." },
      { term: "Quality Assurance SLA", definition: "Service level agreement measuring quality metrics." },
      { term: "Escalation Matrix", definition: "Hierarchical protocol of routing complex issues." },
      { term: "Customer Satisfaction", definition: "Key performance metric measuring client happiness." },
      { term: "Data Privacy & Compliance", definition: "Security protocols protecting confidential user data." }
    ]
  };

  const activeLevel = currentCourse?.sections?.[currentLevelIndex] || currentCourse?.sections?.[0] || fallbackLevel;
  const totalLevels = Math.max(1, currentCourse?.sections?.length || 1);

  // Trigger Level Complete Confetti
  const triggerConfetti = () => {
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error(e);
      }
    }

    // Heavy confetti explosion
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#8B1D1D', '#FFFDF9', '#FFC93C', '#111111']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#8B1D1D', '#FFFDF9', '#FFC93C', '#111111']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleFinishLevel = () => {
    setLevelCompletedNow(true);
    completeLevel(currentLevelIndex);
    triggerConfetti();
  };

  const handleNextLevelClick = () => {
    setLevelCompletedNow(false);
    if (currentLevelIndex < totalLevels - 1) {
      nextLevel();
    }
  };

  const handleMcqRedirect = async () => {
    if (assignmentId) {
      try {
        const asnRef = doc(db, 'assignments', assignmentId);
        await updateDoc(asnRef, { status: 'in-progress' });
      } catch (err) {
        console.error("Error setting assignment in-progress:", err);
      }
    }
    navigate(`/employee/course/${courseId}/quiz`, { state: { assignmentId } });
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden font-body text-slate-800 select-none">
        <BackgroundParticles />
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 z-10">
          <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[3px_3px_0px_#000] mb-4" />
          <span className="font-heading font-black text-sm text-slate-800 uppercase animate-pulse">Loading Training Levels...</span>
        </div>
      </div>
    );
  }

  if (!currentCourse || !activeLevel) return null;

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden font-body text-slate-800 select-none">
      <BackgroundParticles />
      <Sidebar />
      
      <div className="flex-1 p-4 md:p-6 flex flex-col max-w-7xl w-full mx-auto z-10">
        
        <header className="w-full card-brutal bg-white p-3 md:p-4 flex flex-col gap-3 z-10 mb-6 border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="border-2 border-ink-black p-2 bg-brand-red rounded-xl text-white shadow-brutal-sm">
              <svg width="24" height="24" viewBox="0 0 100 100" class="flex-shrink-0 animate-wiggle">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#FFFFFF" strokeWidth={10} />
                <path d="M 50 15 A 35 35 0 1 1 20 40 L 40 45 A 15 15 0 1 0 50 30 Z" fill="#FFFFFF" />
                <circle cx="50" cy="50" r="10" fill="#FFFFFF" />
              </svg>
            </div>
            <div class="flex flex-col flex-1 overflow-hidden">
              <h2 class="font-heading font-black text-sm md:text-base uppercase tracking-tight truncate leading-none">{currentCourse.title}</h2>
              <span class="text-[10px] text-gray-500 font-heading font-bold uppercase tracking-wider mt-1.5 truncate">
                LEVEL {currentLevelIndex + 1} OF {totalLevels} — {activeLevel.title}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-3 md:gap-4 select-none w-full md:w-auto justify-end">
            {/* Streak Badge */}
            <span class="badge-brutal bg-orange-100 text-orange-600 border-orange-600 text-xs md:text-sm gap-1 py-1.5 px-3 md:py-2 md:px-4 shadow-[0_0_10px_rgba(234,88,12,0.2)]">
              <Flame size={16} fill="currentColor" class="animate-pulse" /> <span class="font-black">{streak} STREAK</span>
            </span>
            {/* Sound Toggle */}
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              class="p-2 border-2 border-ink-black rounded-lg bg-white hover:bg-gray-100 shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div class="w-full bg-gray-200 h-2 rounded-full border-2 border-ink-black overflow-hidden mt-1">
          <div 
            class="h-full bg-success-green transition-all duration-500 ease-out"
            style={{ width: `${Math.max(5, (completedLevels.length / totalLevels) * 100)}%` }}
          />
        </div>
      </header>

      {/* 2. Main Game Body */}
      <main class="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch z-10 pb-10">
        
        {/* Left Side: Arcade Quest Map Stepper (WINDING PATH) */}
        <div class="card-brutal bg-[#111] text-white lg:col-span-1 flex flex-col overflow-hidden lg:max-h-[calc(100vh-140px)] relative rounded-2xl border-4 border-ink-black shadow-brutal-lg" style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          
          {/* Map Header */}
          <div class="sticky top-0 bg-[#111]/90 backdrop-blur-md z-30 p-4 border-b-4 border-ink-black flex items-center justify-center gap-2">
            <svg class="w-5 h-5 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
            <h3 class="font-heading font-black text-base uppercase tracking-widest text-white">QUEST MAP</h3>
          </div>
          
          {/* Winding Path container */}
          <div class="flex-1 overflow-y-auto px-6 py-10 relative">
            
            {/* The SVG Winding Line (Dynamic based on node count, simplified for CSS positioning) */}
            <div class="absolute top-12 bottom-12 left-1/2 -translate-x-1/2 w-0.5 bg-ink-black/50 z-0 hidden md:block"></div>
            
            <div class="flex flex-col gap-10 relative z-10 w-full">
              {currentCourse.sections.map((sec, idx) => {
                const isCompleted = completedLevels.includes(idx);
                const isCurrent = currentLevelIndex === idx;
                const isLocked = idx > completedLevels.length;
                const alignLeft = idx % 2 === 0;

                return (
                  <div 
                    key={sec.id} 
                    class={`flex items-center relative transition-all duration-300 w-full ${
                      alignLeft ? 'flex-row' : 'flex-row-reverse'
                    } ${isLocked ? 'opacity-40 grayscale' : 'opacity-100'}`}
                  >
                    
                    {/* SVG Connector Line */}
                    <div class="absolute top-1/2 left-0 w-full h-1 bg-ink-black/30 -z-10 rounded-full" />
                    
                    {/* Node Circle */}
                    <button
                      disabled={isLocked}
                      onClick={() => {
                        setLevelCompletedNow(false);
                        selectLevelIndex(idx);
                      }}
                      class={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-heading font-black text-lg transition-all flex-shrink-0 relative z-20 ${
                        isCurrent 
                          ? 'bg-brand-red text-white border-white scale-125 shadow-[0_0_20px_rgba(234,40,63,0.6)] animate-pulse-border ring-4 ring-brand-red/50' 
                          : isCompleted 
                          ? 'bg-success-green text-white border-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' 
                          : 'bg-gray-800 text-gray-400 border-gray-600 hover:scale-105 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {isCompleted ? <Check size={24} strokeWidth={4} /> : isLocked ? <Lock size={20} /> : idx + 1}
                    </button>

                    {/* Spacer for winding layout */}
                    <div class="w-4 flex-shrink-0"></div>

                    {/* Node Title Card */}
                    <div 
                      onClick={() => {
                        if (!isLocked) {
                          setLevelCompletedNow(false);
                          selectLevelIndex(idx);
                        }
                      }}
                      class={`flex-1 p-3 border-2 border-ink-black rounded-xl cursor-pointer transition-all max-w-[calc(100%-4.5rem)] relative overflow-visible ${
                        isCurrent 
                          ? 'bg-white text-ink-black shadow-brutal-sm scale-105' 
                          : isCompleted
                          ? 'bg-gray-800 border-gray-600 text-gray-200'
                          : 'bg-gray-900 border-gray-700 text-gray-500'
                      }`}
                    >
                      {/* Triangle pointer */}
                      <div class={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 border-b-2 border-l-2 border-ink-black ${
                        alignLeft ? '-left-[7px] border-t-0 border-r-0' : '-right-[7px] border-b-0 border-l-0 border-t-2 border-r-2'
                      } ${isCurrent ? 'bg-white' : isCompleted ? 'bg-gray-800 border-gray-600' : 'bg-gray-900 border-gray-700'}`}></div>
                      
                      <div class="flex flex-col relative z-10">
                        <span class={`text-[9px] font-heading font-black uppercase leading-none ${isCurrent ? 'text-brand-red' : 'text-gray-400'}`}>LEVEL {idx + 1}</span>
                        <h4 class="font-heading font-black text-xs md:text-sm uppercase truncate mt-1 leading-tight">{sec.title}</h4>
                        <span class={`text-[9px] font-heading font-bold uppercase mt-1 ${isCurrent ? 'text-gray-500' : 'text-gray-500'}`}>
                          {sec.gameType === 'flashcards' ? '📚 STUDY' : sec.gameType === 'match' ? '🧩 MATCH' : '👾 BATTLE'}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Graded Exam Node - Golden Boss Style */}
          <div class="bg-gradient-to-b from-transparent to-[#111] p-4 sticky bottom-0 z-30 border-t-4 border-ink-black/50 backdrop-blur-md">
            <button
              disabled={!isMcqUnlocked}
              onClick={handleMcqRedirect}
              class={`w-full py-4 border-4 border-ink-black font-heading font-black text-sm uppercase tracking-widest rounded-xl transition-all text-center flex items-center justify-center gap-3 relative overflow-hidden group ${
                isMcqUnlocked 
                  ? 'bg-warning-yellow text-ink-black shadow-brutal hover:-translate-y-1 hover:shadow-brutal-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-none' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed border-dashed'
              }`}
            >
              {isMcqUnlocked && (
                <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              )}
              <Sparkles size={20} class={isMcqUnlocked ? 'animate-pulse text-brand-red' : ''} /> 
              {isMcqUnlocked ? 'FINAL BOSS EXAM' : 'EXAM LOCKED'}
            </button>
          </div>
        </div>

        {/* Right Side: Active Level Game Board */}
        <div class="lg:col-span-3 flex flex-col gap-6 items-stretch">
          
          {/* Level study materials summary - NOTEBOOK STYLE */}
          <div class="card-brutal bg-[#f9f5eb] border-4 border-ink-black p-6 md:p-8 relative overflow-hidden shadow-brutal">
            {/* Binder holes */}
            <div class="absolute left-4 top-0 bottom-0 flex flex-col justify-evenly">
              {[...Array(6)].map((_, i) => (
                <div key={i} class="w-4 h-4 rounded-full bg-ink-black border-2 border-white/50 shadow-inner"></div>
              ))}
            </div>
            
            <div class="pl-8">
              <div class="flex items-center gap-2 text-ink-black font-heading font-black text-sm md:text-base uppercase mb-4 border-b-2 border-ink-black/20 pb-2">
                <BookOpen size={22} class="text-brand-red" /> 
                <span class="tracking-widest">FIELD NOTES</span>
              </div>
              
              <div class="relative">
                {/* Notebook lines */}
                <div class="absolute inset-0 bg-[linear-gradient(transparent_23px,#cbd5e1_24px)] bg-[length:100%_24px] opacity-60 -z-10"></div>
                <p class="font-serif text-base md:text-lg text-ink-black leading-[24px] select-text py-1 relative z-10">
                  {activeLevel.content}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Game Shell */}
          <div class="card-brutal bg-white flex-1 flex flex-col p-6 md:p-10 min-h-[500px] relative overflow-hidden border-4 border-ink-black shadow-brutal-lg">
            
            <AnimatePresence mode="wait">
              {levelCompletedNow ? (
                // Level complete stamp overlay
                <motion.div 
                  initial={{ scale: 0.1, rotate: -35, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', damping: 10, stiffness: 80 } }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  class="absolute inset-0 z-40 flex flex-col items-center justify-center text-center p-6 bg-white/90 backdrop-blur-md"
                >
                  <div class="border-4 border-ink-black bg-success-green text-white font-heading font-black text-4xl md:text-6xl uppercase tracking-widest px-10 md:px-14 py-8 md:py-10 rounded-3xl rotate-[-6deg] shadow-[8px_8px_0px_0px_#111] mb-10 flex flex-col md:flex-row items-center gap-6 animate-bounce hover:scale-105 transition-transform">
                    <CheckCircle2 size={64} strokeWidth={4} /> 
                    <span class="drop-shadow-md">STAGE CLEARED!</span>
                  </div>
                  <p class="font-body text-xl md:text-2xl text-ink-black mb-12 max-w-md font-black bg-green-100 p-6 border-4 border-ink-black rounded-2xl shadow-brutal">
                    Outstanding work! You earned <br/><strong class="text-success-green font-black text-4xl block mt-2 animate-pulse">+100 XP</strong>
                  </p>

                  <div class="flex gap-4">
                    {currentLevelIndex < totalLevels - 1 ? (
                      <button onClick={handleNextLevelClick} class="btn-brutal-primary text-sm md:text-base py-4 px-8 flex items-center gap-2">
                        NEXT LEVEL <ChevronRight size={20} strokeWidth={3} />
                      </button>
                    ) : (
                      <button onClick={handleMcqRedirect} class="btn-brutal-yellow text-sm md:text-base py-4 px-8 text-ink-black flex items-center gap-2">
                        <Sparkles size={20} strokeWidth={3} /> UNLOCK FINAL EXAM
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key={currentLevelIndex + '_' + activeLevel.gameType}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  class="flex-1 flex flex-col justify-between h-full"
                >
                  {/* A. FLASHCARDS */}
                  {activeLevel.gameType === 'flashcards' && (
                    <FlashcardGame 
                      keyTerms={activeLevel.keyTerms} 
                      onFinish={handleFinishLevel} 
                      sound={soundEnabled}
                    />
                  )}

                  {/* B. MEMORY MATCH GAME */}
                  {activeLevel.gameType === 'match' && (
                    <MemoryMatchGame 
                      keyTerms={activeLevel.keyTerms} 
                      onFinish={handleFinishLevel} 
                      sound={soundEnabled}
                      addXp={addXp}
                      incrementStreak={incrementStreak}
                      resetStreak={resetStreak}
                    />
                  )}

                  {/* C. ARCADE BOSS BATTLE */}
                  {activeLevel.gameType === 'recall' && (
                    <RetroArcadeRecallGame 
                      keyTerms={activeLevel.keyTerms} 
                      onFinish={handleFinishLevel} 
                      sound={soundEnabled}
                      addXp={addXp}
                      incrementStreak={incrementStreak}
                      resetStreak={resetStreak}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </main>

    </div>

  </div>
);
};

/* ---------------------------------------------------- */
/* MINI-GAME 1: FLASHCARDS, TRUE/FALSE & READ ALOUD    */
/* ---------------------------------------------------- */
const FlashcardGame = ({ keyTerms, onFinish, sound }) => {
  const [subStage, setSubStage] = useState(1); // 1: 5 Flip Cards | 2: 5 True/False | 3: 5 Read Aloud Cards

  // Stage 1 State: 5 Flip Cards
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flippedSet, setFlippedSet] = useState(new Set());

  // Stage 2 State: 5 True/False Questions
  const [tfIndex, setTfIndex] = useState(0);
  const [tfScore, setTfScore] = useState(0);
  const [tfFeedback, setTfFeedback] = useState(null);

  // Stage 3 State: 5 Read Aloud Cards
  const [readIndex, setReadIndex] = useState(0);
  const [isReadingAudio, setIsReadingAudio] = useState(false);

  // Prepare 5 terms
  const terms5 = (keyTerms && keyTerms.length >= 5) 
    ? keyTerms.slice(0, 5) 
    : [
        ...(keyTerms || []),
        { term: "Standard Operating Procedure", definition: "Mandatory instructions to execute daily tasks efficiently." },
        { term: "Quality Assurance SLA", definition: "Service level agreement measuring quality metrics." },
        { term: "Escalation Matrix", definition: "Hierarchical protocol of routing complex issues." },
        { term: "Customer Satisfaction", definition: "Key performance metric measuring client happiness." },
        { term: "Data Privacy & Compliance", definition: "Security protocols protecting confidential user data." }
      ].slice(0, 5);

  // Generate 5 True/False Questions
  const tfQuestions = terms5.map((t, idx) => {
    const isTrue = idx % 2 === 0;
    const oppositeTerm = terms5[(idx + 1) % terms5.length];
    return {
      statement: isTrue 
        ? `True or False: "${t.term}" refers to: "${t.definition}"` 
        : `True or False: "${t.term}" refers to: "${oppositeTerm.definition}"`,
      isCorrectTrue: isTrue,
      explanation: isTrue 
        ? `Correct! "${t.term}" is defined as: "${t.definition}"`
        : `False! "${t.term}" actually means: "${t.definition}"`
    };
  });

  // Stage 1 Handlers
  const handleCardFlip = () => {
    setFlipped(!flipped);
    setFlippedSet(prev => new Set([...prev, cardIndex]));
  };

  const handleNextCard = () => {
    if (cardIndex < 4) {
      setCardIndex(cardIndex + 1);
      setFlipped(false);
    } else {
      setSubStage(2); // Advance to 5 True/False
    }
  };

  const handlePrevCard = () => {
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
      setFlipped(false);
    }
  };

  // Stage 2 Handlers: True/False
  const handleTfAnswer = (userChoice) => {
    const q = tfQuestions[tfIndex];
    const isRight = (userChoice === q.isCorrectTrue);

    if (isRight) {
      setTfScore(prev => prev + 1);
      setTfFeedback({ type: 'success', text: `✔ ${q.explanation}` });
    } else {
      setTfFeedback({ type: 'error', text: `✖ Incorrect! ${q.explanation}` });
    }

    setTimeout(() => {
      setTfFeedback(null);
      if (tfIndex < 4) {
        setTfIndex(tfIndex + 1);
      } else {
        setSubStage(3); // Advance to 5 Read Aloud Cards
      }
    }, 1800);
  };

  // Stage 3 Handlers: Read Aloud
  const handleSpeakReadCard = (text) => {
    if (typeof window === 'undefined') return;
    setIsReadingAudio(true);

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = 1.0;
        utterance.rate = 0.95;
        utterance.onend = () => setIsReadingAudio(false);
        utterance.onerror = () => setIsReadingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
      
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
      const audio = new Audio(ttsUrl);
      audio.volume = 1.0;
      audio.onended = () => setIsReadingAudio(false);
      audio.play().catch(() => {});
    } catch (e) {
      setIsReadingAudio(false);
    }
  };

  const handleNextReadCard = () => {
    if (readIndex < 4) {
      setReadIndex(readIndex + 1);
    } else {
      onFinish(); // Complete Game 1
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center w-full max-w-3xl mx-auto h-full py-2">
      
      {/* Sub-Stage Indicator Header */}
      <div className="flex flex-col items-center w-full mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-3 py-1 rounded-full border-2 border-slate-800 text-[10px] font-heading font-black uppercase ${
            subStage === 1 ? 'bg-brand-red text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-slate-500'
          }`}>
            STAGE 1: 5 FLIP TILES
          </span>
          <span className={`px-3 py-1 rounded-full border-2 border-slate-800 text-[10px] font-heading font-black uppercase ${
            subStage === 2 ? 'bg-warning-yellow text-slate-800 shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-slate-500'
          }`}>
            STAGE 2: 5 TRUE/FALSE
          </span>
          <span className={`px-3 py-1 rounded-full border-2 border-slate-800 text-[10px] font-heading font-black uppercase ${
            subStage === 3 ? 'bg-success-green text-white shadow-[2px_2px_0px_#000]' : 'bg-slate-100 text-slate-500'
          }`}>
            STAGE 3: 5 FLIP & READ
          </span>
        </div>
      </div>

      {/* SUB-STAGE 1: 5 FLIP CARDS / TILES */}
      {subStage === 1 && (
        <div className="flex flex-col items-center w-full flex-1 justify-between">
          <h4 className="font-heading font-black text-base uppercase text-slate-800 text-center mb-4">
            FLIP ALL 5 VOCABULARY TILES ({flippedSet.size} / 5 FLIPPED)
          </h4>

          <div 
            onClick={handleCardFlip}
            className="w-full max-w-md h-64 cursor-pointer relative perspective-1000 select-none group my-2"
          >
            <motion.div 
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-full h-full absolute inset-0"
            >
              {/* Front of Card */}
              <div 
                style={{ backfaceVisibility: 'hidden' }}
                className="absolute inset-0 w-full h-full border-4 border-slate-800 rounded-3xl shadow-[6px_6px_0px_#000] bg-white flex flex-col items-center justify-center p-6 text-center"
              >
                <span className="text-[10px] font-heading font-black text-brand-red uppercase tracking-widest mb-2 bg-red-100 px-3 py-1 rounded-md border border-brand-red">
                  CARD {cardIndex + 1} OF 5
                </span>
                <h3 className="text-3xl font-heading font-black uppercase text-slate-800 leading-tight">
                  {terms5[cardIndex]?.term}
                </h3>
                <span className="mt-6 text-xs text-slate-800 font-heading font-black bg-warning-yellow px-4 py-2 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_#000]">
                  CLICK TILE TO FLIP
                </span>
              </div>

              {/* Back of Card */}
              <div 
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                className="absolute inset-0 w-full h-full border-4 border-slate-800 rounded-3xl shadow-[6px_6px_0px_#000] bg-brand-red text-white flex flex-col items-center justify-center p-6 text-center"
              >
                <span className="text-[10px] font-heading font-black text-white uppercase tracking-widest mb-2 bg-black/30 px-3 py-1 rounded-md">
                  DEFINITION
                </span>
                <p className="font-body text-base md:text-lg text-white font-bold leading-relaxed">
                  {terms5[cardIndex]?.definition}
                </p>
                <span className="mt-4 text-xs text-slate-800 font-heading font-black bg-white px-4 py-1.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_#000]">
                  FLIP BACK
                </span>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-between items-center w-full mt-4">
            <button 
              disabled={cardIndex === 0}
              onClick={handlePrevCard}
              className="border-3 border-slate-800 shadow-[3px_3px_0px_#000] rounded-xl px-4 py-2 font-heading font-black text-xs uppercase bg-white text-slate-800 disabled:opacity-40"
            >
              PREVIOUS
            </button>
            <span className="font-mono text-xs font-bold text-slate-500">TILE {cardIndex + 1} / 5</span>
            <button 
              onClick={handleNextCard}
              className="border-3 border-slate-800 shadow-[3px_3px_0px_#000] rounded-xl px-5 py-2 font-heading font-black text-xs uppercase bg-brand-red text-white hover:bg-brand-red-dark"
            >
              {cardIndex === 4 ? 'STAGE 2: TRUE/FALSE →' : 'NEXT TILE →'}
            </button>
          </div>
        </div>
      )}

      {/* SUB-STAGE 2: 5 TRUE / FALSE QUESTIONS */}
      {subStage === 2 && (
        <div className="flex flex-col items-center w-full flex-1 justify-between">
          <h4 className="font-heading font-black text-base uppercase text-slate-800 text-center mb-2">
            STAGE 2: 5 TRUE / FALSE CHALLENGES (SCORE: {tfScore} / 5)
          </h4>

          <div className="w-full max-w-md bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_#000] flex flex-col items-center text-center my-4">
            <span className="text-[10px] font-heading font-black text-slate-500 uppercase tracking-widest mb-3 bg-slate-100 px-3 py-1 rounded-md border border-slate-300">
              QUESTION {tfIndex + 1} OF 5
            </span>
            <p className="font-body text-base md:text-lg font-bold text-slate-800 leading-relaxed mb-6">
              {tfQuestions[tfIndex]?.statement}
            </p>

            {tfFeedback ? (
              <div className={`p-4 rounded-xl border-2 border-slate-800 font-heading font-black text-xs uppercase w-full ${
                tfFeedback.type === 'success' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-brand-red'
              }`}>
                {tfFeedback.text}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => handleTfAnswer(true)}
                  className="bg-success-green text-white py-4 font-heading font-black text-base uppercase rounded-2xl border-3 border-slate-800 shadow-[4px_4px_0px_#000] hover:bg-green-700 active:translate-x-[2px] active:translate-y-[2px]"
                >
                  ✔ TRUE
                </button>
                <button
                  onClick={() => handleTfAnswer(false)}
                  className="bg-brand-red text-white py-4 font-heading font-black text-base uppercase rounded-2xl border-3 border-slate-800 shadow-[4px_4px_0px_#000] hover:bg-brand-red-dark active:translate-x-[2px] active:translate-y-[2px]"
                >
                  ✖ FALSE
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-STAGE 3: 5 FLIP & READ VOICE CARDS */}
      {subStage === 3 && (
        <div className="flex flex-col items-center w-full flex-1 justify-between">
          <h4 className="font-heading font-black text-base uppercase text-slate-800 text-center mb-2">
            STAGE 3: 5 FLIP & READ AUDIO CARDS
          </h4>

          <div className="w-full max-w-md bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_#000] flex flex-col items-center text-center my-4 relative">
            <span className="text-[10px] font-heading font-black text-brand-red uppercase tracking-widest mb-2 bg-red-100 px-3 py-1 rounded-md border border-brand-red">
              READ & LISTEN CARD {readIndex + 1} OF 5
            </span>

            <h3 className="text-2xl font-heading font-black uppercase text-slate-800 mb-2">
              {terms5[readIndex]?.term}
            </h3>
            
            <p className="font-body text-sm font-bold text-slate-600 leading-relaxed mb-4 bg-slate-50 p-4 border-2 border-slate-800 rounded-xl">
              "{terms5[readIndex]?.definition}"
            </p>

            <button 
              onClick={() => handleSpeakReadCard(`${terms5[readIndex]?.term}. ${terms5[readIndex]?.definition}`)}
              className="bg-warning-yellow text-slate-800 font-heading font-black text-xs uppercase px-6 py-3 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_#000] hover:bg-warning-yellow-dark flex items-center gap-2 cursor-pointer mb-2"
            >
              <Volume2 size={18} className={isReadingAudio ? 'animate-pulse text-brand-red' : ''} />
              {isReadingAudio ? 'READING ALOUD...' : '🔊 LISTEN & READ ALOUD'}
            </button>
          </div>

          <div className="flex justify-between items-center w-full mt-2">
            <span className="font-mono text-xs font-bold text-slate-500">CARD {readIndex + 1} / 5</span>
            <button 
              onClick={handleNextReadCard}
              className="border-3 border-slate-800 shadow-[3px_3px_0px_#000] rounded-xl px-6 py-2.5 font-heading font-black text-xs uppercase bg-success-green text-white hover:bg-green-700 cursor-pointer"
            >
              {readIndex === 4 ? 'FINISH GAME 1 ✔' : 'NEXT READ CARD →'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

/* ---------------------------------------------------- */
/* MINI-GAME 2: MEMORY MATCH GAME (REWRITTEN)           */
/* ---------------------------------------------------- */
const MemoryMatchGame = ({ keyTerms, onFinish, sound, addXp, incrementStreak, resetStreak }) => {
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]); // Array of selected indexes
  const [wrongFlash, setWrongFlash] = useState(false);

  useEffect(() => {
    const list = [];
    keyTerms.forEach((item, idx) => {
      // Card for Term
      list.push({ 
        id: `term-${idx}`, 
        type: 'term', 
        val: item.term, 
        keyId: idx, 
        flipped: false, 
        matched: false 
      });
      // Card for Definition
      list.push({ 
        id: `def-${idx}`, 
        type: 'def', 
        val: item.definition, 
        keyId: idx, 
        flipped: false, 
        matched: false 
      });
    });
    // Shuffle the cards
    setCards([...list].sort(() => Math.random() - 0.5));
    setSelected([]);
    setWrongFlash(false);
  }, [keyTerms]);

  const handleCardClick = (idx) => {
    if (cards[idx].matched || cards[idx].flipped || selected.length >= 2 || wrongFlash) return;

    // Flip card up
    const updatedCards = [...cards];
    updatedCards[idx].flipped = true;
    setCards(updatedCards);

    const nextSelected = [...selected, idx];
    setSelected(nextSelected);

    if (nextSelected.length === 2) {
      const first = cards[nextSelected[0]];
      const second = cards[nextSelected[1]];

      if (first.keyId === second.keyId) {
        // MATCH FOUND!
        setTimeout(() => {
          const finalCards = updatedCards.map((c, i) => {
            if (i === nextSelected[0] || i === nextSelected[1]) {
              return { ...c, matched: true };
            }
            return c;
          });
          setCards(finalCards);
          setSelected([]);
          addXp(15);
          incrementStreak();
          if (sound) {
            playArcadeBeep(800, 0.15);
          }
        }, 300);
      } else {
        // MISMATCH
        setWrongFlash(true);
        if (sound) {
          playArcadeBeep(160, 0.35);
        }
        setTimeout(() => {
          const finalCards = updatedCards.map((c, i) => {
            if (i === nextSelected[0] || i === nextSelected[1]) {
              return { ...c, flipped: false };
            }
            return c;
          });
          setCards(finalCards);
          setSelected([]);
          setWrongFlash(false);
          resetStreak();
        }, 900);
      }
    }
  };

  const playArcadeBeep = (freq, duration = 0.15) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const allMatched = cards.length > 0 && cards.every(c => c.matched);

  return (
    <div class="flex-1 flex flex-col justify-between py-4 h-full">
      <div class="flex flex-col items-center">
        <span class="badge-brutal bg-brand-red text-white border-ink-black text-[10px] mb-3 px-3 py-1 animate-pulse">MINI-GAME: MEMORY MATCH</span>
        <h4 class="font-heading font-black text-base md:text-lg uppercase mt-1 mb-8 text-center text-ink-black">
          Flip cards to match the term with its description
        </h4>

        {/* 4-column responsive matching board */}
        <div class="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 select-none p-2">
          {cards.map((card, idx) => {
            const isSelected = selected.includes(idx);
            const showFace = card.flipped || card.matched;
            
            return (
              <div 
                key={card.id}
                onClick={() => handleCardClick(idx)}
                class="h-32 md:h-40 perspective-1000 cursor-pointer relative select-none group"
              >
                <motion.div
                  animate={{ rotateY: showFace ? 180 : 0, y: (isSelected && !card.matched) ? -8 : 0 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                  style={{ transformStyle: 'preserve-3d' }}
                  class="w-full h-full absolute inset-0 group-hover:-translate-y-2 transition-transform duration-300"
                >
                  {/* Card Back (Face Down) */}
                  <div 
                    style={{ backfaceVisibility: 'hidden' }}
                    class="absolute inset-0 border-4 border-ink-black rounded-xl bg-white shadow-brutal hover:shadow-brutal-lg flex items-center justify-center bg-dots group-hover:bg-brand-red-light transition-colors duration-300"
                  >
                    <div class="w-10 h-10 rounded-full border-4 border-ink-black bg-brand-red flex items-center justify-center font-heading font-black text-white text-xl shadow-inner">
                      ?
                    </div>
                  </div>

                  {/* Card Front (Face Up) */}
                  <div 
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    class={`absolute inset-0 border-4 border-ink-black rounded-xl flex items-center justify-center p-4 text-center leading-tight transition-colors duration-300 shadow-brutal overflow-hidden ${
                      card.matched 
                        ? 'bg-success-green border-ink-black text-white' 
                        : isSelected 
                        ? 'bg-brand-red border-ink-black text-white ring-4 ring-brand-red/30'
                        : wrongFlash && isSelected
                        ? 'bg-error-red border-ink-black text-white animate-shake'
                        : 'bg-white text-ink-black'
                    }`}
                  >
                    {card.matched && (
                      <div class="absolute inset-0 bg-stripes opacity-20 pointer-events-none"></div>
                    )}
                    <div class="flex flex-col items-center relative z-10 w-full h-full justify-center">
                      {card.type === 'term' ? (
                        <>
                          <span class={`text-[10px] font-heading font-black uppercase mb-1.5 px-2 py-0.5 rounded border-2 ${card.matched || isSelected ? 'bg-black/20 border-white/30 text-white' : 'text-brand-red bg-brand-red-light border-brand-red/20'}`}>TERM</span>
                          <span class={`font-heading font-black text-sm uppercase leading-tight break-words drop-shadow-sm ${card.matched || isSelected ? 'text-white' : 'text-ink-black'}`}>{card.val}</span>
                        </>
                      ) : (
                        <>
                          <span class={`text-[10px] font-heading font-black uppercase mb-1.5 px-2 py-0.5 rounded border-2 ${card.matched || isSelected ? 'bg-black/20 border-white/30 text-white' : 'text-gray-500 bg-gray-100 border-gray-300'}`}>DEFINITION</span>
                          <span class={`font-body text-xs font-bold leading-snug line-clamp-4 overflow-hidden text-ellipsis ${card.matched || isSelected ? 'text-white' : 'text-ink-black'}`}>{card.val}</span>
                        </>
                      )}
                    </div>
                    {card.matched && (
                      <Sparkles class="absolute top-2 right-2 text-warning-yellow animate-spin-slow opacity-80" size={20} />
                    )}
                  </div>

                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <div class="flex justify-between items-center border-t-3 border-ink-black pt-6 mt-10">
        <span class="font-heading font-black text-sm uppercase bg-white px-4 py-2 border-2 border-ink-black rounded-xl shadow-brutal-sm">
          {cards.filter(c => c.matched).length / 2} OF {keyTerms.length} PAIRS FOUND
        </span>
        {allMatched ? (
          <button onClick={onFinish} class="btn-brutal-green text-sm py-4 px-8 animate-pulse-border flex items-center gap-2">
            <CheckCircle2 size={20} strokeWidth={3} /> COMPLETE LEVEL
          </button>
        ) : (
          <span class="text-xs font-heading font-black text-gray-500 uppercase bg-gray-100 border-2 border-dashed border-gray-300 px-4 py-3 rounded-xl">
             Match all cards to finish
          </span>
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------------- */
/* MINI-GAME 3: RETRO ARCADE BOSS FIGHT (REWRITTEN)     */
/* ---------------------------------------------------- */
const RetroArcadeRecallGame = ({ keyTerms, onFinish, sound, addXp, incrementStreak, resetStreak }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [quizDone, setQuizDone] = useState(false);
  
  // HP states
  const [bossHp, setBossHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  
  // Damage indicators
  const [bossHit, setBossHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);

  useEffect(() => {
    setupGame();
  }, [keyTerms]);

  const setupGame = () => {
    const list = [];
    keyTerms.forEach((item, idx) => {
      const isTrue = Math.random() > 0.5;
      if (isTrue || keyTerms.length === 1) {
        list.push({
          term: item.term,
          def: item.definition,
          isCorrect: true
        });
      } else {
        const otherIdx = (idx + 1) % keyTerms.length;
        list.push({
          term: item.term,
          def: keyTerms[otherIdx].definition,
          isCorrect: false
        });
      }
    });
    setQuestions(list);
    setCurrentQIndex(0);
    setTimeLeft(15);
    setBossHp(100);
    setPlayerHp(100);
    setGameState('playing');
    setQuizDone(false);
  };

  // Timer loop
  useEffect(() => {
    if (gameState !== 'playing' || quizDone) return;
    if (timeLeft === 0) {
      handleAnswer(null); // Time out is incorrect
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, gameState, quizDone]);

  const handleAnswer = (choice) => {
    if (gameState !== 'playing') return;

    const q = questions[currentQIndex];
    const isCorrect = (choice === q.isCorrect);
    const dmgPerQuestion = Math.ceil(100 / questions.length);

    if (isCorrect) {
      // Hit Boss!
      setBossHit(true);
      setTimeout(() => setBossHit(false), 300);
      const nextBossHp = Math.max(0, bossHp - dmgPerQuestion);
      setBossHp(nextBossHp);
      
      addXp(20);
      incrementStreak();

      if (sound) {
        playBeep(600, 0.1);
        setTimeout(() => playBeep(850, 0.15), 100);
      }

      if (nextBossHp <= 0) {
        setGameState('won');
        setQuizDone(true);
        return;
      }
    } else {
      // Hit Player!
      setPlayerHit(true);
      setTimeout(() => setPlayerHit(false), 400);
      const nextPlayerHp = Math.max(0, playerHp - 34); // 3 strikes
      setPlayerHp(nextPlayerHp);

      resetStreak();

      if (sound) {
        playBeep(150, 0.35);
      }

      if (nextPlayerHp <= 0) {
        setGameState('lost');
        return;
      }
    }

    // Move to next question after action frames
    setTimeout(() => {
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(currentQIndex + 1);
        setTimeLeft(15);
      } else {
        if (bossHp > 0) {
          // If questions ended but player is alive, they win!
          setGameState('won');
          setQuizDone(true);
        }
      }
    }, 600);
  };

  const playBeep = (freq, duration) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const currentQ = questions[currentQIndex];
  const timerCritical = timeLeft <= 5;

  if (gameState === 'lost') {
    return (
      <div class="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-50/50 rounded-2xl border-4 border-error-red animate-shake min-h-[400px] select-none">
        <span class="text-error-red font-heading font-black text-5xl md:text-6xl uppercase tracking-widest animate-pulse">GAME OVER</span>
        <p class="font-body text-sm font-black text-gray-700 mt-4 max-w-sm">
          The Glitch Bug defeated you! Refresh your process guidelines and retry the battle.
        </p>
        <button 
          onClick={setupGame}
          class="btn-brutal-primary bg-brand-red text-white py-4 px-8 text-base font-black shadow-brutal hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] mt-8 flex items-center gap-2 border-4 border-ink-black animate-bounce rounded-2xl"
        >
          INSERT COIN / RETRY FIGHT 👾
        </button>
      </div>
    );
  }

  return (
    <div class="flex-1 flex flex-col justify-between py-4 h-full select-none">
      <div class="flex flex-col items-center w-full max-w-2xl mx-auto">
        <span class="badge-brutal bg-brand-red text-white border-ink-black text-[10px] mb-3 px-3 py-1">MINI-GAME: ARCADE BOSS FIGHT</span>
        <h4 class="font-heading font-black text-base md:text-lg uppercase mt-1 mb-6 text-center">Defeat the Process Glitch Bug!</h4>

        {/* HP BARS GRAPHIC PANEL */}
        <div class="w-full grid grid-cols-2 gap-6 md:gap-8 mb-10 mt-4 relative z-10">
          
          {/* VS Badge */}
          <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-warning-yellow border-4 border-ink-black rounded-full w-12 h-12 flex items-center justify-center font-heading font-black text-xl shadow-brutal rotate-12">
            VS
          </div>

          {/* Player HP */}
          <div class={`card-brutal p-4 bg-white flex flex-col gap-2 border-4 transition-all duration-300 ${playerHit ? 'bg-error-red/10 border-error-red animate-shake scale-95 shadow-none' : 'border-ink-black shadow-brutal'}`}>
            <div class="flex justify-between items-end">
              <span class="text-xs text-ink-black font-heading font-black uppercase tracking-widest bg-success-green/20 px-2 py-1 rounded">PLAYER</span>
              <span class="font-heading font-black text-sm text-success-green">{playerHp} / 100</span>
            </div>
            <div class="w-full h-6 border-4 border-ink-black bg-gray-200 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div 
                class="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${playerHp}%`, background: 'linear-gradient(90deg, #16a34a, #22c55e)' }}
              >
                <div class="absolute top-0 right-0 bottom-0 w-8 bg-white/30 skew-x-12 animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

          {/* Boss HP */}
          <div class={`card-brutal p-4 bg-white flex flex-col gap-2 border-4 transition-all duration-300 ${bossHit ? 'bg-error-red/20 border-error-red animate-shake scale-95 shadow-none' : 'border-ink-black shadow-brutal'}`}>
            <div class="flex justify-between items-end flex-row-reverse">
              <span class="text-xs text-ink-black font-heading font-black uppercase tracking-widest bg-error-red/20 px-2 py-1 rounded">GLITCH BUG</span>
              <span class="font-heading font-black text-sm text-error-red">{bossHp} / 100</span>
            </div>
            <div class="w-full h-6 border-4 border-ink-black bg-gray-200 rounded-full overflow-hidden p-0.5 shadow-inner flex justify-end">
              <div 
                class="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${bossHp}%`, background: 'linear-gradient(270deg, #dc2626, #ef4444)' }}
              >
                <div class="absolute top-0 left-0 bottom-0 w-8 bg-white/30 -skew-x-12 animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

        </div>

        {gameState === 'playing' && currentQ ? (
          <div class="w-full flex flex-col items-center">
            
            {/* Timer visual circle */}
            <div class="relative w-28 h-28 mb-8 flex items-center justify-center drop-shadow-md">
              <svg class="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="#E5E7EB" strokeWidth="10" fill="#fff" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  stroke={timerCritical ? '#dc2626' : '#FFC93C'} 
                  strokeWidth={10} 
                  fill="transparent" 
                  strokeDasharray={301.59}
                  strokeDashoffset={301.59 - (301.59 * timeLeft) / 15}
                  class="transition-all duration-1000 ease-linear"
                  strokeLinecap="round"
                />
              </svg>
              <div class={`absolute inset-3 rounded-full border-4 border-ink-black flex flex-col items-center justify-center bg-white shadow-inner ${timerCritical ? 'animate-pulse bg-red-50' : ''}`}>
                <span class={`font-heading font-black text-2xl leading-none ${timerCritical ? 'text-error-red scale-110' : 'text-ink-black'}`}>
                  {timeLeft}
                </span>
                <span class="text-[9px] font-heading font-black text-gray-500 uppercase mt-0.5">SEC</span>
              </div>
            </div>

            {/* Question Card Console */}
            <div class={`w-full card-brutal bg-white p-6 md:p-8 text-center select-none border-4 transition-colors duration-300 ${playerHit ? 'bg-red-50 border-error-red animate-shake' : bossHit ? 'bg-green-50 border-success-green' : 'border-ink-black shadow-brutal-lg bg-dots'}`}>
              <span class="text-xs text-gray-500 font-heading font-bold uppercase tracking-widest block mb-3">SYSTEM EXCEPTION ENCOUNTERED</span>
              <h3 class="text-2xl md:text-3xl font-heading font-black uppercase text-brand-red mb-4 leading-tight break-words">{currentQ.term}</h3>
              <div class="border-t-3 border-dashed border-ink-black/10 mt-4 pt-4 bg-white p-3.5 rounded-xl border-2 border-ink-black/20">
                <p class="font-body text-sm md:text-base text-ink-black font-black leading-relaxed">"{currentQ.def}"</p>
              </div>
            </div>

            {/* Battle Buttons */}
            <div class="flex gap-6 w-full mt-8">
              <button 
                onClick={() => handleAnswer(false)}
                disabled={playerHit || bossHit}
                class="flex-1 btn-brutal-secondary py-4 text-error-red font-heading font-black text-base hover:bg-red-50 shadow-brutal hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all border-4 border-ink-black rounded-2xl"
              >
                FALSE
              </button>
              <button 
                onClick={() => handleAnswer(true)}
                disabled={playerHit || bossHit}
                class="flex-1 btn-brutal-primary py-4 bg-success-green hover:bg-green-600 font-heading font-black text-base shadow-brutal hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-white border-4 border-ink-black rounded-2xl"
              >
                TRUE
              </button>
            </div>

          </div>
        ) : (
          <div class="py-16 text-center select-none bg-dots p-8 border-4 border-ink-black shadow-brutal-lg rounded-3xl w-full bg-white mt-4">
            <CheckCircle2 size={64} class="text-success-green mx-auto mb-4 animate-bounce" strokeWidth={3} />
            <h4 class="font-heading font-black text-2xl uppercase mb-2">BOSS DEFEATED!</h4>
            <p class="font-body text-base text-gray-600 font-bold">Excellent! You cleared the system fault errors.</p>
          </div>
        )}
      </div>

      <div class="flex justify-between items-center border-t-3 border-ink-black pt-6 mt-10">
        <span class="font-heading font-black text-sm uppercase bg-white px-4 py-2 border-2 border-ink-black rounded-xl shadow-brutal-sm">
          BUG HP: {bossHp}%
        </span>
        {quizDone ? (
          <button onClick={onFinish} class="btn-brutal-green text-sm py-4 px-8 animate-pulse-border flex items-center gap-2">
            <CheckCircle2 size={20} strokeWidth={3} /> COMPLETE LEVEL
          </button>
        ) : (
          <span class="text-xs font-heading font-black text-gray-500 uppercase bg-gray-100 border-2 border-dashed border-gray-300 px-4 py-3 rounded-xl">
             Fight the Glitch
          </span>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
