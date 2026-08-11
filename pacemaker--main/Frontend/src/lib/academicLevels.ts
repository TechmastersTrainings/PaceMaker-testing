export interface AcademicLevel {
  id: string;
  label: string;
  subjects: string[];
  supports: string[];
  hidden?: string[];
  specialtyOptions?: string[];
}

export const ACADEMIC_LEVELS: AcademicLevel[] = [
  {
    id: '1st-year',
    label: '1st Year MBBS',
    subjects: ['Anatomy', 'Physiology', 'Biochemistry'],
    supports: [
      'Video Lectures', 'Notes', 'QBank', 'Subject Tests',
      'Revision Videos', 'Clinical Animations', 'Flowcharts',
      'Bookmarks', 'Analytics'
    ],
    hidden: ['NEET PG GTs', 'INI-CET GTs', 'Rank Prediction', 'National Ranking', 'NEET-SS Courses'],
  },
  {
    id: '2nd-year',
    label: '2nd Year MBBS',
    subjects: ['Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine'],
    supports: [
      'Video Lectures', 'Notes', 'Clinical MCQs', 'PYQs',
      'Magic Module', 'Subject Tests', 'Topic Tests', 'Analytics'
    ],
  },
  {
    id: '3rd-year',
    label: '3rd Year MBBS',
    subjects: ['Community Medicine', 'Ophthalmology', 'ENT'],
    supports: [
      'Integrated Teaching', 'Clinical Cases', 'QBank',
      'Revision Videos', 'Custom Practice', 'Analytics'
    ],
  },
  {
    id: '4th-year',
    label: '4th Year MBBS (Final Year)',
    subjects: [
      'Medicine', 'Surgery', 'Pediatrics', 'Orthopedics',
      'Obstetrics & Gynecology', 'Dermatology', 'Psychiatry',
      'Radiology', 'Anesthesia'
    ],
    supports: [
      'Everything from MBBS', 'Clinical Case Discussions',
      'Full-length Tests', 'Grand Tests', 'Integrated Subjects',
      'NExT Preparation', 'High Yield Lists'
    ],
  },
  {
    id: 'internship',
    label: 'Internship',
    subjects: ['All MBBS Subjects'],
    supports: [
      'Full QBank', 'Magic Module', 'Grand Tests',
      'Rank Prediction', 'National Ranking', 'GT Analysis',
      'NEET PG Preparation', 'INI-CET Preparation',
      'FMGE Preparation', 'Recent Updates', 'World of Revision'
    ],
  },
  {
    id: 'pg-entrance',
    label: 'PG Entrance (NEET PG / INI-CET)',
    subjects: ['All 19 Subjects'],
    supports: [
      'Full Platform Access', 'Grand Tests', 'National Ranking',
      'Rank Prediction', 'Custom Modules', 'Magic Module',
      'Schema', 'PYQs', 'Recent Updates', 'NEET PG GTs',
      'INI-CET GTs', 'Exam Analytics'
    ],
  },
  {
    id: 'postgraduate',
    label: 'Postgraduate (MD/MS/DNB)',
    subjects: [
      'Medicine', 'Surgery', 'Pediatrics', 'Radiology',
      'Orthopedics', 'Obstetrics & Gynecology', 'Anesthesia',
      'Psychiatry', 'Dermatology', 'ENT', 'Ophthalmology'
    ],
    supports: [
      'Specialty Videos', 'Case Discussions', 'Journal Updates',
      'Guidelines', 'NEET-SS Preparation', 'Specialty QBank',
      'Clinical Decision Making'
    ],
    specialtyOptions: [
      'Medicine', 'Surgery', 'Pediatrics', 'Radiology',
      'Orthopedics', 'Obstetrics & Gynecology', 'Anesthesia',
      'Psychiatry', 'Dermatology', 'ENT', 'Ophthalmology'
    ],
  },
];

export function getLevel(id: string): AcademicLevel | undefined {
  return ACADEMIC_LEVELS.find(l => l.id === id);
}

export const ACADEMIC_LEVEL_OPTIONS = ACADEMIC_LEVELS.map(l => ({
  value: l.id,
  label: l.label,
}));
