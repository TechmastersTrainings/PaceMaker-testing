'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Timer, Target, Shuffle, BookOpen, CheckCircle2, ChevronRight, Sparkles, FileText, Activity } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';

interface ToolCard {
  id: string;
  icon: any;
  title: string;
  description: string;
  action: string;
  badge: string;
}

export default function RevisionToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools: ToolCard[] = [
    {
      id: 'mnemonics',
      icon: Shuffle,
      title: 'High-Yield Medical Mnemonics',
      description: 'Quick recall memory aids for anatomy, pharmacology, and pathology concepts.',
      action: 'Browse Mnemonics',
      badge: 'High Yield',
    },
    {
      id: 'lab-values',
      icon: Activity,
      title: 'Normal Clinical Lab Reference',
      description: 'Standard reference ranges for hematology, electrolytes, and arterial blood gas.',
      action: 'View Lab Values',
      badge: 'Must Know',
    },
    {
      id: 'drug-choice',
      icon: Target,
      title: 'Drugs of Choice Lookup',
      description: 'Quick-reference guide for first-line therapies across clinical conditions.',
      action: 'Search Drugs of Choice',
      badge: 'Clinical',
    },
    {
      id: 'planner',
      icon: BookOpen,
      title: 'MBBS Syllabus Weightage Guide',
      description: 'High-yield topic weightage breakdown by academic year and specialty.',
      action: 'View Weightage',
      badge: 'Exam Prep',
    },
  ];

  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="revision-tools">
        <div className="space-y-6 selection:bg-primary-500 selection:text-white pb-12">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Revision Reference Tools</h1>
            <p className="text-sm font-medium text-stone-500 mt-0.5">Faculty-curated quick reference tools for high-yield exam preparation</p>
          </div>

          {/* Tools Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 bg-white rounded-2xl border border-stone-200/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {tool.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-stone-900 text-base mb-1">{tool.title}</h3>
                  <p className="text-xs text-stone-500 font-medium leading-relaxed mb-4">{tool.description}</p>
                </div>

                <button
                  onClick={() => setActiveTool(tool.id)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-primary-600 text-white rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer border-none inline-flex items-center justify-center gap-1.5"
                >
                  {tool.action} <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Tool Active Detail View */}
          {activeTool && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-white rounded-2xl border border-stone-200 shadow-lg text-stone-900"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
                <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  {activeTool === 'mnemonics' ? 'High-Yield Medical Mnemonics' :
                   activeTool === 'lab-values' ? 'Normal Clinical Lab Reference' :
                   activeTool === 'drug-choice' ? 'First-Line Drugs of Choice' : 'MBBS Syllabus Weightage Guide'}
                </h3>
                <button
                  onClick={() => setActiveTool(null)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  Close Reference
                </button>
              </div>

              {activeTool === 'mnemonics' && (
                <div className="space-y-3">
                  <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-200/50">
                    <p className="font-bold text-stone-900 text-sm">Retroperitoneal Organs: SAD PUCKER</p>
                    <p className="text-xs text-stone-600 mt-1">Suprarenal glands, Aorta/IVC, Duodenum (2nd-4th parts), Pancreas (head/body), Ureters, Colon (ascending/descending), Kidneys, Esophagus, Rectum.</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                    <p className="font-bold text-stone-900 text-sm">Branches of Facial Nerve: Two Zygomatic Patients Call Me</p>
                    <p className="text-xs text-stone-600 mt-1">Temporal, Zygomatic, Buccal, Marginal Mandibular, Cervical.</p>
                  </div>
                </div>
              )}

              {activeTool === 'lab-values' && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                    <p className="font-bold text-stone-900 text-sm mb-2">Serum Electrolytes</p>
                    <p><strong className="text-stone-700">Sodium (Na+):</strong> 135 – 145 mEq/L</p>
                    <p><strong className="text-stone-700">Potassium (K+):</strong> 3.5 – 5.0 mEq/L</p>
                    <p><strong className="text-stone-700">Chloride (Cl-):</strong> 96 – 106 mEq/L</p>
                    <p><strong className="text-stone-700">Bicarbonate (HCO3-):</strong> 22 – 28 mEq/L</p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1">
                    <p className="font-bold text-stone-900 text-sm mb-2">Arterial Blood Gas (ABG)</p>
                    <p><strong className="text-stone-700">pH:</strong> 7.35 – 7.45</p>
                    <p><strong className="text-stone-700">PaCO2:</strong> 35 – 45 mmHg</p>
                    <p><strong className="text-stone-700">PaO2:</strong> 80 – 100 mmHg</p>
                    <p><strong className="text-stone-700">HCO3-:</strong> 22 – 26 mEq/L</p>
                  </div>
                </div>
              )}

              {activeTool === 'drug-choice' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl flex justify-between border border-stone-100 font-medium">
                    <span className="font-bold text-stone-900">Anaphylactic Shock</span>
                    <span className="text-primary-700 font-bold">IM Epinephrine (1:1000)</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl flex justify-between border border-stone-100 font-medium">
                    <span className="font-bold text-stone-900">Acute Trigeminal Neuralgia</span>
                    <span className="text-primary-700 font-bold">Carbamazepine</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl flex justify-between border border-stone-100 font-medium">
                    <span className="font-bold text-stone-900">Methicillin-Resistant S. aureus (MRSA)</span>
                    <span className="text-primary-700 font-bold">IV Vancomycin</span>
                  </div>
                </div>
              )}

              {activeTool === 'planner' && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-2">
                  <p className="font-bold text-stone-900 text-sm">NEET PG / INI-CET Subject Weightage Summary</p>
                  <p className="text-stone-600"><strong>General Medicine & Surgery:</strong> ~45 questions (High Priority)</p>
                  <p className="text-stone-600"><strong>Pathology & Pharmacology:</strong> ~35 questions (High Priority)</p>
                  <p className="text-stone-600"><strong>Obstetrics & Gynecology:</strong> ~30 questions (High Priority)</p>
                  <p className="text-stone-600"><strong>Pediatrics & Preventive Social Medicine:</strong> ~25 questions</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}
