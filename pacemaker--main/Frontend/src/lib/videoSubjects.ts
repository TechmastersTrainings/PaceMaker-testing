export interface SubjectEntry {
  value: string;   // enum-style key (e.g. FORENSIC_MEDICINE)
  label: string;   // display name (e.g. Forensic Medicine)
  years: string[]; // which academic years include this subject
}

export const ALL_VIDEO_SUBJECTS: SubjectEntry[] = [
  // ── 1st Year MBBS ──
  { value: 'ANATOMY',           label: 'Anatomy',           years: ['1st-year'] },
  { value: 'PHYSIOLOGY',        label: 'Physiology',        years: ['1st-year'] },
  { value: 'BIOCHEMISTRY',      label: 'Biochemistry',      years: ['1st-year'] },

  // ── 2nd Year MBBS ──
  { value: 'PATHOLOGY',         label: 'Pathology',         years: ['2nd-year'] },
  { value: 'PHARMACOLOGY',      label: 'Pharmacology',      years: ['2nd-year'] },
  { value: 'MICROBIOLOGY',      label: 'Microbiology',      years: ['2nd-year'] },
  { value: 'FORENSIC_MEDICINE', label: 'Forensic Medicine', years: ['2nd-year'] },

  // ── 3rd Year MBBS ──
  { value: 'COMMUNITY_MEDICINE',label: 'Community Medicine',years: ['3rd-year'] },
  { value: 'OPHTHALMOLOGY',     label: 'Ophthalmology',     years: ['3rd-year'] },
  { value: 'ENT',               label: 'ENT',               years: ['3rd-year'] },

  // ── 4th Year MBBS (Final Year) ──
  { value: 'MEDICINE',               label: 'Medicine',               years: ['4th-year'] },
  { value: 'SURGERY',                label: 'Surgery',                years: ['4th-year'] },
  { value: 'PEDIATRICS',             label: 'Pediatrics',             years: ['4th-year'] },
  { value: 'ORTHOPEDICS',            label: 'Orthopedics',            years: ['4th-year'] },
  { value: 'OBSTETRICS_GYNECOLOGY',  label: 'Obstetrics & Gynecology',years: ['4th-year'] },
  { value: 'DERMATOLOGY',            label: 'Dermatology',            years: ['4th-year'] },
  { value: 'PSYCHIATRY',             label: 'Psychiatry',             years: ['4th-year'] },
  { value: 'RADIOLOGY',              label: 'Radiology',              years: ['4th-year'] },
  { value: 'ANESTHESIA',             label: 'Anesthesia',             years: ['4th-year'] },

  // ── NEET / PG Entrance ──
  { value: 'NEET_PG',   label: 'NEET PG',   years: ['pg-entrance', 'postgraduate'] },
  { value: 'INI_CET',   label: 'INI-CET',   years: ['pg-entrance', 'postgraduate'] },
];

export const SUBJECT_LABELS: Record<string, string> = Object.fromEntries(
  ALL_VIDEO_SUBJECTS.map(s => [s.value, s.label])
);

export const SUBJECT_VALUES: Record<string, string> = Object.fromEntries(
  ALL_VIDEO_SUBJECTS.map(s => [s.label, s.value])
);

/** Get the subject keys (enum values) for a given academic level */
export function subjectsForLevel(levelId: string): string[] {
  if (levelId === 'internship') {
    return ALL_VIDEO_SUBJECTS
      .filter(s => !['NEET_PG', 'INI_CET'].includes(s.value))
      .map(s => s.value);
  }
  return ALL_VIDEO_SUBJECTS
    .filter(s => s.years.includes(levelId))
    .map(s => s.value);
}
