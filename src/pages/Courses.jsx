import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { seedDefaultCourse } from '../utils/seedData';
import { ProgressTracker } from '../components/shared/ProgressTracker';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  FolderSync,
  UploadCloud,
  FileText,
  Sparkles,
  Tv
} from 'lucide-react';

export const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // PDF Auto-Generator state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [pdfProgressText, setPdfProgressText] = useState('');
  const [generationJobId, setGenerationJobId] = useState(null);

  const handleProcessPdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;

    setParsingPdf(true);
    setError('');
    setSuccess('');
    
    try {
      setPdfProgressText('Uploading PDF to generation server...');
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      if (data.success && data.jobId) {
        setGenerationJobId(data.jobId);
        setIsPdfModalOpen(false);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error("PDF upload error:", err);
      setError(err.message || 'Failed to parse and generate course from PDF.');
    } finally {
      setParsingPdf(false);
      setPdfProgressText('');
    }
  };

  const handleGenerationComplete = async (result) => {
    setGenerationJobId(null);
    try {
      const newCourseId = `course-pdf-${Date.now()}`;
      
      // Get characters from backend or use defaults
      const char1 = result.characters?.speaker1 || { name: 'Instructor', role: 'Subject Expert', avatar: '👩‍💼', voiceGender: 'female' };
      const char2 = result.characters?.speaker2 || { name: 'Student', role: 'Learner', avatar: '👨‍💼', voiceGender: 'male' };

      // Convert backend scenes (sceneText format) into InteractiveVideoPlayer dialogues
      const videoScenes = (result.scenes || []).map((scene, idx) => {
        // Split scene narration text into dialogue turns between two characters
        const sentences = (scene.sceneText || '').split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
        const dialogues = sentences.map((sentence, sIdx) => {
          const isChar1 = sIdx % 2 === 0;
          return {
            speaker: isChar1 ? char1.name : char2.name,
            role: isChar1 ? char1.role : char2.role,
            avatar: isChar1 ? '👩‍💼' : '👨‍💼',
            voiceGender: isChar1 ? (char1.voiceGender || 'female') : (char2.voiceGender || 'male'),
            text: sentence.trim()
          };
        });

        // If no dialogues extracted, create at least one from the full scene text
        if (dialogues.length === 0 && scene.sceneText) {
          dialogues.push({
            speaker: char1.name,
            role: char1.role,
            avatar: '👩‍💼',
            voiceGender: char1.voiceGender || 'female',
            text: scene.sceneText
          });
        }

        return {
          sceneId: scene.sceneId || `scene-${idx + 1}`,
          title: `Scene ${idx + 1}: ${scene.visualCue || 'Content'}`,
          subtitle: `Part ${idx + 1} of ${result.scenes.length}`,
          visualTheme: idx === 0 ? 'intro' : (idx === result.scenes.length - 1 ? 'summary' : 'deep_dive'),
          keyHighlights: scene.keyHighlights || [],
          dialogues
        };
      });

      const videoModule = {
        title: result.outline?.title ? `${result.outline.title} - AI Animated Video` : 'AI Animated Video Module',
        description: 'Auto-generated animated video module from PDF document.',
        totalDurationSeconds: (result.scenes || []).reduce((sum, s) => sum + (s.durationHint || 15), 0),
        scenes: videoScenes.length > 0 ? videoScenes : [{
          sceneId: 'scene-1',
          title: 'Course Introduction',
          subtitle: 'Welcome',
          visualTheme: 'intro',
          keyHighlights: [result.outline?.title || 'Course Content'],
          dialogues: [{
            speaker: char1.name, role: char1.role, avatar: '👩‍💼', voiceGender: 'female',
            text: `Welcome to this course on ${result.outline?.title || 'the uploaded document'}. Let's explore the key concepts together.`
          }]
        }]
      };

      const mappedMcqs = (result.mcqs || []).map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correctIndex !== undefined ? q.correctIndex : 0),
        explanation: q.explanation || ''
      }));

      // Build 2 mini-game sections from outline chapters
      const allChapters = result.outline?.chapters || [];
      const mappedSections = allChapters.slice(0, 2).map((chapter, idx) => ({
        id: `sec-${Date.now()}-${idx}`,
        title: idx === 0 
          ? `Game 1: Flashcard Challenge — ${chapter.chapterTitle || 'Key Concepts'}` 
          : `Game 2: Speed Match — ${chapter.chapterTitle || 'Core Terms'}`,
        gameType: idx % 2 === 0 ? 'flashcards' : 'match',
        content: chapter.summary || chapter.chapterTitle || '',
        keyTerms: (chapter.keyPoints || []).slice(0, 6).map((kp, kIdx) => ({
          term: kp.length > 40 ? kp.substring(0, 40) : kp,
          definition: kp
        }))
      }));

      // Get description from outline
      const outlineSummary = allChapters.length > 0 
        ? allChapters.map(ch => ch.summary || ch.chapterTitle).join(' ').substring(0, 300)
        : 'Auto-generated training course from uploaded PDF document.';

      const courseData = {
        id: newCourseId,
        title: result.outline?.title || 'PDF Auto Course',
        processName: processName || 'PDF Course',
        description: outlineSummary,
        passPercentage: 75,
        pointsPerQuestion: 10,
        passingScore: Math.floor((mappedMcqs.length || 20) * 10 * 0.75),
        mcqTimeLimitMinutes: 15,
        maxAttempts: 2,
        isActive: true,
        createdBy: 'trainer_pdf_upload',
        sourcePdfName: 'Uploaded PDF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sections: mappedSections.length >= 2 ? mappedSections : [
          { id: `sec-${Date.now()}-0`, title: 'Game 1: Flashcard Challenge', gameType: 'flashcards', content: outlineSummary, keyTerms: [{ term: 'Key Concept', definition: 'Important topic from the document.' }] },
          { id: `sec-${Date.now()}-1`, title: 'Game 2: Speed Match Duel', gameType: 'match', content: outlineSummary, keyTerms: [{ term: 'Core Term', definition: 'Fundamental concept from the training material.' }] }
        ],
        videoModule,
        mcqs: mappedMcqs.length > 0 ? mappedMcqs : [{ id: 'q-1', question: 'Demo question?', options: ['A', 'B', 'C', 'D'], correctIndex: 0, explanation: 'Placeholder' }],
        videoUrl: result.videoUrl || null
      };

      await setDoc(doc(db, 'courses', newCourseId), courseData);
      setSuccess(`🎉 Course "${courseData.title}" auto-created with ${mappedMcqs.length} MCQs, ${videoScenes.length} video scenes, and 2 mini-games!`);
      setPdfFile(null);
      fetchCourses();
    } catch (err) {
      console.error("Error saving generated course:", err);
      setError("Failed to save generated course.");
    }
  };

  const handleGenerationError = (errMsg) => {
    setGenerationJobId(null);
    setError(errMsg);
  };

  // Course Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  
  // Wizard Form state
  const [title, setTitle] = useState('');
  const [processName, setProcessName] = useState('');
  const [description, setDescription] = useState('');
  const [passPercentage, setPassPercentage] = useState(70);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [pointsPerQuestion, setPointsPerQuestion] = useState(10);
  const [passingScore, setPassingScore] = useState(70);
  const [mcqTimeLimitMinutes, setMcqTimeLimitMinutes] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(2);
  
  // Sections (levels)
  const [sections, setSections] = useState([
    { id: 'sec-1', title: 'Introduction', gameType: 'flashcards', content: '', keyTerms: [{ term: '', definition: '' }] }
  ]);
  
  // MCQs
  const [mcqs, setMcqs] = useState([
    { id: 'q-1', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
  ]);

  const handleStartEditCourse = (course) => {
    setEditingCourseId(course.id);
    setTitle(course.title || '');
    setProcessName(course.processName || '');
    setDescription(course.description || '');
    setPassPercentage(course.passPercentage || 70);
    setPointsPerQuestion(course.pointsPerQuestion || 10);
    setPassingScore(course.passingScore || 70);
    setMcqTimeLimitMinutes(course.mcqTimeLimitMinutes || 0);
    setMaxAttempts(course.maxAttempts || 2);
    setSections(course.sections || [
      { id: 'sec-1', title: 'Introduction', gameType: 'flashcards', content: '', keyTerms: [{ term: '', definition: '' }] }
    ]);
    setMcqs(course.mcqs || [
      { id: 'q-1', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }
    ]);
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCourses(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${course.title}"? This will erase all auto-generated PDF data, levels, MCQs, assignments, and video module.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      // 1. Delete course document
      await deleteDoc(doc(db, 'courses', course.id));

      // 2. Delete all assignment documents referencing this courseId
      const asnQuery = query(collection(db, 'assignments'), where('courseId', '==', course.id));
      const asnSnap = await getDocs(asnQuery);
      const deletePromises = [];
      asnSnap.forEach((asnDoc) => {
        deletePromises.push(deleteDoc(doc(db, 'assignments', asnDoc.id)));
      });
      await Promise.all(deletePromises);

      setSuccess(`🗑️ Course "${course.title}" and all student assignments deleted permanently.`);
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      setError("Failed to delete course. " + (err.message || ''));
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setSuccess('');
    setError('');
    try {
      await seedDefaultCourse();
      setSuccess("Successfully seeded the default 'React.js Masterclass' course!");
      fetchCourses();
    } catch (err) {
      setError("Failed to seed default course.");
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleCourseActive = async (course) => {
    setError('');
    setSuccess('');
    const newStatus = !course.isActive;
    try {
      const courseRef = doc(db, 'courses', course.id);
      await updateDoc(courseRef, { isActive: newStatus });
      setSuccess(`Course "${course.title}" status changed to ${newStatus ? 'Active' : 'Archived'}.`);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError("Failed to update course status.");
    }
  };

  // Section Add / Remove helpers
  const addSection = () => {
    const newId = `sec-${Date.now()}`;
    const gameTypes = ['flashcards', 'match', 'recall'];
    const gameType = gameTypes[sections.length % 3];
    setSections([...sections, { 
      id: newId, 
      title: `Section ${sections.length + 1}`, 
      gameType, 
      content: '', 
      keyTerms: [{ term: '', definition: '' }] 
    }]);
  };

  const removeSection = (idx) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionChange = (idx, field, value) => {
    const updated = [...sections];
    updated[idx][field] = value;
    setSections(updated);
  };

  const addTerm = (secIdx) => {
    const updated = [...sections];
    updated[secIdx].keyTerms.push({ term: '', definition: '' });
    setSections(updated);
  };

  const removeTerm = (secIdx, termIdx) => {
    const updated = [...sections];
    if (updated[secIdx].keyTerms.length === 1) return;
    updated[secIdx].keyTerms = updated[secIdx].keyTerms.filter((_, i) => i !== termIdx);
    setSections(updated);
  };

  const handleTermChange = (secIdx, termIdx, field, value) => {
    const updated = [...sections];
    updated[secIdx].keyTerms[termIdx][field] = value;
    setSections(updated);
  };

  // MCQ helpers
  const addMcq = () => {
    const newId = `q-${Date.now()}`;
    setMcqs([...mcqs, { id: newId, question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
  };

  const removeMcq = (idx) => {
    if (mcqs.length === 1) return;
    setMcqs(mcqs.filter((_, i) => i !== idx));
  };

  const handleMcqChange = (idx, field, value) => {
    const updated = [...mcqs];
    updated[idx][field] = value;
    setSections(updated); // Wait! Let's check original code: updated[idx][field] = value; setMcqs(updated); wait, it was setMcqs in original! Wait!
    // Let me check line 176 in original:
    // "updated[idx][field] = value;
    // setMcqs(updated);"
    // Oh, yes! I must write setMcqs(updated) not setSections(updated). Good catch!
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...mcqs];
    updated[qIdx].options[optIdx] = value;
    setMcqs(updated);
  };

  // Create or Update Course Submit
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!title || !processName || !description) {
      return setError('Please fill out all course header information.');
    }

    const courseId = editingCourseId || `course-${Date.now()}`;
    const existing = courses.find(c => c.id === editingCourseId);

    const newCourse = {
      id: courseId,
      title: title.trim(),
      processName: processName.trim(),
      description: description.trim(),
      passPercentage: Number(passPercentage),
      pointsPerQuestion: Number(pointsPerQuestion),
      passingScore: Number(passingScore),
      mcqTimeLimitMinutes: Number(mcqTimeLimitMinutes),
      maxAttempts: Number(maxAttempts),
      isActive: existing ? existing.isActive : true,
      createdAt: existing ? existing.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
      sections,
      mcqs
    };

    try {
      await setDoc(doc(db, 'courses', courseId), newCourse);
      setSuccess(editingCourseId ? `Course "${title}" updated successfully!` : `Course "${title}" created successfully!`);
      setIsWizardOpen(false);
      setEditingCourseId(null);
      
      // Reset forms
      setTitle('');
      setProcessName('');
      setDescription('');
      setPassPercentage(70);
      setPointsPerQuestion(10);
      setPassingScore(70);
      setMcqTimeLimitMinutes(0);
      setMaxAttempts(2);
      setSections([{ id: 'sec-1', title: 'Introduction', gameType: 'flashcards', content: '', keyTerms: [{ term: '', definition: '' }] }]);
      setMcqs([{ id: 'q-1', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
      setWizardStep(1);
      fetchCourses();
    } catch (err) {
      console.error(err);
      setError('Failed to save course. Check console.');
    }
  };

  return (
    <div class="min-h-screen main-content-layout flex flex-col relative">
      <Sidebar />
      <BackgroundParticles />
      {generationJobId && (
        <ProgressTracker 
          jobId={generationJobId} 
          onComplete={handleGenerationComplete} 
          onError={handleGenerationError} 
          onClose={() => setGenerationJobId(null)}
        />
      )}
      
      <main class="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto relative z-10">
        {isWizardOpen ? (
          // FULL PAGE COURSE GENERATOR SCREEN
          <div class="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 md:p-8 bg-white relative transition-all duration-200 animate-scale-in flex flex-col gap-6 w-full">
            
            {/* Header with clear return action */}
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-3 border-slate-800 pb-5 mb-2 gap-4">
              <div class="flex flex-col">
                <h2 class="font-heading font-black text-3xl uppercase tracking-tight text-slate-800">COURSE GENERATOR</h2>
                <span class="text-xs text-gray-500 font-heading font-bold mt-1">
                  STEP {wizardStep} OF 3 — {wizardStep === 1 ? 'HEADER INFO' : wizardStep === 2 ? 'LEARNING LEVELS' : 'EVALUATION QUIZ'}
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setIsWizardOpen(false)} 
                class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center gap-2 text-xs py-2.5 px-4 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                ← CANCEL & RETURN TO COURSE LIST
              </button>
            </div>

            {/* Step 1: Basic Info */}
            {wizardStep === 1 && (
              <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="font-heading font-black text-xs uppercase tracking-wider text-gray-700">Course Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Definitive Call Etiquettes Masterclass"
                      class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <label class="font-heading font-black text-xs uppercase tracking-wider text-gray-700">Process Name / Dept</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Tele-Sales Onboarding"
                      class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                      value={processName} 
                      onChange={(e) => setProcessName(e.target.value)} 
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="font-heading font-black text-xs uppercase tracking-wider text-gray-700">Description</label>
                  <textarea 
                    required 
                    rows="4"
                    placeholder="Outline what learners will learn in this course..."
                    class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div class="flex flex-col gap-2">
                    <label class="font-heading font-black text-xs uppercase tracking-wider text-gray-700">Points Per Question</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="100"
                      class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                      value={pointsPerQuestion} 
                      onChange={(e) => setPointsPerQuestion(e.target.value)} 
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="font-heading font-black text-xs uppercase tracking-wider text-gray-700">Passing Score (Points)</label>
                    <input 
                      type="number" 
                      min="1"
                      className="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                      value={passingScore} 
                      onChange={(e) => setPassingScore(e.target.value)} 
                    />
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="font-heading font-black text-xs uppercase tracking-wider text-gray-700">Pass Percentage (%)</label>
                    <input 
                      type="number" 
                      min="50" 
                      max="100"
                      class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                      value={passPercentage} 
                      onChange={(e) => setPassPercentage(e.target.value)} 
                    />
                  </div>
                </div>

                {/* Dynamic calculation banner */}
                <div className="bg-warning-yellow-light p-4 border-2 border-slate-800 rounded-xl font-body text-xs font-bold text-slate-800 flex justify-between items-center shadow-[2px_2px_0px_#000]">
                  <span>
                    Total MCQ Questions: <strong className="text-brand-red font-black">{mcqs.length}</strong>
                  </span>
                  <span>
                    Total Score: <strong className="text-brand-red font-black">{mcqs.length * pointsPerQuestion} Points</strong>
                  </span>
                  <span>
                    Required Passing: <strong className="text-brand-red font-black">{passingScore} Points</strong>
                  </span>
                </div>

                <div class="flex justify-end gap-3 mt-4 border-t-2 border-slate-800 pt-4">
                  <button type="button" onClick={() => setIsWizardOpen(false)} class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2.5 px-4 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">CANCEL</button>
                  <button type="button" onClick={() => setWizardStep(2)} class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2.5 px-4 bg-brand-red text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">NEXT: LEVELS →</button>
                </div>
              </div>
            )}

            {/* Step 2: Sections / Levels */}
            {wizardStep === 2 && (
              <div class="flex flex-col gap-6">
                <div class="flex justify-between items-center">
                  <h4 class="font-heading font-black text-sm uppercase tracking-wider text-gray-500">Add Learning Levels</h4>
                  <button 
                    type="button" 
                    onClick={addSection}
                    class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs px-3 py-2 flex items-center gap-1 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Plus size={14} /> ADD LEVEL
                  </button>
                </div>

                <div class="flex flex-col gap-6 max-h-[60vh] overflow-y-auto pr-2">
                  {sections.map((sec, secIdx) => (
                    <div key={sec.id} class="border-2 border-slate-800 rounded-xl p-4 bg-gray-50 relative shadow-[2px_2px_0px_#000]">
                      <button 
                        type="button" 
                        onClick={() => removeSection(secIdx)}
                        class="absolute top-4 right-4 p-1.5 bg-red-100 hover:bg-red-200 border-2 border-slate-800 rounded-lg text-error-red"
                        title="Remove level"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div class="flex flex-col gap-1 md:col-span-2">
                          <label class="font-heading font-bold text-xs uppercase text-gray-600">Level {secIdx + 1} Title</label>
                          <input 
                            type="text" 
                            required 
                            class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                            value={sec.title} 
                            onChange={(e) => handleSectionChange(secIdx, 'title', e.target.value)} 
                          />
                        </div>
                        <div class="flex flex-col gap-1">
                          <label class="font-heading font-bold text-xs uppercase text-gray-600">Game Type</label>
                          <select
                            class="p-3 border-2 border-slate-800 rounded-xl font-body bg-white shadow-[2px_2px_0px_#000] font-bold text-xs text-slate-800 focus:outline-none"
                            value={sec.gameType}
                            onChange={(e) => handleSectionChange(secIdx, 'gameType', e.target.value)}
                          >
                            <option value="flashcards">FLASHCARDS (REVEAL)</option>
                            <option value="match">MATCH THE PAIRS (MEMORY CARDS)</option>
                            <option value="recall">SPEED RECALL (ARCADE BOSS FIGHT)</option>
                          </select>
                        </div>
                      </div>

                      <div class="flex flex-col gap-1 mb-4">
                        <label class="font-heading font-bold text-xs uppercase text-gray-600">Level Study Material (Content)</label>
                        <textarea 
                          required 
                          rows="3"
                          class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                          placeholder="Add the detailed text description for this level..."
                          value={sec.content}
                          onChange={(e) => handleSectionChange(secIdx, 'content', e.target.value)}
                        ></textarea>
                      </div>

                      {/* Key Terms for game */}
                      <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center border-t border-slate-800/10 pt-3">
                          <span class="font-heading font-bold text-xs text-gray-500">Key Vocabulary Terms (For Games)</span>
                          <button 
                            type="button" 
                            onClick={() => addTerm(secIdx)}
                            class="border-3 border-slate-800 shadow-[2px_2px_0px_#000] rounded-xl text-[10px] px-2 py-1 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          >
                            + ADD KEYTERM
                          </button>
                        </div>

                        <div class="flex flex-col gap-2">
                          {sec.keyTerms.map((term, tIdx) => (
                            <div key={tIdx} class="flex flex-col md:flex-row gap-2 items-center">
                              <input 
                                type="text" 
                                placeholder="Term (e.g. ACW)" 
                                class="w-full md:w-1/3 p-2 border-2 border-slate-800 rounded-lg text-sm text-slate-800 focus:outline-none"
                                value={term.term}
                                onChange={(e) => handleTermChange(secIdx, tIdx, 'term', e.target.value)}
                              />
                              <input 
                                type="text" 
                                placeholder="Definition (e.g. After Call Work)" 
                                class="w-full md:flex-1 p-2 border-2 border-slate-800 rounded-lg text-sm text-slate-800 focus:outline-none"
                                value={term.definition}
                                onChange={(e) => handleTermChange(secIdx, tIdx, 'definition', e.target.value)}
                              />
                              <button 
                                type="button" 
                                onClick={() => removeTerm(secIdx, tIdx)}
                                class="p-2 border-2 border-slate-800 rounded-lg hover:bg-gray-100 text-slate-800"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div class="flex justify-between mt-6 border-t-2 border-slate-800 pt-4">
                  <button type="button" onClick={() => setWizardStep(1)} class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2 px-4 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">← BACK</button>
                  <button type="button" onClick={() => setWizardStep(3)} class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2 px-4 bg-brand-red text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">NEXT: MCQS →</button>
                </div>
              </div>
            )}

            {/* Step 3: MCQs */}
            {wizardStep === 3 && (
              <div class="flex flex-col gap-6">
                <div class="flex justify-between items-center">
                  <h4 class="font-heading font-black text-sm uppercase tracking-wider text-gray-500">Configure Graded Assessment Questions</h4>
                  <button 
                    type="button" 
                    onClick={addMcq}
                    class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs px-3 py-2 flex items-center gap-1 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Plus size={14} /> ADD MCQ
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-4 mb-6 bg-gray-50 relative transition-all duration-200 border-dashed">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-heading font-bold uppercase text-gray-500">TIME LIMIT (MINUTES)</label>
                    <input 
                      type="number" 
                      min="0" 
                      placeholder="0 = Unlimited"
                      className="border-2 border-slate-800 rounded-xl p-3 font-heading font-black text-sm shadow-[2px_2px_0px_#000] text-slate-800 bg-white focus:outline-none"
                      value={mcqTimeLimitMinutes} 
                      onChange={(e) => setMcqTimeLimitMinutes(e.target.value)} 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-heading font-bold uppercase text-gray-500">MAX ATTEMPTS</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      className="border-2 border-slate-800 rounded-xl p-3 font-heading font-black text-sm shadow-[2px_2px_0px_#000] text-slate-800 bg-white focus:outline-none"
                      value={maxAttempts} 
                      onChange={(e) => setMaxAttempts(e.target.value)} 
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-6 max-h-[50vh] overflow-y-auto pr-2">
                  {mcqs.map((q, qIdx) => (
                    <div key={q.id} class="border-2 border-slate-800 rounded-xl p-4 bg-gray-50 relative shadow-[2px_2px_0px_#000] animate-scale-in">
                      <button 
                        type="button" 
                        onClick={() => removeMcq(qIdx)}
                        class="absolute top-4 right-4 p-1 bg-red-100 hover:bg-red-200 border-2 border-slate-800 rounded-lg text-error-red"
                        title="Remove question"
                      >
                        <Trash2 size={14} />
                      </button>

                      <div class="flex flex-col gap-1 mb-3">
                        <label class="font-heading font-bold text-xs uppercase text-gray-600">Question {qIdx + 1}</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Enter the question text..."
                          class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                          value={q.question} 
                          onChange={(e) => handleMcqChange(qIdx, 'question', e.target.value)} 
                        />
                      </div>

                      {/* Options */}
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} class="flex gap-2 items-center">
                            <span class="font-heading font-bold text-xs text-slate-800">{String.fromCharCode(65 + oIdx)}:</span>
                            <input 
                              type="text" 
                              required 
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                              class="w-full p-2 border-2 border-slate-800 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                              value={opt}
                              onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/10 pt-3">
                        <div class="flex flex-col gap-1">
                          <label class="font-heading font-bold text-xs uppercase text-gray-600">Correct Answer</label>
                          <select
                            class="p-2 border-2 border-slate-800 rounded-lg font-body bg-white text-sm text-slate-800 focus:outline-none"
                            value={q.correctIndex}
                            onChange={(e) => handleMcqChange(qIdx, 'correctIndex', Number(e.target.value))}
                          >
                            <option value="0">OPTION A</option>
                            <option value="1">OPTION B</option>
                            <option value="2">OPTION C</option>
                            <option value="3">OPTION D</option>
                          </select>
                        </div>
                        <div class="flex flex-col gap-1 md:col-span-2">
                          <label class="font-heading font-bold text-xs uppercase text-gray-600">Explanation</label>
                          <input 
                            type="text" 
                            placeholder="Why is this the correct answer?"
                            class="w-full p-2.5 border-2 border-slate-800 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                            value={q.explanation} 
                            onChange={(e) => handleMcqChange(qIdx, 'explanation', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div class="flex justify-between mt-6 border-t-2 border-slate-800 pt-4">
                  <button type="button" onClick={() => setWizardStep(2)} class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2 px-4 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">← BACK</button>
                  <button type="button" onClick={handleCreateCourse} class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2.5 px-6 bg-success-green text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">PUBLISH COURSE ✓</button>
                </div>
              </div>
            )}

          </div>
        ) : (
          // REGULAR COURSE LIST VIEW
          <>
            {/* Header and Actions */}
            <div class="flex flex-col items-center text-center gap-4 border-b-3 border-slate-800 pb-6 w-full">
              <div class="flex flex-col items-center">
                <h1 class="text-4xl font-black uppercase tracking-tight text-slate-800">COURSE MANAGER</h1>
                <p class="font-body text-gray-600 mt-1">Configure training materials, terms for interactive games, and MCQ evaluations.</p>
              </div>
              <div class="flex flex-wrap gap-3 justify-center">
                <button 
                  onClick={handleSeedData}
                  disabled={seeding}
                  class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center gap-2 text-xs py-2.5 px-4 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  title="Seeds React Masterclass"
                >
                  <FolderSync size={16} class={seeding ? 'animate-spin' : ''} />
                  {seeding ? 'SEEDING...' : 'SEED REACT COURSE'}
                </button>
                <button 
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setPdfFile(null);
                    setIsPdfModalOpen(true);
                  }}
                  className="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center gap-2 text-xs py-2.5 px-4 bg-warning-yellow text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                >
                  <UploadCloud size={16} /> UPLOAD PDF & AUTO-GENERATE
                </button>
                <button 
                  onClick={() => {
                    setError('');
                    setSuccess('');
                    setEditingCourseId(null);
                    setTitle('');
                    setProcessName('');
                    setDescription('');
                    setPassPercentage(70);
                    setPointsPerQuestion(10);
                    setPassingScore(70);
                    setMcqTimeLimitMinutes(0);
                    setMaxAttempts(2);
                    setSections([{ id: 'sec-1', title: 'Introduction', gameType: 'flashcards', content: '', keyTerms: [{ term: '', definition: '' }] }]);
                    setMcqs([{ id: 'q-1', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }]);
                    setWizardStep(1);
                    setIsWizardOpen(true);
                  }}
                  class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center gap-2 text-xs py-2.5 px-4 bg-brand-red text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                >
                  <Plus size={16} /> BUILD NEW COURSE
                </button>
              </div>
            </div>

            {/* Alert states */}
            {success && (
              <div class="bg-success-green text-white p-4 border-3 border-slate-800 rounded-xl font-heading font-bold text-sm shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <Check size={18} /> {success}
              </div>
            )}
            {error && (
              <div class="bg-error-red text-white p-4 border-3 border-slate-800 rounded-xl font-heading font-bold text-sm shadow-[2px_2px_0px_#000] flex items-center gap-2">
                <X size={18} /> {error}
              </div>
            )}

            {/* Courses list */}
            {loading ? (
              <div class="flex-1 flex flex-col items-center justify-center py-20">
                <div class="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[4px_4px_0px_#000] mb-4"></div>
                <p class="font-heading font-bold text-sm uppercase animate-pulse text-slate-800">Syncing course materials...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div 
                    key={course.id} 
                    className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white relative transition-all duration-200 flex flex-col justify-between min-h-[340px] hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000]"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Card Header Badges */}
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <span className="border-2 border-slate-800 rounded-full px-3 py-1 text-[10px] font-black font-heading uppercase tracking-wider inline-flex items-center gap-1 select-none shadow-[2px_2px_0px_#000] bg-brand-red-light text-brand-red max-w-[200px] truncate">
                          {course.processName.toUpperCase()}
                        </span>
                        <span className="border-2 border-slate-800 rounded-full px-3 py-1 text-[10px] font-black font-heading uppercase tracking-wider inline-flex items-center gap-1 select-none shadow-[2px_2px_0px_#000] bg-green-100 text-success-green">
                          ACTIVE
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-black text-xl uppercase leading-snug text-slate-800 line-clamp-2">
                        {course.title}
                      </h3>

                      {/* PDF Source Badge if present */}
                      {course.sourcePdfName && (
                        <span className="font-mono text-[10px] font-bold text-brand-red bg-red-50 border border-brand-red/30 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 w-fit shadow-sm">
                          <FileText size={12} /> PDF Sourced: {course.sourcePdfName}
                        </span>
                      )}

                      {/* Description */}
                      <p className="font-body text-xs text-slate-500 font-bold line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="border-t-2 border-slate-800 pt-4 mt-6 flex flex-wrap justify-between items-center bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl border-dashed gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-heading font-bold uppercase tracking-wider">Evaluations</span>
                        <span className="font-heading font-black text-xs text-slate-800">
                          {course.sections?.length || 0} Levels &bull; {course.mcqs?.length || 0} MCQs
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditCourse(course)}
                          className="bg-warning-yellow hover:bg-amber-400 text-slate-900 border-2 border-slate-800 shadow-[2px_2px_0px_#000] px-3.5 py-2 text-xs font-heading font-black tracking-wider uppercase inline-flex items-center gap-1.5 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          title="Edit Course Content & MCQs"
                        >
                          <Edit3 size={14} /> EDIT
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCourse(course)}
                          className="bg-red-500 hover:bg-red-600 text-white border-2 border-slate-800 shadow-[2px_2px_0px_#000] px-3.5 py-2 text-xs font-heading font-black tracking-wider uppercase inline-flex items-center gap-1.5 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          title="Permanently Delete Course & PDF Data"
                        >
                          <Trash2 size={14} /> DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div class="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white relative transition-all duration-200 col-span-full py-20 flex flex-col items-center justify-center text-center">
                    <BookOpen size={48} class="text-gray-300 mb-2" />
                    <p class="font-heading font-bold text-sm text-gray-500 uppercase mb-4">No courses configured yet</p>
                    <button 
                      onClick={seedDefaultCourse}
                      disabled={seeding}
                      class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl text-xs py-2 px-4 bg-white text-slate-800 font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <FolderSync size={16} /> SEED DEMO REACT COURSE
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* PDF Auto-Generator Modal */}
        {isPdfModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="border-3 border-slate-800 shadow-[8px_8px_0px_#000] rounded-2xl bg-white p-6 md:p-8 max-w-lg w-full flex flex-col gap-6 relative animate-in fade-in zoom-in-95">
              <button 
                onClick={() => setIsPdfModalOpen(false)}
                disabled={parsingPdf}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg border-2 border-transparent hover:border-slate-800 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-brand-red font-heading font-black text-xs uppercase tracking-wider">
                  <Sparkles size={16} /> AI PDF COURSE GENERATOR
                </div>
                <h3 className="font-heading font-black text-xl text-slate-800 uppercase">Upload Process Document</h3>
                <p className="font-body text-xs text-slate-500 font-bold leading-relaxed">
                  Select a PDF guideline or process document. Our system will analyze the text, extract key protocols, auto-create game levels, MCQs, and generate an interactive animated video module for learners.
                </p>
              </div>

              {parsingPdf ? (
                <div className="p-8 border-3 border-slate-800 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[3px_3px_0px_#000]" />
                  <div className="flex flex-col gap-1">
                    <span className="font-heading font-black text-sm text-slate-800 uppercase animate-pulse">{pdfProgressText}</span>
                    <span className="font-mono text-[10px] text-slate-400">Analyzing topics, generating levels, MCQs & video narration...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProcessPdfUpload} className="flex flex-col gap-4">
                  <div className="border-3 border-dashed border-slate-300 hover:border-slate-800 bg-slate-50 p-6 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf"
                      required
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="p-3 bg-white border-2 border-slate-800 shadow-[2px_2px_0px_#000] rounded-xl text-brand-red">
                      <FileText size={28} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-heading font-black text-xs uppercase text-slate-800">
                        {pdfFile ? pdfFile.name : 'Click or Drop PDF File Here'}
                      </span>
                      <span className="font-body text-[10px] text-slate-400 font-bold">
                        {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB` : 'Supports standard PDF documents (Max 15MB)'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!pdfFile}
                    className="bg-brand-red text-white font-heading font-black uppercase tracking-wider text-xs px-6 py-3.5 border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-brand-red-dark select-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full mt-2"
                  >
                    <Sparkles size={16} /> AUTO-GENERATE COURSE & VIDEO MODULE
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Courses;
