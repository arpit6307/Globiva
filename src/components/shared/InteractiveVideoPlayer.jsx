import React, { useEffect, useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Tv,
  Lock,
  MessageSquare,
  Film,
  Zap,
  BookOpen,
  FastForward,
  Mic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { HeadingIntro } from '../visuals/HeadingIntro';
import { BulletList } from '../visuals/BulletList';
import { ComparisonTable } from '../visuals/ComparisonTable';
import { Timeline } from '../visuals/Timeline';
import { QuoteHighlight } from '../visuals/QuoteHighlight';
import { DiagramPlaceholder } from '../visuals/DiagramPlaceholder';
import { speechEngine } from '../../services/speechEngine';

export const InteractiveVideoPlayer = ({ videoModule, onComplete, initialCompleted = false }) => {
  const scenes = videoModule?.scenes || [];

  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [activeDialogueIdx, setActiveDialogueIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sceneFinished, setSceneFinished] = useState(initialCompleted);
  
  // Playback & Speech Controls
  const [speechRate, setSpeechRate] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  const currentScene = scenes[activeSceneIdx] || scenes[0];
  const dialogues = currentScene?.dialogues || [];
  const currentDialogue = dialogues[activeDialogueIdx] || dialogues[0];
  const totalScenes = scenes.length;

  // Load SpeechSynthesis Voices
  useEffect(() => {
    const updateVoices = () => {
      const voices = speechEngine.getAvailableVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !selectedVoiceName) {
        const defaultVoice = voices.find(v => v.lang.includes('en')) || voices[0];
        setSelectedVoiceName(defaultVoice.name);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Dynamically resolve Speaker 1 (Host) and Speaker 2 (Guest) from dialogue data
  const speaker1 = (dialogues && dialogues[0]) ? dialogues[0] : { speaker: "Trainer Sarah", role: "Subject Matter Expert", avatar: "👩‍💼" };
  const speaker2 = (dialogues && dialogues.length > 1) ? (dialogues.find(d => d && d.speaker !== speaker1.speaker) || dialogues[1]) : { speaker: "Agent Alex", role: "Quality Analyst", avatar: "👨‍💼" };

  const isSpeaker1Speaking = currentDialogue?.speaker === speaker1?.speaker;
  const isSpeaker2Speaking = currentDialogue?.speaker === speaker2?.speaker;

  // Progress Percentage
  const totalDialogues = scenes.reduce((acc, s) => acc + (s.dialogues?.length || 0), 0);
  const passedDialogues = scenes.slice(0, activeSceneIdx).reduce((acc, s) => acc + (s.dialogues?.length || 0), 0) + activeDialogueIdx;
  const progressPercent = Math.min(100, Math.round(((passedDialogues + 1) / Math.max(1, totalDialogues)) * 100));

  // Speak dialogue & narration strictly synced with SpeechSynthesis utterance.onend
  const triggerNarration = (dialogue) => {
    if (!dialogue || !voiceEnabled) return;

    const textToSpeak = dialogue.text || currentScene?.narration || "Reviewing official process documentation.";
    const selectedVoice = availableVoices.find(v => v.name === selectedVoiceName) || null;
    const isFemale = dialogue.voiceGender === 'female';
    const pitch = isFemale ? 1.25 : 0.85;

    speechEngine.speak(textToSpeak, {
      voice: selectedVoice,
      rate: speechRate,
      pitch,
      onEnd: () => {
        // Automatically advance dialogue / scene strictly when speech ends!
        if (activeDialogueIdx < dialogues.length - 1) {
          setActiveDialogueIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setSceneFinished(true);
          if (activeSceneIdx === totalScenes - 1) {
            setIsCompleted(true);
            if (onComplete) onComplete();
          }
        }
      },
      onError: () => {
        if (activeDialogueIdx < dialogues.length - 1) {
          setActiveDialogueIdx(prev => prev + 1);
        } else {
          setIsPlaying(false);
          setSceneFinished(true);
          if (activeSceneIdx === totalScenes - 1) {
            setIsCompleted(true);
            if (onComplete) onComplete();
          }
        }
      }
    });
  };

  // Playback effect
  useEffect(() => {
    if (isPlaying && currentDialogue) {
      triggerNarration(currentDialogue);
    } else {
      speechEngine.stop();
    }

    return () => {
      speechEngine.stop();
    };
  }, [isPlaying, activeDialogueIdx, activeSceneIdx, voiceEnabled, speechRate, selectedVoiceName]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      if (sceneFinished && activeDialogueIdx >= dialogues.length - 1) {
        setActiveDialogueIdx(0);
        setSceneFinished(false);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      speechEngine.pause();
    }
  };

  const handleNextScene = () => {
    speechEngine.stop();
    if (activeSceneIdx < totalScenes - 1) {
      setActiveSceneIdx(activeSceneIdx + 1);
      setActiveDialogueIdx(0);
      setSceneFinished(false);
      setIsPlaying(true);
    } else {
      setIsCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const handlePrevScene = () => {
    speechEngine.stop();
    if (activeSceneIdx > 0) {
      setActiveSceneIdx(activeSceneIdx - 1);
      setActiveDialogueIdx(0);
      setSceneFinished(false);
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    speechEngine.stop();
    setActiveSceneIdx(0);
    setActiveDialogueIdx(0);
    setSceneFinished(false);
    setIsPlaying(true);
  };

  if (!videoModule || scenes.length === 0) return null;

  // Render Visual Component Template matching scene.visualType
  const renderVisualTemplate = () => {
    const vType = currentScene?.visualType;
    const vData = currentScene?.visualData;

    switch (vType) {
      case 'heading-intro':
        return <HeadingIntro visualData={vData} speaker1={speaker1} speaker2={speaker2} isSpeaker1Speaking={isSpeaker1Speaking} isSpeaker2Speaking={isSpeaker2Speaking} />;
      case 'bullet-list':
        return <BulletList visualData={vData} />;
      case 'comparison-table':
        return <ComparisonTable visualData={vData} />;
      case 'timeline':
        return <Timeline visualData={vData} />;
      case 'quote-highlight':
        return <QuoteHighlight visualData={vData} />;
      case 'diagram-placeholder':
        return <DiagramPlaceholder visualData={vData} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-2 md:my-4 z-10 items-center">
            {/* Character 1 */}
            <motion.div 
              animate={isSpeaker1Speaking ? { scale: 1.04, y: [0, -6, 0] } : { scale: 0.95, opacity: 0.7 }}
              className={`border-3 border-slate-700 rounded-2xl p-4 bg-slate-900/90 flex items-center gap-4 relative shadow-[4px_4px_0px_#000] transition-all ${
                isSpeaker1Speaking ? 'border-brand-red ring-4 ring-brand-red/40 bg-slate-850' : ''
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 border-2 border-slate-800 flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000]">
                {speaker1.avatar || '👩‍💼'}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading font-black text-sm text-white uppercase">{speaker1.speaker}</span>
                <span className="text-[10px] font-mono text-brand-red uppercase">{speaker1.role}</span>
              </div>
            </motion.div>

            {/* Character 2 */}
            <motion.div 
              animate={isSpeaker2Speaking ? { scale: 1.04, y: [0, -6, 0] } : { scale: 0.95, opacity: 0.7 }}
              className={`border-3 border-slate-700 rounded-2xl p-4 bg-slate-900/90 flex items-center gap-4 relative shadow-[4px_4px_0px_#000] transition-all ${
                isSpeaker2Speaking ? 'border-warning-yellow ring-4 ring-warning-yellow/40 bg-slate-850' : ''
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 border-2 border-slate-800 flex items-center justify-center text-3xl shadow-[3px_3px_0px_#000]">
                {speaker2.avatar || '👨‍💼'}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-heading font-black text-sm text-white uppercase">{speaker2.speaker}</span>
                <span className="text-[10px] font-mono text-warning-yellow uppercase">{speaker2.role}</span>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className="w-full border-3 border-slate-800 shadow-[8px_8px_0px_#000] rounded-2xl bg-slate-950 text-white overflow-hidden flex flex-col relative select-none">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900 p-3 md:p-4 border-b-3 border-slate-800 flex justify-between items-center gap-4 z-20 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-red text-white border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]">
            <Film size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-black text-xs md:text-sm uppercase tracking-wider text-white">
                LIVE ANIMATED SLIDESHOW COURSE
              </span>
              <span className="bg-warning-yellow text-slate-800 text-[9px] font-heading font-black px-2 py-0.5 rounded border border-slate-800 uppercase flex items-center gap-1">
                <Volume2 size={12} /> WebSpeech Narration
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              SCENE {activeSceneIdx + 1} OF {totalScenes} &bull; {progressPercent}% COMPLETED
            </span>
          </div>
        </div>

        {/* Voice Selector & Rate Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          {availableVoices.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
              <Mic size={14} className="text-warning-yellow" />
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="bg-transparent text-white font-mono text-[10px] focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name} className="bg-slate-900 text-white">
                    {v.name.substring(0, 22)} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {[0.8, 1.0, 1.2, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg transition-all ${
                  speechRate === rate ? 'bg-brand-red text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <button 
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`border-2 border-slate-800 rounded-xl px-3 py-1.5 text-xs font-heading font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
              voiceEnabled ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-900 text-slate-500'
            }`}
            title="Toggle Voiceover Audio"
          >
            {voiceEnabled ? <><Volume2 size={16} /> AUDIO ON</> : <><VolumeX size={16} /> MUTED</>}
          </button>
        </div>
      </div>

      {/* 16:9 Widescreen Animated Explainer Video Screen */}
      <div className="relative w-full aspect-video min-h-[340px] md:min-h-[460px] bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 md:p-8 flex flex-col justify-between overflow-hidden border-b-3 border-slate-800">
        
        {/* Dynamic Canvas Background Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ea283f_1px,transparent_1px)] [background-size:32px_32px]" />
        
        {/* Video Screen Top Title Overlay */}
        <div className="flex justify-between items-center z-10 bg-slate-900/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-slate-800 shadow-md">
          <div>
            <span className="text-brand-red font-heading font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> {currentScene?.subtitle || `PART ${activeSceneIdx + 1}`}
            </span>
            <h2 className="font-heading font-black text-lg md:text-2xl uppercase text-white tracking-tight">
              {currentScene?.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {currentScene?.keyHighlights?.map((tag, idx) => (
              <span key={idx} className="hidden sm:inline-block text-[9px] md:text-[10px] font-heading font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Dynamic Visual Template Component Container */}
        <div className="my-3 z-10 flex-1 flex flex-col justify-center">
          {renderVisualTemplate()}
        </div>

        {/* Synchronized PDF Speech Bubble Dialogue Card */}
        <div className="z-10 my-1">
          <AnimatePresence mode="wait">
            {currentDialogue && (
              <motion.div 
                key={activeDialogueIdx}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`border-3 p-4 md:p-5 rounded-2xl relative shadow-[6px_6px_0px_#000] backdrop-blur-md ${
                  isSpeaker1Speaking 
                    ? 'bg-slate-900/95 border-brand-red text-white' 
                    : 'bg-slate-900/95 border-warning-yellow text-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentDialogue.avatar}</span>
                    <span className={`font-heading font-black text-xs md:text-sm uppercase tracking-wider ${
                      isSpeaker1Speaking ? 'text-brand-red' : 'text-warning-yellow'
                    }`}>
                      {currentDialogue.speaker} ({currentDialogue.role})
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                    <Volume2 size={12} className="text-success-green animate-pulse" /> SPEECH SYNTHESIS ({speechRate}x)
                  </span>
                </div>
                <p className="font-body font-bold text-xs md:text-base leading-relaxed select-text text-slate-100">
                  "{currentDialogue.text}"
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Scrubber & Playback Progress Bar */}
        <div className="z-10 flex flex-col gap-1.5 mt-2">
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700 relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-brand-red to-warning-yellow"
              style={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

      </div>

      {/* Video Controls Footer */}
      <div className="p-3 md:p-4 bg-slate-900 flex flex-wrap justify-between items-center gap-4 z-20">
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePlayPause}
            className="bg-brand-red text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_#000] hover:bg-brand-red-dark flex items-center gap-2 cursor-pointer transition-all"
          >
            {isPlaying ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> PLAY SLIDESHOW</>}
          </button>

          <button 
            onClick={handleRestart}
            className="bg-slate-800 text-slate-200 font-heading font-bold text-xs uppercase px-3.5 py-2.5 rounded-xl border-2 border-slate-700 shadow-[2px_2px_0px_#000] hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw size={14} /> RESTART SLIDESHOW
          </button>
        </div>

        {/* Locked Next Scene Button */}
        <div className="flex items-center gap-2">
          <button 
            disabled={activeSceneIdx === 0}
            onClick={handlePrevScene}
            className="bg-slate-800 text-white p-2 rounded-xl border-2 border-slate-700 shadow-[2px_2px_0px_#000] disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="font-mono text-xs font-bold text-slate-400">
            SCENE {activeSceneIdx + 1} / {totalScenes}
          </span>

          {sceneFinished || isCompleted ? (
            <button 
              onClick={handleNextScene}
              className="bg-success-green text-white font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_#000] hover:bg-green-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              {activeSceneIdx === totalScenes - 1 ? 'FINISH & UNLOCK EXAM' : 'NEXT SCENE'} <ChevronRight size={14} />
            </button>
          ) : (
            <button 
              disabled
              className="bg-slate-800 text-slate-500 font-heading font-black text-xs uppercase px-5 py-2.5 rounded-xl border-2 border-slate-700 shadow-[2px_2px_0px_#000] cursor-not-allowed flex items-center gap-2 opacity-80"
            >
              <Lock size={12} /> PLAYING SCENE...
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
