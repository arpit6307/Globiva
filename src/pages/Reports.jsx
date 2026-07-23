import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { 
  BarChart3, 
  Search, 
  Download, 
  Award, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';

export const Reports = () => {
  const [results, setResults] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PASS' | 'FAIL'
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch results
      const resultsSnap = await getDocs(collection(db, 'results'));
      const resultsList = [];
      resultsSnap.forEach((doc) => {
        resultsList.push({ id: doc.id, ...doc.data() });
      });

      // Fetch courses for titles mapping
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const coursesMap = {};
      const courseOptions = [];
      coursesSnap.forEach((doc) => {
        const data = doc.data();
        coursesMap[doc.id] = data;
        courseOptions.push({ id: doc.id, title: data.title });
      });
      setCourses(courseOptions);

      // Fetch users for names and departments mapping
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap = {};
      usersSnap.forEach((doc) => {
        usersMap[doc.id] = doc.data();
      });
      setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Map details to results list
      const resolvedList = resultsList.map((res) => {
        const user = usersMap[res.employeeId] || {};
        const course = coursesMap[res.courseId] || {};
        return {
          ...res,
          employeeName: user.name || 'Unknown Agent',
          employeeIdCode: user.employeeId || 'N/A',
          employeeDept: user.department || 'Unknown Department',
          courseTitle: course.title || 'Unknown Course'
        };
      });

      // Sort by date descending
      resolvedList.sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
      setResults(resolvedList);
    } catch (err) {
      console.error("Error fetching reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredResults = results.filter((res) => {
    const matchesSearch = res.employeeName.toLowerCase().includes(search.toLowerCase()) ||
                          res.employeeIdCode.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'ALL' || res.courseId === courseFilter;
    const matchesDept = deptFilter === 'ALL' || res.employeeDept === deptFilter;
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'PASS' && res.passed) || 
                          (statusFilter === 'FAIL' && !res.passed);
    return matchesSearch && matchesCourse && matchesDept && matchesStatus;
  });

  // Client-Side CSV Export (Requirement RPT-4)
  const handleExportCSV = () => {
    const headers = ['Agent Name', 'Employee ID', 'Department', 'Course', 'Score (%)', 'XP Earned', 'Result', 'Date'];
    const rows = filteredResults.map((res) => [
      `"${res.employeeName}"`,
      `"${res.employeeIdCode}"`,
      `"${res.employeeDept}"`,
      `"${res.courseTitle}"`,
      res.mcqScore,
      res.gameScore, // using gamescore as XP earned here
      res.passed ? 'PASS' : 'FAIL',
      new Date(res.attemptedAt).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GlobivaLearn_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments = ['Customer Support', 'Tele-Sales', 'Quality Assurance', 'Escalations', 'Backoffice Operations'];

  return (
    <div class="min-h-screen main-content-layout flex flex-col relative">
      <Sidebar />
      <BackgroundParticles />
      
      <main class="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto relative z-10">
        
        {/* Title & CSV download */}
        <div class="flex flex-col items-center text-center gap-4 border-b-3 border-slate-800 pb-6 w-full">
          <div class="flex flex-col items-center">
            <h1 class="text-4xl font-black uppercase tracking-tight text-slate-800">TRAINING REPORTS</h1>
            <p class="font-body text-gray-600 mt-1">Audit process qualifications, download certificate backups, and inspect answers.</p>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={filteredResults.length === 0}
            class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center gap-2 text-xs py-2.5 px-4 bg-success-green text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download size={16} /> EXPORT FILTERED CSV
          </button>
        </div>

        {/* Filters Panel */}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white border-3 border-slate-800 p-4 rounded-xl shadow-[4px_4px_0px_#000]">
          
          {/* Text Search */}
          <div class="flex flex-col gap-1">
            <label class="font-heading font-bold text-[10px] text-gray-500 uppercase">Search Employee</label>
            <div class="relative w-full">
              <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Name or ID..."
                class="w-full pl-8 pr-2 py-2 border-2 border-slate-800 rounded-lg text-xs font-body focus:outline-none text-slate-800 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Course filter */}
          <div class="flex flex-col gap-1">
            <label class="font-heading font-bold text-[10px] text-gray-500 uppercase">Process Course</label>
            <select
              class="p-2 border-2 border-slate-800 rounded-lg text-xs font-body bg-white text-slate-800 focus:outline-none"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="ALL">ALL COURSES</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div class="flex flex-col gap-1">
            <label class="font-heading font-bold text-[10px] text-gray-500 uppercase">Department</label>
            <select
              class="p-2 border-2 border-slate-800 rounded-lg text-xs font-body bg-white text-slate-800 focus:outline-none"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">ALL DEPARTMENTS</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div class="flex flex-col gap-1">
            <label class="font-heading font-bold text-[10px] text-gray-500 uppercase">Evaluation Result</label>
            <select
              class="p-2 border-2 border-slate-800 rounded-lg text-xs font-body bg-white text-slate-800 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">ALL RESULTS</option>
              <option value="PASS">PASSED ONLY</option>
              <option value="FAIL">FAILED ONLY</option>
            </select>
          </div>

        </div>

        {/* Results grid / table */}
        {loading ? (
          <div class="flex-1 flex flex-col items-center justify-center py-20">
            <div class="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[4px_4px_0px_#000] mb-4"></div>
            <p class="font-heading font-bold text-sm uppercase animate-pulse text-slate-800">Filtering report sheets...</p>
          </div>
        ) : (
          <div class="overflow-x-auto border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] bg-white">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-slate-800 text-white font-heading font-bold text-xs uppercase tracking-wider">
                  <th class="p-4 text-left border-r border-slate-700/50">AGENT</th>
                  <th class="p-4 text-left border-r border-slate-700/50">DEPARTMENT</th>
                  <th class="p-4 text-left border-r border-slate-700/50">COURSE TITLE</th>
                  <th class="p-4 text-left border-r border-slate-700/50">SCORE</th>
                  <th class="p-4 text-left border-r border-slate-700/50">STATUS</th>
                  <th class="p-4 text-center">DATE ATTEMPTED</th>
                </tr>
              </thead>
              <tbody class="font-body text-sm divide-y-2 divide-slate-800 text-slate-800">
                {filteredResults.length > 0 ? (
                  filteredResults.map((res, idx) => (
                    <tr key={res.id} class={idx % 2 === 0 ? 'bg-white' : 'bg-brand-red-light/20'}>
                      <td class="p-4 border-r border-slate-800/20">
                        <div class="flex flex-col">
                          <span class="font-bold">{res.employeeName}</span>
                          <span class="text-[10px] text-gray-500 font-mono">{res.employeeIdCode}</span>
                        </div>
                      </td>
                      <td class="p-4 border-r border-slate-800/20 font-heading font-bold text-xs uppercase">{res.employeeDept}</td>
                      <td class="p-4 border-r border-slate-800/20 font-bold max-w-xs truncate">{res.courseTitle}</td>
                      <td class="p-4 border-r border-slate-800/20">
                        <div class="flex flex-col">
                          <span class="font-heading font-black text-base text-slate-800">{res.mcqScore}%</span>
                          <span class="text-[10px] text-gray-500 font-mono">{res.correctAnswers}/{res.totalQuestions} Correct</span>
                        </div>
                      </td>
                      <td class="p-4 border-r border-slate-800/20">
                        <span class={`border-2 border-slate-800 rounded-full px-3.5 py-1.5 text-[10px] font-black font-heading uppercase tracking-wider inline-flex items-center gap-1 select-none shadow-[2px_2px_0px_#000] ${res.passed ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'}`}>
                          {res.passed ? <Check size={12} /> : <X size={12} />}
                          {res.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td class="p-4 text-center font-mono font-bold text-xs text-slate-800">
                        {new Date(res.attemptedAt).toLocaleDateString()} at {new Date(res.attemptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" class="p-12 text-center text-gray-500 font-heading font-bold uppercase">
                      No evaluation reports match current criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
};

export default Reports;
