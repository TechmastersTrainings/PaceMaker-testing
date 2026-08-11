'use client';

export type PlanType = 'Basic' | 'Medium' | 'High' | 'Enterprise';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Cancelled' | 'Trial';
export type PaymentMethod = 'Razorpay' | 'Card' | 'UPI';

export interface Subscriber {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  plan: PlanType;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  amount: number; // in ₹
  paymentMethod: PaymentMethod;
  last4?: string;
  registeredDate: string;
  pausedMonthsRemaining?: number; // for paused accounts
  isOfflinePayment?: boolean;
}

export interface PaymentHistory {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'failed' | 'refunded';
  invoiceUrl: string;
  paymentMethod: PaymentMethod;
  last4?: string;
}

const SUBS_KEY = 'lms_subscriptions_v2';
const PAYMENTS_KEY = 'lms_payments_v2';

// Helper to make sure we're in the browser environment before invoking localStorage
const getLocalStorage = (key: string, defaultValue: string) => {
  if (typeof window === 'undefined') return defaultValue;
  return localStorage.getItem(key) || defaultValue;
};

const setLocalStorage = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

export function getSubscribers(): Subscriber[] {
  const loaded = getLocalStorage(SUBS_KEY, '');
  if (!loaded) {
    return [];
  }
  try {
    return JSON.parse(loaded);
  } catch {
    return [];
  }
}

export function saveSubscribers(subs: Subscriber[]) {
  setLocalStorage(SUBS_KEY, JSON.stringify(subs));
  // Fire storage event to update other tabs/views in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
}

export function getPayments(): PaymentHistory[] {
  const loaded = getLocalStorage(PAYMENTS_KEY, '');
  if (!loaded) {
    return [];
  }
  try {
    return JSON.parse(loaded);
  } catch {
    return [];
  }
}

export function savePayments(pays: PaymentHistory[]) {
  setLocalStorage(PAYMENTS_KEY, JSON.stringify(pays));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storage'));
  }
}

// Custom Student subscription loader & initialization helper
export function getOrCreateStudentSubscription(name: string, email: string): Subscriber {
  const subs = getSubscribers();
  const found = subs.find(s => s.email.toLowerCase() === email.toLowerCase());
  
  if (found) return found;
  
  // Create a brand new active plan for this student
  const newSub: Subscriber = {
    userId: 'u_student_' + Math.random().toString(36).substr(2, 5),
    name: name,
    email: email,
    plan: 'Medium',
    status: 'Active',
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    autoRenew: true,
    amount: 1999,
    paymentMethod: 'Card',
    last4: '1099',
    registeredDate: '2026-01-01'
  };
  
  const updatedSubs = [newSub, ...subs];
  saveSubscribers(updatedSubs);
  
  // Add an initial payment record
  const newPay: PaymentHistory = {
    id: 'pay_' + Math.random().toString(36).substr(2, 5),
    userId: newSub.userId,
    date: '2026-01-15',
    description: 'Medium Plan Activation',
    amount: 1999,
    status: 'paid',
    invoiceUrl: '#',
    paymentMethod: 'Card',
    last4: '1099'
  };
  
  const pays = getPayments();
  savePayments([newPay, ...pays]);
  
  return newSub;
}

// Plan Prices dictionary (monthly basis)
export const PLAN_PRICES = {
  Basic: 999,
  Medium: 1999,
  High: 4999,
  Enterprise: 15000
};

export const PLAN_FEATURES = {
  Basic: [
    'All Grand Tests & Mock Exams Only',
    'National Ranking & Percentiles',
    'Detailed explanations for all questions',
    'Standard community support'
  ],
  Medium: [
    'Adaptive Q-Bank with AI Analytics',
    'All Grand Tests & Mini Mocks',
    'Previous Year Questions (PYQs)',
    'Doubt Resolution Forum Access',
    'Email support (24 hour response)'
  ],
  High: [
    'All 19 Subjects Video Lectures',
    'Adaptive Q-Bank with AI Analytics',
    'All Grand Tests & Mini Mocks',
    'Clinical Scenario Masterclass',
    'Printed Lecture Handouts (PDFs)',
    'Priority Doubt Resolution (4 hours)'
  ],
  Enterprise: [
    'All PaceMaker High Features Included',
    'Printed Physical Study Notes delivered home',
    '1-on-1 Medical Mentor consultations',
    'Customized prep calendars & trackers',
    'Dedicated WhatsApp Concierge assistance',
    'Mock Interview & FMGE/NEET counseling sessions'
  ]
};

// Admin Operations API

export function addOfflineSubscription(data: { name: string, email: string, plan: PlanType, amount: number, startDate: string, endDate: string }) {
  const subs = getSubscribers();
  const userId = 'u_off_' + Math.random().toString(36).substr(2, 5);
  
  const newSub: Subscriber = {
    userId,
    name: data.name,
    email: data.email,
    plan: data.plan,
    status: 'Active',
    startDate: data.startDate,
    endDate: data.endDate,
    autoRenew: false,
    amount: data.amount,
    paymentMethod: 'Card', // Default to Card for offline bookkeeping
    registeredDate: new Date().toISOString().split('T')[0],
    isOfflinePayment: true
  };
  
  saveSubscribers([newSub, ...subs]);
  
  const newPay: PaymentHistory = {
    id: 'pay_' + Math.random().toString(36).substr(2, 5),
    userId,
    date: data.startDate,
    description: `${data.plan} Plan - Offline Intake`,
    amount: data.amount,
    status: 'paid',
    invoiceUrl: '#',
    paymentMethod: 'Card'
  };
  
  const payments = getPayments();
  savePayments([newPay, ...payments]);
  return newSub;
}

export function extendSubscription(userId: string, extensionMonths: number) {
  const subs = getSubscribers();
  const idx = subs.findIndex(s => s.userId === userId);
  if (idx < 0) return;
  
  const sub = subs[idx];
  const oldEndDate = new Date(sub.endDate);
  oldEndDate.setMonth(oldEndDate.getMonth() + extensionMonths);
  sub.endDate = oldEndDate.toISOString().split('T')[0];
  sub.status = 'Active'; // Reactivate if it was expired/cancelled
  
  saveSubscribers([...subs]);
  
  // Log extension payment records
  const chargeAmount = sub.plan === 'Basic' ? 999 : sub.plan === 'Medium' ? 1999 : sub.plan === 'High' ? 4999 : 15000;
  const newPay: PaymentHistory = {
    id: 'pay_' + Math.random().toString(36).substr(2, 5),
    userId,
    date: new Date().toISOString().split('T')[0],
    description: `Subscription Extended (${extensionMonths} mo) - ${sub.plan} Plan`,
    amount: chargeAmount * extensionMonths,
    status: 'paid',
    invoiceUrl: '#',
    paymentMethod: sub.paymentMethod,
    last4: sub.last4
  };
  
  const payments = getPayments();
  savePayments([newPay, ...payments]);
}

export function changePlan(userId: string, newPlan: PlanType, proratedAmount: number) {
  const subs = getSubscribers();
  const idx = subs.findIndex(s => s.userId === userId);
  if (idx < 0) return;
  
  const sub = subs[idx];
  sub.plan = newPlan;
  sub.amount = PLAN_PRICES[newPlan];
  sub.status = 'Active';
  
  saveSubscribers([...subs]);
  
  const newPay: PaymentHistory = {
    id: 'pay_' + Math.random().toString(36).substr(2, 5),
    userId,
    date: new Date().toISOString().split('T')[0],
    description: `Plan Upgraded/Downgraded to ${newPlan} (Prorated adjustment)`,
    amount: proratedAmount,
    status: 'paid',
    invoiceUrl: '#',
    paymentMethod: sub.paymentMethod,
    last4: sub.last4
  };
  
  const payments = getPayments();
  savePayments([newPay, ...payments]);
}

export function cancelSubscription(userId: string, immediate: boolean) {
  const subs = getSubscribers();
  const idx = subs.findIndex(s => s.userId === userId);
  if (idx < 0) return;
  
  const sub = subs[idx];
  sub.autoRenew = false;
  if (immediate) {
    sub.status = 'Cancelled';
  } else {
    // Non-immediate cancellation just turns off autoRenew and keeps it Active until endDate
    sub.status = 'Active'; 
  }
  
  saveSubscribers([...subs]);
}

export function pauseSubscription(userId: string, months: number) {
  const subs = getSubscribers();
  const idx = subs.findIndex(s => s.userId === userId);
  if (idx < 0) return;
  
  const sub = subs[idx];
  sub.status = 'Cancelled'; // Freeze status
  sub.pausedMonthsRemaining = months;
  sub.autoRenew = false;
  
  // Extend subscription end date by frozen months
  const oldEndDate = new Date(sub.endDate);
  oldEndDate.setMonth(oldEndDate.getMonth() + months);
  sub.endDate = oldEndDate.toISOString().split('T')[0];
  
  saveSubscribers([...subs]);
}

export function reactivateSubscription(userId: string) {
  const subs = getSubscribers();
  const idx = subs.findIndex(s => s.userId === userId);
  if (idx < 0) return;
  
  const sub = subs[idx];
  sub.status = 'Active';
  sub.autoRenew = true;
  sub.pausedMonthsRemaining = undefined;
  
  saveSubscribers([...subs]);
}

export function refundPayment(paymentId: string, amount: number) {
  const payments = getPayments();
  const idx = payments.findIndex(p => p.id === paymentId);
  if (idx < 0) return;
  
  const payment = payments[idx];
  payment.status = 'refunded';
  savePayments([...payments]);
}
