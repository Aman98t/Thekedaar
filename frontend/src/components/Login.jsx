// ==========================================
// 🔑 LOGIN & REGISTER SCREEN COMPONENT
// Location: src/components/Login.jsx
// ==========================================
import React, { useState } from 'react';
import { Phone, Lock, Building2, User, ShieldAlert } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { API_BASE_URL } from '../config';
export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Default first user can be admin
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password || (isRegistering && !name)) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
// ✅ ISE REPLACE KARKE YE LIKHO (Sahi Route):
const endpoint = isRegistering 
  ? `${API_BASE_URL}/api/users/register` 
  : `${API_BASE_URL}/api/users/login`;
    
    // Payload
    const payload = isRegistering 
      ? { name, phone, password, role } 
      : { phone, password };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

      const data = await res.json();
     
 if (res.ok && (data.success || data.user || data.message === "Login Successful!")) {
  if (isRegistering) {
    showToast("Account created successfully! Please login.", "success");
    setIsRegistering(false); 
  } else {
    localStorage.setItem('thekedaar_active_session', JSON.stringify(data.user));
    if (data.token) {
      localStorage.setItem('buildhub_token', data.token);
    }
    showToast("Login Successful!", "success");
    onLoginSuccess(data.user); // 🚀 YEH CHALTE HI THEKEDAAR DASHBOARD KHUL JAYEGA!
  }
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

  const handleForgotPassword = () => {
    alert("As per your company workflow, please contact your Admin or Contractor to reset your password instantly from their dashboard roster!");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 text-xs text-slate-200">
        
       {/* ==========================================
          HEADER / TITLE SECTION (Premium Dark UI)
          ========================================== */}
      <div className="text-center space-y-3 mb-8">
        {/* Logo Icon - Subtle Gold Glow */}
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-sm mb-1">
          <span className="text-2xl font-black">₹</span>
        </div>

        {/* Title - High Contrast Pure White */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Thekedaar Portal
        </h1>

        {/* Subtitle - Crisp Slate Grey with Amber Highlights */}
        <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-xs mx-auto leading-relaxed">
          Sign in with your registered mobile number and Password
        </p>

        {/* Sleek Dark-Mode Badges (No more light pastel pills) */}
        <div className="flex justify-center items-center gap-2 pt-2">
          <span className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-amber-400 font-bold text-[11px] rounded-lg">
            👷 Contractor
          </span>
          <span className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-sky-400 font-bold text-[11px] rounded-lg">
            🧑‍🔧 Labour
          </span>
          <span className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-emerald-400 font-bold text-[11px] rounded-lg">
            🛡️ Admin
          </span>
        </div>
      </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-slate-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter full name..." 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-10 pr-3 py-2.5 rounded-xl font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  required 
                />
              </div>
            </div>
          )}

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
              {!isRegistering && (
                <button 
                  type="button" 
                  onClick={handleForgotPassword}
                  className="text-[10px] text-indigo-400 hover:underline font-bold"
                >
                  Forgot Password?
                </button>
              )}
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

          {isRegistering && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-slate-400">Select Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl font-bold text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="admin">System Admin</option>
                <option value="thekedaar">Contractor (Thekedaar)</option>
              </select>
            </div>
          )}

<button
  type="submit"
  disabled={loading}
  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all duration-150 cursor-pointer disabled:opacity-50"
>
  {loading ? "Signing in..." : "Sign In to Dashboard"}
</button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[11px] text-slate-400 hover:text-white font-bold transition"
          >
            {isRegistering ? "Already have an account? Sign In" : "Need an account? Register Admin/Contractor"}
          </button>
        </div>

      </div>
    </div>
  );
}