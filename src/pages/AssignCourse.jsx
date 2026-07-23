import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, query, where, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  UserCheck, 
  Calendar, 
  Check, 
  X, 
  Search,
  CheckSquare,
  Square,
  Trash2,
  FolderSync,
  RotateCcw
} from 'lucide-react';

export const AssignCourse = () => {
  const { currentUser } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [allCoursesForMapping, setAllCoursesForMapping] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment selection states
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Status feedback
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch courses (active & archived for titles mapping)
      const coursesSnap = await getDocs(collection(db, 'courses'));
      const activeCourses = [];
      const mappingCourses = [];
      coursesSnap.forEach((doc) => {
        const data = doc.data();
        mappingCourses.push({ id: doc.id, ...data });
        if (data.isActive) {
          activeCourses.push({ id: doc.id, ...data });
        }
      });
      setCourses(activeCourses);
      setAllCoursesForMapping(mappingCourses);
      
      // Auto-select first active course only if none is selected yet
      if (activeCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(activeCourses[0].id);
      }

      // 2. Fetch active employees
      const employeesQuery = query(
        collection(db, 'users'), 
        where('role', '==', 'employee'),
        where('status', '==', 'active')
      );
      const employeesSnap = await getDocs(employeesQuery);
      const activeEmployees = [];
      employeesSnap.forEach((doc) => {
        activeEmployees.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(activeEmployees);

      // 3. Fetch existing assignments
      const assignmentsSnap = await getDocs(collection(db, 'assignments'));
      const assignmentsList = [];
      assignmentsSnap.forEach((doc) => {
        assignmentsList.push({ id: doc.id, ...doc.data() });
      });
      setAssignments(assignmentsList);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch databases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleEmployee = (empId) => {
    if (selectedEmployeeIds.includes(empId)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter(id => id !== empId));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, empId]);
    }
  };

  const handleSelectAllFiltered = (filteredList) => {
    const allFilteredIds = filteredList.map(e => e.id);
    const allSelectedAlready = allFilteredIds.every(id => selectedEmployeeIds.includes(id));
    
    if (allSelectedAlready) {
      // Unselect all filtered
      setSelectedEmployeeIds(selectedEmployeeIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered (merge with existing selections)
      const merged = Array.from(new Set([...selectedEmployeeIds, ...allFilteredIds]));
      setSelectedEmployeeIds(merged);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError('Please select a course to assign.');
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      setError('Please select at least one agent.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let createdCount = 0;
      let skippedCount = 0;

      for (const employeeId of selectedEmployeeIds) {
        // Check if there is already an active or pending assignment for this employee and course
        const existing = assignments.find(
          (asn) => asn.employeeId === employeeId && asn.courseId === selectedCourseId && asn.status !== 'completed' && asn.status !== 'failed'
        );

        if (existing) {
          skippedCount++;
          continue;
        }

        // Add document to assignments collection
        await addDoc(collection(db, 'assignments'), {
          courseId: selectedCourseId,
          employeeId,
          assignedBy: currentUser.uid,
          assignedAt: new Date().toISOString(),
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          status: 'pending'
        });
        createdCount++;
      }

      setSuccess(`Assignments completed! Assigned to ${createdCount} agents. ${skippedCount > 0 ? `(Skipped ${skippedCount} active/pending assignments)` : ''}`);
      setSelectedEmployeeIds([]);
      setDueDate('');
      fetchData(); // Refresh assignments list
    } catch (err) {
      console.error(err);
      setError('An error occurred during assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to revoke this course assignment? Any ongoing progress for this course will be deleted.")) return;
    
    setError('');
    setSuccess('');
    try {
      await deleteDoc(doc(db, 'assignments', assignmentId));
      setSuccess("Course assignment revoked successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to revoke assignment.");
    }
  };

  const handleGrantExtraAttempt = async (assignment) => {
    if (!window.confirm(`Grant extra attempt to employee for course? This will reset their assignment status so they can retake the test.`)) return;

    setError('');
    setSuccess('');
    try {
      // 1. Delete previous attempts (results) for this employee & course
      const resultsQuery = query(
        collection(db, 'results'),
        where('employeeId', '==', assignment.employeeId),
        where('courseId', '==', assignment.courseId)
      );
      const resultsSnap = await getDocs(resultsQuery);
      const deletePromises = resultsSnap.docs.map(resDoc => deleteDoc(doc(db, 'results', resDoc.id)));
      await Promise.all(deletePromises);

      // 2. Update assignment status back to 'in-progress'
      const asnRef = doc(db, 'assignments', assignment.id);
      await updateDoc(asnRef, { status: 'in-progress' });

      setSuccess("Extra attempt granted successfully! Previous attempts cleared and status set to in-progress.");
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to grant extra attempt.");
    }
  };

  const departments = ['Customer Support', 'Tele-Sales', 'Quality Assurance', 'Escalations', 'Backoffice Operations'];

  const filteredEmployees = employees.filter((emp) => {
    // Exclude if already assigned and incomplete
    const alreadyAssigned = assignments.some(
      asn => asn.courseId === selectedCourseId && asn.employeeId === emp.id && asn.status !== 'completed' && asn.status !== 'failed'
    );
    if (alreadyAssigned) return false;

    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="min-h-screen main-content-layout flex flex-col bg-slate-50 relative overflow-hidden">
      <BackgroundParticles />
      <Sidebar />
      
      <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto z-10">
        
        {/* Title - Centered */}
        <div className="border-b-3 border-slate-200 pb-6 text-center w-full max-w-6xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-800">ASSIGN COURSE</h1>
          <p className="font-body text-sm text-slate-500 mt-1 max-w-md">Roll out process trainings and set deadlines for employee pools.</p>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="bg-success-green text-white p-4 border-3 border-slate-800 rounded-xl font-heading font-bold text-sm shadow-[4px_4px_0px_#000] flex items-center gap-2 max-w-6xl mx-auto w-full">
            <Check size={18} /> {success}
          </div>
        )}
        {error && (
          <div className="bg-error-red text-white p-4 border-3 border-slate-800 rounded-xl font-heading font-bold text-sm shadow-[4px_4px_0px_#000] flex items-center gap-2 max-w-6xl mx-auto w-full">
            <X size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-brand-red rounded-full animate-spin bg-white shadow-[3px_3px_0px_#000] mb-4"></div>
            <p className="font-heading font-bold text-sm text-slate-500 uppercase animate-pulse">Syncing rosters...</p>
          </div>
        ) : (
          <form onSubmit={handleAssign} className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
            
            {/* Left side: Select Course and due date */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              
              {/* Course Card Selector */}
              <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white flex flex-col gap-4">
                <h3 className="font-heading font-black text-lg uppercase tracking-wider border-b-2 border-slate-100 pb-2 text-slate-800">1. SELECT COURSE</h3>
                
                <div className="flex flex-col gap-1">
                  <label className="font-heading font-bold text-xs uppercase text-slate-400">Active Course</label>
                  <select
                    className="p-3 border-2 border-slate-800 rounded-xl font-body bg-slate-55 shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-brand-red w-full text-slate-800 font-bold"
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedEmployeeIds([]); // Clear selection when course changes to prevent cross-leak
                    }}
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {selectedCourse && (
                  <div className="bg-brand-red-light/30 border-2 border-dashed border-brand-red/35 p-3 rounded-xl flex flex-col gap-1.5 mt-2">
                    <span className="text-xs font-heading font-bold text-brand-red">GUIDELINE STATS:</span>
                    <span className="text-xs font-body text-slate-700 font-bold">{selectedCourse.sections?.length || 0} Game Levels</span>
                    <span className="text-xs font-body text-slate-700 font-bold">{selectedCourse.mcqs?.length || 0} Quiz Questions</span>
                    <span className="text-xs font-body text-slate-700 font-bold">Passing Mark: {selectedCourse.passPercentage}%</span>
                  </div>
                )}
              </div>

              {/* Due Date Card */}
              <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white flex flex-col gap-4">
                <h3 className="font-heading font-black text-lg uppercase tracking-wider border-b-2 border-slate-100 pb-2 text-slate-800">2. DEADLINE (OPTIONAL)</h3>
                
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2 items-center text-xs font-heading font-bold text-slate-400 mb-1">
                    <Calendar size={14} className="text-brand-red" /> SET DUE DATE
                  </div>
                  <input
                    type="date"
                    className="p-3 border-2 border-slate-800 rounded-xl font-body bg-white shadow-[2px_2px_0px_#000] focus:outline-none text-slate-800 font-bold text-sm w-full"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={submitting || courses.length === 0}
                className="bg-brand-red text-white font-heading font-black uppercase tracking-wider text-sm px-6 py-4 border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[6px_6px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none hover:bg-brand-red-dark select-none inline-flex items-center justify-center gap-2 cursor-pointer w-full disabled:opacity-50"
              >
                {submitting ? 'ASSIGNING ASSIGNMENTS...' : `DISPATCH TRAINING (${selectedEmployeeIds.length})`}
              </button>

            </div>

            {/* Right side: Employee Pool Selection */}
            <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white lg:col-span-2 flex flex-col gap-4 min-h-[450px]">
              <h3 className="font-heading font-black text-lg uppercase tracking-wider border-b-2 border-slate-100 pb-2 text-slate-800">3. CHOOSE EMPLOYEES</h3>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Filter by name or ID..."
                    className="w-full pl-9 pr-3 py-2 border-2 border-slate-800 rounded-lg text-sm font-body text-slate-800 font-bold focus:outline-none shadow-[2px_2px_0px_#000]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="w-full sm:w-48 p-2 border-2 border-slate-800 rounded-lg text-xs font-heading font-bold bg-white text-slate-800 shadow-[2px_2px_0px_#000] cursor-pointer"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="ALL">ALL DEPARTMENTS</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Multi-selection list */}
              <div className="flex-1 overflow-y-auto border-2 border-slate-800 rounded-xl p-3 bg-slate-50 max-h-[300px] flex flex-col gap-1.5 shadow-inner">
                <div className="flex justify-between items-center mb-2 px-1 border-b border-slate-200 pb-2">
                  <span className="text-[10px] font-heading font-bold text-slate-400 uppercase">Agents listed: {filteredEmployees.length}</span>
                  {filteredEmployees.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => handleSelectAllFiltered(filteredEmployees)}
                      className="text-[10px] font-heading font-black text-brand-red hover:underline uppercase"
                    >
                      Toggle Select All Listed
                    </button>
                  )}
                </div>

                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => {
                    const isSelected = selectedEmployeeIds.includes(emp.id);
                    return (
                      <div 
                        key={emp.id}
                        onClick={() => handleToggleEmployee(emp.id)}
                        className={`flex justify-between items-center p-3 border-2 border-slate-800 rounded-xl cursor-pointer select-none transition-all ${isSelected ? 'bg-brand-red-light border-brand-red shadow-none translate-x-[1px] translate-y-[1px]' : 'bg-white shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000]'}`}
                      >
                        <div className="flex items-center gap-3">
                          {isSelected ? <CheckSquare size={16} className="text-brand-red" /> : <Square size={16} className="text-slate-300" />}
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-xs uppercase leading-none text-slate-800">{emp.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono mt-1">{emp.employeeId} • {emp.department}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center py-16 text-center text-slate-400 font-heading font-bold text-xs uppercase">
                    No active employees matching filters
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              <div className="bg-slate-100 border-2 border-slate-200 p-3 rounded-xl flex flex-wrap gap-1.5 items-center shadow-inner">
                <span className="text-[10px] font-heading font-bold text-slate-500 uppercase mr-1">SELECTED ({selectedEmployeeIds.length}):</span>
                {selectedEmployeeIds.map(empId => {
                  const emp = employees.find(e => e.id === empId);
                  if (!emp) return null;
                  return (
                    <span key={empId} className="border border-slate-800 bg-white text-slate-700 text-[10px] font-bold py-1 px-2.5 rounded shadow-[1px_1px_0px_#000] flex items-center gap-1 uppercase">
                      {emp.name.split(' ')[0]}
                      <X size={10} className="text-brand-red cursor-pointer hover:scale-125" onClick={(e) => {
                        e.stopPropagation();
                        handleToggleEmployee(empId);
                      }} />
                    </span>
                  );
                })}
                {selectedEmployeeIds.length === 0 && <span className="text-xs text-slate-400 font-bold italic">No agents selected</span>}
              </div>

            </div>
          </form>
        )}

        {/* Active Assignments Table Section */}
        <div className="border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white flex flex-col gap-4 mt-6 w-full max-w-6xl mx-auto">
          <div className="border-b-2 border-slate-100 pb-3">
            <h3 className="font-heading font-black text-xl uppercase tracking-wider text-slate-800">ACTIVE TRAINING ASSIGNMENTS</h3>
            <p className="font-body text-xs text-slate-550 font-bold mt-1">Track course rollouts, statuses, deadlines, and revoke training modules.</p>
          </div>

          <div className="overflow-x-auto border-2 border-slate-850 rounded-xl shadow-[3px_3px_0px_#000]">
            <table className="w-full border-collapse text-left bg-white">
              <thead>
                <tr className="bg-slate-800 text-white font-heading font-bold text-[10px] uppercase tracking-wider">
                  <th className="p-3 border-r border-slate-700">AGENT / EMPLOYEE</th>
                  <th className="p-3 border-r border-slate-700">DEPARTMENT</th>
                  <th className="p-3 border-r border-slate-700">COURSE TITLE</th>
                  <th className="p-3 border-r border-slate-700">ASSIGNED ON</th>
                  <th className="p-3 border-r border-slate-700">DUE DATE</th>
                  <th className="p-3 border-r border-slate-700">STATUS</th>
                  <th className="p-3 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="font-body text-xs divide-y-2 divide-slate-100 text-slate-650 font-bold">
                {assignments.length > 0 ? (
                  assignments.map((asn) => {
                    const emp = employees.find(e => e.id === asn.employeeId) || {};
                    const course = allCoursesForMapping.find(c => c.id === asn.courseId) || {};
                    
                    return (
                      <tr key={asn.id} className="hover:bg-slate-50/50">
                        <td className="p-3 border-r border-slate-100">
                          <div className="flex flex-col">
                            <span className="font-heading font-bold text-slate-800 uppercase">{emp.name || 'Unknown Agent'}</span>
                            <span className="text-[9px] text-slate-400 font-mono mt-0.5">{emp.employeeId || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-100 font-heading font-bold text-[10px] uppercase text-slate-500">
                          {emp.department || 'N/A'}
                        </td>
                        <td className="p-3 border-r border-slate-100 font-heading font-bold text-[11px] uppercase text-slate-700">
                          {course.title || 'Unknown Course'}
                        </td>
                        <td className="p-3 border-r border-slate-100 text-slate-500 font-mono">
                          {asn.assignedAt ? new Date(asn.assignedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-3 border-r border-slate-100 text-slate-500 font-mono">
                          {asn.dueDate ? new Date(asn.dueDate).toLocaleDateString() : 'NO DEADLINE'}
                        </td>
                        <td className="p-3 border-r border-slate-100">
                          <span className={`border-2 border-slate-800 shadow-[1.5px_1.5px_0px_#000] rounded-full px-2 py-0.5 text-[9px] font-heading font-black tracking-wider inline-block ${
                            asn.status === 'completed' 
                              ? 'bg-green-100 text-success-green' 
                              : asn.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-600'
                              : asn.status === 'failed'
                              ? 'bg-red-100 text-error-red'
                              : 'bg-yellow-100 text-slate-700'
                          }`}>
                            {asn.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {(asn.status === 'failed' || asn.status === 'in-progress' || asn.status === 'completed') && (
                              <button
                                onClick={() => handleGrantExtraAttempt(asn)}
                                className="p-2 border-2 border-slate-800 bg-yellow-100 hover:bg-yellow-200 text-slate-800 rounded-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5 text-[10px] font-heading font-black uppercase cursor-pointer"
                                title="Grant Extra Attempt / Reset Progress"
                              >
                                <RotateCcw size={12} />
                                <span>GRANT ATTEMPT</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleUnassign(asn.id)}
                              className="p-2 border-2 border-slate-800 bg-red-100 hover:bg-red-200 text-error-red rounded-lg shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                              title="Revoke (Unassign) Course"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 font-heading font-bold uppercase text-xs">
                      No active training assignments dispatched
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AssignCourse;
