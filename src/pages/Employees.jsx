import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc, query, where } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, createSecondaryUser, auth } from '../firebase/config';
import { Sidebar } from '../components/shared/Sidebar';
import { BackgroundParticles } from '../components/shared/BackgroundParticles';
import { useAuth } from '../context/AuthContext';
import SkeletonLoader from '../components/shared/SkeletonLoader';
import { 
  UserPlus, 
  Search, 
  ToggleLeft, 
  ToggleRight, 
  Mail, 
  Edit3, 
  X, 
  Check, 
  Plus, 
  UserCheck, 
  UserX,
  Key
} from 'lucide-react';

export const Employees = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customAgentId, setCustomAgentId] = useState('');
  const [department, setDepartment] = useState('Customer Support');
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'employee'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setEmployees(list);
    } catch (err) {
      console.error("Error fetching employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Generate Unique Employee ID (e.g. GLB1024)
  const generateEmployeeId = () => {
    const min = 1000;
    const max = 9999;
    const rand = Math.floor(Math.random() * (max - min + 1) + min);
    return `GLB${rand}`;
  };

  // Add Employee
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessing(true);

    const employeeId = customAgentId.trim() ? customAgentId.trim().toUpperCase() : generateEmployeeId();
    const tempPassword = `Globiva@${Math.floor(100 + Math.random() * 900)}`; // e.g. Globiva@582

    try {
      // Check if email already registered in our list
      const emailExists = employees.some(emp => emp.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        throw new Error('Email is already registered.');
      }

      // Create Firebase Auth user using the secondary app workaround
      const newUid = await createSecondaryUser(email.trim(), tempPassword);

      // Write User details to Firestore
      const employeeData = {
        role: 'employee',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        employeeId,
        department,
        status: 'active',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      };

      await setDoc(doc(db, 'users', newUid), employeeData);
      
      setSuccess(`Agent added! ID: ${employeeId} | Temp Password: ${tempPassword}`);
      setName('');
      setEmail('');
      setCustomAgentId('');
      setDepartment('Customer Support');
      setIsAddModalOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create employee user.');
    } finally {
      setProcessing(false);
    }
  };

  // Edit Employee
  const handleEditEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setProcessing(true);

    try {
      const userRef = doc(db, 'users', editingEmployee.id);
      const updatedId = customAgentId.trim() ? customAgentId.trim().toUpperCase() : editingEmployee.employeeId;
      await updateDoc(userRef, {
        name: name.trim(),
        employeeId: updatedId,
        department
      });

      setSuccess(`Updated details for Agent ID: ${updatedId}`);
      setName('');
      setCustomAgentId('');
      setDepartment('Customer Support');
      setIsEditModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Failed to update employee details.');
    } finally {
      setProcessing(false);
    }
  };

  // Toggle Status (Activate/Deactivate)
  const toggleEmployeeStatus = async (emp) => {
    setError('');
    setSuccess('');
    const newStatus = emp.status === 'active' ? 'inactive' : 'active';
    
    try {
      const userRef = doc(db, 'users', emp.id);
      await updateDoc(userRef, { status: newStatus });
      setSuccess(`Status of employee ${emp.employeeId} changed to ${newStatus}.`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setError('Failed to update status.');
    }
  };

  // Send Password Reset
  const handleResetPassword = async (email) => {
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(`Password reset email sent successfully to ${email}.`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send password reset email.');
    }
  };

  const departments = ['Customer Support', 'Tele-Sales', 'Quality Assurance', 'Escalations', 'Backoffice Operations'];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div class="min-h-screen main-content-layout flex flex-col relative">
      <Sidebar />
      <BackgroundParticles />
      
      <main class="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto relative z-10">
        
        {/* Title and Top Actions */}
        <div class="flex flex-col items-center text-center gap-4 border-b-3 border-slate-800 pb-6 w-full">
          <div class="flex flex-col items-center">
            <h1 class="text-4xl font-black uppercase tracking-tight text-slate-800">AGENT MANAGEMENT</h1>
            <p class="font-body text-gray-600 mt-1">Register new agents, track activity status, and manage security credentials.</p>
          </div>
          <button 
            onClick={() => {
              setError('');
              setSuccess('');
              setIsAddModalOpen(true);
            }}
            class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center gap-2 text-xs py-2.5 px-4 bg-brand-red text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <UserPlus size={18} /> ADD NEW AGENT
          </button>
        </div>

        {/* Success & Error alerts */}
        {success && (
          <div class="bg-success-green text-white p-4 border-3 border-slate-800 rounded-xl font-heading font-bold text-sm shadow-[2px_2px_0px_#000] flex items-center gap-2 select-all">
            <Check size={18} /> {success}
          </div>
        )}
        {error && (
          <div class="bg-error-red text-white p-4 border-3 border-slate-800 rounded-xl font-heading font-bold text-sm shadow-[2px_2px_0px_#000] flex items-center gap-2">
            <X size={18} /> {error}
          </div>
        )}

        {/* Filter controls */}
        <div class="flex flex-col md:flex-row gap-4 items-center bg-white border-3 border-slate-800 p-4 rounded-xl shadow-[4px_4px_0px_#000]">
          <div class="relative w-full md:flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Email..."
              class="w-full pl-10 pr-3 py-2.5 border-2 border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red font-body text-slate-800 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div class="flex gap-2 w-full md:w-auto items-center">
            <span class="font-heading font-bold text-xs uppercase tracking-wider whitespace-nowrap text-slate-800">Dept:</span>
            <select
              class="w-full md:w-48 p-2.5 border-2 border-slate-800 rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-brand-red bg-white text-slate-800"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">ALL DEPARTMENTS</option>
              {departments.map((dept, idx) => (
                <option key={idx} value={dept}>{dept.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employees Table */}
        {loading ? (
          <SkeletonLoader type="table" />
        ) : (
          <div class="overflow-x-auto border-3 border-slate-800 rounded-xl shadow-[4px_4px_0px_#000] bg-white">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-slate-800 text-white font-heading font-bold text-xs uppercase tracking-wider">
                  <th class="p-4 text-left border-r border-slate-700/50">AGENT ID</th>
                  <th class="p-4 text-left border-r border-slate-700/50">NAME</th>
                  <th class="p-4 text-left border-r border-slate-700/50">EMAIL</th>
                  <th class="p-4 text-left border-r border-slate-700/50">DEPARTMENT</th>
                  <th class="p-4 text-left border-r border-slate-700/50">STATUS</th>
                  <th class="p-4 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody class="font-body text-sm divide-y-2 divide-slate-800 text-slate-800">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, idx) => (
                    <tr key={emp.id} class={idx % 2 === 0 ? 'bg-white' : 'bg-brand-red-light/10'}>
                      <td class="p-4 font-mono font-bold border-r border-slate-800/20">{emp.employeeId}</td>
                      <td class="p-4 font-bold border-r border-slate-800/20">{emp.name}</td>
                      <td class="p-4 border-r border-slate-800/20 text-gray-600 select-all">{emp.email}</td>
                      <td class="p-4 border-r border-slate-800/20 font-heading font-bold text-xs uppercase tracking-wider">{emp.department}</td>
                      <td class="p-4 border-r border-slate-800/20">
                        <span class={`border-2 border-slate-800 rounded-full px-3.5 py-1.5 text-[10px] font-black font-heading uppercase tracking-wider inline-flex items-center gap-1 select-none shadow-[2px_2px_0px_#000] ${emp.status === 'active' ? 'bg-green-100 text-success-green' : 'bg-red-100 text-error-red'}`}>
                          {emp.status === 'active' ? <UserCheck size={12} /> : <UserX size={12} />}
                          {emp.status}
                        </span>
                      </td>
                      <td class="p-4 flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setError('');
                            setSuccess('');
                            setEditingEmployee(emp);
                            setName(emp.name);
                            setCustomAgentId(emp.employeeId || '');
                            setDepartment(emp.department);
                            setIsEditModalOpen(true);
                          }}
                          class="p-2 border-2 border-slate-800 bg-white rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-gray-50 text-slate-800 transition-all"
                          title="Edit details"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => toggleEmployeeStatus(emp)}
                          class={`p-2 border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${emp.status === 'active' ? 'bg-red-50 hover:bg-red-100' : 'bg-green-50 hover:bg-green-100'}`}
                          title={emp.status === 'active' ? 'Deactivate account' : 'Activate account'}
                        >
                          {emp.status === 'active' ? <ToggleRight size={16} class="text-error-red" /> : <ToggleLeft size={16} class="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleResetPassword(emp.email)}
                          class="p-2 border-2 border-slate-800 bg-white rounded-lg shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-gray-50 text-slate-800 transition-all"
                          title="Send Password Reset"
                        >
                          <Key size={14} class="text-brand-red" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" class="p-12 text-center text-gray-500 font-heading font-bold uppercase">
                      No employees registered matching these filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Employee Modal */}
        {isAddModalOpen && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-slate-900/60" onClick={() => setIsAddModalOpen(false)}></div>
            <div class="relative w-full max-w-md border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white z-10 animate-scale-in">
              <div class="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4">
                <h3 class="font-heading font-black text-xl uppercase tracking-wider text-slate-800">ADD NEW AGENT</h3>
                <button onClick={() => setIsAddModalOpen(false)} class="p-1 border-2 border-slate-800 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-800">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddEmployee} class="flex flex-col gap-4">
                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                    Agent ID / Employee Code (Manual or Auto)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AGENT-101 or GLB8900 (Auto-generates if blank)"
                    class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full font-mono uppercase"
                    value={customAgentId}
                    onChange={(e) => setCustomAgentId(e.target.value)}
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter agent's full name"
                    class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. agent@globiva.com"
                    class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">Department</label>
                  <select
                    class="p-3 border-2 border-slate-800 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-brand-red bg-white text-slate-800 shadow-[2px_2px_0px_#000]"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center justify-center gap-2 text-xs py-3 px-4 bg-brand-red text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mt-2"
                >
                  {processing ? 'CREATING SECURE CREDENTIALS...' : 'CONFIRM & GENERATE AGENT'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {isEditModalOpen && (
          <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-slate-900/60" onClick={() => {
              setIsEditModalOpen(false);
              setEditingEmployee(null);
            }}></div>
            <div class="relative w-full max-w-md border-3 border-slate-800 shadow-[6px_6px_0px_#000] rounded-2xl p-6 bg-white z-10 animate-scale-in">
              <div class="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4">
                <h3 class="font-heading font-black text-xl uppercase tracking-wider text-slate-800">EDIT AGENT DETAILS</h3>
                <button onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEmployee(null);
                }} class="p-1 border-2 border-slate-800 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-800">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditEmployee} class="flex flex-col gap-4">
                <div class="flex flex-col gap-1 bg-gray-50 border-2 border-dashed border-slate-800/30 rounded-xl p-3 mb-1">
                  <span class="text-xs text-gray-500 font-mono">Email (Locked): <strong class="text-slate-800">{editingEmployee?.email}</strong></span>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                    Agent ID / Employee Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AGENT-101 or GLB8900"
                    class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full font-mono uppercase"
                    value={customAgentId}
                    onChange={(e) => setCustomAgentId(e.target.value)}
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter agent name"
                    class="bg-white border-3 border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-brand-red-light focus:bg-white font-body font-bold text-slate-800 transition-all shadow-[2px_2px_0px_#000] placeholder-gray-400 text-sm w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div class="flex flex-col gap-1">
                  <label class="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">Department</label>
                  <select
                    class="p-3 border-2 border-slate-800 rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-brand-red bg-white text-slate-800 shadow-[2px_2px_0px_#000]"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  class="border-3 border-slate-800 shadow-[4px_4px_0px_#000] rounded-xl flex items-center justify-center gap-2 text-xs py-3 px-4 bg-brand-red text-white font-heading font-black transition-all duration-200 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mt-2"
                >
                  {processing ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Employees;
