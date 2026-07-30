import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { 
  ClipboardList, Plus, ArrowRight, ArrowLeft, CheckCircle2, 
  Clock, AlertCircle, Trash2, Calendar, LayoutGrid 
} from 'lucide-react';

export default function MilestoneTaskBoard() {
  const { sites = [] } = useRole();
  const context = useRole();

  // Context-safe plumbing for task state management
  const tasks = context.tasks || [];
  const setTasks = context.setTasks || (() => {});

  // Local fallback if context state isn't initialized yet
  const [localTasks, setLocalTasks] = useState([
    { id: 't1', siteId: sites[0]?.id || '1', title: 'Excavation & Footing Digging', status: 'done', priority: 'High' },
    { id: 't2', siteId: sites[0]?.id || '1', title: 'Foundation Beam Shuttering', status: 'progress', priority: 'High' },
    { id: 't3', siteId: sites[0]?.id || '1', title: 'Plinth Beam Concrete Casting', status: 'todo', priority: 'Medium' },
    { id: 't4', siteId: sites[0]?.id || '1', title: 'Brickwork Layer up to Lintel Level', status: 'todo', priority: 'Low' }
  ]);

  const activeTasks = context.tasks ? tasks : localTasks;
  const updateTasksState = (updatedList) => {
    if (context.tasks) {
      setTasks(updatedList);
    } else {
      setLocalTasks(updatedList);
    }
  };

  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Medium');

  const currentSite = sites.find(s => s.id === selectedSiteId) || sites[0];
  const siteTasks = activeTasks.filter(t => t.siteId === currentSite?.id);

  // Compute live visual project completion metrics
  const totalCount = siteTasks.length;
  const doneCount = siteTasks.filter(t => t.status === 'done').length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedSiteId) return;

    const newTask = {
      id: `task-${Date.now()}`,
      siteId: selectedSiteId,
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: newTaskPriority,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };

    updateTasksState([newTask, ...activeTasks]);
    setNewTaskTitle('');
  };

  const moveTask = (taskId, currentStatus, direction) => {
    const statuses = ['todo', 'progress', 'done'];
    let currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= statuses.length) return;

    const updated = activeTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: statuses[nextIndex] };
      }
      return t;
    });
    updateTasksState(updated);
  };

  const deleteTask = (taskId) => {
    const updated = activeTasks.filter(t => t.id !== taskId);
    updateTasksState(updated);
  };

  if (sites.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 text-center p-8 rounded-2xl text-xs">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-bold text-slate-600">No active site blueprints found.</p>
        <p className="text-[11px] text-slate-400 font-medium">Create a construction site location first to use the progress Kanban board.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-xs animate-fadeIn">
      
      {/* FILTER HEADER & SITE PROGRESS METER BAR */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Select Construction Site</label>
          <select 
            value={selectedSiteId} 
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Live Visual Completion Bar */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-center mb-1.5 font-bold">
            <span className="text-slate-500">Site Work Completion Meter</span>
            <span className="text-indigo-600 font-black">{progressPercent}% Built</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* QUICK INLINE FORM TO DROP A NEW TASK MILESTONE */}
      <form onSubmit={handleAddTask} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Add Stage / Blueprint Task</label>
          <input 
            type="text" 
            required
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="e.g., Setup shuttering for 1st floor roof slab casting..."
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-32">
          <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Priority Tag</label>
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-slate-800 focus:outline-none"
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🔵 Low</option>
          </select>
        </div>
        <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold p-2 px-4 rounded-lg flex items-center justify-center gap-1.5 transition">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </form>

      {/* THREE-COLUMN OPERATION KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* COLUMN 1: PENDING WORK / TO-DO */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col h-full min-h-[350px]">
          <div className="flex justify-between items-center mb-3 font-bold px-1">
            <span className="text-slate-700 flex items-center gap-1.5"><ClipboardList className="w-4 h-4 text-slate-400" /> Pending (*Baki Kaam*)</span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black">{siteTasks.filter(t => t.status === 'todo').length}</span>
          </div>
          
          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {siteTasks.filter(t => t.status === 'todo').map(task => (
              <div key={task.id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-3 group hover:border-slate-300 transition">
                <p className="font-bold text-slate-800 leading-normal">{task.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600'}`}>{task.priority}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-rose-600 p-1 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => moveTask(task.id, 'todo', 'next')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-1 px-1.5 rounded-md transition font-black flex items-center gap-0.5">Start <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE WORK / IN PROGRESS */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 flex flex-col h-full min-h-[350px]">
          <div className="flex justify-between items-center mb-3 font-bold px-1">
            <span className="text-amber-800 flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> Active (*Chalu Kaam*)</span>
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black">{siteTasks.filter(t => t.status === 'progress').length}</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {siteTasks.filter(t => t.status === 'progress').map(task => (
              <div key={task.id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-3 hover:border-amber-200 transition">
                <p className="font-bold text-slate-800 leading-normal">{task.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>{task.priority}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveTask(task.id, 'progress', 'prev')} className="text-slate-400 hover:text-slate-700 p-1.5 rounded transition"><ArrowLeft className="w-3.5 h-3.5" /></button>
                    <button type="button" onClick={() => moveTask(task.id, 'progress', 'next')} className="bg-emerald-600 hover:bg-emerald-500 text-white p-1 px-1.5 rounded-md transition font-black flex items-center gap-0.5">Done <ArrowRight className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 3: COMPLETED WORK / DONE */}
        <div className="bg-emerald-50/30 border border-emerald-100/70 rounded-2xl p-4 flex flex-col h-full min-h-[350px]">
          <div className="flex justify-between items-center mb-3 font-bold px-1">
            <span className="text-emerald-800 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Finished (*Pura Hua*)</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black">{siteTasks.filter(t => t.status === 'done').length}</span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {siteTasks.filter(t => t.status === 'done').map(task => (
              <div key={task.id} className="bg-white border border-emerald-100 p-3 rounded-xl shadow-2xs space-y-3 opacity-85 hover:opacity-100 transition">
                <p className="font-bold text-slate-500 line-through leading-normal">{task.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">Success</span>
                  <button type="button" onClick={() => moveTask(task.id, 'done', 'prev')} className="text-slate-400 hover:text-indigo-600 p-1 px-1.5 rounded-md border border-slate-100 transition font-bold flex items-center gap-0.5"><ArrowLeft className="w-3 h-3" /> Reopen</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}