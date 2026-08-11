'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, Edit3, X, Activity, Check, 
  AlertCircle, Save, FileText, Users, Loader2, Filter, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { patientCaseService, PatientCase } from '@/services/patientCaseService';
import { AdminTableSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';

function AdminPatientCases() {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<number | null>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState<Omit<PatientCase, 'id'>>({
    name: '',
    description: '',
    difficulty: 'Medium',
    systemSubject: ''
  });

  const fetchCases = async () => {
    try {
      const allCases = await patientCaseService.getAllCases();
      setCases(allCases);
    } catch (err) {
      console.error('Failed to load patient cases:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      difficulty: 'Medium',
      systemSubject: ''
    });
    setEditingCaseId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (c: PatientCase) => {
    setFormData({
      name: c.name,
      description: c.description,
      difficulty: c.difficulty,
      systemSubject: c.systemSubject
    });
    setEditingCaseId(c.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this case?')) {
      try {
        await patientCaseService.deleteCase(id);
        setCases(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to delete patient case:', err);
        alert('Failed to delete case. Please ensure you have permission.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCaseId !== null) {
        const res = await patientCaseService.updateCase(editingCaseId, formData);
        setCases(prev => prev.map(c => c.id === editingCaseId ? res : c));
      } else {
        const res = await patientCaseService.createCase(formData);
        setCases(prev => [res, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save patient case:', err);
      alert('Failed to save patient case. Please check form constraints.');
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.systemSubject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'All' || c.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto min-h-screen bg-transparent p-6 md:p-10 pb-32">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
        </div>
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-transparent text-gray-900 p-6 md:p-10 pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-sm tracking-wide uppercase">
            <Activity className="w-4 h-4" />
            Clinical Skills Lab
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Patient Cases <span className="text-primary-600">Simulator Settings</span></h1>
          <p className="text-gray-600 font-medium">Create and configure clinical cases for the OSCE Patient Simulation sandbox.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 text-lg"
        >
          <Plus className="w-5 h-5" />
          Add OSCE Case
        </button>
      </div>

      {/* Grid Toolbar & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
        {/* Left Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Active Cases</p>
            <p className="text-4xl font-black text-gray-900">{cases.length}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
               <span className="text-gray-500 font-medium">Live Simulator Scenarios</span>
               <span className="text-green-600 font-bold">Active</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
             <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary-500" /> Filter by Difficulty
             </h4>
             <div className="flex flex-col gap-1 pr-2">
                {['All', 'Medium', 'Advanced'].map(d => (
                  <button 
                    key={d} 
                    onClick={() => setDifficultyFilter(d)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${difficultyFilter === d ? 'bg-primary-50 text-primary-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    {d}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Right Search & Case List */}
        <div className="lg:col-span-3 space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search patient cases by title or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-3xl bg-white border border-gray-200 outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 text-lg font-medium transition-all text-gray-900 shadow-sm"
              />
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredCases.length > 0 ? filteredCases.map((c) => (
                  <motion.div 
                    layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    key={c.id}
                    className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            c.difficulty === 'Medium' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                             {c.difficulty} Difficulty
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject key: {c.systemSubject}</span>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(c)} className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900 leading-relaxed mb-2">{c.name}</p>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{c.description}</p>
                  </motion.div>
                )) : (
                  <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center">
                     <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-gray-300" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900">No patient cases found</h3>
                     <p className="text-sm text-gray-500 mt-1 font-medium">Add a new OSCE case or try checking difficulty filters.</p>
                  </div>
                )}
              </AnimatePresence>
           </div>
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetForm} className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-8 md:p-12">
                 <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-100">
                    <div>
                       <h2 className="text-3xl font-black text-gray-900">{editingCaseId !== null ? 'Edit OSCE Case' : 'New OSCE Case Creation'}</h2>
                       <p className="text-gray-500 font-medium">Design structured clinical case scenarios for student medical diagnosis.</p>
                    </div>
                    <button onClick={resetForm} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                       <X className="w-6 h-6 text-gray-400" />
                    </button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Case Name / Patient Bio</label>
                          <input 
                            required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary-500 transition-all font-bold text-gray-900"
                            placeholder="e.g. 52yo Male: Chest Pain"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Subject Key (passed to AI)</label>
                          <input 
                            required type="text" value={formData.systemSubject} onChange={(e) => setFormData({...formData, systemSubject: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-primary-500 transition-all font-bold text-gray-900"
                            placeholder="e.g. chest_pain, acute_abdomen"
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Difficulty</label>
                          <div className="flex bg-gray-50 rounded-2xl border border-gray-100 p-1">
                             {['Medium', 'Advanced'].map((d) => (
                               <button 
                                 key={d} type="button" onClick={() => setFormData({...formData, difficulty: d})}
                                 className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.difficulty === d ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                               >
                                 {d}
                               </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Clinical Scenario Description</label>
                       <textarea 
                         required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-8 py-6 outline-none focus:border-primary-500 transition-all font-medium text-gray-700 resize-none animate-none"
                         placeholder="A detailed clinical presentation of the patient case for study..."
                       />
                    </div>

                    <div className="pt-8 flex gap-6">
                       <button type="button" onClick={resetForm} className="flex-1 py-5 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all">Discard Changes</button>
                       <button type="submit" className="flex-[2] py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                          <Save className="w-5 h-5" />
                          Publish to Sim
                       </button>
                    </div>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPatientCasesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <AdminPatientCases />
    </ErrorBoundary>
  );
}
