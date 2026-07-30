// Location: src/components/SystemAlertBanner.jsx
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Megaphone, X } from 'lucide-react';
import { API_BASE_URL } from '../config';
export default function SystemAlertBanner({ userRole, userStatus = 'Active' }) {
  const [banner, setBanner] = useState({ maintenanceMode: false, maintenanceText: '' });
  const [broadcasts, setBroadcasts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);

  useEffect(() => {
    fetchSystemAlerts();
    // Har 30 seconds pe check karenge taaki bina page refresh ke naya alert aaye
    const interval = setInterval(fetchSystemAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemAlerts = async () => {
    try {
      // 1. Fetch Maintenance Banner
      const resBanner = await fetch(`${API_BASE_URL}/api/admin/banner`);
      if (resBanner.ok) {
        setBanner(await resBanner.json());
      }

      // 2. Fetch Active Broadcasts
      const resBroadcasts = await fetch(`${API_BASE_URL}/api/admin/broadcasts`);
      if (resBroadcasts.ok) {
        const data = await resBroadcasts.json();
        setBroadcasts(data);
      }
    } catch (error) {
      console.error("Failed to sync system alerts:", error);
    }
  };

  // Target Segment Filtering
  const relevantBroadcasts = broadcasts.filter(b => {
    if (dismissedIds.includes(b._id)) return false;
    if (b.targetSegment === 'all') return true;
    if (b.targetSegment === userStatus) return true;
    return false;
  });

  if (!banner.maintenanceMode && relevantBroadcasts.length === 0) return null;

  return (
    <div className="space-y-2 mb-4 animate-fadeIn">
      {/* 🔴 PRIORITY 1: GLOBAL MAINTENANCE WARNING STRIP */}
      {banner.maintenanceMode && (
        <div className="bg-amber-500 border border-amber-600 text-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
            <span><strong>SYSTEM NOTICE:</strong> {banner.maintenanceText}</span>
          </div>
        </div>
      )}

      {/* 📢 PRIORITY 2: ADMIN PUSH BROADCASTS */}
      {relevantBroadcasts.map((item) => (
        <div 
          key={item._id} 
          className="bg-indigo-900 border border-indigo-700 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-800 p-1.5 rounded-lg text-amber-400">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black uppercase tracking-wider text-[9px] text-indigo-300 block">
                Official Advisory ({item.language.toUpperCase()})
              </span>
              <p className="font-bold text-slate-100">{item.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setDismissedIds([...dismissedIds, item._id])}
            className="text-indigo-300 hover:text-white p-1 rounded-lg transition"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}