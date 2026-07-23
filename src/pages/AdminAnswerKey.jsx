import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { KeyRound, BookOpen, CheckCircle2, HelpCircle, ChevronDown, FileText, Printer, Search, Target, Award, Percent, Hash } from 'lucide-react';

export const AdminAnswerKey = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again.");
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const mcqs = selectedCourse?.mcqs || [];
  
  const filteredMcqs = mcqs.filter(mcq => 
    mcq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalQuestions = mcqs.length;
  const totalPoints = mcqs.reduce((sum, mcq) => sum + (Number(mcq.points) || 0), 0);
  const passPercentage = selectedCourse?.passingCriteria || 70; // Defaulting
  const pointsPerQuestion = totalQuestions > 0 ? (totalPoints / totalQuestions).toFixed(1) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
      <BackgroundParticles />
      
      <div className="print:hidden">
        <Sidebar />
      </div>
      
      <main className="flex-1 p-6 lg:p-10 w-full max-w-7xl mx-auto print:p-0 print:m-0 print:w-full z-10">
        
        {/* Printable Official Document Header (Only visible on print) */}
        <div className="hidden print:block w-full text-center border-b-4 border-double border-slate-800 pb-6 mb-8">
          <h1 className="text-3xl font-heading font-black uppercase text-slate-800 tracking-wider">GLOBIVA LEARN — OFFICIAL KEY</h1>
          <div className="flex justify-center gap-6 mt-3 text-sm font-body font-bold text-slate-600">
            <span>COURSE: {selectedCourse?.title}</span>
            <span>•</span>
            <span>QUESTIONS: {totalQuestions}</span>
            <span>•</span>
            <span>PASS MARK: {passPercentage}%</span>
          </div>
          <div className="text-right text-[9px] font-mono text-slate-400 mt-3">
            Generated on: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Page Header (Hidden on print) */}
        <div className="mb-8 border-b-3 border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden w-full">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-brand-red-light p-3 border-3 border-slate-800 shadow-[3px_3px_0px_#000] shrink-0 rounded-xl">
              <KeyRound className="w-7 h-7 text-brand-red" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-800 uppercase tracking-tight leading-none">MCQ Answer Key</h1>
              <p className="text-xs font-body text-slate-500 font-bold mt-2 max-w-md">
                View the complete answer key, explanations, and course statistics.
              </p>
            </div>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-white text-slate-800 font-heading font-black uppercase tracking-wider text-xs px-5 py-2.5 border-3 border-slate-800 rounded-xl shadow-[3px_3px_0px_#000] transition-all duration-150 hover:-translate-x-[1.5px] hover:-translate-y-[1.5px] hover:shadow-[4.5px_4.5px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-slate-50 select-none flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Print Answer Key</span>
          </button>
        </div>

        {error && (
          <div className="bg-error-red text-white p-4 mb-6 font-bold flex items-center gap-2 shadow-[4px_4px_0px_#000] border-3 border-slate-800 print:hidden w-full">
            <HelpCircle className="w-6 h-6" />
            {error}
          </div>
        )}

        {/* Controls Section (Hidden on print) */}
        <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-6 mb-8 print:hidden w-full">
          <label className="block text-lg font-heading font-black text-slate-800 mb-3 uppercase flex items-center justify-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-red" /> Select Course
          </label>
          <div className="relative">
            <select
              className="w-full text-base p-4 font-body border-3 border-slate-800 shadow-[3px_3px_0px_#000] appearance-none bg-slate-50 focus:outline-none focus:ring-4 focus:ring-brand-red/10 cursor-pointer font-bold text-slate-800 rounded-xl"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSearchQuery('');
              }}
              disabled={loading}
            >
              <option value="">-- Choose a course to view its answer key --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title || 'Untitled Course'} ({course.id})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-850 bg-brand-red-light border-l-3 border-slate-800 rounded-r-xl">
              <ChevronDown className="w-5 h-5 font-bold text-slate-800" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex justify-center items-center py-20 print:hidden">
            <div className="animate-spin rounded-full h-16 w-16 border-b-8 border-brand-red"></div>
          </div>
        ) : !selectedCourseId ? (
          <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-warning-yellow p-16 text-center flex flex-col items-center justify-center print:hidden w-full">
            <div className="bg-white p-5 rounded-full border-3 border-slate-800 mb-6 shadow-[3px_3px_0px_#000] animate-wiggle">
              <HelpCircle className="w-12 h-12 text-slate-800" />
            </div>
            <h3 className="text-3xl font-heading font-black uppercase text-slate-800 mb-3">No Course Selected</h3>
            <p className="text-base font-body text-slate-700 font-bold max-w-md">Please select a course from the dropdown above to view its comprehensive answer key and statistics.</p>
          </div>
        ) : (
          <div className="space-y-8 print:space-y-6 w-full">
            
            {/* Course Summary Card */}
            <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-6 md:p-8 border-4 print:border-none print:shadow-none print:text-slate-800 print:bg-white print:p-0 print:mb-6">
              <h2 className="text-2xl md:text-3xl font-heading font-black uppercase mb-6 text-slate-800 print:text-xl border-b-2 border-slate-100 pb-4 print:border-slate-800 print:pb-2">
                {selectedCourse?.title || 'Untitled Course'}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                <div className="bg-slate-50 p-4 border-2 border-slate-200 rounded-xl flex flex-col items-center text-center print:bg-white print:border-slate-800 print:p-2">
                  <Hash className="w-5 h-5 text-brand-red mb-1.5 print:text-slate-800" />
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider print:text-slate-600">Questions</span>
                  <span className="text-xl font-black text-slate-850">{totalQuestions}</span>
                </div>
                <div className="bg-slate-50 p-4 border-2 border-slate-200 rounded-xl flex flex-col items-center text-center print:bg-white print:border-slate-800 print:p-2">
                  <Award className="w-5 h-5 text-warning-yellow mb-1.5 print:text-slate-800" />
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider print:text-slate-600">Total Points</span>
                  <span className="text-xl font-black text-slate-850">{totalPoints}</span>
                </div>
                <div className="bg-slate-50 p-4 border-2 border-slate-200 rounded-xl flex flex-col items-center text-center print:bg-white print:border-slate-800 print:p-2">
                  <Percent className="w-5 h-5 text-success-green mb-1.5 print:text-slate-800" />
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider print:text-slate-600">Pass Mark</span>
                  <span className="text-xl font-black text-slate-850">{passPercentage}%</span>
                </div>
                <div className="bg-slate-50 p-4 border-2 border-slate-200 rounded-xl flex flex-col items-center text-center print:bg-white print:border-slate-800 print:p-2">
                  <Target className="w-5 h-5 text-blue-500 mb-1.5 print:text-slate-800" />
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider print:text-slate-600">Pts/Question</span>
                  <span className="text-xl font-black text-slate-850">{pointsPerQuestion}</span>
                </div>
              </div>
            </div>

            {/* Search Bar (Hidden on print) */}
            {mcqs.length > 0 && (
              <div className="relative print:hidden w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 text-base font-bold bg-white border-3 border-slate-800 shadow-[3px_3px_0px_#000] rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-red/10"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Questions List */}
            {mcqs.length === 0 ? (
              <div className="border-3 border-slate-800 border-dashed bg-slate-100 p-16 text-center flex flex-col items-center justify-center rounded-2xl">
                <FileText className="w-16 h-16 mb-5 text-slate-400" />
                <h3 className="text-2xl font-heading font-black uppercase text-slate-800 mb-2">No MCQs Found</h3>
                <p className="text-base font-body text-slate-700 font-bold">This course does not have any Multiple Choice Questions yet.</p>
              </div>
            ) : filteredMcqs.length === 0 ? (
              <div className="border-3 border-brand-red bg-brand-red-light p-12 text-center rounded-2xl print:hidden">
                <h3 className="text-xl font-heading font-black uppercase text-brand-red mb-1">No Matches Found</h3>
                <p className="text-sm font-bold text-brand-red-dark">Try adjusting your search query.</p>
              </div>
            ) : (
              <div className="space-y-6 print:space-y-2">
                {filteredMcqs.map((mcq, index) => {
                  const actualIndex = mcqs.findIndex(m => m === mcq);
                  return (
                    <div key={actualIndex} className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl bg-white p-0 overflow-hidden flex flex-col md:flex-row print:border-b-2 print:border-t-0 print:border-x-0 print:rounded-none print:shadow-none print:my-4 print:pb-4 print:break-inside-avoid">
                      
                      {/* Left Number Box - Premium Slate instead of Black */}
                      <div className="bg-slate-100 text-slate-800 p-4 md:w-20 border-b-2 md:border-b-0 md:border-r-3 border-slate-800 flex items-center justify-center font-heading font-black text-2xl shrink-0 print:bg-white print:text-slate-800 print:border-none print:w-10 print:justify-start print:p-0 print:text-lg">
                        #{actualIndex + 1}
                      </div>
                      
                      <div className="p-6 md:p-8 flex-1 print:p-0">
                        <div className="flex justify-between items-start gap-4 mb-4 print:mb-2">
                          <h3 className="text-xl font-body font-black text-slate-850 leading-tight print:text-base print:font-bold">
                            {mcq.question}
                          </h3>
                          {mcq.points && (
                            <span className="border-2 border-slate-800 bg-brand-red-light text-brand-red text-xs py-1 px-2.5 rounded-full font-heading font-black uppercase tracking-wider shrink-0 shadow-[2px_2px_0px_#000] print:shadow-none print:border-slate-800 print:text-slate-800 print:bg-white print:text-[10px]">
                              {mcq.points} {mcq.points === 1 ? 'pt' : 'pts'}
                            </span>
                          )}
                        </div>

                        {/* Correct Answer Display */}
                        <div className="mt-4 p-4 bg-[#E6F4EA] border-3 border-success-green rounded-xl flex items-center justify-between gap-4 shadow-[2px_2px_0px_#000] print:bg-white print:border-l-4 print:border-y-0 print:border-r-0 print:rounded-none print:shadow-none print:mt-2 print:p-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-success-green text-white p-1.5 rounded-full border-2 border-slate-800 shrink-0 print:hidden">
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-heading font-black text-success-green uppercase block tracking-wider print:text-[9px]">CORRECT ANSWER</span>
                              <span className="text-lg font-body font-black text-slate-850 print:text-sm print:font-semibold">{mcq.correctOption || (mcq.options && mcq.options[mcq.correctIndex]) || 'N/A'}</span>
                            </div>
                          </div>
                          <span className="border-2 border-slate-800 bg-success-green text-white text-[10px] font-heading font-black px-2.5 py-1 rounded shadow-[1.5px_1.5px_0px_#000] shrink-0 print:hidden">
                            OFFICIAL KEY
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAnswerKey;
