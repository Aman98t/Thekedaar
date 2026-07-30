import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
  HardHat, Calendar, CheckCircle2, AlertTriangle, 
  IndianRupee, User, Building, Send, Clock,
  ChevronLeft, ChevronRight, MapPin, ChevronDown,
  ShieldAlert // 👈 Naya Icon add kiya Security Note ke liye
} from 'lucide-react';
import SystemAlertBanner from './SystemAlertBanner'; // 👈 Banner Import

export default function LabourView({ currentUser }) {
  const [allSites, setAllSites] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [dbAdvances, setDbAdvances] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); 

  if (!currentUser) return <div className="p-10 text-center text-slate-500 font-bold">Please login...</div>;

  const masterLabourId = currentUser._id || currentUser.id; 
  const dailyWage = Number(currentUser.dailyWage || 0);

  useEffect(() => {
    if (masterLabourId) {
      const fetchSites = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/sites/worker-sites/${masterLabourId}`);
          if (res.ok) {
            const data = await res.json();
            setAllSites(data.sites || []);
            setMyAssignments(data.assignments || []);
            
            if (data.assignments && data.assignments.length > 0) {
              setSelectedSiteId(data.assignments[0].siteId);
            }
          }
        } catch (err) { console.error(err); }
      };

      const fetchAttendance = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/attendance/worker/${masterLabourId}`);
          if (res.ok) setAttendanceRecords(await res.json());
        } catch (err) { console.error(err); }
      };
      
      const fetchAdvances = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/advances/worker/${masterLabourId}`);
          if (res.ok) setDbAdvances(await res.json());
        } catch (err) { console.error(err); }
      };

      fetchSites();
      fetchAttendance();
      fetchAdvances();
    }
  }, [masterLabourId]);

  // ISOLATION: Majdoor ki unhi sites ko dropdown me dalo jahan wo assigned hai ya kaam kar chuka hai
  const activeSiteIds = new Set();
  attendanceRecords.forEach(a => activeSiteIds.add(String(a.siteId)));
  dbAdvances.forEach(a => activeSiteIds.add(String(a.siteId)));
  myAssignments.forEach(a => activeSiteIds.add(String(a.siteId)));
  
  const myRelevantSites = allSites.filter(site => activeSiteIds.has(String(site._id)));

  // FILTER DATA ACCORDING TO DROPDOWN SELECTION
  const siteAttendance = attendanceRecords.filter(a => String(a.siteId) === String(selectedSiteId));
  const siteAdvances = dbAdvances.filter(a => String(a.siteId) === String(selectedSiteId));

  let presentCount = 0, halfCount = 0, absentCount = 0;
  const myAttendanceDates = {};
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;

  siteAttendance.forEach(record => {
    myAttendanceDates[record.date] = record.status;
    if (record.date.startsWith(currentMonthPrefix)) {
      if (record.status === 'present') presentCount++;
      if (record.status === 'halfday') halfCount++;
      if (record.status === 'absent') absentCount++;
    }
  });

  const totalEarned = (presentCount * dailyWage) + (halfCount * (dailyWage / 2));
  const totalReceived = siteAdvances.reduce((sum, adv) => sum + Number(adv.amount), 0);
  const pendingBalance = totalEarned - totalReceived; 

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const getFormattedDateKey = (day) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const [issueDetail, setIssueDetail] = useState('');
  const [issues, setIssues] = useState([]);

  const handleReportIssue = (e) => {
    e.preventDefault();
    if (!issueDetail.trim()) return;
    setIssues([{ id: Date.now(), type: 'Site Issue', detail: issueDetail.trim(), status: 'Sent to Thekedaar' }, ...issues]);
    setIssueDetail('');
  };

  return (
    <div className="max-w-md mx-auto space-y-5 p-2 text-xs text-slate-800 animate-fadeIn">
      
      {/* 🚀 REAL-TIME SYSTEM ALERT BANNER (Correct Scope & Placement) */}
      <SystemAlertBanner userRole="labour" userStatus={currentUser?.status || 'Active'} />

      {/* 🧑‍🎤 PROFILE & DYNAMIC SITE SELECTOR */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 text-white shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 border border-indigo-500/30 p-2.5 rounded-xl text-indigo-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">{currentUser.name}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{currentUser.skill || 'Worker'} • ₹{dailyWage}/day</p>
            </div>
          </div>
        </div>

        {/* SITE DROPDOWN SELECTOR */}
        <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-xl flex items-center justify-between gap-2 mb-4 relative shadow-inner">
          <div className="flex items-center gap-2 w-full">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <select 
              value={selectedSiteId} 
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full bg-transparent text-amber-400 font-black text-xs focus:outline-none cursor-pointer pr-6 appearance-none"
            >
              {myRelevantSites.length === 0 ? (
                <option value="">No Active Sites Found</option>
              ) : (
                myRelevantSites.map(site => (
                  <option key={site._id} value={site._id} className="text-slate-900">{site.name}</option>
                ))
              )}
            </select>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
        </div>

        {/* 🧮 3-STEP KHATA CALCULATOR */}
        <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4">
          <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl flex flex-col items-center justify-center shadow-inner">
            <span className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Earned</span>
            <span className="font-mono font-black text-emerald-400 text-[11px] sm:text-xs">₹{totalEarned.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl flex flex-col items-center justify-center shadow-inner">
            <span className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Received</span>
            <span className="font-mono font-black text-rose-400 text-[11px] sm:text-xs">₹{totalReceived.toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 p-2.5 rounded-xl flex flex-col items-center justify-center shadow-inner">
            <span className="text-[9px] uppercase font-black text-slate-400 mb-1 tracking-widest">Pending</span>
            <span className="font-mono font-black text-amber-400 text-[11px] sm:text-xs">₹{pendingBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 📅 SITE ATTENDANCE GRID */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-slate-950 text-xs flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-indigo-600" /> Site Attendance 
          </h3>
          <div className="flex gap-1 text-[9px] font-black tracking-wide">
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">P: {presentCount}</span>
            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">A: {absentCount}</span>
            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">H: {halfCount}</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-3xs"><ChevronLeft className="w-3.5 h-3.5 text-slate-700" /></button>
          <span className="text-xs font-black text-slate-900 uppercase tracking-wide font-mono">{currentDate.toLocaleString('default', { month: 'long' })} {year}</span>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg shadow-3xs"><ChevronRight className="w-3.5 h-3.5 text-slate-700" /></button>
        </div>
        
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
          <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="py-1.5 text-[9px] font-black text-slate-400 uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200">
            {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-white min-h-[40px]" />)}
            {days.map(day => {
              const dateKey = getFormattedDateKey(day);
              const status = myAttendanceDates[dateKey];
              return (
                <div key={day} className="bg-white min-h-[40px] p-1.5 relative flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-300 absolute top-0.5 left-1 font-mono">{day}</span>
                  {status === 'present' && <div className="bg-emerald-500 w-3.5 h-3.5 rounded-full mt-2 shadow-3xs"></div>}
                  {status === 'absent' && <div className="bg-rose-500 w-3.5 h-3.5 rounded-full mt-2 shadow-3xs"></div>}
                  {status === 'halfday' && <div className="bg-amber-400 w-3.5 h-3.5 rounded-full mt-2 shadow-3xs"></div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 💸 SITE PAYMENT LOG */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-3">
        <h3 className="font-black text-slate-950 text-xs flex items-center gap-1.5">
          <IndianRupee className="w-4 h-4 text-emerald-600" /> Site Payment Log
        </h3>
        
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {siteAdvances.length === 0 ? (
            <p className="text-center text-slate-400 text-[10px] py-4 border border-dashed rounded-lg bg-slate-50/50">No cash payments received for this site yet.</p>
          ) : (
            siteAdvances.map(adv => (
              <div key={adv._id} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-100 rounded-xl transition-all hover:border-emerald-200">
                <div>
                  <p className="font-black text-slate-800 text-xs">Cash Handover</p>
                  <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-2.5 h-2.5"/> {adv.date}</p>
                </div>
                <span className="font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg text-xs shadow-3xs">
                  +₹{adv.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* ⚠️ REPORT SITE ISSUE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-3xs space-y-4">
        <div>
          <h3 className="font-black text-slate-950 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Report Site Issue (Samsya)
          </h3>
        </div>
        <form onSubmit={handleReportIssue} className="space-y-3">
          <textarea value={issueDetail} onChange={(e) => setIssueDetail(e.target.value)} placeholder="Explain the problem here..." className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium text-slate-800 text-xs focus:outline-none" required />
          <button type="submit" className="w-full bg-slate-950 text-white p-2.5 rounded-xl font-black text-xs">Send Alert to Thekedaar</button>
        </form>
      </div>

      {/* 🔑 NAYA: PASSWORD RESET & SECURITY INFO BOX (Option A Workflow) */}
      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-3 shadow-3xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-amber-900 leading-relaxed">
          Security Note: Agar aapko apna password change ya reset karwana ho, toh kripya apne Thekedaar se sampark karein. Wo apne dashboard se turant aapka password update kar sakte hain.
        </p>
      </div>

    </div>
  );
}