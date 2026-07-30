import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  // Active View Role State
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem('thekedaar_active_role');
    if (!saved) return 'thekedaar'; 
    return saved.replace(/^"|"$/g, ''); 
  });

  // Safe fetch helper for arrays/objects
  const safeFetch = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      return saved && saved !== 'undefined' ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  // --- CORE SYSTEM STATES ---
  const [sites, setSites] = useState(() => safeFetch('thekedaar_sites', [{ id: 's1', name: 'Primary Site Demo' }]));
  
  const [workers, setWorkers] = useState(() => safeFetch('thekedaar_workers', [
    { id: 'w1', name: 'Rajesh Kumar (Mistri)', dailyWage: 650, phone: '98765XXXXX' },
    { id: 'w2', name: 'Sukhwinder Singh (Mistri)', dailyWage: 650, phone: '94172XXXXX' },
    { id: 'w3', name: 'Ramesh Yadav (Mazdoor)', dailyWage: 450, phone: '81463XXXXX' },
    { id: 'w4', name: 'Chotu Paswan (Mazdoor)', dailyWage: 450, phone: '70091XXXXX' }
  ]));
  
  const [attendance, setAttendance] = useState(() => safeFetch('thekedaar_attendance', {}));
  const [advances, setAdvances] = useState(() => safeFetch('thekedaar_advances', []));
  const [tasks, setTasks] = useState(() => safeFetch('thekedaar_tasks', [
    { id: 't1', siteId: 's1', title: 'Excavation & Footing Digging', status: 'done', priority: 'High' },
    { id: 't2', siteId: 's1', title: 'Foundation Beam Shuttering', status: 'progress', priority: 'High' }
  ]));

  // 🎯 NEWLY WIRED: Material Ledger Persistent State
  const [materialInvoices, setMaterialInvoices] = useState(() => safeFetch('thekedaar_materials', [
    { id: 'inv-1', siteId: 's1', vendor: 'Aggarwal Cement Store', item: 'ACC Cement (100 Bags)', total: 45000, paid: 20000, date: '22 Jun' },
    { id: 'inv-2', siteId: 's1', vendor: 'Jai Durga Iron & Steel', item: 'TMT Steel Rebars (2 Tons)', total: 115000, paid: 115000, date: '24 Jun' }
  ]));

  // 🎯 NEWLY WIRED: Owner Progress Billing Persistent State
  const [ownerBills, setOwnerBills] = useState(() => safeFetch('thekedaar_owner_bills', [
    { id: 'b1', siteId: 's1', title: 'Plinth Level Completion Running Bill', amountRaised: 250000, amountReceived: 200000, date: '15 Jun' }
  ]));


  // --- AUTOMATIC LOCALSTORAGE SYNC HOOKS ---
  useEffect(() => { localStorage.setItem('thekedaar_active_role', currentRole); }, [currentRole]);
  useEffect(() => { localStorage.setItem('thekedaar_sites', JSON.stringify(sites)); }, [sites]);
  useEffect(() => { localStorage.setItem('thekedaar_workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('thekedaar_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('thekedaar_advances', JSON.stringify(advances)); }, [advances]);
  useEffect(() => { localStorage.setItem('thekedaar_tasks', JSON.stringify(tasks)); }, [tasks]);
  
  // Sync hooks for new components
  useEffect(() => { localStorage.setItem('thekedaar_materials', JSON.stringify(materialInvoices)); }, [materialInvoices]);
  useEffect(() => { localStorage.setItem('thekedaar_owner_bills', JSON.stringify(ownerBills)); }, [ownerBills]);

  return (
    <RoleContext.Provider value={{
      currentRole, setCurrentRole,
      sites, setSites,
      workers, setWorkers,
      attendance, setAttendance,
      advances, setAdvances,
      tasks, setTasks,
      materialInvoices, setMaterialInvoices, // 👈 Exposed cleanly to Frontend Components
      ownerBills, setOwnerBills             // 👈 Exposed cleanly to Frontend Components
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}