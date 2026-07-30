import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import LabourView from './components/LabourView';
import { ToastProvider } from './context/ToastContext';
import AdminView from './components/AdminView';
import ThekedaarView from './components/ThekedaarView';
import { LogOut, User, Shield, HardHat, Landmark } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const session = localStorage.getItem('thekedaar_active_session');
    return session ? JSON.parse(session) : null;
  });

  const handleLoginSuccess = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('thekedaar_active_session', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('thekedaar_active_session');
  };

  return (
    <ToastProvider>
      {!currentUser ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen overflow-y-scroll bg-slate-50 flex flex-col font-medium text-xs text-slate-700">
          
          {/* 🌐 SECURE GLOBAL APPLICATION NAVIGATION HEADER */}
          <header className="bg-slate-950 text-white px-5 py-3 flex justify-between items-center border-b border-slate-900 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-600 px-2 py-1 rounded-lg font-black tracking-wider uppercase text-white">
                {currentUser.role === 'admin' && '🛡️ SYSTEM ADMIN'}
                {currentUser.role === 'thekedaar' && '🏗️ CONTRACTOR'}
                {currentUser.role === 'labour' && '👷 SITE WORKER'}
              </span>
              <span className="text-slate-400 font-bold text-[11px]">| logged in as <span className="text-slate-100 font-black">{currentUser.name}</span></span>
            </div>

            <button 
              onClick={handleLogout}
              className="bg-slate-900 border border-slate-800 hover:bg-rose-950/60 hover:border-rose-900 text-slate-300 hover:text-rose-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-[11px] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Secure Logout
            </button>
          </header>

          {/* 🚀 ROLE-BASED ACCESS CONTROL DISPATCH CONTAINER */}
          <main className="flex-1 p-5 max-w-[1600px] w-full mx-auto overflow-y-auto">
            {currentUser.role === 'admin' && <AdminView currentUser={currentUser} />}
            {currentUser.role === 'thekedaar' && <ThekedaarView currentUser={currentUser} />}
            {currentUser.role === 'labour' && <LabourView currentUser={currentUser} />}
          </main>

        </div>
      )}
    </ToastProvider>
  );
}