// ==========================================
// 🧩 THEKEDAAR VIEW - MASTER DASHBOARD (MERN STACK)
// Location: src/components/ThekedaarView.jsx
// Description: Contractor portal for managing Sites, Roster, Attendance, Advances, Materials, Tasks, and Malik Ledger with PDF/Excel Export.
// ==========================================

import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import SystemAlertBanner from './SystemAlertBanner';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import { 
  Building, Users, ClipboardCheck, HandCoins, 
  MapPin, Phone, Search, IndianRupee, Trash2,
  Check, X, Clock, ChevronLeft, ChevronRight,
  PackageOpen, Landmark, Wallet, 
  Truck, Plus, Tag, PlusCircle, Calendar,
  LayoutGrid, ClipboardList, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, FileText, FileSpreadsheet
} from 'lucide-react';

export default function ThekedaarView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('sites');
  const [dbSites, setDbSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState('');
  
  // 👷 NAYI STATE: Labours ki list store karne ke liye
  const [laboursList, setLaboursList] = useState([]);

  const thekedaarId = currentUser?._id || currentUser?.id;

  // 🔄 Component load hote hi Sites aur Labours dono fetch karo
  useEffect(() => {
    if (thekedaarId) {
      fetchSites();
      fetchLabours(); // <-- Yahan add kar diya
    }
  }, [thekedaarId]);

  const fetchSites = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/thekedaar/${thekedaarId}`);
      if (res.ok) {
        const data = await res.json();
        setDbSites(data);
        if (data.length > 0 && !activeSiteId) setActiveSiteId(data[0]._id);
      }
    } catch (err) { console.error("Failed to fetch sites:", err); }
  };

  // 👷 LABOURS FETCH KARENGE BACKEND SE (Only Contractor's Labours)
  const fetchLabours = async () => {
    const session = JSON.parse(localStorage.getItem('thekedaar_active_session'));
    const token = session?.token || localStorage.getItem('buildhub_token');
    if (!token) return;

    try {
      const res = await fetch('${API_BASE_URL}/api/thekedaar/labours', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLaboursList(data.labours);
      }
    } catch (err) { console.error("Failed to fetch labours:", err); }
  };

  // ... baaki tumhara existing code (activeSiteData, Header, Tabs, Select Dropdown) ...

  if (!currentUser) return <div className="p-10 text-center font-bold">Loading Profile...</div>;

  // 🎯 Current selected site ka data object nikaalo
  const activeSiteData = dbSites.find(s => s._id === activeSiteId) || null;

  return (
    <div className="space-y-6 text-xs text-slate-800">
      
      {/* 🏛️ HEADER TOWER: Contractor Identity */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2.5 rounded-xl shadow-inner">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">Contractor Dashboard</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Welcome back, <span className="text-indigo-400 font-bold uppercase tracking-wider">{currentUser.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 🔴 SYSTEM ALERT BANNER: Global maintenance/announcements */}
      <SystemAlertBanner userRole="thekedaar" userStatus={currentUser.status || 'Active'} />

      {/* 🧭 HORIZONTAL NAVIGATION TABS SWITCHER */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
        {['sites','tasks','roster', 'attendance', 'advances', 'materials', 'malik'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex shrink-0 items-center gap-2 px-3 py-2 text-[11px] font-black rounded-lg capitalize ${activeTab === tab ? 'bg-white text-slate-950 shadow-3xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab === 'sites' && <MapPin className="w-3.5 h-3.5" />}
            {tab === 'roster' && <Users className="w-3.5 h-3.5" />}
            {tab === 'attendance' && <ClipboardCheck className="w-3.5 h-3.5" />}
            {tab === 'advances' && <HandCoins className="w-3.5 h-3.5" />}
            {tab === 'materials' && <PackageOpen className="w-3.5 h-3.5" />}
            {tab === 'malik' && <Landmark className="w-3.5 h-3.5" />}
            {tab === 'tasks' && <LayoutGrid className="w-3.5 h-3.5" />}
            {tab === 'sites' ? 'Site Manager' : 
             tab === 'tasks' ? 'Tasks & Milestones' :
              tab === 'roster' ? 'Labours' : 
              tab === 'attendance' ? 'Attendance' : 
              tab === 'advances' ? 'Khata (Advance)' :
              tab === 'materials' ? 'Material & Vendor' : 'Malik Ka Khata'
            }
          </button>
        ))}
      </div>

      {/* 🌍 GLOBAL SITE SWITCHER DROPDOWN (Appears on active tabs) */}
      {dbSites.length > 0 && activeTab !== 'sites' && (
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-3 shadow-3xs">
          <span className="text-[10px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Active Site:
          </span>
          <select 
            value={activeSiteId} 
            onChange={(e) => setActiveSiteId(e.target.value)}
            className="flex-1 bg-white border border-indigo-200 p-2 rounded-lg font-bold text-slate-900 text-xs focus:outline-none focus:border-indigo-500 shadow-3xs cursor-pointer"
          >
            {dbSites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      )}

{/* ==========================================
          TAB PIPELINE ROUTING (Wrapped for Smooth Switching)
          ========================================== */}
      {/* 👇 YAHAN SE MIN-HEIGHT WRAPPER SHURU HUA (Glitch Fix) 👇 */}
      <div className="min-h-[60vh] md:min-h-[600px]">
        
        {activeTab === 'sites' && (
          <SiteManager currentUser={currentUser} dbSites={dbSites} fetchSites={fetchSites} />
        )}
        
        {/* 👷 EK HI BAR RENDER KARO - Saare zaroori props ke sath */}
        {activeTab === 'roster' && activeSiteId && (
          <WorkerRoster 
            siteId={activeSiteId} 
            currentUser={currentUser} 
            laboursList={laboursList} 
            refreshLabours={fetchLabours} 
          />
        )}
        
        {activeTab === 'attendance' && activeSiteId && (
          <AttendanceSheet siteId={activeSiteId} currentUser={currentUser} activeSiteData={activeSiteData} />
        )}
        
        {activeTab === 'advances' && activeSiteId && (
          <AdvanceLedger siteId={activeSiteId} currentUser={currentUser} />
        )}
        
        {activeTab === 'tasks' && activeSiteData && (
          <MilestoneTaskBoard siteData={activeSiteData} fetchSites={fetchSites} />
        )}
        
        {activeTab === 'materials' && activeSiteData && (
          <MaterialManager siteData={activeSiteData} fetchSites={fetchSites} />
        )}
        
        {activeTab === 'malik' && activeSiteData && (
          <MalikKhata siteData={activeSiteData} fetchSites={fetchSites} />
        )}

        {/* Fallback if no site is selected */}
        {activeTab !== 'sites' && !activeSiteId && (
          <div className="text-center py-10 border border-dashed rounded-xl bg-slate-50">
            <p className="text-slate-500 font-bold mb-2">No Active Sites Found</p>
            <button onClick={() => setActiveTab('sites')} className="text-indigo-600 font-black underline cursor-pointer">Go to Site Manager</button>
          </div>
        )}

      </div>
      {/* 👆 YAHAN MIN-HEIGHT WRAPPER KHATAM HUA 👆 */}

    </div>
  );
}

// ==========================================
// 1. SITE MANAGER TAB
// ==========================================
function SiteManager({ currentUser, dbSites, fetchSites }) {
  const [newSiteName, setNewSiteName] = useState('');
  const { showToast } = useToast();

  const handleCreateSite = async (e) => {
    e.preventDefault();
    if (!newSiteName.trim()) return;
    try {
      const res = await fetch('${API_BASE_URL}/api/sites/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSiteName.trim(), thekedaarId: currentUser._id || currentUser.id })
      });
      if (res.ok) {
        showToast("New Site Created!", "success");
        setNewSiteName(''); fetchSites();
      }
    } catch (err) { showToast("Network Error", "error"); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div><h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-indigo-600" /> Active Project Sites</h3></div>
      <form onSubmit={handleCreateSite} className="flex gap-2">
        <input type="text" placeholder="Enter new site name..." value={newSiteName} onChange={(e)=>setNewSiteName(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-indigo-500" required />
        <button type="submit" className="bg-slate-950 text-white px-4 py-2.5 rounded-xl font-black text-xs hover:bg-slate-800">Create Site</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {dbSites.map((site, idx) => (
          <div key={site._id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-black text-xs">S{idx + 1}</div>
            <p className="font-black text-slate-900">{site.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. WORKER ROSTER TAB
// ==========================================
function WorkerRoster({ siteId, currentUser }) {
  const { showToast } = useToast();
  const [masterLabours, setMasterLabours] = useState([]);
  const [dbAssignments, setDbAssignments] = useState([]);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWage, setRegWage] = useState('');
  const [regSkill, setRegSkill] = useState('Helper');
  const [assignLabourId, setAssignLabourId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const thekedaarId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (thekedaarId) { fetchMasterLabours(); fetchAssignments(); }
  }, [thekedaarId, siteId]);

  const fetchMasterLabours = async () => {
    const res = await fetch(`${API_BASE_URL}/api/users/labours/${thekedaarId}`);
    if (res.ok) setMasterLabours(await res.json());
  };
  const fetchAssignments = async () => {
    const res = await fetch(`${API_BASE_URL}/api/sites/assignments/${thekedaarId}`);
    if (res.ok) setDbAssignments(await res.json());
  };

  const handleRegisterLabour = async (e) => {
    e.preventDefault();
    
    // Get active session token
    const session = JSON.parse(localStorage.getItem('thekedaar_active_session'));
    const token = session?.token || localStorage.getItem('buildhub_token');
  
    if (!token) {
      showToast("Session expired. Please login again.", "error");
      return;
    }
  
    try {
      const res = await fetch('${API_BASE_URL}/api/thekedaar/add-labour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: labourName,       // Apne form state variables ke hisaab se check kar lena
          phone: labourPhone,
          password: labourPassword || '123',
          skill: labourSkill || 'Helper',
          dailyWage: Number(labourWage) || 0
        })
      });
  
      const data = await res.json();
  
      if (res.ok && data.success) {
        showToast(data.message, "success");
        // List refresh karne ya modal close karne ka function yahan call kar dena
        fetchLaboursFromServer?.(); 
      } else {
        showToast(data.message || "Failed to register labour", "error");
      }
    } catch (err) {
      console.error("Register labour network error:", err);
      showToast("Server connection error", "error");
    }
  };

  const handleAssignLabour = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('${API_BASE_URL}/api/sites/assign', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: assignLabourId, siteId, thekedaarId })
      });
      if (res.ok) { showToast("Assigned!", "success"); setAssignLabourId(''); fetchAssignments(); }
    } catch (err) {}
  };
  // ==========================================
  // 🔑 SUPERIOR-BASED PASSWORD RESET FUNCTION
  // ==========================================
  
  const handleUnassignWorker = async (workerId) => {
    try {
      await fetch(`${API_BASE_URL}/api/sites/assignment/${workerId}/${siteId}`, { method: 'DELETE' });
      fetchAssignments();
    } catch (err) {}
  };
  
// ==========================================
  // 🔑 SUPERIOR-BASED PASSWORD RESET FUNCTION
  // ==========================================
  const handleResetLabourPassword = async (workerId, workerName) => {
    const newPass = prompt(`🚨 PASSWORD RESET\n\nEnter new temporary password for ${workerName}:`, "123");
    if (!newPass) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${workerId}/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        fetchMasterLabours(); // ✅ YEH NAYA ADD KIYA: Taki Red Badge turant hat jaye
      } else {
        showToast(data.message || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      showToast("Server connection error", "error");
    }
  };
  const siteWorkerIds = dbAssignments.filter(a => a.siteId?._id === siteId).map(a => a.workerId);
  const currentSiteLabours = masterLabours.filter(l => siteWorkerIds.includes(l._id)).filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const unassignedMasterLabours = masterLabours.filter(l => !siteWorkerIds.includes(l._id));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div><h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600" /> Labour Registry</h3></div>
      <form onSubmit={handleRegisterLabour} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input type="text" placeholder="Worker Name" value={regName} onChange={(e)=>setRegName(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <input type="tel" maxLength={10} placeholder="Phone" value={regPhone} onChange={(e)=>setRegPhone(e.target.value.replace(/\D/g, ''))} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <input type="number" placeholder="Daily Wage (₹)" value={regWage} onChange={(e)=>setRegWage(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <select value={regSkill} onChange={(e)=>setRegSkill(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs"><option value="Helper">Helper</option><option value="Mason">Mason</option></select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold">Register & Deploy</button>
      </form>
      {unassignedMasterLabours.length > 0 && (
        <form onSubmit={handleAssignLabour} className="bg-indigo-50/50 p-3 rounded-xl flex gap-2">
          <select value={assignLabourId} onChange={(e) => setAssignLabourId(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 rounded-lg font-bold text-slate-800" required>
            <option value="">Assign existing worker...</option>
            {unassignedMasterLabours.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-3 rounded-lg font-bold">Assign</button>
        </form>
      )}
      <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg text-xs" />
      <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
        {currentSiteLabours.map(w => (
          <div key={w._id} className="py-2.5 flex justify-between items-center group">
            <div className="flex items-center gap-2"><p className="font-bold">{w.name}</p></div>
            <div className="flex items-center gap-2">
              {/* ✅ NAYA: Agar majdoor ne password request kiya hai, toh ye lal button dikhao */}
{w.resetRequested && (
  <button 
    onClick={() => handleResetLabourPassword(w._id, w.name)}
    className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[9px] font-black cursor-pointer hover:bg-red-500/20 transition-colors animate-pulse ml-2"
    title="Click to reset password"
  >
    🔴 RESET REQ
  </button>
)}

              <span className="font-black bg-slate-100 px-2 py-1 rounded text-[10px]">₹{w.dailyWage}</span>
              <button onClick={() => handleUnassignWorker(w._id)} className="text-amber-600"><X className="w-3 h-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. ATTENDANCE SHEET (FIXED ID MATCHING)
// ==========================================
function AttendanceSheet({ siteId, currentUser, activeSiteData }) {
  const { showToast } = useToast();
  const [attendance, setAttendance] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [siteWorkers, setSiteWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [advances, setAdvances] = useState([]);

  useEffect(() => {
    const fetchSiteWorkers = async () => {
      try {
        const thekedaarId = currentUser._id || currentUser.id;
        const [resAssign, resLabours] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sites/assignments/${thekedaarId}`),
          fetch(`${API_BASE_URL}/api/users/labours/${thekedaarId}`)
        ]);
        if (resAssign.ok && resLabours.ok) {
          const assignments = await resAssign.json();
          const allLabours = await resLabours.json();
          
          // 🔍 Robust ID matching (handles ObjectIds, strings, and populated docs)
          const validWorkerIds = assignments
            .filter(a => {
              const assignedSiteId = a.siteId?._id || a.siteId;
              return String(assignedSiteId) === String(siteId);
            })
            .map(a => String(a.workerId?._id || a.workerId));

          const filteredLabours = allLabours.filter(l => validWorkerIds.includes(String(l._id)));
          setSiteWorkers(filteredLabours);
          
          if (filteredLabours.length > 0) {
            setSelectedWorkerId(filteredLabours[0]._id);
          } else {
            setSelectedWorkerId('');
          }
        }
      } catch (err) { console.error("Error fetching site workers:", err); }
    };
    if (siteId) fetchSiteWorkers();
  }, [siteId, currentUser]);

  useEffect(() => {
    if (siteId) {
      fetchAttendance();
      fetchAdvances();
    }
  }, [siteId]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attendance/site/${siteId}`);
      if (res.ok) {
        const data = await res.json();
        const formatted = {};
        data.forEach(record => {
          if (!formatted[record.date]) formatted[record.date] = {};
          formatted[record.date][record.workerId] = record.status;
        });
        setAttendance(formatted);
      }
    } catch (err) { console.error(err); }
  };

  const fetchAdvances = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/advances/site/${siteId}`);
      if (res.ok) setAdvances(await res.json());
    } catch (err) { console.error(err); }
  };

  const getFormattedDateKey = (day) => {
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${currentDate.getFullYear()}-${m}-${d}`;
  };

  const toggleAttendance = async (day) => {
    if (!selectedWorkerId) return;
    const dateKey = getFormattedDateKey(day);
    const currentStatus = attendance[dateKey]?.[selectedWorkerId];
    
    let nextStatus = !currentStatus ? 'present' : currentStatus === 'present' ? 'absent' : currentStatus === 'absent' ? 'halfday' : null; 

    const updated = { ...attendance };
    if (!updated[dateKey]) updated[dateKey] = {};
    if (nextStatus) updated[dateKey][selectedWorkerId] = nextStatus;
    else delete updated[dateKey][selectedWorkerId];
    setAttendance(updated);

    try {
      await fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: selectedWorkerId, siteId, date: dateKey, status: nextStatus })
      });
      fetchAttendance(); 
    } catch (err) { showToast("Error saving attendance", "error"); }
  };

  const getStatus = (day) => attendance[getFormattedDateKey(day)]?.[selectedWorkerId] || null;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-indigo-600" /> Attendance Grid</h3>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {siteWorkers.length > 0 && (
            <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="bg-slate-50 border border-slate-200 p-2 rounded-xl font-bold text-slate-800 text-xs focus:outline-none">
              {siteWorkers.map(w => <option key={w._id} value={w._id}>{w.name} ({w.skill})</option>)}
            </select>
          )}
        </div>
      </div>

      {siteWorkers.length === 0 ? (
        <p className="text-slate-400 text-center py-12 border border-dashed rounded-xl font-bold">No workers assigned to this site yet. Assign workers from the Roster tab first.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-3.5 h-3.5 text-slate-700" /></button>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide font-mono">{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-3.5 h-3.5 text-slate-700" /></button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
            <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-wider">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-white min-h-[44px]" />)}
              {days.map(day => {
                const status = getStatus(day);
                return (
                  <div key={day} onClick={() => toggleAttendance(day)} className="bg-white min-h-[44px] p-1 cursor-pointer hover:bg-indigo-50/40 transition-colors relative flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{day}</span>
                    <div className="flex justify-center mb-1">
                      {status === 'present' && <div className="bg-emerald-500 w-4 h-4 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                      {status === 'absent' && <div className="bg-rose-500 w-4 h-4 rounded-full flex items-center justify-center"><X className="w-2.5 h-2.5 text-white" /></div>}
                      {status === 'halfday' && <div className="bg-amber-400 w-4 h-4 rounded-full flex items-center justify-center"><Clock className="w-2.5 h-2.5 text-white" /></div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ADVANCE KHATA TAB (FIXED ID MATCHING)
// ==========================================
function AdvanceLedger({ siteId, currentUser }) {
  const { showToast } = useToast();
  const [advances, setAdvances] = useState([]);
  const [workerId, setWorkerId] = useState('');
  const [amount, setAmount] = useState('');
  const [siteWorkers, setSiteWorkers] = useState([]);

  useEffect(() => {
    const fetchSiteWorkers = async () => {
      try {
        const thekedaarId = currentUser._id || currentUser.id;
        const [resAssign, resLabours] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sites/assignments/${thekedaarId}`),
          fetch(`${API_BASE_URL}/api/users/labours/${thekedaarId}`)
        ]);
        if (resAssign.ok && resLabours.ok) {
          const assignments = await resAssign.json();
          const allLabours = await resLabours.json();
          
          const validWorkerIds = assignments
            .filter(a => {
              const assignedSiteId = a.siteId?._id || a.siteId;
              return String(assignedSiteId) === String(siteId);
            })
            .map(a => String(a.workerId?._id || a.workerId));

          setSiteWorkers(allLabours.filter(l => validWorkerIds.includes(String(l._id))));
        }
      } catch (err) { console.error(err); }
    };
    if (siteId) fetchSiteWorkers();
  }, [siteId, currentUser]);

  useEffect(() => { if (siteId) fetchAdvances(); }, [siteId]);

  const fetchAdvances = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/advances/site/${siteId}`);
      if (res.ok) setAdvances(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddAdvance = async (e) => {
    e.preventDefault();
    if (!workerId || !amount) return;
    
    const selectedWorker = siteWorkers.find(w => String(w._id) === String(workerId));
    if (!selectedWorker) return;

    try {
      const res = await fetch('${API_BASE_URL}/api/advances/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: selectedWorker._id,
          workerName: selectedWorker.name,
          siteId,
          amount: Number(amount),
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        })
      });

      if (res.ok) {
        showToast(`₹${amount} issued to ${selectedWorker.name}`, 'success');
        setAmount(''); setWorkerId(''); fetchAdvances();
      }
    } catch (err) { showToast("Error updating ledger", "error"); }
  };

  const totalAdvancesPaid = advances.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><HandCoins className="w-4 h-4 text-indigo-600" /> Cash Advance Khata</h3>
        <div className="bg-rose-50 text-rose-700 font-black px-2 py-1 rounded-lg text-xs">Total: ₹{totalAdvancesPaid.toLocaleString('en-IN')}</div>
      </div>

      <form onSubmit={handleAddAdvance} className="flex flex-col sm:flex-row gap-2 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
        <select value={workerId} onChange={(e)=>setWorkerId(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none" required>
          <option value="">Select Worker...</option>
          {siteWorkers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <div className="relative w-full sm:w-44">
          <span className="absolute left-2.5 top-2 font-black text-slate-400 text-xs">₹</span>
          <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full bg-white border border-slate-200 pl-6 pr-2 py-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none" required />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-500 shadow-2xs">Issue Cash</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-44 overflow-y-auto pr-1">
        {advances.length === 0 ? <p className="text-slate-400 font-medium text-center py-4 col-span-full">No active advances distributed.</p> : advances.map(adv => (
          <div key={adv._id} className="bg-amber-50/40 border border-amber-100 p-2.5 rounded-xl flex justify-between items-center shadow-3xs">
            <div>
              <p className="font-bold text-slate-900 text-xs">{adv.workerName}</p>
              <p className="text-[9px] text-slate-400 font-bold">{adv.date}</p>
            </div>
            <span className="font-black text-rose-600 bg-white border border-rose-100 px-2 py-0.5 rounded-md text-xs">-₹{adv.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. MILESTONE TASK BOARD (KANBAN)
// ==========================================
function MilestoneTaskBoard({ siteData, fetchSites }) {
  const { showToast } = useToast();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const siteTasks = siteData.tasks || [];
  const totalCount = siteTasks.length;
  const doneCount = siteTasks.filter(t => t.status === 'done').length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
          status: 'todo',
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        })
      });

      if (res.ok) {
        showToast("Task Created", "success");
        setNewTaskTitle(''); fetchSites();
      }
    } catch (err) { showToast("Error adding task", "error"); }
  };

  const moveTask = async (taskId, currentStatus, direction) => {
    const statuses = ['todo', 'progress', 'done'];
    let currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= statuses.length) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/task/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statuses[nextIndex] })
      });
      if (res.ok) fetchSites();
    } catch (err) { showToast("Error moving task", "error"); }
  };

  const deleteTask = async (taskId) => {
    if(!window.confirm("Delete this milestone?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/task/${taskId}`, {
        method: 'DELETE'
      });
      if (res.ok) { showToast("Task deleted", "warning"); fetchSites(); }
    } catch (err) { showToast("Error deleting", "error"); }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-indigo-600" /> Milestone Tracking Board</h3>
          <p className="text-[11px] text-slate-400 font-medium">Manage project stages for <strong className="text-indigo-600">{siteData.name}</strong></p>
        </div>
        <div className="flex-1 max-w-md w-full">
          <div className="flex justify-between items-center mb-1.5 font-bold">
            <span className="text-slate-500">Site Work Completion Meter</span>
            <span className="text-indigo-600 font-black">{progressPercent}% Built</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
            <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <form onSubmit={handleAddTask} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Add Stage / Blueprint Task</label>
          <input type="text" required value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="e.g., Setup shuttering for 1st floor roof slab..." className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none" />
        </div>
        <div className="w-full sm:w-32">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Priority Tag</label>
          <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none">
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🔵 Low</option>
          </select>
        </div>
        <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: To Do */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col h-full min-h-[350px]">
          <div className="flex justify-between items-center mb-3 font-bold px-1">
            <span className="text-slate-700 flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-slate-400" /> Pending</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black">{siteTasks.filter(t => t.status === 'todo').length}</span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {siteTasks.filter(t => t.status === 'todo').slice().reverse().map(task => (
              <div key={task._id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-3 hover:border-slate-300 transition">
                <p className="font-bold text-slate-800 leading-normal">{task.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>{task.priority}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => deleteTask(task._id)} className="text-slate-300 hover:text-rose-600 p-1 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => moveTask(task._id, 'todo', 'next')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-1 px-1.5 rounded-md transition font-black flex items-center gap-0.5">Start <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 flex flex-col h-full min-h-[350px]">
          <div className="flex justify-between items-center mb-3 font-bold px-1">
            <span className="text-amber-800 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Active</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black">{siteTasks.filter(t => t.status === 'progress').length}</span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {siteTasks.filter(t => t.status === 'progress').slice().reverse().map(task => (
              <div key={task._id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-3 hover:border-amber-200 transition">
                <p className="font-bold text-slate-800 leading-normal">{task.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}>{task.priority}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveTask(task._id, 'progress', 'prev')} className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition"><ArrowLeft className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => moveTask(task._id, 'progress', 'next')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-1 px-1.5 rounded-md transition font-black flex items-center gap-0.5">Done <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="bg-emerald-50/30 border border-emerald-100/70 rounded-2xl p-4 flex flex-col h-full min-h-[350px]">
          <div className="flex justify-between items-center mb-3 font-bold px-1">
            <span className="text-emerald-800 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Finished</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black">{siteTasks.filter(t => t.status === 'done').length}</span>
          </div>
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {siteTasks.filter(t => t.status === 'done').slice().reverse().map(task => (
              <div key={task._id} className="bg-white border border-emerald-100 p-3 rounded-xl shadow-2xs space-y-3 opacity-85 hover:opacity-100 transition">
                <p className="font-bold text-slate-500 line-through leading-normal">{task.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">Success</span>
                  <button type="button" onClick={() => moveTask(task._id, 'done', 'prev')} className="text-slate-400 hover:text-indigo-600 p-1 px-1.5 rounded-md border border-slate-100 transition font-bold flex items-center gap-0.5"><ArrowLeft className="w-3 h-3" /> Reopen</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. MATERIAL & VENDOR MANAGER TAB
// ==========================================
function MaterialManager({ siteData, fetchSites }) {
  const { showToast } = useToast();
  const [vendorName, setVendorName] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [quantity, setQuantity] = useState('');

  const [materialDropdownItems, setMaterialDropdownItems] = useState(() => {
    const savedItems = localStorage.getItem('thekedaar_material_items');
    return savedItems ? JSON.parse(savedItems) : ['Cement (Bags)', 'Sariya / Steel (Kg)', 'Bajri / Gravel (Brass)', 'Sand / Reti (Brass)', 'Bricks / Eent (Pcs)', 'Crusher (Pcs)'];
  });
  const [customItem, setCustomItem] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('thekedaar_material_items', JSON.stringify(materialDropdownItems));
  }, [materialDropdownItems]);

  const siteMaterials = siteData.materials || [];
  const totalSiteMaterialExpense = siteMaterials.reduce((sum, item) => sum + (item.cost || 0), 0);
  const autoTotalPrice = Number(ratePerPiece || 0) * Number(quantity || 0);

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    if (!materialDropdownItems.includes(customItem.trim())) {
      setMaterialDropdownItems([...materialDropdownItems, customItem.trim()]);
      setSelectedMaterial(customItem.trim()); 
    }
    setCustomItem('');
    setShowAddItemForm(false);
  };

  const handleAddMaterialRecord = async (e) => {
    e.preventDefault();
    if (!vendorName.trim() || !selectedMaterial || !ratePerPiece || !quantity) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/material`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: vendorName.trim(),
          materialType: selectedMaterial,
          ratePerPiece: Number(ratePerPiece),
          quantity: Number(quantity),
          cost: autoTotalPrice, 
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        })
      });

      if (res.ok) {
        showToast("Material Logged Successfully!", "success");
        setVendorName(''); setSelectedMaterial(''); setRatePerPiece(''); setQuantity('');
        fetchSites();
      }
    } catch (err) { showToast("Error saving material log", "error"); }
  };

  const handleDeleteMaterial = async (materialId) => {
    if(!window.confirm("Delete this material log?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/material/${materialId}`, {
        method: 'DELETE'
      });
      if(res.ok) { showToast("Material Deleted", "warning"); fetchSites(); }
    } catch(err) { showToast("Error deleting", "error"); }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><Truck className="w-4 h-4 text-indigo-600" /> Material & Vendor Expense Log</h3>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-black px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs">
          Total Material Cost: <IndianRupee className="w-3 h-3 ml-1" />{totalSiteMaterialExpense.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <span className="font-bold text-slate-900 block">Need a custom item category?</span>
          <p className="text-[10px] text-slate-400">Add custom materials like tiles, pipes, or paint directly.</p>
        </div>
        {!showAddItemForm ? (
          <button type="button" onClick={() => setShowAddItemForm(true)} className="bg-white border border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[11px] hover:bg-slate-50 transition shadow-3xs">
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" /> + Add New Item Type
          </button>
        ) : (
          <form onSubmit={handleAddCustomItem} className="flex gap-1.5 items-center w-full sm:w-auto">
            <input type="text" placeholder="e.g., Marble" value={customItem} onChange={(e) => setCustomItem(e.target.value)} className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-bold text-xs focus:outline-none w-full sm:w-44" required />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs">Save</button>
            <button type="button" onClick={() => setShowAddItemForm(false)} className="text-slate-400 font-bold">Cancel</button>
          </form>
        )}
      </div>

      <form onSubmit={handleAddMaterialRecord} className="bg-indigo-50/30 border border-indigo-100/60 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Supplier / Vendor Name</label>
            <input type="text" placeholder="Supplier Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Select Material Item</label>
            <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs focus:outline-none" required>
              <option value="">-- Choose Item --</option>
              {materialDropdownItems.map((item, idx) => <option key={idx} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Rate (Cost per Unit)</label>
            <input type="number" placeholder="Rate" value={ratePerPiece} onChange={(e) => setRatePerPiece(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Quantity (Units)</label>
            <input type="number" placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs focus:outline-none" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-indigo-600 mb-0.5">Auto Total Cost</label>
            <div className="w-full bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg font-black text-xs text-slate-900 flex items-center">
              ₹ {autoTotalPrice.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2.5 rounded-xl font-bold text-xs transition shadow-2xs">
          + Save Material Log Entry
        </button>
      </form>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {siteMaterials.length === 0 ? (
          <p className="text-center text-slate-400 py-6 text-xs">No material logs added for this site yet.</p>
        ) : (
          siteMaterials.slice().reverse().map(mat => (
            <div key={mat._id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100 shadow-3xs">
              <div>
                <h4 className="font-black text-slate-900 text-xs">{mat.vendorName}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  <span className="text-indigo-700 font-bold">{mat.materialType}</span> • Rate: ₹{mat.ratePerPiece} | Qty: {mat.quantity} ({mat.date})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-950 bg-white border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
                  ₹{(mat.cost || 0).toLocaleString('en-IN')}
                </span>
                <button onClick={() => handleDeleteMaterial(mat._id)} className="text-slate-300 hover:text-rose-600 p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// 7. MALIK KA KHATA TAB & EXCEL EXPORT
// ==========================================
function MalikKhata({ siteData, fetchSites }) {
  const { showToast } = useToast();
  const [billAmount, setBillAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const finalBill = siteData.finalBill || 0;
  const payments = siteData.ownerPayments || [];
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = finalBill - totalReceived;

  const handleUpdateBill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/final-bill`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalBill: Number(billAmount) })
      });
      if (res.ok) {
        showToast("Final Bill Updated!", "success");
        setBillAmount(''); fetchSites();
      }
    } catch (err) { showToast("Error updating bill", "error"); }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/${siteData._id}/owner-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(paymentAmount),
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        })
      });
      if (res.ok) {
        showToast("Payment from Malik Saved!", "success");
        setPaymentAmount(''); fetchSites();
      }
    } catch (err) { showToast("Error saving payment", "error"); }
  };

  // 📊 EXCEL EXPORT FUNCTION (Full Site Accounting Ledger)
  const exportSiteExcelLedger = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Material & Vendor Log
    const materialRows = (siteData.materials || []).map((m, idx) => ({
      'S.No': idx + 1,
      'Date': m.date || 'N/A',
      'Vendor / Shop': m.vendorName,
      'Material Item': m.materialType,
      'Rate (Rs)': m.ratePerPiece,
      'Quantity': m.quantity,
      'Total Expense (Rs)': m.cost || 0
    }));
    const wsMaterial = XLSX.utils.json_to_sheet(materialRows.length ? materialRows : [{ Message: 'No Material Logs' }]);
    XLSX.utils.book_append_sheet(wb, wsMaterial, 'Material Log');

    // Sheet 2: Owner Payments
    const ownerRows = (siteData.ownerPayments || []).map((p, idx) => ({
      'S.No': idx + 1,
      'Date': p.date,
      'Mode': p.mode || 'Cash/Bank',
      'Payment Received (Rs)': p.amount,
      'Note': p.note || '-'
    }));
    const wsOwner = XLSX.utils.json_to_sheet(ownerRows.length ? ownerRows : [{ Message: 'No Owner Payments' }]);
    XLSX.utils.book_append_sheet(wb, wsOwner, 'Malik Payments');

    XLSX.writeFile(wb, `${siteData.name.replace(/\s+/g, '_')}_Ledger.xlsx`);
    showToast("Full Site Ledger Exported to Excel!", "success");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><Landmark className="w-4 h-4 text-emerald-600" /> Malik Ka Khata (Owner Ledger)</h3>
        </div>
        {/* 📊 Excel Export Button */}
        <button 
          type="button"
          onClick={exportSiteExcelLedger}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-3xs transition"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Export Full Ledger (Excel)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-lg">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Total Fixed Bill</span>
          <div className="text-xl font-black text-white">₹{finalBill.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
          <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest block mb-1">Total Received</span>
          <div className="text-xl font-black text-emerald-700">₹{totalReceived.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
          <span className="text-[10px] text-rose-600 font-black uppercase tracking-widest block mb-1">Remaining Balance</span>
          <div className="text-xl font-black text-rose-700">₹{remaining.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <form onSubmit={handleUpdateBill} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="block text-[10px] font-black text-slate-600 uppercase mb-2">Update Total Project Bill</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Enter Total Amount..." value={billAmount} onChange={e=>setBillAmount(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none" required />
            <button type="submit" className="bg-slate-950 text-white px-4 rounded-lg font-bold">Save</button>
          </div>
        </form>

        <form onSubmit={handleAddPayment} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <label className="block text-[10px] font-black text-emerald-700 uppercase mb-2">Log Payment Received (Today)</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Enter Received Amount..." value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} className="flex-1 bg-white border border-emerald-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none" required />
            <button type="submit" className="bg-emerald-600 text-white px-4 rounded-lg font-bold">Add</button>
          </div>
        </form>
      </div>

      <div className="pt-2">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b pb-2">Payment History</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {payments.length === 0 ? <p className="text-slate-400 text-center py-2">No payments received yet.</p> : payments.slice().reverse().map((p, i) => (
            <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-2.5 rounded-lg shadow-3xs">
              <span className="font-bold text-slate-600 flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5"/> Payment Received</span>
              <div className="text-right">
                <span className="block font-black text-emerald-600">+₹{p.amount.toLocaleString('en-IN')}</span>
                <span className="text-[9px] text-slate-400 font-medium">{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}