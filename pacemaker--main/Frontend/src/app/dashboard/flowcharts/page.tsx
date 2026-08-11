'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Search, Trash2, Eye, FileText, ChevronRight } from 'lucide-react';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useAuth } from '@/contexts/AuthContext';

interface Flowchart {
  id: string;
  title: string;
  subject: string;
  description: string;
  steps?: string[];
  createdAt: string;
}

const DEFAULT_FLOWCHARTS: Flowchart[] = [
  {
    id: 'fc-1',
    title: 'Diagnostic Approach to Acute Chest Pain',
    subject: 'MEDICINE',
    description: 'Algorithmic decision tree for emergency room triage: ECG -> Cardiac Biomarkers -> Risk Stratification -> Cath Lab / Observation.',
    steps: ['1. Immediate 12-Lead ECG within 10 mins', '2. Check High-Sensitivity Troponin I/T', '3. Assess TIMI / HEART Risk Score', '4. Direct to Coronary Angiography if STEMI'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fc-2',
    title: 'Management Algorithm for Diabetic Ketoacidosis (DKA)',
    subject: 'ENDOCRINOLOGY',
    description: 'Step-by-step fluid resuscitation, IV regular insulin titration, and potassium monitoring flow chart.',
    steps: ['1. Fluid Resuscitation (0.9% NaCl 1-1.5L in 1st hour)', '2. Check K+ levels (If < 3.3 mEq/L hold insulin & give K+)', '3. IV Regular Insulin 0.1 U/kg/hr infusion', '4. Add D5W when blood glucose < 200 mg/dL'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'fc-3',
    title: 'Anemia Diagnostic Flowchart: Microcytic vs Macrocytic',
    subject: 'PATHOLOGY',
    description: 'Workup algorithm starting from MCV values -> Iron profile / Serum Ferritin vs B12/Folate assays.',
    steps: ['1. Evaluate MCV (<80 fL: Microcytic, 80-100 fL: Normocytic, >100 fL: Macrocytic)', '2. Microcytic: Order Serum Ferritin, TIBC, Iron', '3. Macrocytic: Order Vitamin B12, Folate & Reticulocyte count'],
    createdAt: new Date().toISOString(),
  },
];

function FlowchartsPage() {
  const { user } = useAuth();
  const isInstructorOrAdmin = user?.role === 'INSTRUCTOR' || user?.role === 'TRAINER' || user?.role === 'ADMIN';

  const [isLoaded, setIsLoaded] = useState(false);
  const [flowcharts, setFlowcharts] = useState<Flowchart[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFlowchart, setActiveFlowchart] = useState<Flowchart | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lms_flowcharts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFlowcharts(parsed);
        } else {
          setFlowcharts(DEFAULT_FLOWCHARTS);
        }
      } catch {
        setFlowcharts(DEFAULT_FLOWCHARTS);
      }
    } else {
      setFlowcharts(DEFAULT_FLOWCHARTS);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lms_flowcharts', JSON.stringify(flowcharts));
    }
  }, [flowcharts, isLoaded]);

  const filtered = flowcharts.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) return <DashboardSkeleton />;

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="flowcharts">
        <div className="space-y-6 selection:bg-primary-500 selection:text-white pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Clinical Flowcharts</h1>
              <p className="text-sm font-medium text-stone-500 mt-0.5">Visual decision algorithms and clinical diagnostic flowcharts</p>
            </div>
            {isInstructorOrAdmin && (
              <button
                onClick={() => {
                  const title = prompt('Flowchart title:');
                  if (!title) return;
                  const newFlowchart: Flowchart = {
                    id: Date.now().toString(),
                    title,
                    subject: prompt('Subject:') || 'General',
                    description: prompt('Description:') || '',
                    steps: ['Step 1: Clinical Assessment', 'Step 2: Diagnostic Workup'],
                    createdAt: new Date().toISOString(),
                  };
                  setFlowcharts(prev => [newFlowchart, ...prev]);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer border-none"
              >
                <Plus className="w-4 h-4" /> Add Flowchart
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search clinical flowcharts by title, subject, or algorithm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Flowchart Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-16 bg-white rounded-2xl border border-stone-200/60 p-6">
                <GitBranch className="w-12 h-12 mx-auto mb-3 text-stone-300" />
                <p className="font-bold text-stone-900">No flowcharts found</p>
                <p className="text-sm text-stone-500">Try searching for a different clinical algorithm</p>
              </motion.div>
            ) : (
              filtered.map((fc, i) => (
                <motion.div
                  key={fc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-2xl border border-stone-200/60 p-5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {fc.subject}
                      </span>
                      {isInstructorOrAdmin && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete flowchart "${fc.title}"?`)) {
                              setFlowcharts(prev => prev.filter(f => f.id !== fc.id));
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-stone-900 text-base leading-snug mb-2">{fc.title}</h3>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 mb-4">{fc.description}</p>
                  </div>

                  <button
                    onClick={() => setActiveFlowchart(fc)}
                    className="w-full py-2.5 bg-stone-900 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer border-none inline-flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Flowchart Steps
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Flowchart Detail Modal */}
          {activeFlowchart && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveFlowchart(null)} />
              <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 text-stone-900 border border-stone-200">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                  <div>
                    <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {activeFlowchart.subject}
                    </span>
                    <h3 className="font-bold text-lg text-stone-900 mt-1">{activeFlowchart.title}</h3>
                  </div>
                  <button onClick={() => setActiveFlowchart(null)} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-bold border-none cursor-pointer">
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  <p className="text-xs text-stone-600 leading-relaxed font-medium bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {activeFlowchart.description}
                  </p>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Step-by-Step Flowchart Algorithm</p>
                    <div className="space-y-2">
                      {(activeFlowchart.steps || ['Clinical Assessment', 'Diagnostic Workup', 'Targeted Therapy']).map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-3 bg-white border border-stone-200/80 rounded-xl text-xs font-bold text-stone-800 shadow-sm">
                          <ChevronRight className="w-4 h-4 text-primary-600 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-stone-100 flex justify-end">
                  <button
                    onClick={() => setActiveFlowchart(null)}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-primary-600 text-white rounded-xl font-bold text-xs transition-all border-none cursor-pointer"
                  >
                    Close Reference
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

export default function Page() {
  return <FlowchartsPage />;
}
