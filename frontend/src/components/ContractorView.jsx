// ==========================================
// 🧩 CONTRACTOR VIEW - MASTER DASHBOARD (MERN STACK)
// Location: src/components/ContractorView.jsx
// Description: Contractor portal for managing Sites, Roster, Attendance, Advances, Materials, Tasks, and Malik Ledger with PDF/Excel Export.
// ==========================================

import React, { useState, useEffect } from 'react';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import SystemAlertBanner from './SystemAlertBanner';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import { 
  Building, Users, ClipboardCheck, HandCoins, Download,
  MapPin, Phone, Search, IndianRupee, Trash2,
  Check, X, Clock, ChevronLeft, ChevronRight,
  PackageOpen, Landmark, Wallet, 
  Truck, Plus, Tag, PlusCircle, Calendar,
  LayoutGrid, ClipboardList, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, FileText, FileSpreadsheet
} from 'lucide-react';

export default function ContractorView({ currentUser }) {
  const [activeTab, setActiveTab] = useState('sites');
  const [dbSites, setDbSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState('');
  
  // 👷 CHANGED: laboursList -> workersList
  const [workersList, setWorkersList] = useState([]);

  // ✅ CHANGED: thekedaarId -> contractorId
  const contractorId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (contractorId) {
      fetchSites();
      fetchWorkers(); 
    }
  }, [contractorId]);

  const fetchSites = async () => {
    try {
      // ✅ CHANGED: /thekedaar/ -> /contractor/
      const res = await fetch(`${API_BASE_URL}/api/sites/contractor/${contractorId}`);
      if (res.ok) {
        const data = await res.json();
        setDbSites(data);
        if (data.length > 0 && !activeSiteId) setActiveSiteId(data[0]._id);
      }
    } catch (err) { console.error("Failed to fetch sites:", err); }
  };

  // 👷 WORKERS FETCH KARENGE BACKEND SE (Only Contractor's Workers)
  const fetchWorkers = async () => {
    const session = JSON.parse(localStorage.getItem('thekedaar_active_session'));
    const token = session?.token || localStorage.getItem('buildhub_token');
    if (!token) return;

    try {
      // ✅ CHANGED: /api/thekedaar/labours -> /api/contractor/workers
      const res = await fetch(`${API_BASE_URL}/api/contractor/workers`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setWorkersList(data.workers); // ✅ CHANGED: labours -> workers
      }
    } catch (err) { console.error("Failed to fetch workers:", err); }
  };

  if (!currentUser) return <div className="p-10 text-center font-bold">Loading Profile...</div>;

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

      {/* 🔴 SYSTEM ALERT BANNER */}
      {/* ✅ CHANGED: userRole="contractor" */}
      <SystemAlertBanner userRole="contractor" userStatus={currentUser.status || 'Active'} />

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
             tab === 'roster' ? 'Workers' : 
             tab === 'attendance' ? 'Attendance' : 
             tab === 'advances' ? 'Khata (Advance)' :
             tab === 'materials' ? 'Material & Vendor' : 'Malik Ka Khata'
            }
          </button>
        ))}
      </div>

      {/* 🌍 GLOBAL SITE SWITCHER DROPDOWN */}
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

      {/* TAB PIPELINE ROUTING */}
      <div className="min-h-[60vh] md:min-h-[600px]">
        
        {activeTab === 'sites' && (
          <SiteManager currentUser={currentUser} dbSites={dbSites} fetchSites={fetchSites} />
        )}
        
        {activeTab === 'roster' && activeSiteId && (
          <WorkerRoster 
            siteId={activeSiteId} 
            currentUser={currentUser} 
            workersList={workersList} 
            refreshWorkers={fetchWorkers} 
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
      const res = await fetch(`${API_BASE_URL}/api/sites/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ CHANGED: thekedaarId -> contractorId
        body: JSON.stringify({ name: newSiteName.trim(), contractorId: currentUser._id || currentUser.id })
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
  // ✅ CHANGED: masterLabours -> masterWorkers
  const [masterWorkers, setMasterWorkers] = useState([]);
  const [dbAssignments, setDbAssignments] = useState([]);
  
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWage, setRegWage] = useState('');
  const [regSkill, setRegSkill] = useState('Helper');
  const [regPassword, setRegPassword] = useState(''); // ✅ FIXED: Password State Added
  
  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const contractorId = currentUser?._id || currentUser?.id; // ✅ CHANGED

  useEffect(() => {
    if (contractorId) { fetchMasterWorkers(); fetchAssignments(); }
  }, [contractorId, siteId]);

  const fetchMasterWorkers = async () => {
    // ✅ CHANGED: /api/users/labours -> /api/users/workers
    const res = await fetch(`${API_BASE_URL}/api/users/workers/${contractorId}`);
    if (res.ok) setMasterWorkers(await res.json());
  };

  const fetchAssignments = async () => {
    const res = await fetch(`${API_BASE_URL}/api/sites/assignments/${contractorId}`);
    if (res.ok) setDbAssignments(await res.json());
  };

  const handleRegisterWorker = async (e) => {
    e.preventDefault();
    
    const session = JSON.parse(localStorage.getItem('thekedaar_active_session'));
    const token = session?.token || localStorage.getItem('buildhub_token');
  
    if (!token) {
      showToast("Session expired. Please login again.", "error");
      return;
    }
  
    try {
      // ✅ CHANGED: /add-labour -> /add-worker
      const res = await fetch(`${API_BASE_URL}/api/contractor/add-worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: regName,       // ✅ FIXED: Matched with correct state
          phone: regPhone,
          password: regPassword || '123',
          skill: regSkill || 'Helper',
          dailyWage: Number(regWage) || 0
        })
      });
  
      const data = await res.json();
  
      if (res.ok && data.success) {
        showToast(data.message, "success");
        setRegName(''); setRegPhone(''); setRegWage(''); setRegPassword('');
        fetchMasterWorkers(); 
      } else {
        showToast(data.message || "Failed to register worker", "error");
      }
    } catch (err) {
      console.error("Register worker network error:", err);
      showToast("Server connection error", "error");
    }
  };

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/sites/assign`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        // ✅ CHANGED: thekedaarId -> contractorId
        body: JSON.stringify({ workerId: assignWorkerId, siteId, contractorId })
      });
      if (res.ok) { showToast("Assigned!", "success"); setAssignWorkerId(''); fetchAssignments(); }
    } catch (err) {}
  };
  
  const handleUnassignWorker = async (workerId) => {
    try {
      await fetch(`${API_BASE_URL}/api/sites/assignment/${workerId}/${siteId}`, { method: 'DELETE' });
      fetchAssignments();
    } catch (err) {}
  };
  
  const handleResetWorkerPassword = async (workerId, workerName) => {
    const newPass = prompt(`🚨 PASSWORD RESET\n\nEnter new temporary password for ${workerName}:`, "123");
    if (!newPass) return;

    const session = JSON.parse(localStorage.getItem('thekedaar_active_session'));
    const token = session?.token || localStorage.getItem('buildhub_token');

    try {
      // ✅ CHANGED: Endpoint updated in backend, hitting the correct reset password logic
      const res = await fetch(`${API_BASE_URL}/api/contractor/reset-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // ✅ CHANGED: labourId -> workerId
        body: JSON.stringify({ workerId: workerId, newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, "success");
        fetchMasterWorkers(); 
      } else {
        showToast(data.message || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      showToast("Server connection error", "error");
    }
  };

  const siteWorkerIds = dbAssignments.filter(a => a.siteId?._id === siteId).map(a => a.workerId);
  const currentSiteWorkers = masterWorkers.filter(l => siteWorkerIds.includes(l._id)).filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const unassignedMasterWorkers = masterWorkers.filter(l => !siteWorkerIds.includes(l._id));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div><h3 className="font-black text-slate-950 text-sm flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600" /> Worker Registry</h3></div>
      
      <form onSubmit={handleRegisterWorker} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          <input type="text" placeholder="Worker Name" value={regName} onChange={(e)=>setRegName(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <input type="tel" maxLength={10} placeholder="Phone" value={regPhone} onChange={(e)=>setRegPhone(e.target.value.replace(/\D/g, ''))} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <input type="text" placeholder="Set Password" value={regPassword} onChange={(e)=>setRegPassword(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <input type="number" placeholder="Daily Wage (₹)" value={regWage} onChange={(e)=>setRegWage(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs" required/>
          <select value={regSkill} onChange={(e)=>setRegSkill(e.target.value)} className="bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs"><option value="Helper">Helper</option><option value="Mason">Mason</option></select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded-xl font-bold">Register & Deploy</button>
      </form>

      {unassignedMasterWorkers.length > 0 && (
        <form onSubmit={handleAssignWorker} className="bg-indigo-50/50 p-3 rounded-xl flex gap-2">
          <select value={assignWorkerId} onChange={(e) => setAssignWorkerId(e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 rounded-lg font-bold text-slate-800" required>
            <option value="">Assign existing worker...</option>
            {unassignedMasterWorkers.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-3 rounded-lg font-bold">Assign</button>
        </form>
      )}

      <input type="text" placeholder="Search workers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-50 border p-2 rounded-lg text-xs" />
      
      <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
        {currentSiteWorkers.map(w => (
          <div key={w._id} className="py-2.5 flex justify-between items-center group">
            <div className="flex items-center gap-2"><p className="font-bold">{w.name}</p></div>
            <div className="flex items-center gap-2">
              {w.resetRequested && (
                <button 
                  onClick={() => handleResetWorkerPassword(w._id, w.name)}
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
// 3. ATTENDANCE SHEET (With Dynamic PDF/Excel Export)
// ==========================================
function AttendanceSheet({ siteId, currentUser, activeSiteData }) {
  const { showToast } = useToast();
  const [attendance, setAttendance] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [siteWorkers, setSiteWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // ✅ NAYA: Date Range State (Default: Pichle 7 din)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchSiteWorkers = async () => {
      try {
        const contractorId = currentUser._id || currentUser.id;
        const [resAssign, resWorkers] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sites/assignments/${contractorId}`),
          fetch(`${API_BASE_URL}/api/users/workers/${contractorId}`)
        ]);
        if (resAssign.ok && resWorkers.ok) {
          const assignments = await resAssign.json();
          const allWorkers = await resWorkers.json();
          
          const validWorkerIds = assignments
            .filter(a => {
              const assignedSiteId = a.siteId?._id || a.siteId;
              return String(assignedSiteId) === String(siteId);
            })
            .map(a => String(a.workerId?._id || a.workerId));

          const filteredWorkers = allWorkers.filter(l => validWorkerIds.includes(String(l._id)));
          setSiteWorkers(filteredWorkers);
          
          if (filteredWorkers.length > 0) {
            setSelectedWorkerId(filteredWorkers[0]._id);
          } else {
            setSelectedWorkerId('');
          }
        }
      } catch (err) { console.error("Error fetching site workers:", err); }
    };
    if (siteId) fetchSiteWorkers();
  }, [siteId, currentUser]);

  useEffect(() => {
    if (siteId) fetchAttendance();
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

  // ==========================================
  // 🚀 REPORT GENERATION LOGIC
  // ==========================================
  const generateReportData = () => {
    if (!fromDate || !toDate) {
      showToast("Please select valid dates!", "error");
      return null;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showToast("'From Date' cannot be after 'To Date'", "error");
      return null;
    }

    // 1. Generate dates array between fromDate and toDate
    const dateKeys = [];
    let curr = new Date(fromDate);
    const end = new Date(toDate);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dateKeys.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }

    // 2. Setup Headers (Name, Skill, Dates..., Total P, H, A)
    const formattedDates = dateKeys.map(d => {
      const parts = d.split('-');
      return `${parts[2]}/${parts[1]}`; // DD/MM format
    });
    const headers = ['Worker Name', 'Skill', ...formattedDates, 'Total P', 'Total H', 'Total A'];

    // 3. Process data per worker
    const rows = siteWorkers.map(worker => {
      let pCount = 0, hCount = 0, aCount = 0;
      const rowData = [worker.name, worker.skill];
      
      dateKeys.forEach(date => {
        const status = attendance[date]?.[worker._id] || '-';
        if (status === 'present') { pCount++; rowData.push('P'); }
        else if (status === 'halfday') { hCount++; rowData.push('H'); }
        else if (status === 'absent') { aCount++; rowData.push('A'); }
        else { rowData.push('-'); }
      });
      
      rowData.push(pCount, hCount, aCount);
      return rowData;
    });

    return { headers, rows };
  };

  const downloadPDF = () => {
    const data = generateReportData();
    if (!data) return;
    
    // Landscape mode kyunki columns (dates) zyada ho sakti hain
    const doc = new jsPDF('landscape');
    const siteName = activeSiteData?.name || 'Site';
    
    doc.setFontSize(16);
    doc.text(`Attendance Report: ${siteName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 22);

    doc.autoTable({
      head: [data.headers],
      body: data.rows,
      startY: 28,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600 Theme matching
      columnStyles: {
        0: { halign: 'left', cellWidth: 'auto' }, // Name
        1: { halign: 'left', cellWidth: 'auto' }  // Skill
      },
    });

    doc.save(`Attendance_${siteName.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.pdf`);
    showToast("PDF Downloaded successfully!", "success");
  };

  const downloadExcel = () => {
    const data = generateReportData();
    if (!data) return;

    const ws = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    
    const siteName = activeSiteData?.name || 'Site';
    XLSX.writeFile(wb, `Attendance_${siteName.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.xlsx`);
    showToast("Excel Sheet Downloaded successfully!", "success");
  };

  // ==========================================
  // RENDER LOGIC
  // ==========================================
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" /> Attendance Grid
          </h3>
          <p className="text-xs text-slate-500 mt-1">Mark daily attendance or export historical reports.</p>
        </div>
        
        {/* EXPORT REPORT SECTION (Naya Feature) */}
        <div className="flex flex-wrap items-end gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50 w-full lg:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-white border border-indigo-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-white border border-indigo-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none" />
          </div>
          
          <div className="flex items-center gap-2 ml-auto lg:ml-2">
            <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-rose-600/20">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={downloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shadow-emerald-600/20">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR SECTION */}
      {siteWorkers.length === 0 ? (
        <p className="text-slate-400 text-center py-12 border border-dashed rounded-xl font-bold">No workers assigned to this site yet. Assign workers from the Roster tab first.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Marking for:</span>
              <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="bg-white border border-slate-200 py-1.5 px-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none shadow-sm">
                {siteWorkers.map(w => <option key={w._id} value={w._id}>{w.name} ({w.skill})</option>)}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm"><ChevronLeft className="w-4 h-4 text-slate-700" /></button>
              <span className="text-xs font-black text-slate-900 uppercase tracking-wide font-mono w-32 text-center">
                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
              </span>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-sm"><ChevronRight className="w-4 h-4 text-slate-700" /></button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
            <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2 text-[9px] font-black text-slate-500 uppercase tracking-wider">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200">
              {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-white min-h-[50px]" />)}
              {days.map(day => {
                const status = getStatus(day);
                return (
                  <div key={day} onClick={() => toggleAttendance(day)} className="bg-white min-h-[50px] p-1.5 cursor-pointer hover:bg-indigo-50/40 transition-colors relative flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{day}</span>
                    <div className="flex justify-center mb-1.5">
                      {status === 'present' && <div className="bg-emerald-500 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"><Check className="w-3 h-3 text-white" /></div>}
                      {status === 'absent' && <div className="bg-rose-500 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"><X className="w-3 h-3 text-white" /></div>}
                      {status === 'halfday' && <div className="bg-amber-400 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"><Clock className="w-3 h-3 text-white" /></div>}
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
// 4. ADVANCE KHATA TAB (With Dynamic Export)
// ==========================================
function AdvanceLedger({ siteId, currentUser }) {
  const { showToast } = useToast();
  const [advances, setAdvances] = useState([]);
  const [workerId, setWorkerId] = useState('');
  const [amount, setAmount] = useState('');
  const [siteWorkers, setSiteWorkers] = useState([]);

  // ✅ NAYA: Date Range State (Default: Pichle 7 din)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchSiteWorkers = async () => {
      try {
        const contractorId = currentUser._id || currentUser.id;
        const [resAssign, resWorkers] = await Promise.all([
          fetch(`${API_BASE_URL}/api/sites/assignments/${contractorId}`),
          fetch(`${API_BASE_URL}/api/users/workers/${contractorId}`)
        ]);
        if (resAssign.ok && resWorkers.ok) {
          const assignments = await resAssign.json();
          const allWorkers = await resWorkers.json();
          
          const validWorkerIds = assignments
            .filter(a => {
              const assignedSiteId = a.siteId?._id || a.siteId;
              return String(assignedSiteId) === String(siteId);
            })
            .map(a => String(a.workerId?._id || a.workerId));

          setSiteWorkers(allWorkers.filter(l => validWorkerIds.includes(String(l._id))));
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
      const res = await fetch(`${API_BASE_URL}/api/advances/issue`, {
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

  // ✅ NAYA: Filter advances based on date range
  const filteredAdvances = advances.filter(adv => {
    const advDate = new Date(adv.date);
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999); // Din ka aakhiri second
    return advDate >= start && advDate <= end;
  });

  // Total ab sirf filtered list ka dikhayega
  const totalAdvancesPaid = filteredAdvances.reduce((s, a) => s + a.amount, 0);

  // ==========================================
  // 🚀 EXPORT LOGIC (PDF & EXCEL)
  // ==========================================
  const downloadPDF = () => {
    if (filteredAdvances.length === 0) {
      showToast("No records found in this date range!", "error");
      return;
    }

    const doc = new jsPDF('portrait');
    doc.setFontSize(16);
    doc.text(`Advance Khata Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 22);
    doc.text(`Total Distributed: Rs ${totalAdvancesPaid.toLocaleString('en-IN')}`, 14, 28);

    const headers = [['Date', 'Worker Name', 'Advance Amount (Rs)']];
    const rows = filteredAdvances.map(adv => [adv.date, adv.workerName, adv.amount]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 34,
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    doc.save(`Advance_Khata_${fromDate}_to_${toDate}.pdf`);
    showToast("Ledger PDF Downloaded!", "success");
  };

  const downloadExcel = () => {
    if (filteredAdvances.length === 0) {
      showToast("No records found in this date range!", "error");
      return;
    }

    const headers = ['Date', 'Worker Name', 'Advance Amount (Rs)'];
    const rows = filteredAdvances.map(adv => [adv.date, adv.workerName, adv.amount]);
    rows.push(['', 'TOTAL:', totalAdvancesPaid]); // Footer row for total

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Advance Ledger");
    
    XLSX.writeFile(wb, `Advance_Khata_${fromDate}_to_${toDate}.xlsx`);
    showToast("Ledger Excel Downloaded!", "success");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* HEADER WITH DATE FILTER & EXPORT BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-indigo-600" /> Cash Advance Khata
          </h3>
          <p className="text-xs text-slate-500 mt-1">Manage and export daily advances given to workers.</p>
        </div>
        
        {/* Date Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 w-full xl:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-white border border-indigo-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-white border border-indigo-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none" />
          </div>
          
          <div className="flex items-center gap-2 ml-auto xl:ml-2 mt-4 xl:mt-0">
            <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm">
              <FileText className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={downloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="text-xs font-black text-slate-500 uppercase">Filtered Total:</span>
        <div className="bg-rose-100 text-rose-700 font-black px-3 py-1.5 rounded-lg text-sm shadow-sm border border-rose-200">
          ₹{totalAdvancesPaid.toLocaleString('en-IN')}
        </div>
      </div>

      {/* FORM SECTION */}
      <form onSubmit={handleAddAdvance} className="flex flex-col sm:flex-row gap-2 bg-white p-3 rounded-xl border border-slate-200 shadow-3xs">
        <select value={workerId} onChange={(e)=>setWorkerId(e.target.value)} className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none" required>
          <option value="">Select Worker...</option>
          {siteWorkers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <div className="relative w-full sm:w-44">
          <span className="absolute left-2.5 top-2 font-black text-slate-400 text-xs">₹</span>
          <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-6 pr-2 py-2 rounded-lg font-bold text-slate-800 text-xs focus:outline-none" required />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-500 shadow-md">Issue Cash</button>
      </form>

      {/* LIST SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
        {filteredAdvances.length === 0 ? (
          <p className="text-slate-400 font-medium text-center py-6 col-span-full border border-dashed rounded-xl">No active advances in this date range.</p>
        ) : filteredAdvances.map(adv => (
          <div key={adv._id} className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center shadow-3xs hover:border-indigo-200 transition-colors">
            <div>
              <p className="font-bold text-slate-900 text-xs">{adv.workerName}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">{adv.date}</p>
            </div>
            <span className="font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md text-xs">-₹{adv.amount}</span>
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
// 6. MATERIAL & VENDOR MANAGER TAB (With Dynamic Export)
// ==========================================
function MaterialManager({ siteData, fetchSites }) {
  const { showToast } = useToast();
  const [vendorName, setVendorName] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [quantity, setQuantity] = useState('');

  // ✅ NAYA: Date Range State (Default: Pichle 7 din)
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

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
  
  // ✅ NAYA: Filter materials based on date range
  const filteredMaterials = siteMaterials.filter(mat => {
    if (!mat.date) return true; // Agar purana record ho jisme date na ho
    const matDate = new Date(mat.date);
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    return matDate >= start && matDate <= end;
  });

  // Total ab sirf us date-range ke materials ka nikalega
  const totalFilteredExpense = filteredMaterials.reduce((sum, item) => sum + (item.cost || 0), 0);
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

  // ==========================================
  // 🚀 EXPORT LOGIC (PDF & EXCEL) for Owner Billing
  // ==========================================
  const downloadPDF = () => {
    if (filteredMaterials.length === 0) {
      showToast("No records found in this date range!", "error");
      return;
    }

    const doc = new jsPDF('portrait');
    const siteName = siteData?.name || 'Site';
    
    doc.setFontSize(16);
    doc.text(`Material & Expense Report: ${siteName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Billing Period: ${fromDate} to ${toDate}`, 14, 22);
    doc.text(`Total Expense: Rs ${totalFilteredExpense.toLocaleString('en-IN')}`, 14, 28);

    // Columns clear rakhne hain taaki Malik (Owner) ko easily samajh aaye
    const headers = [['Date', 'Vendor / Supplier', 'Material', 'Rate', 'Qty', 'Total Cost']];
    const rows = filteredMaterials.map(m => [
      m.date, 
      m.vendorName, 
      m.materialType, 
      `Rs ${m.ratePerPiece}`, 
      m.quantity, 
      `Rs ${m.cost}`
    ]);

    doc.autoTable({
      head: headers,
      body: rows,
      startY: 34,
      headStyles: { fillColor: [79, 70, 229] }, // Indigo theme
    });

    doc.save(`Material_Bill_${siteName.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.pdf`);
    showToast("Bill PDF Downloaded!", "success");
  };

  const downloadExcel = () => {
    if (filteredMaterials.length === 0) {
      showToast("No records found in this date range!", "error");
      return;
    }

    const siteName = siteData?.name || 'Site';
    const headers = ['Date', 'Vendor / Supplier', 'Material Item', 'Rate (Rs)', 'Quantity', 'Total Cost (Rs)'];
    
    const rows = filteredMaterials.map(m => [
      m.date, 
      m.vendorName, 
      m.materialType, 
      m.ratePerPiece, 
      m.quantity, 
      m.cost
    ]);
    
    // Grand Total sabse aakhiri row mein add karenge
    rows.push(['', '', '', '', 'GRAND TOTAL:', totalFilteredExpense]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Material Bill");
    
    XLSX.writeFile(wb, `Material_Bill_${siteName.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.xlsx`);
    showToast("Excel Bill Downloaded!", "success");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* HEADER WITH DATE FILTER & EXPORT BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" /> Material & Vendor Bill Log
          </h3>
          <p className="text-xs text-slate-500 mt-1">Export this bill to show expenses to the Site Owner.</p>
        </div>
        
        {/* Date Filter & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50 w-full xl:w-auto">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-white border border-indigo-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-indigo-900 uppercase">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-white border border-indigo-200 text-xs font-bold text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none" />
          </div>
          
          <div className="flex items-center gap-2 ml-auto xl:ml-2 mt-4 xl:mt-0">
            <button onClick={downloadPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-sm">
              <FileText className="w-3.5 h-3.5" /> PDF Bill
            </button>
            <button onClick={downloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* FILTERED TOTAL SUMMARY */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
        <span className="text-xs font-black text-slate-500 uppercase">Filtered Bill Amount:</span>
        <div className="bg-indigo-100 text-indigo-800 font-black px-4 py-1.5 rounded-lg text-sm shadow-sm border border-indigo-200 flex items-center">
          <IndianRupee className="w-4 h-4 mr-1" /> {totalFilteredExpense.toLocaleString('en-IN')}
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

      {/* ADD MATERIAL FORM */}
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

      {/* FILTERED MATERIAL LIST */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {filteredMaterials.length === 0 ? (
          <p className="text-center text-slate-400 py-6 text-xs border border-dashed rounded-xl">No material logs found in this date range.</p>
        ) : (
          filteredMaterials.slice().reverse().map(mat => (
            <div key={mat._id} className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-200 shadow-3xs hover:border-indigo-200 transition-colors">
              <div>
                <h4 className="font-black text-slate-900 text-xs">{mat.vendorName}</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  <span className="text-indigo-700 font-bold">{mat.materialType}</span> • Rate: ₹{mat.ratePerPiece} | Qty: {mat.quantity} ({mat.date})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-slate-950 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
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

  // 📊 EXCEL EXPORT FUNCTION
  const exportSiteExcelLedger = () => {
    const wb = XLSX.utils.book_new();

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