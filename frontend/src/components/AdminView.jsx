// ==========================================
// 🧩 [SECTION: MANUAL_ADMIN_MANIFEST]
// Description: Focused Admin Control Center mapped exactly to user requirements.
// Location: src/components/AdminView.jsx
// ==========================================
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useToast } from '../context/ToastContext';
import { 
  Users, Megaphone, Database, UserPlus, Trash2, 
  ShieldAlert, ToggleLeft, ToggleRight, Radio, Languages, Server, Activity, RefreshCw
} from 'lucide-react';

export default function AdminView({ currentUser }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('contractors');

  // ==========================================
  // 📁 STATE 1: CONTRACTOR REGISTRY & GLOBAL STATS
  // ==========================================
  const [contractors, setContractors] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalContractors: 0,
    totalLabours: 0,
    totalFundsDeployed: 0
  });

  // 🚀 NAYA: DB Health ke liye state
  const [dbHealth, setDbHealth] = useState({
    latencyMs: '--',
    indexSizeMB: '0.00',
    dataSizeMB: '0.00',
    storageSizeMB: '0.00',
    collectionsCount: 0,
    objectsCount: 0,
    indexesCount: 0,
    status: 'Checking...'
  });

  // Load hote hi saari APIs call hongi
  useEffect(() => {
    fetchContractors();
    fetchBannerState(); 
    fetchGlobalStats(); 
    fetchDbHealth(); // 👈 Live DB Health Call
  }, []);

  const fetchGlobalStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`);
      if (response.ok) {
        const data = await response.json();
        setGlobalStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch global stats:", error);
    }
  };

  const fetchContractors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/contractors-detailed`);
      const data = await response.json();
      
      if (response.ok) {
        const formattedData = data.map(user => ({
          id: user.id, 
          name: user.name,
          phone: user.phone,
          status: user.status,
          workers: user.workers, 
          activeSites: user.activeSites,
          wagesProcessed: `₹${user.wagesProcessed.toLocaleString('en-IN')}`,
          resetRequested: user.resetRequested
        }));
        setContractors(formattedData);
      }
    } catch (error) {
      console.error("Failed to fetch detailed contractors:", error);
    }
  };

  const fetchBannerState = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/banner`);
      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode);
        setMaintenanceText(data.maintenanceText);
      }
    } catch (error) {
      console.error("Failed to fetch banner state:", error);
    }
  };

  // 🚀 NAYA: Fetch Real MongoDB Health Stats
  const fetchDbHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/db-health`);
      if (response.ok) {
        const data = await response.json();
        setDbHealth(data);
      }
    } catch (error) {
      console.error("Failed to fetch DB health:", error);
      showToast("Could not fetch DB metrics", "error");
    }
  };

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  // ✅ NAYA: Thekedaar ko assign karne ke liye initial password state
  const [newPassword, setNewPassword] = useState('');

  // ==========================================
  // 📢 STATE 2: ANNOUNCEMENTS & SYSTEM BANNER MANAGEMENT
  // ==========================================
  const [announcement, setAnnouncement] = useState('');
  const [targetSegment, setTargetSegment] = useState('all');
  const [selectedLang, setSelectedLang] = useState('en');
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceText, setMaintenanceText] = useState('Scheduled system maintenance tomorrow from 2:00 AM to 4:00 AM IST. Platforms will be offline.');

  const templates = {
    en: { welcome: "Welcome to the platform! Please verify your active sites.", alert: "Action Required: Update your weekly labour attendance sheets." },
    hi: { welcome: "प्लेटफॉर्म पर आपका स्वागत है! कृपया अपने सक्रिय साइट्स की पुष्टि करें।", alert: "आवश्यक कार्रवाई: अपने साप्ताहिक लेबर हाजिरी पत्रक को अपडेट करें।" }
  };

  const handleOnboardContractor = async (e) => {
    e.preventDefault();
    // ✅ NAYA: Password ki validation bhi check kar li
    if (!newName.trim() || !newPhone.trim() || !newPassword.trim()) {
      showToast("Please fill Name, Phone, and Password", "error");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newName.trim(), 
          phone: newPhone.trim(), 
          role: 'thekedaar',
          password: newPassword.trim() // 👈 NAYA: Yahan 'admin' hata kar state laga di 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`${newName} successfully database me add ho gaya!`, "success");
        setNewName('');
        setNewPhone('');
        setNewPassword(''); // 👈 NAYA: Password state bhi clear kardi
        fetchContractors(); 
        fetchGlobalStats();
      } else {
        showToast(data.message || "Error adding contractor", "error");
      }
    } catch (error) {
      console.error('Error:', error);
      showToast("Server se connect nahi ho pa raha hai", "error");
    }
  };

  const cycleStatus = async (id, currentStatus) => {
    const statusOrder = ['Active', 'Suspended', 'Deactivated'];
    const nextIndex = (statusOrder.indexOf(currentStatus) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/contractor/status/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });

      if (response.ok) {
        setContractors(contractors.map(c => c.id === id ? { ...c, status: nextStatus } : c));
        showToast(`Account status updated to ${nextStatus}.`, "warning");
      }
    } catch (error) {
      console.error("Status change failed:", error);
      showToast("System offline. Status update nahi hua.", "error");
    }
  };

  const handleDeleteContractor = async (id, name) => {
    if (!window.confirm(`Kya aap sach me ${name} ko permanently delete karna chahte hain?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/contractor/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setContractors(contractors.filter(c => c.id !== id));
        showToast(`${name}'s profile purged permanently.`, "error");
        fetchGlobalStats();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Server error. Thekedaar delete nahi hua.", "error");
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcement.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: announcement.trim(),
          targetSegment,
          language: selectedLang
        })
      });

      if (response.ok) {
        showToast(`Broadcast saved & dispatched to [${targetSegment.toUpperCase()}]!`, "success");
        setAnnouncement('');
      } else {
        showToast("Error dispatching broadcast", "error");
      }
    } catch (error) {
      showToast("Server network error", "error");
    }
  };

  // ==========================================
  // 🔑 ADMIN: RESET CONTRACTOR PASSWORD (Option A Workflow)
  // ==========================================
  const handleResetContractorPassword = async (contractorId, contractorName) => {
    const newPassword = prompt(`Enter new password for Contractor (${contractorName}):`);
    if (!newPassword || newPassword.trim() === '') return;

    const session = JSON.parse(localStorage.getItem('thekedaar_active_session'));
    const token = session?.token || localStorage.getItem('buildhub_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Backend 'thekedaarId' key expect karta hai, isliye hum map kar rahe hain:
        body: JSON.stringify({ thekedaarId: contractorId, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message, "success");
      } else {
        showToast(data.message || "Failed to reset password", "error");
      }
    } catch (err) {
      console.error("Admin reset password error:", err);
      showToast("Server error while resetting password", "error");
    }
  };

  if (!currentUser) return <div className="p-10 text-center text-slate-500 font-bold">Loading Admin Profile...</div>;

  return (
    <div className="space-y-6 text-xs text-slate-800 animate-fadeIn font-sans">
      
      {/* HEADER TOWER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2.5 rounded-xl shadow-inner">
            <ShieldAlert className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">System Control Hub</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Authorized Master: <span className="text-amber-400 font-bold uppercase tracking-wider">{currentUser.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* RE-SCOPE SEGMENT NAVIGATION TABS */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('contractors')}
          className={`flex shrink-0 items-center gap-2 px-3 py-2 text-[11px] font-black rounded-lg transition-all ${activeTab === 'contractors' ? 'bg-white text-slate-950 shadow-3xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Users className="w-3.5 h-3.5" /> Contractor Management
        </button>
        <button 
          onClick={() => setActiveTab('broadcasts')}
          className={`flex shrink-0 items-center gap-2 px-3 py-2 text-[11px] font-black rounded-lg transition-all ${activeTab === 'broadcasts' ? 'bg-white text-slate-950 shadow-3xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Megaphone className="w-3.5 h-3.5" /> Broadcasts & Banners
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          className={`flex shrink-0 items-center gap-2 px-3 py-2 text-[11px] font-black rounded-lg transition-all ${activeTab === 'health' ? 'bg-white text-slate-950 shadow-3xs border border-slate-200' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <Database className="w-3.5 h-3.5" /> Database Health
        </button>
      </div>

      {/* ==========================================
          TAB PIPELINE SWITCHERS
          ========================================== */}

      {/* TAB 1: CONTRACTOR MANAGEMENT HUB */}
      {activeTab === 'contractors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Total Network Thekedaars</span>
                <div className="text-3xl font-black text-white leading-none">{globalStats.totalContractors}</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50"><Users className="w-6 h-6 text-indigo-400" /></div>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Total Active Labours</span>
                <div className="text-3xl font-black text-white leading-none">{globalStats.totalLabours}</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50"><Activity className="w-6 h-6 text-amber-400" /></div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block mb-1">Total Capital Disbursed</span>
                <div className="text-3xl font-black text-emerald-400 leading-none font-mono tracking-tight">₹{globalStats.totalFundsDeployed.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs space-y-4">
            <div>
              <h3 className="font-black text-slate-950 text-sm">Onboard Thekedaar</h3>
              <p className="text-[10px] text-slate-400 font-medium">Create isolated environment access fields for a new contractor.</p>
            </div>
            
            <form onSubmit={handleOnboardContractor} className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Contractor Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Gurpreet Singh" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs focus:outline-none focus:border-slate-950"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Mobile Contact</label>
                <input 
                  type="tel" 
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g., 9876543210" 
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs font-mono focus:outline-none focus:border-slate-950"
                  required
                />
              </div>
              
{/* ✅ NAYA: Assign Password Input (Matched with Light Theme) */}
<div>
  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">
    Assign Initial Password
  </label>
  <input 
    type="text" 
    value={newPassword} 
    onChange={(e) => setNewPassword(e.target.value)}
    placeholder="e.g. Thekedaar@123" 
    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs font-mono focus:outline-none focus:border-slate-950"
    required 
  />
  <p className="text-[9px] text-slate-400 font-medium mt-1 ml-1">
    Contractor will use this password for their first login.
  </p>
</div>

              <button type="submit" className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black p-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs">
                <UserPlus className="w-3.5 h-3.5" /> Register Thekedaar
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-3xs p-4 lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-black text-slate-950 text-sm">Active Contractor Clusters</h3>
              <p className="text-[10px] text-slate-400 font-medium">Each manager possesses separate, non-overlapping labour rosters (Encapsulated).</p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse font-medium">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-black text-[9px] uppercase">
                    <th className="p-3">Thekedaar Identity</th>
                    <th className="p-3">Aggregated Metrics Summary</th>
                    <th className="p-3">Status Layer</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {contractors.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center p-8 text-slate-400 font-bold bg-slate-50/50">
                        No contractors fetched from database yet.
                      </td>
                    </tr>
                  ) : (
                    contractors.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3">
                          <div className="font-black text-slate-950">{c.name}</div>
                          <div className="font-mono text-[10px] text-slate-400 mt-0.5">{c.phone}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-600 space-y-0.5">
                          <div>👷 Local Workers Managed: <span className="text-slate-950 font-black px-1.5 py-0.5 bg-slate-100 rounded text-[9px]">{c.workers}</span></div>
                          <div className="text-[10px]">🪙 Extracted Ledger: <span className="text-emerald-600 font-black px-1.5 py-0.5 bg-emerald-50 rounded text-[9px]">{c.wagesProcessed}</span></div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-black text-[9px] tracking-wide uppercase ${
                            c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'Suspended' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        
             {/* 🛠️ UPDATED: ACTION BUTTONS WITH "RESET PASSWORD" */}
<td className="p-3 text-right space-x-1 whitespace-nowrap">
  
  {/* ✅ NAYA: Agar reset request true hai, toh Red badge dikhao */}
  {c.resetRequested && (
    <button 
      onClick={() => handleResetContractorPassword(c.id, c.name)}
      className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-black cursor-pointer hover:bg-red-500/20 transition-colors animate-pulse mr-2"
      title="Click to reset password"
    >
      🔴 RESET REQ
    </button>
  )}
  
  {/* Existing Suspend/Active Button */}
  <button 
    onClick={() => cycleStatus(c.id, c.status)}
    title="Cycle Node State (Suspend/Deactivate)"
    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all inline-block"
  >
    {c.status === 'Active' ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
  </button>
  
  {/* Existing Delete Button */}
  <button 
    onClick={() => handleDeleteContractor(c.id, c.name)}
    title="Purge Contractor Profile"
    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all inline-block"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>

</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS & SYSTEM MAINTENANCE */}
      {activeTab === 'broadcasts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs space-y-4">
            <div>
              <h3 className="font-black text-slate-950 text-sm">Send Push Announcements</h3>
              <p className="text-[10px] text-slate-400 font-medium">Broadcast tailored dynamic alerts directly to active field segments.</p>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Target Segment</label>
                  <select 
                    value={targetSegment} 
                    onChange={(e) => setTargetSegment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="all">All Contractors</option>
                    <option value="Active">Active Nodes Only</option>
                    <option value="Suspended">Suspended Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Language Template</label>
                  <select 
                    value={selectedLang} 
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs focus:outline-none"
                  >
                    <option value="en">🇬🇧 English Suite</option>
                    <option value="hi">🇮🇳 Hindi Template (हिंदी)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
                  <Languages className="w-3 h-3 text-indigo-500" /> System-Wide Blueprint Preview
                </span>
                <p className="text-slate-600 text-[10px] italic">
                  "<strong>Auto-Welcome:</strong> {templates[selectedLang].welcome}"
                </p>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Custom Message Custom Text</label>
                <textarea 
                  rows={3}
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Type dispatch advisory announcement details here..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs focus:outline-none"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black p-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs">
                <Radio className="w-3.5 h-3.5 text-amber-400" /> Dispatch In-App Announcement
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-3xs space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-slate-950 text-sm">Platform Announcement Banner</h3>
                <p className="text-[10px] text-slate-400 font-medium">Control global layout warning strip for planned maintenance logs.</p>
              </div>
              <button 
                type="button"
                onClick={async () => {
                  const nextMode = !maintenanceMode;
                  setMaintenanceMode(nextMode);
                  try {
                    await fetch(`${API_BASE_URL}/api/admin/banner`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ maintenanceMode: nextMode, maintenanceText })
                    });
                    showToast(`Banner status updated in DB: ${nextMode ? 'ACTIVE' : 'MUTED'}`, "warning");
                  } catch (err) {
                    showToast("Error updating database", "error");
                  }
                }}
                className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wide border transition-all ${
                  maintenanceMode ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {maintenanceMode ? '🟢 BANNER ACTIVE' : '⚪ BANNER MUTED'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase mb-1">Banner Notice Text</label>
                <textarea 
                  rows={3}
                  value={maintenanceText}
                  onChange={(e) => setMaintenanceText(e.target.value)}
                  onBlur={async () => {
                    try {
                      await fetch(`${API_BASE_URL}/api/admin/banner`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ maintenanceMode, maintenanceText })
                      });
                    } catch (err) { console.error(err); }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-800 text-xs focus:outline-none"
                  disabled={!maintenanceMode}
                />
              </div>
              {maintenanceMode && (
                <div className="bg-amber-500 border border-amber-600 p-3 rounded-xl text-slate-950 font-bold flex items-center gap-2 text-[11px]">
                  <Radio className="w-4 h-4 shrink-0 text-slate-950 animate-ping" />
                  <span><strong>Live Layout Preview:</strong> {maintenanceText}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 🚀 TAB 3: REAL MONGODB DATABASE HEALTH MONITOR */}
      {activeTab === 'health' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-3xs p-5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-black text-slate-950 text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700" /> Infrastructure Database Health Monitoring
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Real-time Mongoose DB operational indices, storage footprint, and live latency checks.</p>
            </div>
            <button
              onClick={() => {
                fetchDbHealth();
                showToast("Refreshed live database metrics!", "success");
              }}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg text-slate-700 font-black text-xs flex items-center gap-1.5 transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Live Stats
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Query Execution Speed</span>
              <div className="text-lg font-black text-emerald-600 font-mono">{dbHealth.latencyMs} ms</div>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md font-medium inline-block">🚀 {dbHealth.status} Latency</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Index Space Utilization</span>
              <div className="text-lg font-black text-indigo-600 font-mono">{dbHealth.indexSizeMB} MB</div>
              <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-medium inline-block">📦 {dbHealth.indexesCount} Active Indexes</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Data & Storage Footprint</span>
              <div className="text-lg font-black text-slate-900 font-mono">{dbHealth.dataSizeMB} MB / {dbHealth.storageSizeMB} MB</div>
              <span className="text-[9px] text-slate-600 bg-slate-200/60 border border-slate-300/40 px-1.5 py-0.5 rounded-md font-medium inline-block">📉 {dbHealth.collectionsCount} Collections • {dbHealth.objectsCount} Total Docs</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}