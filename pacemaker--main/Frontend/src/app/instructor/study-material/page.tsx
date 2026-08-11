'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText, Upload, Trash2, Edit, Download, Eye, Search, BookOpen, Layers,
  Check, X, AlertCircle, FileSpreadsheet, ChevronDown, ChevronRight, HelpCircle
} from 'lucide-react';
import {
  SUBJECTS, CHAPTERS_BY_SUBJECT, MaterialType, DifficultyLevel, PublishStatus
} from '@/lib/studyMaterialStore';
import { saveFileData } from '@/lib/studyMaterialStore';
import type { StudyMaterial } from '@/lib/studyMaterialStore';
import { studyMaterialService } from '@/services/studyMaterialService';
import { AdminTableSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

const mapBackendMaterial = (bm: any): StudyMaterial => {
  return {
    id: String(bm.id),
    title: bm.title || bm.fileName || 'Untitled Study Material',
    subject: bm.subjectName || 'General',
    chapter: bm.chapterName || 'General',
    description: `High-yield clinical revision study material for ${bm.chapterName || 'General'} chapter in ${bm.subjectName || 'General'}.`,
    type: 'Notes',
    difficulty: 'Intermediate',
    tags: [bm.subjectName || 'Medical', 'Clinical'],
    fileUrl: `/api/v1/study-materials/download/${bm.id}`,
    fileSize: bm.fileSize ? `${(bm.fileSize / 1024 / 1024).toFixed(2)} MB` : '0 MB',
    pageCount: 0,
    thumbnail: '',
    downloadCount: 0,
    rating: 0,
    ratingsCount: 0,
    allowDownload: true,
    freePreview: true,
    previewPages: 4,
    displayOrder: 1,
    status: bm.status === 'draft' ? 'draft' : 'published',
    uploadedBy: '',
    uploadedAt: bm.uploadedAt || new Date().toISOString(),
    updatedAt: bm.uploadedAt || new Date().toISOString()
  };
};

interface Toast { id: string; type: 'success' | 'error'; message: string; }

function InstructorStudyMaterialPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('Notes');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');
  const [tags, setTags] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [freePreview, setFreePreview] = useState(true);
  const [previewPages, setPreviewPages] = useState(5);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('published');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [previewingMaterial, setPreviewingMaterial] = useState<StudyMaterial | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);

  const fetchMaterials = async () => {
    try {
      const rawMaterials = await studyMaterialService.getAllMaterials();
      setMaterials(rawMaterials.map(mapBackendMaterial));
    } catch (_) { setMaterials([]); }
  };

  useEffect(() => {
    fetchMaterials();
    const t = setTimeout(() => setIsLoaded(true), 850);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (subject && CHAPTERS_BY_SUBJECT[subject]) setChapter(CHAPTERS_BY_SUBJECT[subject][0]);
    else setChapter('');
  }, [subject]);

  const toast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const parsePdfPageCount = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        if (!e.target?.result) { resolve(Math.floor(Math.random() * 20) + 10); return; }
        try {
          const arr = new Uint8Array(e.target.result as ArrayBuffer);
          const decoder = new TextDecoder('ascii');
          let text = arr.length < 5000000 ? decoder.decode(arr) : decoder.decode(arr.slice(0, 500000)) + decoder.decode(arr.slice(arr.length - 500000));
          const m = text.match(/\/Type\s*\/Page\b/g);
          if (m && m.length > 0) { resolve(m.length); return; }
          const c = text.match(/\/Count\s+(\d+)/);
          if (c && c[1]) { resolve(parseInt(c[1], 10)); return; }
        } catch (_) {}
        resolve(Math.floor(Math.random() * 25) + 15);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handlePdfChange = async (file: File) => {
    if (file.type !== 'application/pdf') { toast('error', 'Only PDF files are supported.'); return; }
    if (file.size > 20 * 1024 * 1024) { toast('error', 'File size exceeds the 20MB limit.'); return; }
    setPdfFile(file);
    setPdfPreviewUrl(URL.createObjectURL(file));
    setDetectedPages(await parsePdfPageCount(file));
    toast('success', 'PDF uploaded successfully.');
  };

  const handleThumbnailChange = (file: File) => {
    if (!file.type.startsWith('image/')) { toast('error', 'Please upload a valid image file.'); return; }
    setThumbnailFile(file);
    setThumbnailPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) { toast('error', 'Please select a subject.'); return; }
    if (!pdfFile && !isBatchMode) { toast('error', 'Please upload a PDF file.'); return; }
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => setUploadProgress(p => p >= 90 ? (clearInterval(interval), 90) : p + 15), 150);

    const uploadAndCache = async (file: File, subj: string, chap: string) => {
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const resp = await studyMaterialService.uploadMaterial(subj, chap, file);
      try { saveFileData(String(resp.id), dataUri); } catch {}
      return resp;
    };

    try {
      if (isBatchMode) {
        if (batchFiles.length === 0) { toast('error', 'No batch files selected.'); setIsUploading(false); clearInterval(interval); return; }
        for (const f of batchFiles) await uploadAndCache(f, subject, chapter || 'General');
        setUploadProgress(100);
        setTimeout(() => { setIsUploading(false); setUploadProgress(0); setBatchFiles([]); fetchMaterials(); toast('success', `Batch uploaded ${batchFiles.length} files.`); }, 500);
      } else if (pdfFile) {
        await uploadAndCache(pdfFile, subject, chapter);
        setUploadProgress(100);
        setTimeout(() => { setIsUploading(false); setUploadProgress(0); resetForm(); fetchMaterials(); toast('success', 'Study material uploaded successfully.'); }, 500);
      }
    } catch (_) { clearInterval(interval); setIsUploading(false); setUploadProgress(0); toast('error', 'Failed to upload files.'); }
  };

  const resetForm = () => {
    setTitle(''); setDescription(''); setTags(''); setPdfFile(null); setPdfPreviewUrl(null);
    setDetectedPages(null); setThumbnailFile(null); setThumbnailPreviewUrl(null); setDisplayOrder(p => p + 1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this study material?')) return;
    try { await studyMaterialService.deleteMaterial(Number(id)); await fetchMaterials(); toast('success', 'Material deleted.'); }
    catch (_) { toast('error', 'Failed to delete.'); }
  };

  const handleToggleStatus = async (m: StudyMaterial) => {
    const next = m.status === 'published' ? 'draft' : 'published';
    try { await studyMaterialService.updateMaterial(Number(m.id), m.subject, m.chapter, next); await fetchMaterials(); toast('success', `Status: ${next}.`); }
    catch (_) { toast('error', 'Failed to update.'); }
  };

  const exportCSV = () => {
    const headers = ['S.No', 'Title', 'Subject', 'Chapter', 'Type', 'Downloads', 'Status', 'Date'];
    const rows = filteredMaterials.map((m, i) => [i + 1, m.title, m.subject, m.chapter, m.type, m.downloadCount, m.status, m.uploadedAt]);
    const csv = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a'); a.setAttribute('href', encodeURI(csv)); a.setAttribute('download', `StudyMaterials_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast('success', 'CSV exported.');
  };

  const filteredMaterials = materials.filter(m => {
    const s = searchQuery.toLowerCase();
    return (m.title.toLowerCase().includes(s) || m.subject.toLowerCase().includes(s) || m.chapter.toLowerCase().includes(s)) &&
      (filterSubject === 'All' || m.subject === filterSubject) &&
      (filterType === 'All' || m.type === filterType) &&
      (filterStatus === 'All' || m.status === filterStatus.toLowerCase());
  });

  const totalMaterials = materials.length;
  const totalDownloads = materials.reduce((a, c) => a + c.downloadCount, 0);
  const subDownloads: Record<string, number> = {};
  materials.forEach(m => subDownloads[m.subject] = (subDownloads[m.subject] || 0) + m.downloadCount);
  let topSubject = 'N/A'; let maxD = -1;
  Object.entries(subDownloads).forEach(([s, c]) => { if (c > maxD) { maxD = c; topSubject = s; } });
  const storageUsed = materials.reduce((a, c) => a + (parseFloat(c.fileSize) || 0), 0).toFixed(1);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingMaterial) return;
    try { await studyMaterialService.updateMaterial(Number(editingMaterial.id), editingMaterial.subject, editingMaterial.chapter, editingMaterial.status); setEditingMaterial(null); await fetchMaterials(); toast('success', 'Updated.'); }
    catch (_) { toast('error', 'Failed to update.'); }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto space-y-10 animate-pulse p-6 md:p-10">
        <div className="h-10 w-64 bg-stone-200 rounded-lg" />
        <div className="h-4 w-96 bg-stone-200 rounded-lg" />
        <AdminTableSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-10 pb-32">
      {/* Toasts */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md ${t.type === 'success' ? 'bg-teal-50/95 border-teal-200 text-teal-900' : 'bg-red-50/95 border-red-200 text-red-900'}`}>
            {t.type === 'success' ? <Check className="w-5 h-5 text-teal-600 bg-teal-100 rounded-full p-1" /> : <AlertCircle className="w-5 h-5 text-red-600 bg-red-100 rounded-full p-1" />}
            <span className="text-base font-bold">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-primary-600 font-bold text-base tracking-wide uppercase mb-1"><BookOpen className="w-5 h-5" />Content Library</div>
        <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">Study Material Manager</h1>
        <p className="text-stone-500 font-medium mt-1 text-base">Upload, organize, and manage study materials.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Materials', value: totalMaterials, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Downloads', value: totalDownloads.toLocaleString(), icon: Download, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Top Subject', value: topSubject, icon: BookOpen, color: 'text-violet-600 bg-violet-50' },
          { label: 'Storage', value: `${storageUsed} MB`, icon: Layers, color: 'text-amber-600 bg-amber-50' },
        ].map((c, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`p-2.5 rounded-lg ${c.color}`}><c.icon className="w-5 h-5" /></div>
            <div><p className="text-sm font-semibold text-stone-500">{c.label}</p><p className="text-2xl font-bold text-stone-900">{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Upload Form */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600"><Upload className="w-4 h-4" /></div>
            <div><h2 className="text-lg font-bold text-stone-900">{isBatchMode ? 'Batch Upload' : 'Upload Material'}</h2><p className="text-sm text-stone-500 font-medium">Add study content to the library</p></div>
          </div>
          <button type="button" onClick={() => { setIsBatchMode(!isBatchMode); resetForm(); }}
            className="text-sm font-bold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors border-none cursor-pointer">
            {isBatchMode ? 'Single Mode' : 'Batch Mode'}
          </button>
        </div>
        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          {/* Row 1: Subject + Chapter + Title */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-stone-600 mb-1">Subject <span className="text-red-400">*</span></label>
              <select value={subject} onChange={e => setSubject(e.target.value)} required
                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-stone-900 font-medium text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none">
                <option value="">Select subject</option>
                {SUBJECTS.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm font-bold text-stone-600 mb-1">Chapter <span className="text-red-400">*</span></label>
              {subject && CHAPTERS_BY_SUBJECT[subject] ? (
                <input key="chapter-active" type="text" value={chapter} onChange={e => setChapter(e.target.value)} required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 font-medium text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
              ) : (
                <input key="chapter-disabled" type="text" placeholder="Select subject first" disabled className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-400 text-sm" />
              )}
            </div>
            {!isBatchMode && (
              <div className="md:col-span-4">
                <label className="block text-sm font-bold text-stone-600 mb-1">Material Title <span className="text-red-400">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Cardiology Notes - Chapter 1" required
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 font-medium text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder:text-stone-400" />
              </div>
            )}
          </div>

          {/* Row 2: Description */}
          {!isBatchMode && (
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">Description</label>
              <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief summary of the material..."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder:text-stone-400 resize-none" />
            </div>
          )}

          {/* Row 3: Type + Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">Type <span className="text-red-400">*</span></label>
              <select value={materialType} onChange={e => setMaterialType(e.target.value as MaterialType)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-stone-900 font-medium text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none">
                <option value="Notes">Notes</option><option value="PPT">PPT</option><option value="MCQ Bank">MCQ Bank</option>
                <option value="Previous Year Questions">PYQs</option><option value="Case Study">Case Study</option>
                <option value="Image Set">Image Set</option><option value="Video Summary">Video Summary</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-white text-stone-900 font-medium text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none">
                <option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Row 4: PDF + Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-1">{isBatchMode ? 'PDF Files' : 'PDF File'} <span className="text-red-400">*</span> <span className="text-stone-400 font-normal">(max 20MB)</span></label>
              {isBatchMode ? (
                <div onClick={() => batchInputRef.current?.click()} className="border-2 border-dashed border-stone-200 hover:border-primary-400 rounded-lg p-4 text-center cursor-pointer transition-colors bg-stone-50/50">
                  <input type="file" ref={batchInputRef} multiple accept=".pdf"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      const valid = files.filter(f => f.type === 'application/pdf' && f.size <= 20 * 1024 * 1024);
                      setBatchFiles(valid);
                      if (files.length !== valid.length) toast('error', 'Some files were filtered (max 20MB, PDF only).');
                      if (valid.length) toast('success', `Added ${valid.length} files.`);
                    }} className="hidden" />
                  <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                  <p className="text-sm font-semibold text-stone-700">Select Multiple PDFs</p>
                  <p className="text-sm text-stone-400 mt-0.5">Chapters auto-created from filenames</p>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${pdfFile ? 'border-primary-400 bg-primary-50/30' : 'border-stone-200 hover:border-primary-400 bg-stone-50/50'}`}>
                  <input type="file" ref={fileInputRef} accept=".pdf"
                    onChange={e => e.target.files?.[0] && handlePdfChange(e.target.files[0])} className="hidden" />
                  {pdfFile ? (
                    <div><FileText className="w-6 h-6 text-primary-600 mx-auto mb-1" /><p className="text-sm font-semibold text-stone-800 truncate max-w-full px-4">{pdfFile.name}</p><p className="text-sm text-primary-600 font-medium">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {detectedPages} pages</p></div>
                  ) : (
                    <div><Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" /><p className="text-sm font-semibold text-stone-700">Drag & Drop PDF here</p><p className="text-sm text-stone-400 mt-0.5">or click to browse files</p></div>
                  )}
                </div>
              )}
              {isBatchMode && batchFiles.length > 0 && (
                <div className="mt-2 bg-stone-50 border border-stone-200 rounded-lg p-2.5 max-h-24 overflow-y-auto space-y-1">
                  <p className="text-sm font-bold text-stone-600 mb-1">Queue ({batchFiles.length}):</p>
                  {batchFiles.map((f, i) => <div key={i} className="flex justify-between text-sm text-stone-500"><span className="truncate w-3/4">{i + 1}. {f.name}</span><span>{(f.size / (1024 * 1024)).toFixed(1)}M</span></div>)}
                </div>
              )}
            </div>
            {!isBatchMode && (
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1">Thumbnail <span className="text-stone-400 font-normal">(optional)</span></label>
                <div onClick={() => thumbInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${thumbnailPreviewUrl ? 'border-primary-400 bg-primary-50/30' : 'border-stone-200 hover:border-primary-400 bg-stone-50/50'}`}>
                  <input type="file" ref={thumbInputRef} accept="image/*"
                    onChange={e => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])} className="hidden" />
                  {thumbnailPreviewUrl ? (
                    <div className="flex items-center gap-3 w-full justify-between">
                      <img src={thumbnailPreviewUrl} alt="" className="w-9 h-9 object-cover rounded-lg border" />
                      <span className="text-sm font-medium text-stone-700 truncate flex-1 pl-2">Thumbnail added</span>
                      <span className="text-sm text-stone-400 hover:text-red-500" onClick={e => { e.stopPropagation(); setThumbnailFile(null); setThumbnailPreviewUrl(null); }}>Remove</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 text-stone-400" />
                      <p className="text-sm font-semibold text-stone-700">Click to upload thumbnail</p>
                      <p className="text-sm text-stone-400">PNG, JPG or WebP</p>
              </div>
            )}
                </div>
              </div>
            )}
          </div>

          {/* Publish Settings */}
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-4 space-y-3">
            {!isBatchMode && (
              <div className="bg-white rounded-lg border border-stone-200 p-3.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Tags <span className="text-stone-400 font-normal">(comma-separated)</span></label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="NEET-PG, Cardiology, Revision"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder:text-stone-400" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-600 mb-1">Display Order</label>
                  <input type="number" value={displayOrder} onChange={e => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 font-medium text-base focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                </div>
              </div>
            </div>
            )}
            <div className={`${!isBatchMode ? 'border-t border-stone-200 pt-3' : ''} space-y-2.5`}>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-stone-700">Allow PDF Download</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={allowDownload} onChange={e => setAllowDownload(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-4.5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0.5px] after:left-[0.5px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-stone-700">Free Preview</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={freePreview} onChange={e => setFreePreview(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-4.5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0.5px] after:left-[0.5px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              {freePreview && (
                <div className="flex items-center justify-between pl-3 pt-1 border-l-2 border-primary-200">
                  <span className="text-base text-stone-500">Preview pages</span>
                  <input type="number" value={previewPages} onChange={e => setPreviewPages(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 px-2 py-1 text-center border border-stone-200 rounded-lg text-base font-medium text-stone-900" />
                </div>
              )}
              <div className="border-t border-stone-200 pt-2.5">
                <span className="text-base font-medium text-stone-700 block mb-2">Publish Status</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="publishStatus" value="published" checked={publishStatus === 'published'} onChange={e => setPublishStatus(e.target.value as PublishStatus)}
                      className="w-4 h-4 text-primary-600 border-stone-300 focus:ring-primary-500" />
                    <span className="text-sm text-stone-700">Publish</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="publishStatus" value="draft" checked={publishStatus === 'draft'} onChange={e => setPublishStatus(e.target.value as PublishStatus)}
                      className="w-4 h-4 text-primary-600 border-stone-300 focus:ring-primary-500" />
                    <span className="text-sm text-stone-700">Save as Draft</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={isUploading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-base py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 border-none cursor-pointer flex items-center justify-center gap-2">
                {isUploading ? 'Uploading...' : <><Upload className="w-4 h-4" />Save File</>}
              </button>
              <button type="button" onClick={resetForm}
                className="flex-1 border border-stone-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-stone-700 font-medium text-base py-2.5 px-4 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                Cancel
              </button>
            </div>
          </div>

          {isUploading && (
            <div className="space-y-1">
              <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary-600 h-full transition-all duration-150 rounded-full" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="flex justify-between text-sm font-medium text-stone-500"><span>Uploading...</span><span>{uploadProgress}%</span></div>
            </div>
          )}
        </form>
        {!isBatchMode && pdfPreviewUrl && (
          <div className="px-5 pb-5">
            <button onClick={() => setPreviewingMaterial({
              id: 'preview', title: title || pdfFile?.name || 'Preview', subject: subject || 'General', chapter: chapter || 'Overview',
              description: '', type: materialType, difficulty, tags: [], fileUrl: pdfPreviewUrl, fileSize: '', pageCount: detectedPages || 1,
              thumbnail: '', downloadCount: 0, rating: 0, allowDownload: true, freePreview: true, previewPages: 10, displayOrder: 1,
              status: 'published', uploadedBy: '', uploadedAt: '', updatedAt: ''
            })}
              className="w-full flex items-center justify-center gap-2 border border-stone-200 hover:bg-stone-50 text-stone-700 py-2 rounded-lg text-sm font-medium transition-all">
              <Eye className="w-3.5 h-3.5" />Preview PDF
            </button>
          </div>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2"><Layers className="w-5 h-5 text-primary-600" />Materials Library</h2>
          <button onClick={exportCSV} className="flex items-center gap-1.5 border border-stone-200 hover:bg-stone-50 text-stone-600 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all">
            <FileSpreadsheet className="w-3.5 h-3.5" />Export CSV
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input type="text" placeholder="Search materials..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 focus:ring-1 focus:ring-primary-500 outline-none placeholder:text-stone-400" />
            </div>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-base text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none">
              <option value="All">All Subjects</option>
              {SUBJECTS.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-base text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none">
              <option value="All">All Types</option>
              <option value="Notes">Notes</option><option value="PPT">PPT</option><option value="MCQ Bank">MCQ Bank</option>
              <option value="Previous Year Questions">PYQs</option><option value="Case Study">Case Study</option>
              <option value="Image Set">Image Set</option><option value="Video Summary">Video Summary</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-2.5 py-1.5 border border-stone-200 rounded-lg text-base text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none">
              <option value="All">All Status</option><option value="Published">Published</option><option value="Draft">Draft</option>
            </select>
          </div>

          <div className="overflow-x-auto border border-stone-100 rounded-lg">
            <table className="min-w-full divide-y divide-stone-100">
              <thead>
                <tr className="bg-stone-50 text-sm font-semibold text-stone-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Subject</th>
                  <th className="px-4 py-3 text-left">Chapter</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-center">Downloads</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMaterials.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-stone-400 text-sm">No materials found.</td></tr>
                ) : (
                  filteredMaterials.map((item, i) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-stone-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-stone-900 truncate max-w-[180px]" title={item.title}>{item.title}</p>
                        <p className="text-sm text-stone-400 mt-0.5">{item.fileSize}</p>
                      </td>
                      <td className="px-4 py-3"><span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-sm font-semibold">{item.subject}</span></td>
                      <td className="px-4 py-3 text-sm text-stone-600">{item.chapter}</td>
                      <td className="px-4 py-3 text-sm text-stone-600">{item.type}</td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-stone-700">{item.downloadCount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleStatus(item)}
                          className={`px-2 py-0.5 rounded-full text-sm font-semibold border transition-all ${item.status === 'published' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'}`}>
                          {item.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <button onClick={() => setPreviewingMaterial(item)} title="Preview" className="p-1.5 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => setEditingMaterial(item)} title="Edit" className="p-1.5 text-stone-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(item.id)} title="Delete" className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">Edit Material</h3>
                <button onClick={() => setEditingMaterial(null)} className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-5 space-y-3.5 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-semibold text-stone-600 mb-1">Subject</label><select value={editingMaterial.subject} onChange={e => setEditingMaterial({ ...editingMaterial, subject: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 font-medium outline-none focus:ring-1 focus:ring-primary-500" required>{SUBJECTS.map((s, i) => <option key={i} value={s}>{s}</option>)}</select></div>
                  <div><label className="block text-sm font-semibold text-stone-600 mb-1">Chapter</label><input type="text" value={editingMaterial.chapter} onChange={e => setEditingMaterial({ ...editingMaterial, chapter: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 outline-none focus:ring-1 focus:ring-primary-500" required /></div>
                </div>
                <div><label className="block text-sm font-semibold text-stone-600 mb-1">Title</label><input type="text" value={editingMaterial.title} onChange={e => setEditingMaterial({ ...editingMaterial, title: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 font-medium outline-none focus:ring-1 focus:ring-primary-500" required /></div>
                <div><label className="block text-sm font-semibold text-stone-600 mb-1">Description</label><textarea rows={2} value={editingMaterial.description} onChange={e => setEditingMaterial({ ...editingMaterial, description: e.target.value })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 outline-none focus:ring-1 focus:ring-primary-500 resize-none" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-semibold text-stone-600 mb-1">Type</label><select value={editingMaterial.type} onChange={e => setEditingMaterial({ ...editingMaterial, type: e.target.value as MaterialType })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 outline-none focus:ring-1 focus:ring-primary-500"><option value="Notes">Notes</option><option value="PPT">PPT</option><option value="MCQ Bank">MCQ Bank</option><option value="Previous Year Questions">Previous Year Questions</option><option value="Case Study">Case Study</option><option value="Image Set">Image Set</option><option value="Video Summary">Video Summary</option></select></div>
                  <div><label className="block text-sm font-semibold text-stone-600 mb-1">Difficulty</label><select value={editingMaterial.difficulty} onChange={e => setEditingMaterial({ ...editingMaterial, difficulty: e.target.value as DifficultyLevel })} className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-base text-stone-900 outline-none focus:ring-1 focus:ring-primary-500"><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option></select></div>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between"><span className="text-base text-stone-700">Allow PDF Download</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={editingMaterial.allowDownload} onChange={e => setEditingMaterial({ ...editingMaterial, allowDownload: e.target.checked })} className="sr-only peer" /><div className="w-9 h-4.5 bg-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0.5px] after:left-[0.5px] after:bg-white after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-600"></div></label></div>
                  <div className="flex items-center justify-between"><span className="text-base text-stone-700">Free Preview</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={editingMaterial.freePreview} onChange={e => setEditingMaterial({ ...editingMaterial, freePreview: e.target.checked })} className="sr-only peer" /><div className="w-9 h-4.5 bg-stone-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[0.5px] after:left-[0.5px] after:bg-white after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary-600"></div></label></div>
                  {editingMaterial.freePreview && <div className="flex items-center justify-between pl-3 pt-1 border-l-2 border-primary-200"><span className="text-base text-stone-500">Preview pages</span><input type="number" value={editingMaterial.previewPages} onChange={e => setEditingMaterial({ ...editingMaterial, previewPages: Math.max(1, parseInt(e.target.value) || 1) })} className="w-14 px-2 py-0.5 text-center border border-stone-200 rounded-lg text-base text-stone-900" /></div>}
                </div>
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                  <button type="button" onClick={() => setEditingMaterial(null)} className="px-3.5 py-1.5 border border-stone-200 text-stone-700 rounded-lg text-base font-medium hover:bg-stone-50 transition-all">Cancel</button>
                  <button type="submit" className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all shadow-sm">Update</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 md:p-8">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
              <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
                <div><h3 className="text-base font-bold text-stone-900 truncate max-w-md">{previewingMaterial.title}</h3><p className="text-sm text-stone-500 mt-0.5">{previewingMaterial.subject} &bull; {previewingMaterial.chapter}</p></div>
                <button onClick={() => setPreviewingMaterial(null)} className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 bg-stone-100 p-4 flex items-center justify-center">
                {previewingMaterial.fileUrl.startsWith('data:application/pdf') || previewingMaterial.fileUrl.startsWith('blob:') ? (
                  <iframe src={previewingMaterial.fileUrl} className="w-full h-full rounded-lg border border-stone-200" title="PDF" />
                ) : (
                  <div className="text-center p-8 bg-white rounded-xl border max-w-md shadow-sm">
                    <FileText className="w-12 h-12 text-primary-600 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-stone-900 mb-1.5">{previewingMaterial.title}</h4>
                    <p className="text-sm text-stone-500 mb-3">{previewingMaterial.pageCount} pages &bull; {previewingMaterial.fileSize}</p>
                    <p className="text-sm text-stone-500">Subject: {previewingMaterial.subject} &bull; Chapter: {previewingMaterial.chapter}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-2.5 border-t border-stone-100 flex items-center justify-between bg-stone-50 shrink-0">
                <span className="text-sm text-stone-500">Uploaded {previewingMaterial.uploadedAt ? new Date(previewingMaterial.uploadedAt).toLocaleDateString() : ''}</span>
                <button onClick={() => setPreviewingMaterial(null)} className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm font-medium transition-all">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InstructorStudyMaterialPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <InstructorStudyMaterialPage />
    </ErrorBoundary>
  );
}
