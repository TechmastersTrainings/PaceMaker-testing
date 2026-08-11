export interface PlanPricing {
  planId: 'plan-a' | 'plan-b' | 'plan-c';
  name: string;
  tagline: string;
  badge?: string;
  features: string[];
  prices: {
    '3 Months': number;
    '6 Months': number;
    '12 Months': number;
  };
}

export interface AcademicLevelPricing {
  levelId: string;
  label: string;
  subjects: string[];
  plans: PlanPricing[];
}

export const ACADEMIC_PRICING: AcademicLevelPricing[] = [
  {
    levelId: '1st-year',
    label: '1st Year MBBS',
    subjects: ['Anatomy', 'Physiology', 'Biochemistry'],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 9999,
          '6 Months': 14999,
          '12 Months': 19999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 14999,
          '6 Months': 21999,
          '12 Months': 29999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Video Lectures',
          'Notes',
          'QBank',
          'Test Series',
          'Revision Tools',
          'Analytics',
        ],
        prices: {
          '3 Months': 19999,
          '6 Months': 29999,
          '12 Months': 39999,
        },
      },
    ],
  },
  {
    levelId: '2nd-year',
    label: '2nd Year MBBS',
    subjects: ['Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine'],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 10999,
          '6 Months': 15999,
          '12 Months': 21999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 15999,
          '6 Months': 24999,
          '12 Months': 34999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Video Lectures',
          'Notes',
          'QBank',
          'Test Series',
          'Revision Tools',
          'Analytics',
        ],
        prices: {
          '3 Months': 21999,
          '6 Months': 32999,
          '12 Months': 44999,
        },
      },
    ],
  },
  {
    levelId: '3rd-year',
    label: '3rd Year MBBS',
    subjects: ['Community Medicine', 'Ophthalmology', 'ENT'],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 10999,
          '6 Months': 15999,
          '12 Months': 21999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 15999,
          '6 Months': 24999,
          '12 Months': 34999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Video Lectures',
          'Notes',
          'QBank',
          'Test Series',
          'Revision Tools',
          'Analytics',
        ],
        prices: {
          '3 Months': 21999,
          '6 Months': 32999,
          '12 Months': 44999,
        },
      },
    ],
  },
  {
    levelId: '4th-year',
    label: '4th Year MBBS (Final Year)',
    subjects: [
      'Medicine', 'Surgery', 'Obstetrics & Gynecology',
      'Pediatrics', 'Orthopedics', 'Psychiatry',
      'Dermatology', 'Radiology', 'Anesthesia',
    ],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 12999,
          '6 Months': 18999,
          '12 Months': 24999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 18999,
          '6 Months': 28999,
          '12 Months': 39999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Video Lectures',
          'Notes',
          'QBank',
          'Test Series',
          'Revision Tools',
          'Analytics',
        ],
        prices: {
          '3 Months': 24999,
          '6 Months': 36999,
          '12 Months': 49999,
        },
      },
    ],
  },
  {
    levelId: 'internship',
    label: 'Internship',
    subjects: ['All MBBS Subjects'],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 12999,
          '6 Months': 18999,
          '12 Months': 24999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 18999,
          '6 Months': 28999,
          '12 Months': 39999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Video Lectures',
          'Notes',
          'QBank',
          'Test Series',
          'Revision Tools',
          'Analytics',
        ],
        prices: {
          '3 Months': 24999,
          '6 Months': 36999,
          '12 Months': 49999,
        },
      },
    ],
  },
  {
    levelId: 'pg-entrance',
    label: 'PG Entrance (NEET PG / INI-CET)',
    subjects: ['All 19 Pre-clinical & Para-clinical Subjects'],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 12999,
          '6 Months': 18999,
          '12 Months': 24999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 18999,
          '6 Months': 28999,
          '12 Months': 39999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Video Lectures',
          'Notes',
          'QBank',
          'Test Series',
          'Revision Tools',
          'Analytics',
        ],
        prices: {
          '3 Months': 24999,
          '6 Months': 36999,
          '12 Months': 49999,
        },
      },
    ],
  },
  {
    levelId: 'postgraduate',
    label: 'Postgraduate (MD/MS/DNB)',
    subjects: [
      'Medicine', 'Surgery', 'Pediatrics', 'Radiology',
      'Orthopedics', 'Obstetrics & Gynecology', 'Anesthesia',
      'Psychiatry', 'Dermatology', 'ENT', 'Ophthalmology',
    ],
    plans: [
      {
        planId: 'plan-a',
        name: 'Plan A',
        tagline: 'Test Series',
        features: [
          'Subject Tests',
          'Topic Tests',
          'Mock Tests',
          'Performance Analytics',
        ],
        prices: {
          '3 Months': 14999,
          '6 Months': 21999,
          '12 Months': 29999,
        },
      },
      {
        planId: 'plan-b',
        name: 'Plan B',
        tagline: 'QBank + Tests',
        features: [
          'Complete QBank',
          'Clinical MCQs',
          'PYQs',
          'Detailed Explanations',
          'Subject Tests',
          'Analytics',
        ],
        prices: {
          '3 Months': 21999,
          '6 Months': 32999,
          '12 Months': 44999,
        },
      },
      {
        planId: 'plan-c',
        name: 'Plan C',
        badge: 'most popular',
        tagline: 'Complete Learning',
        features: [
          'Specialty Videos',
          'Case Discussions',
          'Journal Updates',
          'Guidelines',
          'Specialty QBank',
          'Analytics',
        ],
        prices: {
          '3 Months': 29999,
          '6 Months': 44999,
          '12 Months': 59999,
        },
      },
    ],
  },
];

export function getPricingForLevel(levelId: string): AcademicLevelPricing | undefined {
  return ACADEMIC_PRICING.find(p => p.levelId === levelId);
}

export const DURATION_OPTIONS = ['3 Months', '6 Months', '12 Months'] as const;

export type DurationKey = typeof DURATION_OPTIONS[number];

export const PLAN_FEATURES_COMPARISON: { feature: string; a: boolean; b: boolean; c: boolean }[] = [
  { feature: 'Subject Tests', a: true, b: true, c: true },
  { feature: 'Topic Tests', a: true, b: true, c: true },
  { feature: 'Mock Exams', a: true, b: true, c: true },
  { feature: 'Performance Analytics', a: true, b: true, c: true },
  { feature: 'QBank', a: false, b: true, c: true },
  { feature: 'Clinical MCQs', a: false, b: true, c: true },
  { feature: 'PYQs', a: false, b: true, c: true },
  { feature: 'Video Lectures', a: false, b: false, c: true },
  { feature: 'Revision Videos', a: false, b: false, c: true },
  { feature: 'Notes', a: false, b: false, c: true },
  { feature: 'Flowcharts', a: false, b: false, c: true },
  { feature: 'Clinical Images', a: false, b: false, c: true },
  { feature: 'Revision Tools', a: false, b: true, c: true },
];
