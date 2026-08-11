// ============================================================
// Study Material Store — Shared localStorage & mock database
// ============================================================

export type MaterialType = 'Notes' | 'PPT' | 'MCQ Bank' | 'Previous Year Questions' | 'Case Study' | 'Image Set' | 'Video Summary';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type PublishStatus = 'draft' | 'published';

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  year?: number;
  description: string;
  type: MaterialType;
  difficulty: DifficultyLevel;
  tags: string[];
  fileUrl: string; // URL or Base64 data URL
  fileSize: string;
  pageCount: number;
  thumbnail: string; // Optional image URL or Base64
  downloadCount: number;
  rating: number;
  ratingsCount?: number; // Keep track of how many students rated
  allowDownload: boolean;
  freePreview: boolean;
  previewPages: number;
  displayOrder: number;
  status: PublishStatus;
  uploadedBy: string;
  uploadedAt: string;
  updatedAt: string;
}

export interface DownloadLog {
  id: string;
  materialId: string;
  title: string;
  subject: string;
  type: MaterialType;
  fileSize: string;
  downloadedAt: string;
}

export interface FavoriteLog {
  materialId: string;
  savedAt: string;
}

export interface ReportLog {
  id: string;
  materialId: string;
  materialTitle: string;
  reason: string;
  details: string;
  reportedBy: string;
  reportedAt: string;
}

export const MATERIALS_KEY = 'lms_study_materials_v1';
export const DOWNLOADS_KEY = 'lms_downloads_v1';
export const FAVORITES_KEY = 'lms_favorites_v1';
export const REPORTS_KEY = 'lms_reports_v1';

export const SUBJECTS = [
  "Anatomy", "Physiology", "Biochemistry", "Pathology", "Pharmacology", 
  "Microbiology", "Medicine", "Surgery", "Pediatrics", "Gynecology", 
  "ENT", "Ophthalmology", "Orthopedics"
];

// Helper to get common chapters by subject (for auto-populating)
export const CHAPTERS_BY_SUBJECT: Record<string, string[]> = {
  "Anatomy": ["Thorax Anatomy", "Abdomen & Pelvis", "Upper Limb", "Lower Limb", "Head & Neck", "Neuroanatomy", "Osteology & Embryology"],
  "Physiology": ["General Physiology", "Nerve-Muscle Physiology", "Cardiovascular System", "Respiratory System", "Renal & Acid-Base", "Gastrointestinal Tract", "Endocrinology & Reproduction", "Central Nervous System"],
  "Biochemistry": ["Metabolism", "Molecular Biology", "Enzymes & Bioenergetics", "Proteins & Lipids", "Vitamins & Minerals", "Clinical Biochemistry"],
  "Pathology": ["General Pathology", "Hematology & Lymphatics", "Cardiovascular Pathology", "Respiratory Pathology", "Renal Pathology", "Gastrointestinal Pathology", "Endocrine & Systemic Pathology"],
  "Pharmacology": ["General Pharmacology", "ANS Pharmacology", "CNS Pharmacology", "Cardiovascular & Renal", "Endocrine Pharmacology", "Chemotherapy & Antimicrobials", "Autacoids & Respiratory"],
  "Microbiology": ["General Bacteriology", "Systemic Bacteriology", "Virology", "Mycology", "Parasitology", "Immunology", "Clinical Microbiology"],
  "Medicine": ["Cardiovascular System", "Pulmonology", "Gastroenterology", "Nephrology", "Endocrinology", "Neurology", "Infectious Diseases", "Rheumatology & Immunology"],
  "Surgery": ["General Surgery", "Trauma & Critical Care", "Gastrointestinal Surgery", "Urosurgery", "Neurosurgery", "Cardiothoracic Surgery", "Endocrine & Breast Surgery"],
  "Pediatrics": ["Growth & Development", "Neonatology", "Pediatric Infectious Diseases", "Cardiology", "Neurology", "Pediatric Emergencies"],
  "Gynecology": ["Obstetrics", "General Gynecology", "Gynecological Oncology", "Infertility & Reproductive Medicine", "Contraception"],
  "ENT": ["Otology", "Rhinology", "Laryngology", "Head & Neck Surgery"],
  "Ophthalmology": ["Refractive Errors", "Cornea & Conjunctiva", "Lens & Cataract", "Glaucoma", "Retina & Uvea", "Neuro-ophthalmology"],
  "Orthopedics": ["Fractures & Dislocation", "Metabolic Bone Diseases", "Bone Tumors", "Spinal Disorders", "Joint Reconstruction & Sports Medicine"]
};

export function getMaterials(): StudyMaterial[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(MATERIALS_KEY);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveMaterials(materials: StudyMaterial[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

export function upsertMaterial(material: StudyMaterial): void {
  const materials = getMaterials();
  const idx = materials.findIndex(m => m.id === material.id);
  if (idx >= 0) {
    materials[idx] = material;
  } else {
    materials.unshift(material); // Add to beginning of list
  }
  saveMaterials(materials);
}

export function deleteMaterial(id: string): void {
  const materials = getMaterials();
  const filtered = materials.filter(m => m.id !== id);
  saveMaterials(filtered);
}

// Downloads Log Actions
export function getDownloads(): DownloadLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addDownload(material: StudyMaterial): void {
  if (typeof window === 'undefined') return;
  const downloads = getDownloads();
  
  // Record new download
  const newLog: DownloadLog = {
    id: 'dl_' + Math.random().toString(36).slice(2, 9),
    materialId: material.id,
    title: material.title,
    subject: material.subject,
    type: material.type,
    fileSize: material.fileSize,
    downloadedAt: new Date().toISOString()
  };
  
  downloads.unshift(newLog);
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));

  // Increment download count in material
  const materials = getMaterials();
  const idx = materials.findIndex(m => m.id === material.id);
  if (idx >= 0) {
    materials[idx].downloadCount += 1;
    saveMaterials(materials);
  }
}

export function removeDownload(downloadId: string): void {
  if (typeof window === 'undefined') return;
  const downloads = getDownloads();
  const filtered = downloads.filter(dl => dl.id !== downloadId);
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(filtered));
}

// Favorites Actions
export function getFavorites(): FavoriteLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(materialId: string): boolean {
  if (typeof window === 'undefined') return false;
  const favorites = getFavorites();
  const idx = favorites.findIndex(fav => fav.materialId === materialId);
  let isSaved = false;

  if (idx >= 0) {
    favorites.splice(idx, 1);
  } else {
    favorites.push({
      materialId,
      savedAt: new Date().toISOString()
    });
    isSaved = true;
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return isSaved;
}

// Rating Actions
export function addReview(materialId: string, stars: number): void {
  const materials = getMaterials();
  const idx = materials.findIndex(m => m.id === materialId);
  if (idx >= 0) {
    const mat = materials[idx];
    const currentCount = mat.ratingsCount || 0;
    const currentRating = mat.rating || 0;
    
    // Calculate new average
    const totalScore = (currentRating * currentCount) + stars;
    const newCount = currentCount + 1;
    const newRating = Number((totalScore / newCount).toFixed(1));

    materials[idx].rating = newRating;
    materials[idx].ratingsCount = newCount;
    saveMaterials(materials);
  }
}

// Report Actions
export function getReports(): ReportLog[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function reportMaterial(materialId: string, reason: string, details: string, reportedBy: string): void {
  if (typeof window === 'undefined') return;
  const reports = getReports();
  const materials = getMaterials();
  const material = materials.find(m => m.id === materialId);
  
  const newReport: ReportLog = {
    id: 'rep_' + Math.random().toString(36).slice(2, 9),
    materialId,
    materialTitle: material ? material.title : 'Unknown Title',
    reason,
    details,
    reportedBy,
    reportedAt: new Date().toISOString()
  };

  reports.unshift(newReport);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

// Generate new ID helper
export function generateMaterialId(): string {
  return "mat_" + Math.random().toString(36).substring(2, 10);
}

// File data URI cache (for preview without backend)
const FILE_CACHE_KEY = 'lms_study_material_files';

export function getFileData(materialId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FILE_CACHE_KEY);
    if (raw) { const map = JSON.parse(raw); return map[materialId] || null; }
  } catch {}
  return null;
}

export function saveFileData(materialId: string, dataUri: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FILE_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[materialId] = dataUri;
    localStorage.setItem(FILE_CACHE_KEY, JSON.stringify(map));
  } catch {
    // localStorage quota exceeded — silently skip caching
  }
}

export function removeFileData(materialId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(FILE_CACHE_KEY);
    if (raw) { const map = JSON.parse(raw); delete map[materialId]; localStorage.setItem(FILE_CACHE_KEY, JSON.stringify(map)); }
  } catch {}
}
