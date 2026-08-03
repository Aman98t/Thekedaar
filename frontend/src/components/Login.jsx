// ==========================================
// 🔑 LOGIN SCREEN COMPONENT (Pure Sign-In Gateway)
// Location: src/components/Login.jsx
// ==========================================
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';

export default function Login({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    const endpoint = `${API_BASE_URL}/api/users/login`;
    const payload = { phone, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && (data.success || data.user || data.message === "Login Successful!")) {
        // ✅ NAYA: localstorage variable naam waisa hi rehne diya hai taki existing logout logic na toote
        localStorage.setItem('thekedaar_active_session', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('buildhub_token', data.token);
        }
        showToast("Login Successful!", "success");
        onLoginSuccess(data.user); 
      } else {
        showToast(data.message || "Authentication failed", "error");
      }
    } catch (err) {
      console.error("Auth network error:", err);
      showToast("Server connection failed. Is backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!phone || phone.length !== 10) {
      showToast("Please enter your 10-digit mobile number first, then click Forgot Password.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ CHANGED: Alert message updated
        alert("🚨 REQUEST SENT!\n\nYour password reset request has been sent to your Admin/Contractor's dashboard.\n\nPlease contact them directly to get your new password.");
        showToast("Request sent successfully!", "success");
      } else {
        showToast(data.message || "Failed to send request", "error");
      }
    } catch (err) {
      showToast("Server connection failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 text-xs text-slate-200">
        
        {/* Header Section */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-sm mb-1">
            <span className="text-2xl font-black">₹</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {/* ✅ CHANGED: Thekedaar Portal to Contractor Portal */}
            Contractor Portal
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
            Sign in with your registered mobile number and Password
          </p>

          {/* Role Badges */}
          <div className="flex justify-center items-center gap-2 pt-2">
            <span className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-amber-400 font-bold text-[11px] rounded-lg">
              👷 Contractor
            </span>
            {/* ✅ CHANGED: Labour to Worker */}
            <span className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-sky-400 font-bold text-[11px] rounded-lg">
              🧑‍🔧 Worker
            </span>
            <span className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-emerald-400 font-bold text-[11px] rounded-lg">
              🛡️ Admin
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase text-slate-400">Mobile Number</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 font-bold">+91</span>
              <input 
                type="tel" 
                maxLength={10}
                placeholder="Enter 10-digit mobile..." 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 pl-12 pr-3 py-2.5 rounded-xl font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                required 
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black uppercase text-slate-400">Password</label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-[10px] text-indigo-400 hover:underline font-bold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="password" 
                placeholder="Enter password..." 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 rounded-xl font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                required 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}