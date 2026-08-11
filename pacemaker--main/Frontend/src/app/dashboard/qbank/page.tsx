'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Database,   ChevronDown, ChevronRight, BookOpen,  
  Activity, GraduationCap, ArrowRight, ArrowLeft,
  CheckCircle2, AlertCircle, HelpCircle, Trophy,
  Clock, Filter, BarChart, Eye, Download, FileText, X, Sparkles, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DashboardSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import SubscriptionGuard from '@/components/SubscriptionGuard';
import { aiService } from '@/services/aiService';
import { qbankService } from '@/services/qbankService';
import { ALL_VIDEO_SUBJECTS, SUBJECT_LABELS, subjectsForLevel } from '@/lib/videoSubjects';

type Question = {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation: string;
  createdAt: string;
};

type UploadedFile = {
  id: string;
  name: string;
  type: 'json' | 'pdf';
  size: string;
  status: 'Processing' | 'Ready' | 'Extracting MCQs';
  timestamp: string;
  file?: File;
  folder?: string;
};

const INITIAL_QUESTIONS: Question[] = [
  {
    id: '1',
    subject: 'Anatomy',
    topic: 'Upper Limb',
    difficulty: 'Medium',
    questionText: 'Which of the following nerves is most commonly injured in a fracture of the surgical neck of the humerus?',
    options: {
      a: 'Radial nerve',
      b: 'Axillary nerve',
      c: 'Median nerve',
      d: 'Ulnar nerve'
    },
    correctOption: 'b',
    explanation: 'The axillary nerve and the posterior circumflex humeral artery pass through the quadrangular space and are closely related to the surgical neck of the humerus. Fractures in this region commonly lead to axillary nerve injury, resulting in paralysis of the deltoid and teres minor muscles.',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    subject: 'Physiology',
    topic: 'Cardiovascular',
    difficulty: 'Hard',
    questionText: 'During the cardiac cycle, the first heart sound (S1) is primarily caused by:',
    options: {
      a: 'Closure of semilunar valves',
      b: 'Opening of AV valves',
      c: 'Closure of atrioventricular (AV) valves',
      d: 'Rapid ventricular filling'
    },
    correctOption: 'c',
    explanation: 'S1 marks the beginning of systole and is caused by the sudden closure of the mitral and tricuspid valves as ventricular pressure exceeds atrial pressure.',
    createdAt: new Date().toISOString()
  }
];

const mapBackendQuestion = (bq: any): Question => {
  const opts = {
    a: bq.options?.[0] || 'Option A',
    b: bq.options?.[1] || 'Option B',
    c: bq.options?.[2] || 'Option C',
    d: bq.options?.[3] || 'Option D'
  };
  const correctMapping: Record<number, 'a' | 'b' | 'c' | 'd'> = {
    0: 'a',
    1: 'b',
    2: 'c',
    3: 'd'
  };
  const correctOpt = correctMapping[bq.correctOption] || 'a';
  return {
    id: String(bq.id),
    subject: bq.subject || 'General',
    topic: bq.tags?.[0] || 'General',
    difficulty: bq.difficulty === 'Hard' ? 'Hard' : bq.difficulty === 'Medium' ? 'Medium' : 'Easy',
    questionText: bq.questionText,
    options: opts,
    correctOption: correctOpt,
    explanation: bq.explanation || 'No explanation provided.',
    createdAt: new Date().toISOString()
  };
};

function StudentQBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'quiz'>('browse');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | 'c' | 'd' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [selectedDoc, setSelectedDoc] = useState<UploadedFile | null>(null);

  // Academic level filtering
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([]);

  // AI MCQ states
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard' | 'exam-level'>('medium');
  const [aiCount, setAiCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  useEffect(() => {
    const levelId = localStorage.getItem('academicLevelId') || '';
    if (levelId) {
      const levelKeys = subjectsForLevel(levelId);
      const levelLabels = levelKeys.map(k => SUBJECT_LABELS[k]).filter(Boolean);
      setAllowedSubjects(levelLabels);
    }
  }, []);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await qbankService.getQuestions(undefined, undefined, undefined, 0, 100);
        let allQuestions: Question[] = [];
        if (res && res.content && res.content.length > 0) {
          allQuestions = res.content.map(mapBackendQuestion);
        } else {
          const saved = localStorage.getItem('lms_qbank_questions_v1');
          if (saved && JSON.parse(saved).length > 0) {
            allQuestions = JSON.parse(saved);
          } else {
            allQuestions = INITIAL_QUESTIONS;
          }
        }
        const byLevel = allowedSubjects.length > 0
          ? allQuestions.filter(q => allowedSubjects.includes(q.subject))
          : allQuestions;
        setQuestions(byLevel);
      } catch (err) {
        console.error("Failed to fetch questions from backend:", err);
        const saved = localStorage.getItem('lms_qbank_questions_v1');
        if (saved && JSON.parse(saved).length > 0) {
          const parsed = JSON.parse(saved) as Question[];
          const byLevel = allowedSubjects.length > 0
            ? parsed.filter(q => allowedSubjects.includes(q.subject))
            : parsed;
          setQuestions(byLevel);
        } else {
          const byLevel = allowedSubjects.length > 0
            ? INITIAL_QUESTIONS.filter(q => allowedSubjects.includes(q.subject))
            : INITIAL_QUESTIONS;
          setQuestions(byLevel);
        }
      } finally {
        setIsLoaded(true);
      }
    }
    loadQuestions();
  }, [allowedSubjects]);

  const filteredQuestions = questions.filter(q => 
    selectedSubject === 'All' || q.subject === selectedSubject
  );

  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.subject]) acc[q.subject] = [];
    acc[q.subject].push(q);
    return acc;
  }, {} as Record<string, typeof filteredQuestions>);

  const subjectOrder = [...new Set(filteredQuestions.map(q => q.subject))];
  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  const allExpanded = filteredQuestions.length > 0 && subjectOrder.length > 0 && subjectOrder.every(s => expandedSubjects.has(s));
  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSubjects(new Set());
    } else {
      setExpandedSubjects(new Set(subjectOrder));
    }
  };

  useEffect(() => {
    if (subjectOrder.length > 0 && expandedSubjects.size === 0) {
      setExpandedSubjects(new Set(subjectOrder));
    }
  }, [selectedSubject]);

  const startQuiz = () => {
    if (filteredQuestions.length === 0) return;
    setActiveTab('quiz');
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizScore(0);
    setShowResults(false);
  };

  const handleGenerateAiQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    setGenerationError('');
    try {
      const res = await aiService.generateMCQ(aiTopic, aiCount, aiDifficulty);
      if (res && res.questions && res.questions.length > 0) {
        const formatted: Question[] = res.questions.map((q) => ({
          id: `ai-${q.id}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          subject: 'AI Generated',
          topic: res.topic,
          difficulty: (res.difficulty.charAt(0).toUpperCase() + res.difficulty.slice(1)) as any,
          questionText: q.question,
          options: {
            a: q.options.A,
            b: q.options.B,
            c: q.options.C,
            d: q.options.D,
          },
          correctOption: q.correct_answer.toLowerCase() as any,
          explanation: q.explanation,
          createdAt: new Date().toISOString(),
        }));

        // Merge with existing questions and persist to localStorage so Exam Builder can pick them up
        const existing: Question[] = JSON.parse(localStorage.getItem('lms_qbank_questions_v1') || '[]');
        const merged = [...existing.filter(q => q.subject !== 'AI Generated'), ...formatted];
        localStorage.setItem('lms_qbank_questions_v1', JSON.stringify(merged));
        
        setQuestions(formatted);
        setSelectedSubject('AI Generated');
        
        // Start quiz immediately
        setActiveTab('quiz');
        setCurrentQuizIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setQuizScore(0);
        setShowResults(false);
      } else {
        setGenerationError('Failed to generate questions. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.response?.data?.detail || 'An error occurred during quiz generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuestions = () => {
    const saved = localStorage.getItem('lms_qbank_questions_v1');
    if (saved) {
      setQuestions(JSON.parse(saved));
    } else {
      setQuestions(INITIAL_QUESTIONS);
    }
    setSelectedSubject('All');
  };

  const handleOptionSelect = (opt: 'a' | 'b' | 'c' | 'd') => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    if (opt === filteredQuestions[currentQuizIndex].correctOption) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuizIndex < filteredQuestions.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(prev => prev - 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full text-white">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full text-stone-600 selection:bg-primary-500 selection:text-white space-y-6">
      <div>
        
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
           <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-widest mb-6 border border-primary-100"
              >
                 <GraduationCap className="w-4 h-4 text-primary-600" />
                 Adaptive Question Bank
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight tracking-tight">
                 Practice the <span className="text-primary-600">High-Yield</span> <br/>
                 Clinical Scenarios.
              </h1>
           </div>
           
           <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200/60 shadow-sm">
              <button 
                onClick={() => setActiveTab('browse')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all border-none cursor-pointer ${activeTab === 'browse' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-stone-500 hover:text-stone-700 bg-transparent'}`}
              >
                Browse Subjects
              </button>
              <button 
                onClick={() => setActiveTab('quiz')}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all border-none cursor-pointer ${activeTab === 'quiz' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' : 'text-stone-500 hover:text-stone-700 bg-transparent'}`}
              >
                Practice Quiz
              </button>
           </div>
        </div>

        <motion.div 
          key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="w-full"
        >
          {activeTab === 'browse' ? (
            <div className="space-y-6">
              {/* Horizontal Filter Bar */}
              <div className="bg-white border border-stone-200/60 rounded-[2.5rem] p-6 shadow-lg space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-auto px-4 py-2.5 bg-white border border-stone-200/60 rounded-xl text-sm font-semibold text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none shrink-0">
                    {['All', ...allowedSubjects, 'AI Generated'].map(s => (
                      <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
                    ))}
                  </select>
                  {selectedSubject === 'AI Generated' && (
                    <button onClick={resetQuestions}
                      className="px-4 py-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-sm font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer bg-white shrink-0">
                      <X className="w-3.5 h-3.5" /> Restore Default QBank
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <p className="text-sm font-semibold text-stone-500">{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} across {Object.keys(groupedQuestions).length} subject{Object.keys(groupedQuestions).length !== 1 ? 's' : ''}</p>
                  {Object.keys(groupedQuestions).length > 0 && (
                    <button onClick={toggleAll}
                      className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors bg-transparent border-none cursor-pointer">
                      {allExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                  )}
                </div>
              </div>

              {/* AI Custom Quiz Generator */}
              <div className="bg-white border border-stone-200/60 rounded-[2.5rem] p-6 shadow-lg space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl text-white shadow-lg shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900">AI Custom Quiz</h3>
                    <p className="text-sm text-stone-500 font-medium mt-0.5">Generate high-yield practice questions on any medical topic using AI.</p>
                  </div>
                </div>
                <form onSubmit={handleGenerateAiQuiz} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input type="text" required value={aiTopic} onChange={(e) => setAiTopic(e.target.value)}
                        placeholder="Enter a topic, e.g. Aortic Dissection"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200/60 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                    </div>
                    <div className="flex gap-3">
                      <select value={aiDifficulty} onChange={(e: any) => setAiDifficulty(e.target.value)}
                        className="px-4 py-3 bg-white border border-stone-200/60 rounded-xl text-sm font-semibold text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="exam-level">Exam Level</option>
                      </select>
                      <select value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))}
                        className="px-4 py-3 bg-white border border-stone-200/60 rounded-xl text-sm font-semibold text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none">
                        <option value={3}>3 Qs</option>
                        <option value={5}>5 Qs</option>
                        <option value={10}>10 Qs</option>
                      </select>
                      <button type="submit" disabled={isGenerating}
                        className="px-5 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white rounded-xl font-black text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-teal-500/20 border-none cursor-pointer">
                        {isGenerating ? <><Cpu className="w-4 h-4 animate-spin" /> Gen...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
                      </button>
                    </div>
                  </div>
                  {generationError && <p className="text-red-500 text-xs font-semibold">{generationError}</p>}
                </form>
              </div>

              {/* Subjects List — Grouped */}
              <div className="space-y-3">
                {Object.entries(groupedQuestions).map(([subject, subjectQuestions]) =>
                  subjectQuestions.length > 0 && (
                    <div key={subject} className="bg-white rounded-[2.5rem] border border-stone-200/60 shadow-sm overflow-hidden">
                      <button onClick={() => toggleSubject(subject)}
                        className="w-full flex items-center justify-between px-8 py-5 bg-stone-50/50 hover:bg-stone-50 transition-colors border-b border-stone-100 cursor-pointer">
                        <div className="flex items-center gap-4">
                          <ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${expandedSubjects.has(subject) ? '' : '-rotate-90'}`} />
                          <span className="text-lg font-bold text-stone-900">{subject}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-black">{subjectQuestions.length}</span>
                        </div>
                        <span className="text-sm text-stone-400 font-medium">
                          {subjectQuestions.filter(q => q.difficulty === 'Hard').length} hard,{' '}
                          {subjectQuestions.filter(q => q.difficulty === 'Medium').length} medium,{' '}
                          {subjectQuestions.filter(q => q.difficulty === 'Easy').length} easy
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedSubjects.has(subject) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="divide-y divide-stone-50">
                              {subjectQuestions.map((q, i) => (
                                <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className="p-8 hover:bg-stone-50/50 transition-colors group">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${
                                        q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : 
                                        q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                                      }`}>
                                        {q.difficulty}
                                      </span>
                                      <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">{q.topic}</span>
                                    </div>
                                    <button onClick={() => { setActiveTab('quiz'); setCurrentQuizIndex(filteredQuestions.indexOf(q)); setIsAnswered(false); setSelectedOption(null); }}
                                      className="px-5 py-2 border border-primary-200 hover:bg-primary-50 text-primary-700 rounded-xl text-[11px] font-bold transition-all opacity-0 group-hover:opacity-100 cursor-pointer bg-white">
                                      <Eye className="w-3.5 h-3.5 inline-block mr-1" /> Practice
                                    </button>
                                  </div>
                                  <p className="text-base text-stone-800 font-semibold leading-relaxed">{q.questionText}</p>
                                  <div className="mt-4 grid grid-cols-2 gap-3">
                                    {Object.entries(q.options).map(([key, value]) => (
                                      <div key={key} className="flex items-center gap-2 text-base text-stone-600 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                                        <span className="font-black text-stone-500 uppercase">{key}.</span>
                                        <span className="font-medium">{value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                )}
                {Object.keys(groupedQuestions).length === 0 && (
                  <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-stone-200/80 flex flex-col items-center justify-center shadow-sm">
                    <HelpCircle className="w-16 h-16 text-stone-300 mb-6" />
                    <h3 className="text-2xl font-black text-stone-900">No content here yet</h3>
                    <p className="text-stone-500 max-w-xs mt-2 font-semibold">Select a different subject or check back later for new high-yield content.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
               {showResults ? (
                 <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-stone-200/60 shadow-lg text-center space-y-5 text-stone-900 max-w-xl mx-auto">
                    <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/5 border border-primary-100">
                       <Trophy className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">Practice Quiz Complete!</h2>
                    <p className="text-stone-500 font-medium max-w-md mx-auto">Great job. Consistent practice is the key to mastering clinical exams.</p>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                       <div className="bg-stone-50 p-5 rounded-2xl border border-stone-150">
                           <p className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1">Your Score</p>
                           <p className="text-2xl font-black text-primary-600">{quizScore}/{filteredQuestions.length}</p>
                        </div>
                        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-150">
                           <p className="text-xs font-black text-stone-500 uppercase tracking-widest mb-1">Accuracy</p>
                           <p className="text-2xl font-black text-teal-650">{Math.round((quizScore / filteredQuestions.length) * 100)}%</p>
                       </div>
                    </div>

                    <div className="flex justify-center gap-3">
                       <button onClick={() => setActiveTab('browse')} className="px-8 py-3.5 bg-stone-100 text-stone-700 border border-stone-200 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-stone-200 transition-all cursor-pointer">
                          Return to Library
                       </button>
                       <button onClick={startQuiz} className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all border-none cursor-pointer">
                          Try Again
                       </button>
                    </div>
                 </div>
               ) : filteredQuestions.length > 0 ? (
                 <div className="space-y-5">
                    {/* Quiz Progress */}
                    <div className="flex items-center justify-between bg-white border border-stone-200/60 rounded-[2.5rem] px-5 py-4 shadow-lg">
                       <div className="flex items-center gap-3">
                          <button onClick={() => setActiveTab('browse')} className="p-2 bg-stone-100 border border-stone-200 rounded-xl hover:bg-stone-200 transition-colors border-none cursor-pointer">
                             <ArrowLeft className="w-4 h-4 text-stone-500" />
                          </button>
                          <div>
                              <h4 className="text-sm font-black text-stone-900">{filteredQuestions[currentQuizIndex].subject}</h4>
                              <p className="text-xs font-bold text-stone-400">{filteredQuestions[currentQuizIndex].topic}</p>
                          </div>
                       </div>
                       <div className="text-right">
                           <p className="text-sm font-black text-primary-600">Q {currentQuizIndex + 1} / {filteredQuestions.length}</p>
                          <div className="w-24 h-1.5 bg-stone-100 rounded-full mt-1.5 overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }} animate={{ width: `${((currentQuizIndex + 1) / filteredQuestions.length) * 100}%` }}
                               className="h-full bg-primary-600"
                             />
                          </div>
                       </div>
                    </div>

                     {/* Question Card */}
                     <div className="bg-white p-5 md:p-8 rounded-[2.5rem] border border-stone-200/60 shadow-lg text-stone-900">
                         <h3 className="text-lg md:text-xl font-bold text-stone-900 leading-relaxed mb-6">
                          {filteredQuestions[currentQuizIndex].questionText}
                       </h3>

                        <div className="grid grid-cols-2 gap-2.5 mb-6">
                          {Object.entries(filteredQuestions[currentQuizIndex].options).map(([key, value]) => {
                            const isCorrect = key === filteredQuestions[currentQuizIndex].correctOption;
                            const isSelected = selectedOption === key;
                            
                            let style = "border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-primary-500/40 text-stone-900";
                            if (isAnswered) {
                              if (isCorrect) style = "border-green-300 bg-green-50 text-green-700 shadow-sm shadow-green-500/10";
                              else if (isSelected) style = "border-red-300 bg-red-50 text-red-650";
                              else style = "border-stone-100 bg-stone-50/20 opacity-30 text-stone-400";
                            } else if (isSelected) {
                              style = "border-primary-500 bg-primary-50 text-primary-750";
                            }

                            return (
                              <button 
                                key={key} onClick={() => handleOptionSelect(key as any)}
                                disabled={isAnswered}
                                className={`w-full p-3.5 md:p-4 rounded-xl border-2 flex items-center justify-between text-left transition-all duration-300 font-semibold text-base cursor-pointer ${style}`}
                              >
                                  <div className="flex items-center gap-3">
                                     <span className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 text-sm font-black transition-colors ${isSelected && !isAnswered ? 'bg-primary-600 text-white border-transparent' : isAnswered && isCorrect ? 'bg-green-600 text-white border-transparent' : 'border-stone-200 text-stone-500'}`}>
                                        {key.toUpperCase()}
                                     </span>
                                     <span className="text-base">{value}</span>
                                  </div>
                                  {isAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                                  {isAnswered && isSelected && !isCorrect && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                              </button>
                            );
                          })}
                       </div>

                       <AnimatePresence>
                          {isAnswered && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                              className="overflow-hidden"
                            >
                                <div className="p-5 md:p-6 bg-stone-50 border border-stone-200/60 rounded-2xl text-stone-900">
                                   <div className="flex items-center gap-3 mb-3">
                                      <div className="p-1.5 bg-primary-50 rounded-lg text-primary-600 border border-primary-100">
                                         <HelpCircle className="w-4 h-4" />
                                      </div>
                                      <h4 className="text-sm font-black tracking-tight uppercase text-stone-900">Explanation</h4>
                                   </div>
                                   <p className="text-stone-700 leading-relaxed font-medium text-base mb-4">
                                      {filteredQuestions[currentQuizIndex].explanation}
                                   </p>
                                   <div className="flex gap-3">
                                      {currentQuizIndex > 0 && (
                                        <button onClick={prevQuestion}
                                           className="flex-1 py-3 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer">
                                           <ArrowLeft className="w-3.5 h-3.5" /> Previous
                                        </button>
                                      )}
                                      <button onClick={nextQuestion}
                                        className={`${currentQuizIndex > 0 ? 'flex-1' : 'w-full'} py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98] border-none cursor-pointer`}>
                                        {currentQuizIndex < filteredQuestions.length - 1 ? 'Next Question' : 'View Session Summary'}
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </button>
                                   </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
               ) : (
                 <div className="py-32 text-center text-stone-900 bg-white border border-stone-200/60 rounded-[2.5rem] shadow-md">
                    <h3 className="text-2xl font-black text-stone-900">No questions found for this quiz</h3>
                    <button onClick={() => setActiveTab('browse')} className="mt-6 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold border-none cursor-pointer">Back to Library</button>
                 </div>
               )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Document Viewer Modal for Students */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDoc(null)} className="absolute inset-0 bg-[#060f1a]/85 backdrop-blur-md" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-full border border-stone-200/80"
            >
              <div className="p-6 md:p-8 border-b border-stone-200/60 flex justify-between items-center bg-stone-50 text-stone-900">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${selectedDoc.type === 'json' ? 'bg-amber-500/10 text-amber-600' : 'bg-primary-500/10 text-blue-650'}`}>
                    {selectedDoc.type === 'json' ? <Database className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-stone-900 truncate max-w-md">{selectedDoc.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{selectedDoc.type} Resource</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-xs font-bold text-stone-400">{selectedDoc.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedDoc(null)} className="p-4 bg-stone-100 rounded-2xl hover:bg-red-50 text-stone-500 hover:text-red-600 transition-all group border-none cursor-pointer">
                    <X className="w-6 h-6 text-stone-400 group-hover:text-red-400" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden bg-transparent relative">
                {selectedDoc.type === 'pdf' ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-12 text-stone-900">
                     <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center mb-6">
                        <FileText className="w-10 h-10 text-primary-500" />
                     </div>
                     <h3 className="text-xl font-black text-stone-900 mb-2">{selectedDoc.name}</h3>
                     <p className="text-stone-500 max-w-sm mb-8">This resource is available as part of your study module. Please contact your instructor for the printed version or live access.</p>
                     <button className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/20 border-none cursor-pointer">
                        <Download className="w-4 h-4" /> Download Resource
                     </button>
                  </div>
                ) : (
                  <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-3xl mx-auto space-y-6">
                      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl mb-8">
                         <h4 className="text-amber-700 font-bold flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4" /> Question Bank Metadata
                         </h4>
                         <p className="text-amber-700/80 text-sm">This file contains structured MCQs already integrated into your practice library.</p>
                      </div>
                      <div className="p-12 border-2 border-dashed border-stone-200/60 rounded-[2.5rem] text-center">
                         <p className="text-stone-450 font-bold italic">Source questions are processed and available in the "Browse Subjects" tab.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function StudentQBankPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="qbank" featureName="Question Bank">
        <StudentQBankPage />
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}
