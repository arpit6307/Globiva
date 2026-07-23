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
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InteractiveVideoPlayer = ({ videoModule, onComplete, initialCompleted = false }) => {
  const scenes = videoModule?.scenes || [];

  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [activeDialogueIdx, setActiveDialogueIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sceneFinished, setSceneFinished] = useState(initialCompleted);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Audio Context Ref & Audio Element Ref
  const audioCtxRef = useRef(null);
  const currentAudioRef = useRef(null);

  const currentScene = scenes[activeSceneIdx] || scenes[0];
  const dialogues = currentScene?.dialogues || [];
  const currentDialogue = dialogues[activeDialogueIdx] || dialogues[0];
  const totalScenes = scenes.length;

  // Initialize Web Audio API
  const initAudioContext = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } catch (e) {
      console.warn("AudioContext init warning:", e);
    }
  };

  // Stop any currently playing audio
  const stopAllAudio = () => {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      } catch (e) {}
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  };

  // Web Audio Synth Tones with Dynamic Pitch & Voice Modulation
  const playCharacterSpeechTones = (isFemale, textLength = 40, isQuestion = false) => {
    if (!voiceEnabled) return;
    try {
      initAudioContext();
      if (!audioCtxRef.current) return;

      const ctx = audioCtxRef.current;
      const baseFreq = isFemale ? 460 : 210; // Dynamic pitch base
      const noteCount = Math.min(12, Math.max(5, Math.floor(textLength / 10)));
      const now = ctx.currentTime;

      for (let i = 0; i < noteCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dynamic pitch modulation sweep & inflection
        let pitchInflection = (i % 4 === 0 ? 60 : i % 3 === 0 ? -45 : i % 2 === 0 ? 35 : -25);
        if (isQuestion && i === noteCount - 1) {
          pitchInflection += 90; // Upward pitch modulation for question endings
        }

        const targetFreq = Math.max(120, baseFreq + pitchInflection);
        osc.frequency.setValueAtTime(targetFreq, now + i * 0.14);
        // Dynamic pitch modulation slide
        osc.frequency.exponentialRampToValueAtTime(targetFreq + (isFemale ? 30 : -20), now + i * 0.14 + 0.10);

        osc.type = isFemale ? 'triangle' : 'sawtooth';

        gain.gain.setValueAtTime(0, now + i * 0.14);
        gain.gain.linearRampToValueAtTime(isFemale ? 0.18 : 0.22, now + i * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.13);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.14);
      }
    } catch (e) {
      console.warn("Tone synthesis modulation warning:", e);
    }
  };

  // Speak dialogue line using 100% Audible HTML5 Audio Speech Stream + Native TTS with Pitch Modulation
  const speakDialogue = (dialogue) => {
    if (!dialogue || !voiceEnabled) return;
    stopAllAudio();
    initAudioContext();

    const textToSpeak = dialogue.text;
    const isFemale = dialogue.voiceGender === 'female';
    const isQuestion = textToSpeak.includes('?');

    // 1. Play Dynamic Pitch & Tone Modulated Vocal Oscillators
    playCharacterSpeechTones(isFemale, textToSpeak.length, isQuestion);

    // 2. HTML5 Audio Google Translate MP3 Voice Stream
    try {
      const cleanText = encodeURIComponent(textToSpeak.substring(0, 190));
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${cleanText}&tl=en&client=tw-ob`;
      
      const audio = new Audio(ttsUrl);
      audio.volume = 1.0;
      currentAudioRef.current = audio;

      audio.onended = () => {
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
      };

      audio.onerror = () => {
        // Fallback to Pitch Modulated Native SpeechSynthesis
        speakNativeSpeechSynthesis(dialogue);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("HTML5 audio playback fallback to SpeechSynthesis:", err);
          speakNativeSpeechSynthesis(dialogue);
        });
      }
    } catch (e) {
      speakNativeSpeechSynthesis(dialogue);
    }
  };

  // Native SpeechSynthesis Engine with Dynamic Voice Pitch Modulation
  const speakNativeSpeechSynthesis = (dialogue) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(dialogue.text);
      utterance.volume = 1.0;

      if (selectedVoiceURI && availableVoices.length > 0) {
        const matched = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (matched) utterance.voice = matched;
      }
      
      const isFemale = dialogue.voiceGender === 'female';
      const isQuestion = dialogue.text.includes('?');

      // Voice Pitch & Rate Modulation
      utterance.pitch = isFemale 
        ? (isQuestion ? 1.35 : 1.25) // Expressive female pitch
        : (isQuestion ? 0.95 : 0.82); // Inquisitive male pitch

      utterance.rate = speechRate * (isFemale ? 1.02 : 0.94); // Synchronized playback rate
      utterance.lang = 'en-US';

      utterance.onend = () => {
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
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Native SpeechSynthesis error:", err);
    }
  };

  // Dialogue autoplay timer
  useEffect(() => {
    let timer = null;

    if (isPlaying && currentDialogue) {
      speakDialogue(currentDialogue);

      // Timeout safety fallback (5 seconds per dialogue)
      const durationMs = Math.max(4000, currentDialogue.text.length * 80);
      timer = setTimeout(() => {
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
      }, durationMs);

    } else {
      stopAllAudio();
    }

    return () => {
      if (timer) clearTimeout(timer);
      stopAllAudio();
    };
  }, [isPlaying, activeDialogueIdx, activeSceneIdx, voiceEnabled]);

  const handlePlayPause = () => {
    initAudioContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }

    if (!isPlaying) {
      if (sceneFinished && activeDialogueIdx >= dialogues.length - 1) {
        setActiveDialogueIdx(0);
        setSceneFinished(false);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleNextScene = () => {
    stopAllAudio();
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
    stopAllAudio();
    if (activeSceneIdx > 0) {
      setActiveSceneIdx(activeSceneIdx - 1);
      setActiveDialogueIdx(0);
      setSceneFinished(false);
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    stopAllAudio();
    setActiveSceneIdx(0);
    setActiveDialogueIdx(0);
    setSceneFinished(false);
    setIsPlaying(true);
  };

  if (!videoModule || scenes.length === 0) return null;

  // Dynamically resolve Speaker 1 (Host) and Speaker 2 (Guest) from dialogue data
  const speaker1 = (dialogues && dialogues[0]) ? dialogues[0] : { speaker: "Trainer Sarah", role: "Lead Quality Trainer", avatar: "👩‍💼" };
  const speaker2 = (dialogues && dialogues.length > 1) ? (dialogues.find(d => d && d.speaker !== speaker1.speaker) || dialogues[1]) : { speaker: "Agent Alex", role: "Operations Associate", avatar: "👨‍💼" };

  const isSpeaker1Speaking = currentDialogue?.speaker === speaker1?.speaker;
  const isSpeaker2Speaking = currentDialogue?.speaker === speaker2?.speaker;

  // Calculate overall video progress percentage
  const totalDialogues = scenes.reduce((acc, s) => acc + (s.dialogues?.length || 0), 0);
  const passedDialogues = scenes.slice(0, activeSceneIdx).reduce((acc, s) => acc + (s.dialogues?.length || 0), 0) + activeDialogueIdx;
  const progressPercent = Math.min(100, Math.round(((passedDialogues + 1) / Math.max(1, totalDialogues)) * 100));

  return (
    <div className="w-full border-3 border-slate-800 shadow-[8px_8px_0px_#000] rounded-2xl bg-slate-950 text-white overflow-hidden flex flex-col relative select-none">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900 p-3 md:p-4 border-b-3 border-slate-800 flex justify-between items-center gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-red text-white border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000]">
            <Film size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs md:text-sm uppercase tracking-wider text-white">
                PDF-GENERATED ANIMATED EXPLAINER VIDEO
              </span>
              <span className="bg-warning-yellow text-slate-800 text-[9px] font-heading font-black px-2 py-0.5 rounded border border-slate-800 uppercase flex items-center gap-1">
                <Volume2 size={12} /> HTML5 Voiceover Audio
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block">
              MANDATORY LESSON • SCENE {activeSceneIdx + 1} OF {totalScenes} • {progressPercent}% COMPLETED
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Playback Speed Rate Controls (0.8x, 1x, 1.2x, 1.5x) */}
          <div className="flex items-center bg-slate-800 border-2 border-slate-700 rounded-xl p-0.5 shadow-sm">
            {[0.8, 1.0, 1.2, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => setSpeechRate(rate)}
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  speechRate === rate 
                    ? 'bg-brand-red text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Set speech speed to ${rate}x`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* SpeechSynthesis Voice Selector Dropdown */}
          {availableVoices.length > 0 && (
            <select
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="bg-slate-800 text-slate-200 border-2 border-slate-700 rounded-xl text-[10px] font-heading font-bold px-2 py-1 focus:outline-none max-w-[130px] truncate cursor-pointer"
              title="Select Text-to-Speech Voice"
            >
              <option value="">AUTO VOICE</option>
              {availableVoices.filter(v => v.lang.startsWith('en')).slice(0, 12).map((voice, idx) => (
                <option key={idx} value={voice.voiceURI}>
                  {voice.name.replace(/Google|Microsoft|Apple/g, '').trim()}
                </option>
              ))}
            </select>
          )}

          <button 
            onClick={() => {
              initAudioContext();
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.resume();
              }
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`px-3 py-1.5 border-2 border-slate-800 rounded-xl shadow-[2px_2px_0px_#000] transition-all text-xs font-heading font-black flex items-center gap-1.5 cursor-pointer ${
              voiceEnabled ? 'bg-warning-yellow text-slate-800' : 'bg-slate-800 text-slate-400'
            }`}
            title="Toggle Voiceover Audio"
          >
            {voiceEnabled ? <><Volume2 size={16} /> AUDIO ON</> : <><VolumeX size={16} /> MUTED</>}
          </button>

          {isCompleted && (
            <span className="bg-success-green text-white border-2 border-slate-800 rounded-full px-3 py-1 text-[10px] font-heading font-black tracking-wider uppercase flex items-center gap-1 shadow-[2px_2px_0px_#000]">
              <CheckCircle2 size={12} /> VIDEO MODULE COMPLETED
            </span>
          )}
        </div>
      </div>

      {/* 16:9 Widescreen Animated Explainer Video Screen */}
      <div className="relative w-full aspect-video min-h-[340px] md:min-h-[460px] bg-gradient-to-br from-slate-950 via-slate-900 to-black p-4 md:p-8 flex flex-col justify-between overflow-hidden border-b-3 border-slate-800">
        
        {/* Dynamic Canvas Background Effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ea283f_1px,transparent_1px)] [background-size:32px_32px]" />
        
        {/* Animated Glow Spotlights */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-brand-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-warning-yellow/20 rounded-full blur-3xl pointer-events-none" />

        {/* Video Screen Top Title Overlay */}
        <div className="flex justify-between items-center z-10 bg-slate-900/80 backdrop-blur-md p-3 md:p-4 rounded-xl border border-slate-800 shadow-md">
          <div>
            <span className="text-brand-red font-heading font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> {currentScene?.subtitle}
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

        {/* Main 2D Animated Explainer Character Stage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-2 md:my-4 z-10 items-center">
          
          {/* Character 1 (Left) */}
          <motion.div 
            animate={isSpeaker1Speaking ? { scale: 1.04, y: [0, -6, 0] } : { scale: 0.95, opacity: 0.7 }}
            transition={{ duration: 0.3 }}
            className={`border-3 border-slate-700 rounded-2xl p-4 bg-slate-900/90 flex items-center gap-4 relative shadow-[4px_4px_0px_#000] transition-all ${
              isSpeaker1Speaking ? 'border-brand-red ring-4 ring-brand-red/40 bg-slate-850' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-22 md:h-22 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 border-3 border-slate-800 flex items-center justify-center text-3xl md:text-5xl shadow-[3px_3px_0px_#000]">
                {speaker1.avatar || '👩‍💼'}
              </div>
              {isSpeaker1Speaking && isPlaying && (
                <div className="absolute -top-2 -right-2 bg-brand-red text-white p-1 rounded-full border border-slate-800 animate-pulse shadow-md">
                  <Volume2 size={14} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-black text-sm md:text-base text-white uppercase tracking-wider flex items-center gap-1.5">
                {speaker1.speaker}
                {isSpeaker1Speaking && <span className="w-2.5 h-2.5 rounded-full bg-brand-red animate-ping" />}
              </span>
              <span className="text-[10px] font-mono font-bold text-brand-red uppercase">
                {speaker1.role || 'Lead Quality Specialist'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                {isSpeaker1Speaking ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> 🗣️ Speaking (Audible Voice)...</> : '👂 Listening...'}
              </span>
            </div>
          </motion.div>

          {/* Character 2 (Right) */}
          <motion.div 
            animate={isSpeaker2Speaking ? { scale: 1.04, y: [0, -6, 0] } : { scale: 0.95, opacity: 0.7 }}
            transition={{ duration: 0.3 }}
            className={`border-3 border-slate-700 rounded-2xl p-4 bg-slate-900/90 flex items-center gap-4 relative shadow-[4px_4px_0px_#000] transition-all ${
              isSpeaker2Speaking ? 'border-warning-yellow ring-4 ring-warning-yellow/40 bg-slate-850' : ''
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-16 h-16 md:w-22 md:h-22 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 border-3 border-slate-800 flex items-center justify-center text-3xl md:text-5xl shadow-[3px_3px_0px_#000]">
                {speaker2.avatar || '👨‍💼'}
              </div>
              {isSpeaker2Speaking && isPlaying && (
                <div className="absolute -top-2 -right-2 bg-warning-yellow text-slate-800 p-1 rounded-full border border-slate-800 animate-pulse shadow-md">
                  <Volume2 size={14} />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="font-heading font-black text-sm md:text-base text-white uppercase tracking-wider flex items-center gap-1.5">
                {speaker2.speaker}
                {isSpeaker2Speaking && <span className="w-2.5 h-2.5 rounded-full bg-warning-yellow animate-ping" />}
              </span>
              <span className="text-[10px] font-mono font-bold text-warning-yellow uppercase">
                {speaker2.role || 'Process Associate'}
              </span>
              <span className="text-[9px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                {isSpeaker2Speaking ? <><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> 🗣️ Speaking (Audible Voice)...</> : '👂 Listening...'}
              </span>
            </div>
          </motion.div>

        </div>

        {/* Synchronized PDF Speech Bubble Dialogue Card */}
        <div className="z-10 my-1 md:my-2">
          <AnimatePresence mode="wait">
            {currentDialogue && (
              <motion.div 
                key={activeDialogueIdx}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`border-3 p-4 md:p-6 rounded-2xl relative shadow-[6px_6px_0px_#000] backdrop-blur-md ${
                  isSpeaker1Speaking 
                    ? 'bg-slate-900/95 border-brand-red text-white' 
                    : 'bg-slate-900/95 border-warning-yellow text-white'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentDialogue.avatar}</span>
                    <span className={`font-heading font-black text-xs md:text-sm uppercase tracking-wider ${
                      isSpeaker1Speaking ? 'text-brand-red' : 'text-warning-yellow'
                    }`}>
                      {currentDialogue.speaker} ({currentDialogue.role})
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                    <Volume2 size={12} className="text-success-green animate-pulse" /> AUDIBLE SPEECH & VOICE
                  </span>
                </div>
                <p className="font-body font-bold text-sm md:text-lg leading-relaxed select-text text-slate-100">
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
            {isPlaying ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> {activeDialogueIdx === 0 && !sceneFinished ? 'PLAY VIDEO (AUDIBLE AUDIO)' : 'PLAY AUDIO'}</>}
          </button>

          <button 
            onClick={handleRestart}
            className="bg-slate-800 text-slate-200 font-heading font-bold text-xs uppercase px-3.5 py-2.5 rounded-xl border-2 border-slate-700 shadow-[2px_2px_0px_#000] hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <RotateCcw size={14} /> RESTART VIDEO
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
              <Lock size={12} /> SPEAKING PDF DIALOGUE...
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
