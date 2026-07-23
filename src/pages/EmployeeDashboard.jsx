import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/shared/Sidebar';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { generateCertificatePDF } from '../utils/pdfCertificate';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Clock, 
  Play, 
  Download,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Bookmark
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeDashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('PENDING'); 
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchEmployeeData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const assignmentsQuery = query(
        collection(db, 'assignments'), 
        where('employeeId', '==', currentUser.uid)
      );
      const assignmentsSnap = await getDocs(assignmentsQuery);
      const list = [];
      assignmentsSnap.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      const coursesSnap = await getDocs(collection(db, 'courses'));
      const courseMap = {};
      coursesSnap.forEach((doc) => {
        courseMap[doc.id] = doc.data();
      });
      setCourses(courseMap);

      const resultsQuery = query(
        collection(db, 'results'), 
        where('employeeId', '==', currentUser.uid)
      );
      const resultsSnap = await getDocs(resultsQuery);
      const resultsList = [];
      resultsSnap.forEach((doc) => {
        resultsList.push({ id: doc.id, ...doc.data() });
      });
      setResults(resultsList);

      const mappedAssignments = list
        .filter((asn) => {
          const courseInfo = courseMap[asn.courseId];
          // 1. FILTER OUT DELETED / REMOVED COURSES (Prevents "UNKNOWN PROCESS GUIDELINE" cards in student portal)
          if (!courseInfo || !courseInfo.title) return false;
          
          // 2. AUTOMATICALLY REMOVE EXPIRED ASSIGNMENTS AFTER DUE DATE (If status is pending/in-progress)
          if (asn.dueDate && asn.status !== 'completed') {
            const due = new Date(asn.dueDate).getTime();
            const now = Date.now();
            if (due < now) return false; // Automatically hidden after due date
          }

          return true;
        })
        .map((asn) => {
          const courseInfo = courseMap[asn.courseId];
          const resultInfo = resultsList.find(r => r.assignmentId === asn.id && r.passed);
          return {
            ...asn,
            courseTitle: courseInfo.title,
            courseDesc: courseInfo.description || 'No description provided.',
            processName: courseInfo.processName || 'General',
            sectionsCount: courseInfo.sections?.length || 0,
            passedResult: resultInfo || null
          };
        });

      mappedAssignments.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));
      setAssignments(mappedAssignments);
    } catch (err) {
      console.error("Error fetching employee data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [currentUser]);

  const pendingAssignments = assignments.filter(asn => asn.status !== 'completed');
  const completedAssignments = assignments.filter(asn => asn.status === 'completed');

  const handleDownloadCert = (asn) => {
    const res = results.find(r => r.assignmentId === asn.id && r.passed);
    if (!res) return;

    generateCertificatePDF(
      userData.name || 'Globiva Associate',
      asn.courseTitle,
      res.mcqScore,
      res.gameScore, 
      new Date(res.attemptedAt).toLocaleDateString()
    );
  };

  const passedCoursesCount = results.filter(r => r.passed).length;
  const totalXp = results.reduce((acc, curr) => acc + (curr.gameScore || 0), 0);

  return (
    <div class="min-h-screen main-content-layout flex flex-col">
      <Sidebar />
      
      <main class="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
        
        {/* User Summary Banner */}
        <div class="card-brutal bg-ink-black text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-heading font-black tracking-widest text-warning-yellow uppercase flex items-center gap-1.5">
              <Award size={14} /> AGENT REPORT CARD
            </span>
            <h1 class="text-2xl md:text-3xl font-heading font-black uppercase">WELCOME, {userData?.name?.split(' ')[0]}!</h1>
            <p class="font-body text-xs text-gray-300 font-bold">Complete assigned process levels to secure certifications and maintain quality scores.</p>
          </div>

          <div class="flex gap-4">
            <div class="border-2 border-white bg-brand-red rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px] shadow-[4px_4px_0px_0px_#FFFFFF]">
              <span class="text-[9px] font-heading font-bold text-brand-red-light tracking-widest uppercase">CERTIFICATES</span>
              <span class="font-heading font-black text-2xl mt-1">{passedCoursesCount}</span>
            </div>
            <div class="border-2 border-white bg-warning-yellow text-ink-black rounded-xl p-3 flex flex-col items-center justify-center min-w-[100px] shadow-[4px_4px_0px_0px_#FFFFFF]">
              <span class="text-[9px] font-heading font-bold text-ink-black/60 tracking-widest uppercase">COMPLETED</span>
              <span class="font-heading font-black text-2xl mt-1">{completedAssignments.length}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div class="flex border-b-3 border-ink-black gap-4 mt-2">
          <button
            onClick={() => setActiveTab('PENDING')}
            class={`font-heading font-black text-xs tracking-wider uppercase pb-3 px-4 transition-all relative ${activeTab === 'PENDING' ? 'text-brand-red border-b-4 border-brand-red translate-y-[2px]' : 'text-gray-500 hover:text-ink-black'}`}
          >
            PENDING TASKS ({pendingAssignments.length})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            class={`font-heading font-black text-xs tracking-wider uppercase pb-3 px-4 transition-all relative ${activeTab === 'COMPLETED' ? 'text-brand-red border-b-4 border-brand-red translate-y-[2px]' : 'text-gray-500 hover:text-ink-black'}`}
          >
            COMPLETED ({completedAssignments.length})
          </button>
        </div>

        {/* Course Grid */}
        {loading ? (
          <SkeletonLoader type="cards" count={3} />
        ) : (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {activeTab === 'PENDING' ? (
              pendingAssignments.length > 0 ? (
                pendingAssignments.map((asn) => (
                  <div key={asn.id} class="card-brutal bg-white flex flex-col justify-between min-h-[340px] hover:-translate-y-1 hover:shadow-brutal-lg duration-200">
                    <div class="flex flex-col gap-2">
                      <div class="flex justify-between items-center">
                        <span class="badge-brutal bg-brand-red-light text-brand-red border-brand-red text-[9px]">{asn.processName.toUpperCase()}</span>
                        {asn.status === 'in-progress' ? (
                          <span class="badge-brutal bg-blue-100 text-blue-700 border-blue-600 text-[9px] flex items-center gap-1">
                            <Clock size={10} /> IN PROGRESS
                          </span>
                        ) : (
                          <span class="badge-brutal bg-warning-yellow text-ink-black border-ink-black text-[9px]">PENDING</span>
                        )}
                      </div>
                      <h3 class="font-heading font-black text-lg uppercase mt-3 line-clamp-2 leading-tight">{asn.courseTitle}</h3>
                      <p class="font-body text-xs text-gray-500 font-bold line-clamp-3 leading-relaxed mt-1">{asn.courseDesc}</p>
                    </div>

                    <div class="mt-4 border-t-2 border-ink-black pt-4 flex justify-between items-center -mx-6 -mb-6 p-4 bg-gray-50 rounded-b-xl border-dashed">
                      <span class="font-heading font-bold text-[10px] text-gray-500 uppercase">{asn.sectionsCount} GAME LEVELS</span>
                      <button
                        onClick={() => navigate(`/employee/course/${asn.courseId}/intro`, { state: { assignmentId: asn.id } })}
                        class="btn-brutal-primary text-xs py-2 px-4 shadow-brutal-sm"
                      >
                        <Play size={12} fill="white" /> PLAY COURSE
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div class="card-brutal bg-white col-span-full py-16 text-center flex flex-col items-center justify-center">
                  <CheckCircle2 size={40} class="text-success-green mb-2 animate-bounce" />
                  <h4 class="font-heading font-black text-sm uppercase">No pending courses</h4>
                  <p class="font-body text-xs text-gray-500 font-bold mt-1">You are fully up to date with your process training requirements.</p>
                </div>
              )
            ) : (
              completedAssignments.length > 0 ? (
                completedAssignments.map((asn) => {
                  const passScore = asn.passedResult?.mcqScore || 100;
                  return (
                    <div key={asn.id} class="card-brutal bg-white flex flex-col justify-between min-h-[340px] hover:-translate-y-1 hover:shadow-brutal-lg duration-200">
                      <div class="flex flex-col gap-2">
                        <div class="flex justify-between items-center">
                          <span class="badge-brutal bg-brand-red-light text-brand-red border-brand-red text-[9px]">{asn.processName.toUpperCase()}</span>
                          <span class="badge-brutal bg-green-100 text-success-green border-success-green text-[9px] flex items-center gap-1">
                            <CheckCircle2 size={10} /> COMPLETED
                          </span>
                        </div>
                        <h3 class="font-heading font-black text-lg uppercase mt-3 line-clamp-2 leading-tight">{asn.courseTitle}</h3>
                        <p class="font-body text-xs text-gray-500 font-bold line-clamp-3 leading-relaxed mt-1">{asn.courseDesc}</p>
                      </div>

                      <div class="mt-4 border-t-2 border-ink-black pt-4 flex justify-between items-center -mx-6 -mb-6 p-4 bg-gray-50 rounded-b-xl border-dashed">
                        <div class="flex flex-col">
                          <span class="text-[9px] text-gray-400 font-heading font-bold uppercase">Passed Score</span>
                          <span class="font-heading font-black text-sm text-success-green">{passScore}%</span>
                        </div>
                        {asn.passedResult ? (
                          <button
                            onClick={() => handleDownloadCert(asn)}
                            class="btn-brutal-green text-xs py-2 px-4 shadow-brutal-sm flex items-center gap-1.5"
                          >
                            <Download size={12} /> CERTIFICATE
                          </button>
                        ) : (
                          <span class="text-xs font-heading font-bold text-error-red flex items-center gap-1">
                            <AlertCircle size={12} /> NO CERTIFICATE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div class="card-brutal bg-white col-span-full py-16 text-center flex flex-col items-center justify-center bg-dots">
                  <Award size={40} class="text-gray-300 mb-2" />
                  <h4 class="font-heading font-black text-sm uppercase">No completed courses yet</h4>
                  <p class="font-body text-xs text-gray-500 font-bold mt-1">Complete your pending courses to unlock and download certificates.</p>
                </div>
              )
            )}

          </div>
        )}

      </main>
    </div>
  );
};

export default EmployeeDashboard;
