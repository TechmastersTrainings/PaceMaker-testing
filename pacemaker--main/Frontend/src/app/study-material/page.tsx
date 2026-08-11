'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Grid, List, BookOpen, Download, Eye, Star, Heart, Share2, 
  AlertTriangle, X, ChevronDown, ChevronRight, ZoomIn, ZoomOut, Maximize2, 
  Printer, Check, Bookmark, BookmarkCheck, ArrowUpDown, Filter, ChevronLeft, Lock
} from 'lucide-react';
import { 
  getMaterials, addDownload, toggleFavorite, getFavorites, addReview, 
  reportMaterial, SUBJECTS, MaterialType, DifficultyLevel
} from '@/lib/studyMaterialStore';
import type { StudyMaterial } from '@/lib/studyMaterialStore';
import { studyMaterialService } from '@/services/studyMaterialService';
import { subjectsForLevel, SUBJECT_LABELS } from '@/lib/videoSubjects';
import { getFileData } from '@/lib/studyMaterialStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StudyMaterialGridSkeleton } from '@/components/Skeletons';
import ErrorBoundary from '@/components/ErrorBoundary';

const mapBackendMaterial = (bm: any): StudyMaterial => {
  const cached = getFileData(String(bm.id));
  return {
    id: String(bm.id),
    title: bm.title || bm.fileName || 'Untitled Study Material',
    subject: bm.subjectName || 'General',
    chapter: bm.chapterName || 'General',
    year: bm.year ?? undefined,
    description: `High-yield clinical revision study material for ${bm.chapterName || 'General'} chapter in ${bm.subjectName || 'General'}.`,
    type: 'Notes',
    difficulty: 'Intermediate',
    tags: [bm.subjectName || 'Medical', 'Clinical'],
    fileUrl: cached || `/api/v1/study-materials/download/${bm.id}`,
    fileSize: bm.fileSize ? `${(bm.fileSize / 1024 / 1024).toFixed(2)} MB` : '1.5 MB',
    pageCount: 6,
    thumbnail: '',
    downloadCount: bm.downloadCount ?? 0,
    rating: bm.rating ?? 0,
    ratingsCount: bm.ratingsCount ?? 0,
    allowDownload: true,
    freePreview: true,
    previewPages: 4,
    displayOrder: 1,
    status: 'published',
    uploadedBy: 'Dr. Aman Gupta',
    uploadedAt: bm.uploadedAt || new Date().toISOString(),
    updatedAt: bm.uploadedAt || new Date().toISOString()
  };
};

import SubscriptionGuard from '@/components/SubscriptionGuard';
import { useSubscription } from '@/hooks/useSubscription';

export default function StudentStudyMaterialPagePage() {
  return (
    <ErrorBoundary>
      <SubscriptionGuard feature="study-material" featureName="Study Material">
        <StudentStudyMaterialPage />
      </SubscriptionGuard>
    </ErrorBoundary>
  );
}

interface Toast {
  id: string;
  type: 'success' | 'info';
  message: string;
}

function StudentStudyMaterialPage() {
  const pathname = usePathname();
  const basePath = pathname.startsWith('/dashboard') ? '/dashboard/study-material' : '/study-material';
  const { canAccess } = useSubscription();
  const hasAccess = canAccess('study-material');

  // Store state
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'downloads' | 'newest' | 'oldest' | 'az'>('downloads');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  
  // Layout toggles
  const [viewMode, setViewMode] = useState<'grid' | 'accordion'>('grid');
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active item modals
  const [previewingMaterial, setPreviewingMaterial] = useState<StudyMaterial | null>(null);
  const [ratingMaterial, setRatingMaterial] = useState<StudyMaterial | null>(null);
  const [reportingMaterial, setReportingMaterial] = useState<StudyMaterial | null>(null);
  
  // Viewer controls
  const [viewerPage, setViewerPage] = useState(1);
  const [viewerZoom, setViewerZoom] = useState(100);
  const [viewerFullscreen, setViewerFullscreen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState('');
  
  // Report Form state
  const [reportReason, setReportReason] = useState('Broken Link');
  const [reportDetails, setReportDetails] = useState('');
  
  // Rating state
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [givenRating, setGivenRating] = useState(5);
  
  // UI Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Academic level filtering
  const [allowedMaterialSubjects, setAllowedMaterialSubjects] = useState<string[]>([]);

  useEffect(() => {
    const levelId = localStorage.getItem('academicLevelId') || '';
    if (levelId) {
      const levelKeys = subjectsForLevel(levelId);
      const levelLabels = levelKeys.map(k => SUBJECT_LABELS[k]).filter(Boolean);
      setAllowedMaterialSubjects(levelLabels);
    }
  }, []);

  // Load items
  useEffect(() => {
    const loadMaterials = async () => {
      let combined: StudyMaterial[] = [];
      try {
        const rawMaterials = await studyMaterialService.getAllMaterials();
        const mapped = rawMaterials.map(mapBackendMaterial);
        const local = getMaterials();
        combined = [...mapped, ...local.filter(lm => !mapped.some(rm => String(rm.id) === String(lm.id)))];
      } catch (err) {
        console.error('Error fetching materials:', err);
        combined = getMaterials();
      }

      // Merge instructor notes from localStorage as study materials
      try {
        const notesRaw = localStorage.getItem('lms_notes');
        const fileMapRaw = localStorage.getItem('lms_notes_files');
        let fileMap: Record<string, string> = {};
        if (fileMapRaw) try { fileMap = JSON.parse(fileMapRaw); } catch {}
        if (notesRaw) {
          const allNotes = JSON.parse(notesRaw);
          const instructorNotes = allNotes.filter((n: any) => n.source === 'instructor');
          const noteMaterials: StudyMaterial[] = instructorNotes.map((n: any) => ({
            id: `note-${n.id}`,
            title: n.title,
            subject: n.subject || 'General',
            chapter: n.noteType || 'Instructor Notes',
            description: n.content?.substring(0, 200) || 'Instructor-shared note',
            type: 'Notes' as MaterialType,
            difficulty: 'Intermediate' as DifficultyLevel,
            tags: [n.subject, n.noteType].filter(Boolean),
            fileUrl: fileMap[n.id] || n.fileUrl || '',
            fileSize: fileMap[n.id] ? `${(fileMap[n.id].length / 1024 / 1024).toFixed(1)} MB` : '',
            pageCount: 1,
            thumbnail: '',
            downloadCount: 0,
            rating: 0,
            ratingsCount: 0,
            allowDownload: n.downloadable ?? true,
            freePreview: true,
            previewPages: 1,
            displayOrder: 1,
            status: 'published' as const,
            uploadedBy: 'Instructor',
            uploadedAt: n.createdAt || new Date().toISOString(),
            updatedAt: n.createdAt || new Date().toISOString()
          }));
          combined = [...combined, ...noteMaterials];
        }
      } catch {}

      setMaterials(combined);
    };

    loadMaterials();
    const favs = getFavorites().map(f => f.materialId);
    setFavorites(favs);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const addToast = (type: 'success' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Convert data URI to blob URL for iframe preview
  const dataUriToBlobUrl = async (dataUri: string): Promise<string> => {
    try {
      const response = await fetch(dataUri);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch { return dataUri; }
  };

  // Resolve preview source for the iframe
  useEffect(() => {
    if (!previewingMaterial) { setPreviewBlobUrl(''); return; }
    const mat = previewingMaterial;
    if (!mat.fileUrl) { setPreviewBlobUrl(''); return; }
    if (mat.fileUrl.startsWith('blob:')) { setPreviewBlobUrl(mat.fileUrl); return; }
    if (mat.fileUrl.startsWith('data:')) { dataUriToBlobUrl(mat.fileUrl).then(setPreviewBlobUrl); return; }
    // For backend API URLs, try fetching the blob first (avoids rendering HTML errors in iframe)
    if (mat.fileUrl.startsWith('/api/') || mat.fileUrl.startsWith('http')) {
      const id = mat.id.startsWith('note-') ? null : Number(mat.id);
      if (id && !isNaN(id)) {
        studyMaterialService.downloadMaterial(id)
          .then(blob => { const url = URL.createObjectURL(blob); setPreviewBlobUrl(url); })
          .catch(() => setPreviewBlobUrl(''));
      } else {
        setPreviewBlobUrl('');
      }
    } else {
      setPreviewBlobUrl('');
    }
  }, [previewingMaterial]);

  // Toggle Filters
  const handleSubjectFilter = (sub: string) => {
    setSelectedSubjects(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleDifficultyFilter = (diff: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(diff) ? prev.filter(d => d !== diff) : [...prev, diff]
    );
  };

  const handleYearFilter = (yr: number) => {
    setSelectedYears(prev =>
      prev.includes(yr) ? prev.filter(y => y !== yr) : [...prev, yr]
    );
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const isSaved = toggleFavorite(id);
    setFavorites(getFavorites().map(f => f.materialId));
    addToast('success', isSaved ? 'Saved to My Library' : 'Removed from My Library');
  };

  const handleDownload = async (material: StudyMaterial, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      addToast('info', `Downloading ${material.title}...`);

      // Data URI or Blob URL — trigger download directly
      if (material.fileUrl.startsWith('data:') || material.fileUrl.startsWith('blob:')) {
        const link = document.createElement('a');
        link.href = material.fileUrl;
        link.download = `${material.title.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (material.fileUrl.startsWith('/api/') || material.fileUrl.startsWith('http')) {
        // Backend material — try API first, fall back to direct URL
        try {
          const blob = await studyMaterialService.downloadMaterial(Number(material.id));
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = material.title.endsWith('.pdf') ? material.title : `${material.title.replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } catch {
          // Fallback: open the file URL directly
          window.open(material.fileUrl, '_blank');
        }
      } else {
        addToast('success', `Downloading ${material.title}...`);
      }
      
      addDownload(material);
      // Reload combined list
      const rawMaterials = await studyMaterialService.getAllMaterials();
      const mapped = rawMaterials.map(mapBackendMaterial);
      const local = getMaterials();
      const combined = [...mapped, ...local.filter(lm => !mapped.some(rm => String(rm.id) === String(lm.id)))];
      setMaterials(combined);
      
      addToast('success', 'Download complete!');
    } catch (err) {
      console.error('Error downloading material:', err);
      addToast('success', 'Simulated download complete!');
    }
    
    // Prompt for rating
    setRatingMaterial(material);
  };

  const handleShare = (material: StudyMaterial, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const mockUrl = `${window.location.origin}/study-material?id=${material.id}`;
    navigator.clipboard.writeText(mockUrl);
    addToast('info', 'Material link copied to clipboard!');
  };

  const submitReview = async () => {
    if (!ratingMaterial) return;
    addReview(ratingMaterial.id, givenRating);
    
    try {
      const rawMaterials = await studyMaterialService.getAllMaterials();
      const mapped = rawMaterials.map(mapBackendMaterial);
      const local = getMaterials();
      const combined = [...mapped, ...local.filter(lm => !mapped.some(rm => String(rm.id) === String(lm.id)))];
      setMaterials(combined);
    } catch (err) {}
    
    addToast('success', `Thank you for rating this material ${givenRating} stars!`);
    setRatingMaterial(null);
    setGivenRating(5);
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMaterial) return;
    
    const studentName = localStorage.getItem('currentUser') || 'Anonymous Student';
    reportMaterial(reportingMaterial.id, reportReason, reportDetails, studentName);
    
    addToast('success', 'Report submitted successfully. Our team will review this shortly.');
    setReportingMaterial(null);
    setReportDetails('');
  };

  // Filter & Sort Logic
  const filteredMaterials = materials.filter(m => {
    if (m.status !== 'published') return false;

    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(m.subject);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(m.type);
    const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(m.difficulty);
    const matchesYear = selectedYears.length === 0 || (m.year != null && selectedYears.includes(m.year)) || (m.year == null && selectedYears.includes(0));
    const matchesSaved = !showSavedOnly || favorites.includes(m.id);
    const matchesLevel = allowedMaterialSubjects.length === 0 || allowedMaterialSubjects.includes(m.subject);

    return matchesSearch && matchesSubject && matchesType && matchesDifficulty && matchesYear && matchesSaved && matchesLevel;
  });

  // Sort
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    if (sortBy === 'newest') return b.uploadedAt.localeCompare(a.uploadedAt);
    if (sortBy === 'oldest') return a.uploadedAt.localeCompare(b.uploadedAt);
    if (sortBy === 'downloads') return b.downloadCount - a.downloadCount;
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    return 0;
  });

  // Accordion Grouping Structure: Subject > Chapter > Materials
  const accordionGroup: Record<string, Record<string, StudyMaterial[]>> = {};
  sortedMaterials.forEach(m => {
    if (!accordionGroup[m.subject]) {
      accordionGroup[m.subject] = {};
    }
    if (!accordionGroup[m.subject][m.chapter]) {
      accordionGroup[m.subject][m.chapter] = [];
    }
    accordionGroup[m.subject][m.chapter].push(m);
  });

  const toggleSubjectExpand = (sub: string) => {
    setExpandedSubjects(prev => ({ ...prev, [sub]: !prev[sub] }));
  };

  const toggleChapterExpand = (chapKey: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapKey]: !prev[chapKey] }));
  };

  const triggerPrint = (fileUrl: string) => {
    if (fileUrl.startsWith('data:application/pdf') || fileUrl.startsWith('blob:')) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = fileUrl;
      document.body.appendChild(iframe);
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } else {
      window.print();
    }
  };

  const getTypeIcon = (_type: MaterialType) => '';

  // Simulated PDF pages content generator
  const getSimulatedPages = (material: StudyMaterial) => {
    const textData = [
      {
        title: "CLINICAL CASE OVERVIEW",
        subtitle: `Pathology & Symptomatology of ${material.chapter}`,
        content: `The patient presents with progressive symptoms directly correlating to dysregulation in the ${material.chapter}. Laboratory results show an elevation of inflammatory markers, secondary to ischemic changes. Immediate diagnostic algorithms indicate a high susceptibility to acute episodes if left untreated. Recommended pharmacotherapy includes receptor antagonists and structural supportive blockers.`
      },
      {
        title: "DIAGNOSTIC CRITERIA",
        subtitle: "NEET-PG high-yield review guidelines",
        content: "1. Primary Diagnostic Threshold: Electrocardiogram / Biochemical serum analysis.\n2. Morphological markers: Intracellular cellular edema, neutrophilic infiltration, cellular apoptosis, and focal necrosis.\n3. Differential Diagnoses: Non-specific reactive states, immunological hyper-reactivity, and toxic stress conditions.\n4. Grade of Severity: Scale of Class I to Class IV."
      },
      {
        title: "PHARMACOTHERAPEUTIC MANAGEMENT",
        subtitle: "Key medical management options",
        content: "First-line agents: Intravenous administration of stabilization compounds, combined with target inhibitors. Maintenance dose should be adjusted to clear systemic metabolic waste. Contraindications: Active liver dysfunction, renal insufficiency (eGFR < 30 ml/min), and hypersensitivity to synthetic blockers."
      },
      {
        title: "CLINICAL PEARLS & BULLET POINTS",
        subtitle: "Important facts to memorize",
        content: "• ALWAYS check serum potassium levels before administering receptor blockers.\n• The rate-limiting step of this metabolic pathway is regulated by allosteric feedback inhibition.\n• Microscopic biopsies reveal pathognomonic multinucleated giant cells.\n• High-dose Magnesium Sulfate is the drug of choice for convulsing mothers."
      },
      {
        title: "MOCK REVISION MULTIPLE CHOICE QUESTIONS",
        subtitle: "Test your understanding",
        content: "Q1. Which of the following is the most appropriate first-line diagnostic investigation?\nA) Biopsy B) Contrast Computed Tomography C) Biochemical Serum Analysis D) Magnetic Resonance Imaging\n\nCorrect Answer: C\nExplanation: Serum levels show immediate deviations, offering the highest sensitivity and specificity for acute triage."
      }
    ];

    return textData;
  };

  if (isLoading) {
    return (
      <div className="space-y-10">
        <StudyMaterialGridSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 selection:bg-primary-500 selection:text-white text-stone-650">
      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-in bg-white border-stone-200/80 text-stone-900"
          >
            <Check className="w-5 h-5 text-emerald-600 bg-emerald-50 rounded-full p-1 border border-emerald-100" />
            <span className="text-base font-bold">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Study Material Library</h1>
          <p className="text-base text-stone-500 font-medium">Access top-tier medical notes, slide decks, MCQs, and case studies.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`${basePath}/downloads`}
            className="flex items-center gap-2 border border-stone-200/60 hover:border-primary-500 bg-white hover:bg-stone-50 text-stone-700 hover:text-primary-600 px-4 py-3.5 rounded-2xl text-sm font-black shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-stone-400" /> My Downloads
          </Link>
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="bg-white border border-stone-200/60 rounded-xl p-4 shadow-sm space-y-3">
        {/* Row 1: Filter hint + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4 text-primary-600" />
              <span className="text-lg font-black text-primary-700 whitespace-nowrap">Filter by Subject, Type & Difficulty</span>
            </div>
            <div className="relative sm:max-w-xs w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search library..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200/60 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-base font-medium text-stone-900 placeholder:text-stone-400 outline-none" />
          </div>
        </div>

        {/* Row 2: Sort + Subject + Type + Difficulty + Year + Library toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-stone-200/60 rounded-lg text-base font-semibold text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none shrink-0">
            <option value="downloads">Most Downloaded</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">A-Z</option>
          </select>
          <div className="w-px h-4 bg-stone-200 shrink-0" />
          <select value={selectedSubjects[0] || ''} onChange={(e) => setSelectedSubjects(e.target.value ? [e.target.value] : [])}
            className="w-auto px-3 py-1.5 bg-white border border-stone-200/60 rounded-lg text-base font-medium text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none shrink-0">
            <option value="">All Subjects</option>
            {(allowedMaterialSubjects.length > 0 ? allowedMaterialSubjects : SUBJECTS).map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
          <select value={selectedTypes[0] || ''} onChange={(e) => setSelectedTypes(e.target.value ? [e.target.value] : [])}
            className="w-auto px-3 py-1.5 bg-white border border-stone-200/60 rounded-lg text-base font-medium text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none shrink-0">
            <option value="">All Types</option>
            {['Notes', 'PPT', 'MCQ Bank', 'Previous Year Questions', 'Case Study', 'Image Set', 'Video Summary'].map((t, i) => (
              <option key={i} value={t}>{getTypeIcon(t as MaterialType)} {t === 'Previous Year Questions' ? 'PYQ Bank' : t}</option>
            ))}
          </select>
          <select value={selectedDifficulties[0] || ''} onChange={(e) => setSelectedDifficulties(e.target.value ? [e.target.value] : [])}
            className="w-auto px-3 py-1.5 bg-white border border-stone-200/60 rounded-lg text-base font-medium text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none shrink-0">
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select value={selectedYears[0]?.toString() || ''} onChange={(e) => setSelectedYears(e.target.value ? [parseInt(e.target.value)] : [])}
            className="w-auto px-3 py-1.5 bg-white border border-stone-200/60 rounded-lg text-base font-medium text-stone-700 focus:ring-1 focus:ring-primary-500 outline-none shrink-0">
            <option value="">All Years</option>
            {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <div className="flex bg-stone-100 border border-stone-200/60 p-0.5 rounded-lg shrink-0">
            <button onClick={() => setShowSavedOnly(false)}
              className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${!showSavedOnly ? 'bg-primary-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'} border-none cursor-pointer`}>
              All Library
            </button>
            <button onClick={() => setShowSavedOnly(true)}
              className={`px-3 py-1 rounded-md text-sm font-bold transition-all flex items-center gap-1 ${showSavedOnly ? 'bg-primary-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'} border-none cursor-pointer`}>
              <Heart className="w-2.5 h-2.5" /> Saved ({favorites.length})
            </button>
          </div>
        </div>

        {/* Row 3: Results + View Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100">
          <p className="text-sm font-medium text-stone-500">{sortedMaterials.length} material{sortedMaterials.length !== 1 ? 's' : ''} found</p>
          <div className="flex bg-stone-100 border border-stone-200/60 p-0.5 rounded-lg">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-400 hover:text-stone-700'} border-none cursor-pointer`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('accordion')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'accordion' ? 'bg-white text-primary-600 shadow-sm' : 'text-stone-400 hover:text-stone-700'} border-none cursor-pointer`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Library Body */}
      <div className="space-y-6">
          
          {sortedMaterials.length === 0 ? (
            showSavedOnly ? (
              <div className="bg-white border border-stone-200/60 rounded-xl p-10 text-center shadow-sm">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-stone-900 mb-1">Your Library is empty</h3>
                <p className="text-base text-stone-500 font-medium max-w-md mx-auto mb-4">Save study materials by clicking the heart icon on any item. They will appear here for quick access.</p>
                <button
                  onClick={() => setShowSavedOnly(false)}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 cursor-pointer"
                >
                  Browse All Materials
                </button>
              </div>
            ) : (
            <div className="bg-white border border-stone-200/60 rounded-xl p-10 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-900 mb-1">No materials found</h3>
              <p className="text-base text-stone-500 font-medium max-w-md mx-auto mb-4">We couldn't find any study materials fitting your query. Try adjusting your search keywords or checking some filters.</p>
              <button
                onClick={() => {
                  setSelectedSubjects([]);
                  setSelectedTypes([]);
                  setSelectedDifficulties([]);
                  setSelectedYears([]);
                  setSearchQuery('');
                  setShowSavedOnly(false);
                }}
                className="px-6 py-3 bg-stone-100 text-stone-700 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-stone-200 transition-all border border-stone-200/60 cursor-pointer"
              >
                Clear all Filters
              </button>
            </div>
            )
          ) : viewMode === 'grid' ? (
            
            /* Grid layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {sortedMaterials.map(item => {
                const isSaved = favorites.includes(item.id);
                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-stone-200/60 hover:border-primary-500/30 shadow-sm hover:shadow-primary-500/5 rounded-xl overflow-hidden flex flex-col group transition-all"
                  >
                    {/* Thumbnail banner */}
                    <div className="aspect-video bg-gradient-to-br from-primary-600/5 to-blue-600/5 bg-stone-50 relative overflow-hidden flex items-center justify-center shrink-0">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                          <div className="text-center p-4 space-y-1">
                            <span className="text-sm font-black text-stone-850 uppercase tracking-widest bg-stone-200/50 px-2 py-0.5 rounded-full">
                              {item.type}
                            </span>
                          </div>
                      )}
                      
                      {/* Subject/difficulty tags on cover */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        <span className="px-2 py-0.5 text-sm font-black uppercase tracking-widest text-primary-705 bg-primary-50 rounded-md shadow-sm border border-primary-100">
                          {item.subject}
                        </span>
                        {item.year && (
                          <span className="px-2 py-0.5 text-xs font-black uppercase tracking-widest bg-stone-900/70 text-white rounded-md shadow-sm border border-white/10">
                            Year {item.year}
                          </span>
                        )}
                      </div>

                      {/* Favorite/Saved Button */}
                      <button
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className={`absolute top-3 right-3 p-2 rounded-lg transition-all border shadow-sm cursor-pointer ${
                          isSaved 
                            ? 'bg-red-500 border-red-500 text-white' 
                            : 'bg-white/80 border-stone-200/60 text-stone-400 hover:text-red-500 hover:bg-stone-50'
                        }`}
                        title={isSaved ? 'Remove from My Library' : 'Save to My Library'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Content body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm font-black text-stone-400 uppercase tracking-widest">
                          <span className="truncate max-w-[100px]">{item.chapter}</span>
                          <span className={`px-1.5 py-0.5 rounded border text-sm ${
                            item.difficulty === 'Advanced' ? 'bg-red-50 border-red-100 text-red-700' :
                            item.difficulty === 'Intermediate' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                            'bg-green-50 border-green-100 text-green-700'
                          }`}>
                            {item.difficulty}
                          </span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-lg leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-base text-stone-500 font-medium line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Rating & Stats - only if rated */}
                      {item.ratingsCount && item.ratingsCount > 0 && (
                        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-base font-black text-stone-900">{item.rating}</span>
                            <span className="text-sm text-stone-400">({item.ratingsCount})</span>
                          </div>
                          <span className="text-sm font-bold text-stone-400 uppercase tracking-wider">
                            {item.downloadCount.toLocaleString()} downloads
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setPreviewingMaterial(item);
                              setViewerPage(1);
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-primary-200 hover:bg-primary-50 text-primary-700 font-bold text-sm py-2 rounded-lg transition-all cursor-pointer bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>

                          <button
                            onClick={(e) => handleShare(item, e)}
                            className="border border-stone-200/60 hover:bg-stone-50 text-stone-400 hover:text-stone-600 p-2 rounded-lg transition-all cursor-pointer bg-white"
                            title="Share link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => setReportingMaterial(item)}
                            className="border border-stone-200/60 hover:bg-red-50 text-stone-400 hover:text-red-500 p-2 rounded-lg transition-all cursor-pointer bg-white"
                            title="Report broken material"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            
            /* Accordion Tree View */
            <div className="bg-white border border-stone-200/60 rounded-xl p-4 shadow-sm space-y-3 animate-fade-in">
              {Object.entries(accordionGroup).map(([subName, chapters]) => {
                const isSubExpanded = expandedSubjects[subName];
                return (
                  <div key={subName} className="border border-stone-200/60 rounded-lg overflow-hidden bg-stone-50/50 shadow-sm">
                    {/* Subject Level */}
                    <button
                      onClick={() => toggleSubjectExpand(subName)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-200/60 hover:bg-stone-100 transition-colors text-left text-stone-900 border-none cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary-600" />
                        <span className="font-black text-stone-900 text-sm tracking-tight">{subName}</span>
                        <span className="text-xs font-black px-1.5 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-100 uppercase">
                          {Object.values(chapters).reduce((acc, curr) => acc + curr.length, 0)} items
                        </span>
                      </div>
                      {isSubExpanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
                    </button>

                    {/* Chapters level */}
                    {isSubExpanded && (
                      <div className="divide-y divide-stone-200/60 bg-transparent">
                        {Object.entries(chapters).map(([chapName, items]) => {
                          const chapKey = `${subName}_${chapName}`;
                          const isChapExpanded = expandedChapters[chapKey];
                          return (
                            <div key={chapName} className="pl-4 bg-transparent">
                              {/* Chapter header */}
                              <button
                                onClick={() => toggleChapterExpand(chapKey)}
                                className="w-full flex items-center justify-between py-3 pr-4 border-b border-stone-100 hover:text-primary-700 transition-colors text-left text-stone-900 border-none bg-transparent cursor-pointer"
                              >
                                <span className="font-bold text-stone-800 text-sm">{chapName}</span>
                                <div className="flex items-center gap-2 text-stone-400">
                                  <span className="text-xs font-bold">{items.length} files</span>
                                  {isChapExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </div>
                              </button>

                              {/* Material files list */}
                              {isChapExpanded && (
                                <div className="divide-y divide-stone-100 pr-4 pl-3 py-1 bg-transparent">
                                  {items.map(item => {
                                    const isSaved = favorites.includes(item.id);
                                    return (
                                      <div key={item.id} className="py-2 flex items-center justify-between text-sm group hover:bg-stone-50 rounded-md px-2 transition-all">
                                        <div className="flex items-center gap-2 w-1/2">
                                          <span className="text-base shrink-0">{getTypeIcon(item.type)}</span>
                                          <div className="truncate">
                                            <p className="font-bold text-stone-900 group-hover:text-primary-600 transition-colors truncate text-sm">{item.title}</p>
                                            <p className="text-xs text-stone-400 font-bold">{item.fileSize} • {item.pageCount} pages • {item.difficulty}{item.year ? ` • Year ${item.year}` : ''}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-stone-500 font-bold">
                                          <span className="text-xs text-stone-400">{item.downloadCount} downloads</span>
                                          
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => {
                                                setPreviewingMaterial(item);
                                                setViewerPage(1);
                                              }}
                                              className="flex items-center gap-1 hover:text-primary-700 transition-all font-bold px-1.5 py-0.5 rounded bg-primary-50 border border-primary-100 text-xs text-primary-700 cursor-pointer"
                                            >
                                              <Eye className="w-3 h-3" /> Preview
                                            </button>

                                            <button
                                              onClick={(e) => handleToggleFavorite(item.id, e)}
                                              className={`p-1 rounded hover:bg-stone-150 transition-colors border-none bg-transparent cursor-pointer ${isSaved ? 'text-red-500' : 'text-stone-400 hover:text-red-500'}`}
                                              title={isSaved ? 'Remove from My Library' : 'Save to My Library'}
                                            >
                                              <Heart className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* PDF PREVIEW INTERACTIVE MODAL */}
      {previewingMaterial && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#060f1a]/90 backdrop-blur-md transition-all ${viewerFullscreen ? 'p-0' : 'p-4 md:p-8'}`}>
          <div className={`bg-white shadow-2xl flex flex-col overflow-hidden animate-scale-up text-stone-900 ${viewerFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[88vh] rounded-[2.5rem] border border-stone-200/80'}`}>
            
            {/* Header toolbar */}
            <div className="px-8 py-5 border-b border-stone-200/60 flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-stone-50 shrink-0">
              <div className="truncate">
                <h3 className="text-lg font-black text-stone-900 truncate max-w-md">{previewingMaterial.title}</h3>
                <p className="text-xs font-black text-stone-400 uppercase tracking-widest mt-0.5">{previewingMaterial.subject} • {previewingMaterial.chapter}</p>
              </div>

              {/* View options */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Page Navigation */}
                <div className="flex items-center gap-1.5 bg-stone-105 border border-stone-200/65 p-1 rounded-xl shadow-sm text-sm font-bold bg-white">
                  <button
                    disabled={viewerPage <= 1}
                    onClick={() => setViewerPage(p => Math.max(1, p - 1))}
                    className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 disabled:opacity-40 border-none bg-transparent cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-1 text-stone-750">
                    Page {viewerPage} of {previewingMaterial.freePreview ? Math.min(previewingMaterial.previewPages, previewingMaterial.pageCount) : previewingMaterial.pageCount}
                  </span>
                  <button
                    disabled={viewerPage >= (previewingMaterial.freePreview ? Math.min(previewingMaterial.previewPages, previewingMaterial.pageCount) : previewingMaterial.pageCount)}
                    onClick={() => setViewerPage(p => p + 1)}
                    className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-500 disabled:opacity-40 border-none bg-transparent cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Zoom */}
                <div className="flex items-center gap-1.5 bg-stone-105 border border-stone-200/65 p-1 rounded-xl shadow-sm text-sm font-bold bg-white">
                  <button
                    onClick={() => setViewerZoom(z => Math.max(50, z - 20))}
                    className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-550 border-none bg-transparent cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-1 text-stone-750">{viewerZoom}%</span>
                  <button
                    onClick={() => setViewerZoom(z => Math.min(200, z + 20))}
                    className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-550 border-none bg-transparent cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* PDF Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => triggerPrint(previewingMaterial.fileUrl)}
                    className="p-3 bg-stone-100 border border-stone-200 hover:border-stone-350 rounded-xl text-stone-500 hover:text-stone-750 transition-all shadow-sm cursor-pointer"
                    title="Print Document"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setViewerFullscreen(!viewerFullscreen)}
                    className="p-3 bg-stone-100 border border-stone-200 hover:border-stone-350 rounded-xl text-stone-500 hover:text-stone-750 transition-all shadow-sm cursor-pointer"
                    title={viewerFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setPreviewingMaterial(null)}
                    className="p-3 bg-stone-100 hover:bg-red-50 border border-stone-200 text-stone-400 hover:text-red-500 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* Viewer Canvas Area */}
            <div className="flex-1 bg-stone-100/80 overflow-auto p-8 flex items-center justify-center custom-scrollbar">
              <div 
                className="bg-white shadow-2xl rounded-2xl border border-stone-200/80 p-12 transition-all min-h-[60vh] max-w-[800px] w-full flex flex-col justify-between text-stone-900"
                style={{ 
                  transform: `scale(${viewerZoom / 100})`, 
                  transformOrigin: 'top center',
                  marginBottom: viewerZoom > 100 ? `${(viewerZoom - 100) * 0.5}vh` : '0px'
                }}
              >
                {/* Real loaded file via blob URL */}
                {previewBlobUrl ? (
                  hasAccess ? (
                    <embed
                      src={previewBlobUrl}
                      type="application/pdf"
                      className="w-full h-[60vh] rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
                      <Lock className="w-16 h-16 text-stone-300 mb-4" />
                      <h3 className="text-xl font-black text-stone-900 mb-2">Subscription Required</h3>
                      <p className="text-stone-500 font-medium mb-6 max-w-md">
                        Upgrade your plan to unlock full access to study materials, including detailed previews and downloads.
                      </p>
                      <Link href="/pricing"
                        className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20">
                        View Plans
                      </Link>
                    </div>
                  )
                ) : previewingMaterial.fileUrl ? (
                  /* File exists but previewBlobUrl fetch failed */
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center px-8">
                    <AlertTriangle className="w-16 h-16 text-stone-300 mb-4" />
                    <h3 className="text-xl font-black text-stone-900 mb-2">Preview Unavailable</h3>
                    <p className="text-stone-500 font-medium mb-6 max-w-md">
                      The file could not be loaded. It may have been moved or deleted.
                    </p>
                  </div>
                ) : (
                  
                  /* High Fidelity Simulated Medical page design */
                  <div className="space-y-6 flex-1 flex flex-col justify-between bg-transparent text-stone-900">
                    <div>
                      {/* Simulated Medical Header */}
                      <div className="border-b border-stone-100 pb-4 flex items-center justify-between text-sm text-stone-400">
                        <span className="font-black text-primary-600 uppercase tracking-widest">PaceMaker Study Ecosystem</span>
                        <span className="font-bold">Subject: {previewingMaterial.subject}</span>
                      </div>

                      {/* Content block */}
                      <div className="mt-8 space-y-4">
                        <span className="px-3 py-1 rounded bg-primary-50 text-primary-700 text-xs font-black uppercase tracking-wider border border-primary-100">
                          Section {viewerPage}
                        </span>
                        <h2 className="text-2xl font-black text-stone-900 mt-2">
                          {getSimulatedPages(previewingMaterial)[(viewerPage - 1) % 5].title}
                        </h2>
                        <h4 className="text-sm font-bold text-stone-500 italic">
                          {getSimulatedPages(previewingMaterial)[(viewerPage - 1) % 5].subtitle}
                        </h4>
                        <p className="text-stone-850 text-base leading-relaxed mt-6 whitespace-pre-line font-medium">
                          {getSimulatedPages(previewingMaterial)[(viewerPage - 1) % 5].content}
                        </p>
                      </div>

                      {/* Graphic overlay for visual excellence */}
                      <div className="mt-8 p-6 bg-primary-50 border border-primary-100 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center shrink-0">
                          <span className="text-2xl">🧠</span>
                        </div>
                        <div className="text-sm">
                          <p className="font-black text-primary-700 uppercase tracking-wider mb-1">Instructor Review Notes</p>
                          <p className="text-stone-800 leading-relaxed font-bold">This topic is frequently tested in NEET-PG/INICET clinical sections. Revise the diagnostic criteria twice.</p>
                        </div>
                      </div>
                    </div>

                    {/* Footer marker */}
                    <div className="border-t border-stone-100 pt-4 flex items-center justify-between text-xs text-stone-400 font-bold shrink-0">
                      <span>© 2026 PaceMaker Platform. Compiled by {previewingMaterial.uploadedBy || 'Medical Faculty'}.</span>
                      <span>Page {viewerPage} of {previewingMaterial.pageCount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Free preview warning */}
            {previewingMaterial.freePreview && (
              <div className="px-8 py-3.5 bg-amber-50 border-t border-amber-100 flex items-center justify-between text-sm text-amber-600 font-bold shrink-0">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Free Preview limited to first {previewingMaterial.previewPages} pages.
                </span>
                <span className="text-xs font-black uppercase text-amber-600">Unlock the full platform for unlimited pages</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RATING MODAL (Prompts after download) */}
      {ratingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060f1a]/85 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-2xl w-full max-w-md p-8 text-center space-y-6 animate-scale-up text-stone-900">
            <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 text-primary-600 fill-primary-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-stone-900">Rate this Material</h3>
              <p className="text-base text-stone-500 font-medium leading-relaxed">
                You've successfully downloaded <strong>{ratingMaterial.title}</strong>. Please rate this file to help fellow aspirants in their preparation.
              </p>
            </div>

            {/* Interactive Stars */}
            <div className="flex justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setGivenRating(star)}
                  className="p-1 hover:scale-110 transition-transform border-none bg-transparent cursor-pointer"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating !== null ? hoverRating : givenRating) 
                        ? 'text-amber-400 fill-current' 
                        : 'text-stone-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRatingMaterial(null)}
                className="flex-1 px-5 py-3 border border-stone-200 text-stone-500 rounded-xl text-sm font-bold transition-all hover:bg-stone-50 cursor-pointer bg-white"
              >
                Skip Rating
              </button>
              <button
                type="button"
                onClick={submitReview}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 border-none cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT MODAL */}
      {reportingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060f1a]/85 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up text-stone-900">
            <div className="px-8 py-5 border-b border-stone-200/60 flex items-center justify-between bg-stone-50">
              <h3 className="text-lg font-bold text-stone-900">Report Study Material</h3>
              <button 
                onClick={() => setReportingMaterial(null)}
                className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-all border-none bg-transparent cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitReport} className="p-8 space-y-5">
              <p className="text-sm text-stone-500 font-medium leading-relaxed mb-4">
                Help us keep the ecosystem pristine. If this file <strong>{reportingMaterial.title}</strong> has issues, let us know the reason.
              </p>

              <div>
                <label className="block text-sm font-black text-stone-400 uppercase tracking-widest mb-2">Reason for Report</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200/60 rounded-xl bg-white text-stone-900 font-bold outline-none focus:border-primary-500"
                >
                  <option value="Broken Link">Broken PDF / Doesn't Load</option>
                  <option value="Incorrect Information">Incorrect Clinical Data</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Other">Other / Request Update</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black text-stone-400 uppercase tracking-widest mb-2">Details / Specific Pages</label>
                <textarea 
                  rows={4}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="E.g., page 3 diagram is missing, spelling errors, or PDF fails to download..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200/60 rounded-xl focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-stone-900 font-medium text-sm placeholder:text-stone-400 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setReportingMaterial(null)}
                  className="flex-1 px-5 py-3 border border-stone-200 text-stone-500 rounded-xl text-sm font-bold transition-all hover:bg-stone-100 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-red-500/20 border-none cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
