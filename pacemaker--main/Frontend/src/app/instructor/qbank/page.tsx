'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Database, Plus, Edit3, Trash2, X, CheckCircle2, HelpCircle,
  Loader2, ChevronDown, BookOpen, Save, Search, AlertCircle,
  FileUp, Eye, FileText, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminTableSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import { qbankService } from '@/services/qbankService';
import type { QuestionRequest } from '@/services/qbankService';

type Question = {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  options: { a: string; b: string; c: string; d: string };
  correctOption: 'a' | 'b' | 'c' | 'd';
  explanation: string;
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

const mapBackendQuestion = (bq: any): Question => {
  const opts = {
    a: bq.options?.[0] || 'Option A',
    b: bq.options?.[1] || 'Option B',
    c: bq.options?.[2] || 'Option C',
    d: bq.options?.[3] || 'Option D',
  };
  const correctMapping: Record<number, 'a' | 'b' | 'c' | 'd'> = { 0: 'a', 1: 'b', 2: 'c', 3: 'd' };
  return {
    id: String(bq.id),
    subject: bq.subject || 'General',
    topic: bq.topic || 'General',
    difficulty: bq.difficulty === 'Hard' ? 'Hard' : bq.difficulty === 'Medium' ? 'Medium' : 'Easy',
    questionText: bq.questionText,
    options: opts,
    correctOption: correctMapping[bq.correctOption] || 'a',
    explanation: bq.explanation || '',
  };
};

const mapToRequest = (q: Omit<Question, 'id'>): QuestionRequest => ({
  subject: q.subject,
  topic: q.topic,
  difficulty: q.difficulty,
  questionText: q.questionText,
  options: q.options,
  correctOption: q.correctOption,
  explanation: q.explanation,
});

const SUBJECTS = [
  'Anatomy', 'Physiology', 'Biochemistry', 'Pathology',
  'Pharmacology', 'Microbiology', 'Forensic Medicine',
  'Medicine', 'Surgery', 'OBG', 'Pediatrics',
];

function InstructorQBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    subject: 'Anatomy',
    topic: '',
    difficulty: 'Medium',
    questionText: '',
    options: { a: '', b: '', c: '', d: '' },
    correctOption: 'a',
    explanation: '',
  });

  const loadQuestions = async () => {
    try {
      const res = await qbankService.getQuestions(undefined, undefined, undefined, 0, 100);
      if (res?.content) {
        setQuestions(res.content.map(mapBackendQuestion));
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadQuestions();
    const savedFiles = localStorage.getItem('lms_qbank_files_v1');
    if (savedFiles) {
      try { setUploadedFiles(JSON.parse(savedFiles)); } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const metadataOnly = uploadedFiles.map(({ file, ...rest }) => rest);
      localStorage.setItem('lms_qbank_files_v1', JSON.stringify(metadataOnly));
    }
  }, [uploadedFiles, isLoaded]);

  const resetForm = () => {
    setFormData({
      subject: 'Anatomy', topic: '', difficulty: 'Medium', questionText: '',
      options: { a: '', b: '', c: '', d: '' }, correctOption: 'a', explanation: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) return;
    setIsSaving(true);
    try {
      if (editingId) {
        const res = await qbankService.updateQuestion(Number(editingId), mapToRequest(formData));
        setQuestions(prev => prev.map(q => q.id === editingId ? mapBackendQuestion(res) : q));
      } else {
        const res = await qbankService.createQuestion(mapToRequest(formData));
        setQuestions(prev => [mapBackendQuestion(res), ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error('Failed to save question:', err);
      alert('Failed to save question. Make sure you are authenticated.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (q: Question) => {
    setFormData({
      subject: q.subject, topic: q.topic, difficulty: q.difficulty,
      questionText: q.questionText, options: { ...q.options },
      correctOption: q.correctOption, explanation: q.explanation,
    });
    setEditingId(q.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question permanently?')) return;
    try {
      await qbankService.deleteQuestion(Number(id));
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      console.error('Failed to delete question:', err);
      alert('Failed to delete question.');
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
    setIsBulkMenuOpen(false);
  };

  const processFiles = (fileList: File[]) => {
    const newUploads: UploadedFile[] = fileList.map(file => {
      const path = (file as any).webkitRelativePath || '';
      const folderName = path ? path.split('/')[0] : undefined;
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.endsWith('.json') ? 'json' : 'pdf',
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        status: file.name.endsWith('.json') ? 'Ready' : 'Extracting MCQs',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file,
        folder: folderName,
      };
    });
    setUploadedFiles(prev => [...newUploads, ...prev]);

    const jsonFiles = fileList.filter(f => f.name.endsWith('.json'));
    jsonFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content);
          if (Array.isArray(data)) {
            for (const q of data) {
              try {
                const res = await qbankService.createQuestion({
                  subject: q.subject || 'General',
                  topic: q.topic || 'General',
                  difficulty: q.difficulty || 'Medium',
                  questionText: q.questionText,
                  options: q.options || { a: '', b: '', c: '', d: '' },
                  correctOption: q.correctOption || 'a',
                  explanation: q.explanation || '',
                });
                setQuestions(prev => [mapBackendQuestion(res), ...prev]);
              } catch (err) {
                console.error('Failed to bulk-create question:', err);
              }
            }
          }
        } catch (err) {
          console.error('Invalid JSON format:', file.name);
        }
      };
      reader.readAsText(file);
    });
  };

  const filtered = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const groupedQuestions = filtered.reduce((acc, q) => {
    if (!acc[q.subject]) acc[q.subject] = [];
    acc[q.subject].push(q);
    return acc;
  }, {} as Record<string, typeof filtered>);

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  const allExpanded = SUBJECTS.every(s => expandedSubjects.has(s));

  const toggleAll = () => {
    if (allExpanded) setExpandedSubjects(new Set());
    else setExpandedSubjects(new Set(SUBJECTS));
  };

  useEffect(() => {
    setExpandedSubjects(prev => {
      if (prev.size === 0) return new Set(SUBJECTS);
      return prev;
    });
  }, []);

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto py-12">
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-sm font-semibold mb-4 border border-[#0D9488]/20">
            <Database className="w-4 h-4" /> Instructor Content Studio
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 mt-2">Create, edit, and manage clinical MCQs for your students.</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleBulkUpload} accept=".json,.pdf" multiple className="hidden" />
          <input type="file" ref={folderInputRef} onChange={handleBulkUpload} className="hidden" {...{ webkitdirectory: '', directory: '' } as any} />
          <div className="relative">
            <button
              onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
              className="bg-white border border-gray-200 text-gray-700 hover:border-[#0D9488] hover:text-[#0D9488] px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <FileUp className="w-4 h-4" />
              Bulk Upload
            </button>
            <AnimatePresence>
              {isBulkMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBulkMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 overflow-hidden"
                  >
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#0D9488]/5 hover:text-[#0D9488] rounded-xl transition-colors">
                      <Database className="w-4 h-4" /> Upload Files (JSON/PDF)
                    </button>
                    <button onClick={() => folderInputRef.current?.click()} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-[#0D9488]/5 hover:text-[#0D9488] rounded-xl transition-colors">
                      <BookOpen className="w-4 h-4" /> Upload Folder
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-md text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form + List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-panel p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden bg-white"
              >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#0D9488]/10 rounded-full blur-3xl z-0" />

                <div className="relative z-10">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-[#0D9488]" />
                    {editingId ? 'Edit Question' : 'Create New Question'}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject, Topic, Difficulty */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-all flex items-center justify-between text-gray-900 font-medium outline-none"
                          >
                            <span>{formData.subject}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isSubjectOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute z-[110] left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-150 overflow-hidden max-h-60 overflow-y-auto"
                              >
                                {SUBJECTS.map(s => (
                                  <button
                                    key={s} type="button"
                                    onClick={() => { setFormData({ ...formData, subject: s }); setIsSubjectOpen(false); }}
                                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-[#0D9488]/5 ${formData.subject === s ? 'bg-[#0D9488]/10 text-[#0D9488] font-bold' : 'text-gray-700'}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                        <input
                          type="text" required
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-900 font-medium outline-none"
                          placeholder="e.g. Brachial Plexus"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                        <div className="flex bg-gray-100 rounded-xl p-1">
                          {['Easy', 'Medium', 'Hard'].map(d => (
                            <button
                              key={d} type="button"
                              onClick={() => setFormData({ ...formData, difficulty: d as any })}
                              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.difficulty === d ? 'bg-white text-[#0D9488] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                      <textarea
                        required rows={3}
                        value={formData.questionText}
                        onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-900 resize-none outline-none"
                        placeholder="A 45-year-old male presents with..."
                      />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(['a', 'b', 'c', 'd'] as const).map(opt => (
                        <div key={opt} className="relative">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 px-1">
                            Option {opt.toUpperCase()}
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              required type="text"
                              value={formData.options[opt]}
                              onChange={(e) => setFormData({ ...formData, options: { ...formData.options, [opt]: e.target.value } })}
                              className={`flex-1 px-4 py-3 rounded-xl border bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-900 font-medium outline-none ${
                                formData.correctOption === opt ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-300'
                              }`}
                              placeholder={`Option ${opt.toUpperCase()}`}
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, correctOption: opt })}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                                formData.correctOption === opt
                                  ? 'bg-green-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                              }`}
                              title="Mark as correct"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Explanation</label>
                      <textarea
                        required rows={3}
                        value={formData.explanation}
                        onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] transition-shadow text-gray-700 resize-none outline-none"
                        placeholder="Explain why the correct option is right..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200 flex justify-end gap-4">
                      <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                      >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isSaving ? 'Saving...' : editingId ? 'Update Question' : 'Publish to Bank'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by content, topic, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] outline-none font-medium transition-shadow"
            />
          </div>

          {/* Question List - Grouped by Subject */}
          <div className="space-y-3">
            {Object.keys(groupedQuestions).length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-lg font-bold text-gray-900">No questions found</p>
                <p className="text-sm text-gray-500 mt-1">Add your first question to the bank.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {filtered.length} question{filtered.length !== 1 ? 's' : ''} found
                  </p>
                  <button onClick={toggleAll} className="text-xs font-bold text-[#0D9488] hover:text-[#0D9488]/80 transition-colors bg-transparent border-none cursor-pointer">
                    {allExpanded ? 'Collapse All' : 'Expand All'}
                  </button>
                </div>
                {[...SUBJECTS].map(subject => {
                  const subjectQuestions = groupedQuestions[subject] || [];
                  const isExpanded = expandedSubjects.has(subject);
                  return (
                    <div key={subject} className={`bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden ${subjectQuestions.length === 0 ? 'opacity-50' : ''}`}>
                      <button
                        onClick={() => toggleSubject(subject)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedSubjects.has(subject) ? '' : '-rotate-90'}`} />
                          <span className="text-sm font-bold text-gray-900">{subject}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] text-[10px] font-black">{subjectQuestions.length}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {subjectQuestions.filter(q => q.difficulty === 'Hard').length} hard,{' '}
                          {subjectQuestions.filter(q => q.difficulty === 'Medium').length} med,{' '}
                          {subjectQuestions.filter(q => q.difficulty === 'Easy').length} easy
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedSubjects.has(subject) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="divide-y divide-gray-50">
                              {subjectQuestions.map(q => (
                                <div key={q.id} className="p-5 hover:bg-gray-50/50 transition-colors group">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                          q.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                                          q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                          {q.difficulty}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400">{q.topic}</span>
                                      </div>
                                      <p className="text-base font-bold text-gray-900 leading-relaxed">{q.questionText}</p>
                                      <div className="grid grid-cols-2 gap-2 mt-3">
                                        {Object.entries(q.options).map(([key, val]) => (
                                          <div key={key} className={`px-3 py-2 rounded-xl border text-xs font-medium ${
                                            q.correctOption === key
                                              ? 'bg-green-50 border-green-200 text-green-700'
                                              : 'bg-gray-50 border-gray-100 text-gray-600'
                                          }`}>
                                            <span className="font-black uppercase mr-1">{key}:</span> {val}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleEdit(q)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleDelete(q.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Right Column - Stats + Document Library */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 shadow-sm bg-white">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#0D9488]" /> Question Bank
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-3xl font-black text-gray-900">{questions.length}</p>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total Questions</p>
              </div>
              <div className="space-y-2">
                {(['Easy', 'Medium', 'Hard'] as const).map(d => {
                  const count = questions.filter(q => q.difficulty === d).length;
                  return (
                    <div key={d} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        d === 'Easy' ? 'text-green-600' : d === 'Medium' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {d}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Filter by Subject</p>
                <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {['All', ...SUBJECTS].map(s => (
                    <button
                      key={s}
                      onClick={() => setSubjectFilter(s)}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        subjectFilter === s ? 'bg-[#0D9488]/10 text-[#0D9488]' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {s}
                      {s !== 'All' && (
                        <span className="ml-2 text-[10px] text-gray-400">({questions.filter(q => q.subject === s).length})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Document Library */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 shadow-sm bg-white">
            <h4 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0D9488]" /> Document Library
            </h4>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {uploadedFiles.length > 0 ? Object.entries(
                uploadedFiles.reduce((acc, file) => {
                  const key = file.folder || 'Direct Uploads';
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(file);
                  return acc;
                }, {} as Record<string, UploadedFile[]>)
              ).map(([folderName, files]) => (
                <div key={folderName}>
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{folderName}</span>
                  </div>
                  <div className="space-y-2 pl-2 border-l border-gray-100 ml-1">
                    {files.map(file => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedDoc(file)}
                        className="p-3 rounded-xl border border-gray-50 hover:border-[#0D9488]/20 bg-gray-50/30 hover:bg-white transition-all group cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl ${file.type === 'json' ? 'bg-amber-50 text-amber-600' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                            {file.type === 'json' ? <Database className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 truncate pr-4">{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-400 font-medium">{file.size}</span>
                              <span className="text-[10px] text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400 font-medium">{file.timestamp}</span>
                            </div>
                            <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                              file.status === 'Ready' ? 'bg-green-50 text-green-600' : 'bg-[#0D9488]/10 text-[#0D9488] animate-pulse'
                            }`}>
                              {file.status}
                            </span>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#0D9488] transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="py-6 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No documents yet</p>
                  <p className="text-xs text-gray-300 mt-1">Upload JSON/PDF via Bulk Upload</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstructorQBankPageWrapper() {
  return (
    <ErrorBoundary>
      <InstructorQBankPage />
    </ErrorBoundary>
  );
}
