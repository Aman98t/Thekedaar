import React, { useState, useEffect } from 'react';

import { Truck, Plus, Trash2, IndianRupee, Calendar, Tag, ShoppingBag, PlusCircle } from 'lucide-react';

export default function MaterialVendorTracker({ siteId }) {
  // 💾 Context par depend hone ke bajaye direct LocalStorage se independent state banayi
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('thekedaar_site_materials');
    return saved ? JSON.parse(saved) : [];
  });

  // 🔄 Jab bhi koi naya material item add ya delete hoga, auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('thekedaar_site_materials', JSON.stringify(materials));
  }, [materials]);

  // Local Form Input States
  const [vendorName, setVendorName] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [ratePerPiece, setRatePerPiece] = useState('');
  const [quantity, setQuantity] = useState('');

  // 🛠️ Dynamic Dropdown State (with localStorage protection)
  const [materialDropdownItems, setMaterialDropdownItems] = useState(() => {
    const savedItems = localStorage.getItem('thekedaar_material_items');
    return savedItems ? JSON.parse(savedItems) : ['Cement (Bags)', 'Sariya / Steel (Kg)', 'Bajri / Gravel (Brass)', 'Sand / Reti (Brass)', 'Bricks / Eent (Pcs)', 'Crusher (Pcs)'];
  });
  const [customItem, setCustomItem] = useState('');
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('thekedaar_material_items', JSON.stringify(materialDropdownItems));
  }, [materialDropdownItems]);

  // 🎯 STRICT SITE ISOLATION
  const siteMaterials = (materials || []).filter(m => m.siteId === siteId);
  const totalSiteMaterialExpense = siteMaterials.reduce((sum, item) => sum + (item.cost || 0), 0);

  // ⚡ Live Automatic Price Calculation
  const autoTotalPrice = Number(ratePerPiece || 0) * Number(quantity || 0);

  // Add new item type directly inside dropdown list
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    if (!materialDropdownItems.includes(customItem.trim())) {
      setMaterialDropdownItems([...materialDropdownItems, customItem.trim()]);
      setSelectedMaterial(customItem.trim()); // Auto select newly added item
    }
    setCustomItem('');
    setShowAddItemForm(false);
  };

  // 📝 Naya Material Entry Record save karne ke liye
  const handleAddMaterialRecord = (e) => {
    e.preventDefault();
    if (!vendorName.trim() || !selectedMaterial || !ratePerPiece || !quantity) return;

    const newMaterialEntry = {
      id: `mat-${Date.now()}`,
      siteId, 
      vendorName: vendorName.trim(),
      materialType: selectedMaterial,
      ratePerPiece: Number(ratePerPiece),
      quantity: Number(quantity),
      cost: autoTotalPrice, // Calculated Value Saved
      // 📅 Current year ke data automation format ke sath clear date tracking
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    // Functional State Update - Taaki UI turant bina block huye card render kare
    setMaterials((prevMaterials) => [newMaterialEntry, ...prevMaterials]);
    
    // Reset fields
    setVendorName('');
    setSelectedMaterial('');
    setRatePerPiece('');
    setQuantity('');
  };

  // 🗑️ Material Record delete karne ke liye
  const handleDeleteMaterial = (id) => {
    setMaterials((prevMaterials) => prevMaterials.filter(m => m.id !== id));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5 animate-fadeIn text-xs text-slate-800">
      
      {/* HEADER SECTION METRICS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-slate-950 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" /> Material & Inventory Management
          </h3>
          <p className="text-[11px] text-slate-400 font-medium">Manage item stocks, dynamic item rates, and direct supplier costs for this site.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-black px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs shadow-3xs self-stretch sm:self-auto justify-center">
          Current Site Expense: <IndianRupee className="w-3 h-3 ml-1" />{totalSiteMaterialExpense.toLocaleString('en-IN')}
        </div>
      </div>

      {/* DYNAMIC ITEM CREATOR TOGGLE */}
      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <span className="font-bold text-slate-900 block">Need a custom item category?</span>
          <p className="text-[10px] text-slate-400">Add materials like tiles, pipes, or paint directly to your main selection list.</p>
        </div>
        {!showAddItemForm ? (
          <button 
            type="button" 
            onClick={() => setShowAddItemForm(true)}
            className="bg-white border border-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[11px] hover:bg-slate-50 transition-all flex items-center gap-1 shadow-3xs self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-600" /> + Add New Item Type
          </button>
        ) : (
          <form onSubmit={handleAddCustomItem} className="flex gap-1.5 items-center w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="e.g., Marble, Asian Paint" 
              value={customItem} 
              onChange={(e) => setCustomItem(e.target.value)}
              className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg font-bold text-xs text-slate-800 focus:outline-none w-full sm:w-44"
              required
            />
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-indigo-500 shrink-0">Save</button>
            <button type="button" onClick={() => setShowAddItemForm(false)} className="text-slate-400 hover:text-slate-600 px-1 font-bold">Cancel</button>
          </form>
        )}
      </div>

      {/* CALCULATOR LOG ENTRY FORM */}
      <form onSubmit={handleAddMaterialRecord} className="bg-indigo-50/30 border border-indigo-100/60 p-4 rounded-xl space-y-3">
        <span className="block text-[10px] font-black uppercase text-indigo-600 tracking-wider">📋 Manage Stock & Cost Logistics</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          
          {/* Supplier Text Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Supplier / Vendor Name</label>
            <input 
              type="text" 
              placeholder="Type Supplier Name" 
              value={vendorName} 
              onChange={(e) => setVendorName(e.target.value)} 
              className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500" 
              required 
            />
          </div>

          {/* Dynamic Dropdown Select */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Select Material Item</label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs text-slate-800 focus:outline-none"
              required
            >
              <option value="">-- Choose Item --</option>
              {materialDropdownItems.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* Cost of One Piece / Rate Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Rate (Cost per Unit/Pc)</label>
            <div className="relative">
              <span className="absolute left-2.5 top-2 font-black text-slate-400">₹</span>
              <input 
                type="number" 
                placeholder="Cost per Piece" 
                value={ratePerPiece} 
                onChange={(e) => setRatePerPiece(e.target.value)} 
                className="w-full bg-white border border-slate-200 pl-5 pr-2 py-2 rounded-lg font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500" 
                required 
              />
            </div>
          </div>

          {/* Manual Quantity Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Quantity (Total Units)</label>
            <input 
              type="number" 
              placeholder="e.g., 250" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              className="w-full bg-white border border-slate-200 p-2 rounded-lg font-bold text-xs text-slate-800 focus:outline-none focus:border-indigo-500" 
              required 
            />
          </div>

          {/* Read-Only Live Total Calculation Output */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-indigo-600 mb-0.5">Auto Total Cost (Calculated)</label>
            <div className="w-full bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg font-black text-xs text-slate-900 flex items-center shadow-3xs">
              <IndianRupee className="w-3 h-3 text-slate-500 mr-0.5" /> {autoTotalPrice.toLocaleString('en-IN')}
            </div>
          </div>

        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs">
          <Plus className="w-4 h-4" /> Save Material Log Entry
        </button>
      </form>

      {/* DATA OUTPUT OUTPUT RENDERING */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {siteMaterials.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <ShoppingBag className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 font-medium">No material categories listed on this individual site yet.</p>
          </div>
        ) : (
          siteMaterials.map(mat => (
            <div key={mat.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all shadow-3xs group">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black shrink-0">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs tracking-tight">{mat.vendorName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="bg-indigo-50 border border-indigo-100/60 px-1.5 py-0.5 rounded text-indigo-700 font-bold">{mat.materialType}</span>
                    <span className="text-slate-500">Rate: ₹{mat.ratePerPiece || 0}/pc</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-700 font-bold">Qty: {mat.quantity || 0} units</span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-slate-400"><Calendar className="w-2.5 h-2.5" /> {mat.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-slate-950 bg-white border border-slate-200/60 px-2.5 py-1 rounded-xl text-xs flex items-center shadow-3xs">
                  <IndianRupee className="w-3 h-3 text-slate-500 mr-0.5" /> {(mat.cost || 0).toLocaleString('en-IN')}
                </span>
                <button 
                  onClick={() => handleDeleteMaterial(mat.id)}
                  className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg transition-all hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}