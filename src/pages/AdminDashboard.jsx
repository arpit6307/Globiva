import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  Award,
  Sparkles,
  RefreshCw,
  Clock,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  
  const [stats, setStats] = useState({
    employees: 0,
    courses: 0,
    assignments: 0,
    passRate: 0,
    totalResults: 0
  });
  const [loading, setLoading] = useState(true);
  const [pieData, setPieData] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);

  const currentUserEmail = currentUser?.email || userData?.email || '';

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Employees
      const employeesQuery = query(collection(db, 'users'), where('role', '==', 'employee'));
      const employeesSnap = await getDocs(employeesQuery);
      const employeesCount = employeesSnap.size;
      const employeesMap = {};
      employeesSnap.forEach(d => {
        employeesMap[d.id] = d.data();
      });

      // 2. Fetch Courses
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesCount = coursesSnap.size;
      const coursesMap = {};
      coursesSnap.forEach(d => {
        coursesMap[d.id] = d.data();
      });

      // 3. Fetch Assignments
      const assignmentsSnap = await getDocs(collection(db, 'assignments'));
      const assignmentsCount = assignmentsSnap.size;

      // 4. Fetch Results
      const resultsSnap = await getDocs(collection(db, 'results'));
      const totalResults = resultsSnap.size;
      
      let passCount = 0;
      let totalMcqScore = 0;

      resultsSnap.forEach((doc) => {
        const data = doc.data();
        if (data.passed) passCount++;
        totalMcqScore += data.mcqScore || 0;
      });

      const avgPassRate = totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0;

      // Pie chart: Passed vs Failed
      setPieData([
        { name: 'Passed', value: passCount },
        { name: 'Failed', value: totalResults - passCount }
      ]);

      // 5. Build recent attempts log
      const attempts = [];
      resultsSnap.forEach((doc) => {
        const data = doc.data();
        const user = employeesMap[data.employeeId] || {};
        const course = coursesMap[data.courseId] || {};
        attempts.push({
          id: doc.id,
          employeeName: user.name || 'Demo Agent',
          employeeIdCode: user.employeeId || 'GLB1001',
          courseTitle: course.title || 'React Onboarding',
          mcqScore: data.mcqScore,
          passed: data.passed,
          attemptedAt: data.attemptedAt
        });
      });
      // Sort by date and limit to 4
      attempts.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
      setRecentAttempts(attempts.slice(0, 4));

      // 6. Fetch Pending Admins & Auto-Cleanup if > 24 hours
      const adminsQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
      const adminsSnap = await getDocs(adminsQuery);
      const pendingList = [];
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const now = new Date();

      for (const d of adminsSnap.docs) {
        const data = d.data();
        if (data.status === 'pending') {
          const timeDiff = now - new Date(data.createdAt);
          if (timeDiff > twentyFourHours) {
            // Delete expired pending admin document
            await deleteDoc(doc(db, 'users', d.id));
          } else {
            pendingList.push({ id: d.id, ...data });
          }
        }
      }
      setPendingAdmins(pendingList);

      setStats({
        employees: employeesCount,
        courses: coursesCount,
        assignments: assignmentsCount,
        passRate: avgPassRate,
        totalResults
      });
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmin = async (uid, name) => {
    if (!window.confirm(`Are you sure you want to approve ${name} as a trainer?`)) return;
    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', uid), { status: 'active' });
      alert(`${name} has been approved successfully!`);
      fetchStats();
    } catch (err) {
      console.error("Error approving admin:", err);
      alert("Failed to approve admin.");
      setLoading(false);
    }
  };

  const handleRejectAdmin = async (uid, name) => {
    if (!window.confirm(`Are you sure you want to reject and delete ${name}'s request permanently?`)) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', uid));
      alert(`${name}'s request has been rejected and account permanently deleted.`);
      fetchStats();
    } catch (err) {
      console.error("Error rejecting admin:", err);
      alert("Failed to reject admin.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { name: 'TOTAL AGENTS', value: stats.employees, icon: <Users size={22} />, bg: 'bg-white', text: 'text-slate-800' },
    { name: 'ACTIVE COURSES', value: stats.courses, icon: <BookOpen size={22} />, bg: 'bg-brand-red-light', text: 'text-brand-red' },
    { name: 'DISPATCHED TASKS', value: stats.assignments, icon: <UserPlus size={22} />, bg: 'bg-white', text: 'text-slate-800' },
    { name: 'AVG PASS RATE', value: `${stats.passRate}%`, icon: <Award size={22} />, bg: 'bg-warning-yellow', text: 'text-slate-800' }
  ];

  const PIE_COLORS = ['#1F9D55', '#D7263D']; // success-green, error-red

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
      <BackgroundParticles />
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 max-w-7xl w-full mx-auto z-10">
        
        {/* Header bar - Split Layout and Premium */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-3 border-slate-200 pb-6 w-full">
          <div className="flex items-center gap-4 text-left">
            <div className="bg-brand-red-light p-3 border-3 border-slate-800 shadow-[3px_3px_0px_#000] shrink-0 rounded-xl">
              <TrendingUp className="w-7 h-7 text-brand-red" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-800 uppercase tracking-tight leading-none">
                ANALYTICS HUB
              </h1>
              <p className="text-xs font-body text-slate-500 font-bold mt-2 max-w-md">
                Manage employee rosters, process maps, and check real-time passing metrics.
              </p>
            </div>
          </div>
          <button 
            onClick={fetchStats}
            className="bg-white text-slate-800 font-heading font-black uppercase tracking-wider text-xs px-5 py-2.5 border-3 border-slate-800 rounded-xl shadow-[3px_3px_0px_#000] transition-all duration-150 hover:-translate-x-[1.5px] hover:-translate-y-[1.5px] hover:shadow-[4.5px_4.5px_0px_#000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-slate-50 select-none flex items-center justify-center gap-2 cursor-pointer shrink-0 w-full sm:w-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
            <span>REFRESH METRICS</span>
          </button>
        </div>

        {loading ? (
          <div className="w-full max-w-6xl mx-auto">
            <SkeletonLoader type="dashboard" />
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            {/* Stat Cards Grid with Entry Animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((card, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  key={idx} 
                  className={`border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 relative transition-all duration-200 ${card.bg} flex flex-col justify-between h-36 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#000]`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-heading font-black text-[10px] uppercase tracking-wider text-slate-400">{card.name}</span>
                    <div className="border-2 border-slate-800 rounded-lg p-1.5 bg-white shadow-[2px_2px_0px_#000] text-slate-800">
                      {card.icon}
                    </div>
                  </div>
                  <span className={`font-heading font-black text-4xl leading-none ${card.text}`}>{card.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Main Action Hub - Redesigned Graph block to Admin Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Trainer Signup Requests Card (Replaces Course Competency Chart) */}
              <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white lg:col-span-2 flex flex-col h-[380px]">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider mb-6 border-b-2 border-slate-100 pb-2 flex items-center gap-1.5 text-slate-800">
                  <ShieldAlert size={16} className="text-brand-red" /> Trainer Registration Approvals
                </h3>
                <div className="flex-1 w-full overflow-y-auto pr-1">
                  {pendingAdmins.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {pendingAdmins.map((req) => (
                        <div key={req.id} className="border-2 border-slate-800 rounded-xl p-3.5 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex flex-col text-left">
                            <span className="font-heading font-black text-xs uppercase text-slate-850">{req.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono mt-1 font-bold">{req.email} • {req.designation}</span>
                            <span className="text-[9px] text-brand-red font-mono mt-1">Requested: {new Date(req.createdAt).toLocaleString()}</span>
                          </div>
                          
                          {/* Actions restricted to Master Admin */}
                          {currentUserEmail === 'admin@globiva.com' ? (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => handleApproveAdmin(req.id, req.name)}
                                className="bg-success-green text-white font-heading font-black text-[10px] uppercase py-1.5 px-3 border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-green-700 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectAdmin(req.id, req.name)}
                                className="bg-error-red text-white font-heading font-black text-[10px] uppercase py-1.5 px-3 border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-red-800 cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] font-heading font-bold text-slate-400 bg-white border border-slate-200 py-1.5 px-3 rounded-lg select-none">
                              Master Admin Action Only
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                      <div className="border-2 border-slate-250 bg-slate-50 p-3 rounded-full text-slate-400 mb-3 shadow-[2px_2px_0px_#000]">
                        <UserPlus size={24} />
                      </div>
                      <p className="font-heading font-bold text-xs text-slate-400 uppercase">No pending trainer registrations</p>
                      <p className="text-[10px] text-slate-400 font-body mt-1 max-w-xs leading-relaxed">Requests expire and delete automatically if not approved within 24 hours.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie Chart: Overall Pass / Fail */}
              <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white flex flex-col h-[380px]">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider mb-6 border-b-2 border-slate-100 pb-2 flex items-center gap-1.5 text-slate-800">
                  <Award size={16} className="text-warning-yellow" /> Qualification Ratios
                </h3>
                <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                  {stats.totalResults > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          outerRadius={85}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="#1e293b"
                          strokeWidth={2.5}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            border: '3px solid #1e293b', 
                            borderRadius: '12px',
                            fontFamily: 'Inter',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            boxShadow: '4px 4px 0px 0px #000000'
                          }} 
                        />
                        <Legend wrapperStyle={{ fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Award size={40} className="text-slate-300 mb-2" />
                      <p className="font-heading font-bold text-xs text-slate-400 uppercase">No pass statistics available</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Row: Recent Activity Log & Trainer Sticker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Recent Quiz Attempts Log */}
              <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-heading font-black text-sm uppercase tracking-wider border-b-2 border-slate-100 pb-2 flex items-center gap-1.5 text-slate-800">
                  <Clock size={16} className="text-blue-500" /> Recent Assessment Runs
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b-2 border-slate-100 font-heading font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        <th className="pb-3">AGENT</th>
                        <th className="pb-3">COURSE</th>
                        <th className="pb-3 text-center">SCORE</th>
                        <th className="pb-3 text-center">RESULT</th>
                      </tr>
                    </thead>
                    <tbody className="font-body text-xs font-bold divide-y divide-slate-100 text-slate-650 font-bold">
                      {recentAttempts.length > 0 ? (
                        recentAttempts.map((attempt, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3.5 pr-2">
                              <div className="flex flex-col">
                                <span className="text-slate-800">{attempt.employeeName}</span>
                                <span className="text-[9px] text-slate-400 font-mono mt-0.5">{attempt.employeeIdCode}</span>
                              </div>
                            </td>
                            <td className="py-3.5 max-w-xs truncate pr-2 text-slate-700">{attempt.courseTitle}</td>
                            <td className="py-3.5 text-center font-heading text-sm text-slate-800">{attempt.mcqScore}%</td>
                            <td className="py-3.5 text-center">
                              <span className={`border-2 border-slate-800 shadow-[2px_2px_0px_#000] rounded-full px-2.5 py-0.5 text-[9px] font-heading font-black tracking-wider inline-block ${attempt.passed ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'}`}>
                                {attempt.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-slate-400 font-heading text-xs uppercase">
                            No evaluations taken yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tips & Leaderboards */}
              <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-warning-yellow flex flex-col justify-between">
                <div className="flex flex-col gap-3">
                  <div className="border-2 border-slate-800 bg-white rounded-xl p-2 shadow-[2px_2px_0px_#000] w-fit text-brand-red animate-pulse">
                    <Sparkles size={22} />
                  </div>
                  <h4 className="font-heading font-black text-base uppercase tracking-wider mt-1 text-slate-800">Quick Showcase Tip</h4>
                  <p className="font-body text-xs text-slate-800 leading-relaxed font-bold">
                    Click "Quick Login" on the Learner login page to enter as an agent. Play levels, complete the MCQ test, and download the certificate PDF. All score updates will instantly populate this admin panel!
                  </p>
                </div>
                
                <div className="border-t-2 border-dashed border-slate-800/20 pt-4 mt-6">
                  <span className="text-[9px] font-heading font-black text-slate-500 tracking-wider block uppercase">SYSTEM STATE</span>
                  <span className="text-xs font-mono font-bold text-brand-red uppercase mt-1 block">✔ Firebase Realtime Connected</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
