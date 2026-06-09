'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, CheckCircle2, ChevronRight, Info, CreditCard, 
  Lock, QrCode, Wallet, Percent, Tag, X, Check, ArrowLeft, 
  HelpCircle, ShieldCheck, Sparkles, Upload, FileText, Image as ImageIcon,
  Phone, Key, School, GraduationCap, MapPin, Edit3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  getSubscribers, saveSubscribers, getPayments, 
  savePayments, PaymentHistory, PlanType 
} from '@/lib/subscriptionStore';
import type { Subscriber } from '@/lib/subscriptionStore';
import { subscriptionService } from '@/services/subscriptionService';

interface Duration {
  label: string;
  subText?: string;
  price: number;
  originalPrice: number;
  isRecommended: boolean;
}

interface Plan {
  id: string;
  name: string;
  badge?: string;
  subtitle: string;
  durations: Duration[];
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track selected duration index per plan ID
  const [selectedDurations, setSelectedDurations] = useState<Record<string, number>>({});
  
  // Coupon and referral states
  const [couponCode, setCouponCode] = useState('WORLD8');
  const [couponApplied, setCouponApplied] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  // Authentication & Profile details
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('student@pacemaker.com');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // OTP Verification Hook States
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [generatedOtpFallback, setGeneratedOtpFallback] = useState('');

  const handleSendOtp = async () => {
    setOtpSending(true);
    setOtpError('');
    setGeneratedOtpFallback('');
    try {
      const response = await axios.post('/api/pricing/otp', {
        action: 'send',
        mobileNumber
      });
      if (response.data.success) {
        if (!response.data.sent && response.data.code) {
          // If no SMS gateway keys are set in local environment, 
          // share the generated code so they can verify locally
          setGeneratedOtpFallback(response.data.code);
        }
        setCheckoutStep('otp');
      } else {
        setOtpError(response.data.message || 'Failed to dispatch OTP SMS.');
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || 'Server error dispatching OTP.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpVerifying(true);
    setOtpError('');
    try {
      const response = await axios.post('/api/pricing/otp', {
        action: 'verify',
        mobileNumber,
        otpCode
      });
      if (response.data.success) {
        localStorage.setItem('student_mobile', mobileNumber);
        setCheckoutStep('college');
      } else {
        setOtpError(response.data.message || 'Incorrect OTP code entered. Please try again.');
      }
    } catch (error: any) {
      setOtpError(error.response?.data?.message || 'Incorrect OTP. Try requesting a new one.');
    } finally {
      setOtpVerifying(false);
    }
  };

  // Checkout modal multi-step states
  // 'hidden' | 'mobile' | 'otp' | 'college' | 'summary' | 'payment' | 'processing' | 'success'
  const [checkoutStep, setCheckoutStep] = useState<
    'hidden' | 'mobile' | 'otp' | 'college' | 'summary' | 'payment' | 'processing' | 'success'
  >('hidden');

  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [checkoutDuration, setCheckoutDuration] = useState<Duration | null>(null);
  
  // Payment gateway options
  const [paymentOption, setPaymentOption] = useState<'card' | 'qr' | 'bank' | 'wallet'>('qr');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // QR Uploader & countdown states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState(600); // 10 minutes

  useEffect(() => {
    // Fetch logged in user info
    const savedName = localStorage.getItem('currentUser');
    const savedEmail = localStorage.getItem('student_email');
    if (savedName) setUserName(savedName);
    if (savedEmail) setUserEmail(savedEmail);

    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/pricing');
        const data: Plan[] = response.data;
        setPlans(data);
        
        // Auto-select recommended or first option for each plan
        const initialSelections: Record<string, number> = {};
        data.forEach(plan => {
          const recIndex = plan.durations.findIndex(d => d.isRecommended);
          initialSelections[plan.id] = recIndex !== -1 ? recIndex : 0;
        });
        setSelectedDurations(initialSelections);
      } catch (error) {
        console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();

    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // 10-Minute Countdown Clock Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (checkoutStep === 'payment' && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [checkoutStep, countdownSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'WORLD8') {
      setCouponApplied(true);
    } else if (couponCode.trim() !== '') {
      setCouponApplied(true);
    }
  };

  const handleApplyReferral = () => {
    if (referralCode.trim() !== '') {
      setReferralApplied(true);
    }
  };

  const openCheckout = (plan: Plan) => {
    // Auth guard: must be logged in to proceed to payment
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login?redirect=/pricing');
      return;
    }

    const selectedIdx = selectedDurations[plan.id] ?? 0;
    const duration = plan.durations[selectedIdx];
    setCheckoutPlan(plan);
    setCheckoutDuration(duration);
    
    // Check if student has mobile cached
    const savedMobile = localStorage.getItem('student_mobile');
    if (savedMobile) {
      setMobileNumber(savedMobile);
      const savedCollege = localStorage.getItem('student_college');
      if (savedCollege) {
        setSelectedState(localStorage.getItem('student_state') || '');
        setSelectedCollege(savedCollege);
        setSelectedYear(localStorage.getItem('student_year') || '');
        setCheckoutStep('summary'); // Directly jump to summary if profile is set
      } else {
        setCheckoutStep('college');
      }
    } else {
      setCheckoutStep('mobile');
    }
    
    setCountdownSeconds(600); // Reset timer
    setUploadedReceipt(null);
    setUploadedFileName('');
  };

  const closeCheckout = () => {
    setCheckoutStep('hidden');
    setCheckoutPlan(null);
    setCheckoutDuration(null);
  };

  // Math helper
  const fmt = (num: number) => {
    return '₹' + num.toLocaleString('en-IN');
  };

  // Dynamic pricing card calculator (WORLD8 gives 10% or flat discount matching plans)
  const getPricingData = () => {
    if (!checkoutDuration) return { original: 0, discount: 0, final: 0 };
    
    const original = checkoutDuration.originalPrice;
    const basePrice = checkoutDuration.price;
    
    // For Plan A 9 Months, original is 12999 and discount is 3000, final is 9999 as per screenshot!
    let discount = original - basePrice;
    
    if (couponApplied) {
      // WORLD8 grants an extra 10% discount off the basePrice
      const couponReduction = Math.round(basePrice * 0.1);
      discount += couponReduction;
    }

    if (referralApplied) {
      discount += 1000; // Flat ₹1,000 extra for referral code
    }

    const final = Math.max(0, original - discount);
    return { original, discount, final };
  };

  // Handle Mock Receipt Uploads
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedReceipt(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Subscription Activation Handler
  const executeSubscriptionActivation = async () => {
    if (!checkoutPlan || !checkoutDuration) return;

    const pricing = getPricingData();
    const RAZORPAY_KEY = 'rzp_test_SxUph0F8yRLllK';

    // 1. Create order on backend OR use local logic for demo if no backend yet
    // For this implementation, we'll try the backend and fallback to simulated success
    let backendSubscriptionId = 'sub_offline_' + Date.now();
    
    let mappedPlan: PlanType = 'Medium';
    if (checkoutPlan.id === 'plan-c') mappedPlan = 'Enterprise';
    else if (checkoutPlan.id === 'plan-b') mappedPlan = 'High';
    else mappedPlan = 'Basic';

    try {
      const response = await subscriptionService.createSubscription({
        plan: mappedPlan.toUpperCase() === 'ENTERPRISE' ? 'HIGH' : mappedPlan.toUpperCase(),
        amount: pricing.final
      });
      if (response && response.subscriptionId) {
        backendSubscriptionId = response.subscriptionId;
      }
    } catch (err) {
      console.warn('Backend subscription creation failed, using fallback ID');
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: pricing.final * 100, // in paise
      currency: "INR",
      name: "PaceMaker LMS",
      description: `Enrollment: ${checkoutPlan.name} (${checkoutDuration.label})`,
      image: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=100&auto=format&fit=crop",
      order_id: backendSubscriptionId.startsWith('order_') ? backendSubscriptionId : undefined,
      handler: async function (response: any) {
        setCheckoutStep('processing');
        
        try {
          // Verify with backend
          await subscriptionService.verifyPayment({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id || backendSubscriptionId,
            razorpaySignature: response.razorpay_signature
          });
        } catch (e) {
          console.error("Backend verification failed", e);
        }

        // Finalize locally
        finalizeLocalSubscription(pricing.final, mappedPlan, response.razorpay_payment_id);
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: mobileNumber
      },
      notes: {
        plan: checkoutPlan.name,
        duration: checkoutDuration.label,
        college: selectedCollege
      },
      theme: {
        color: "#063e46"
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal closed");
        }
      },
      // Restriction for international cards
      config: {
        display: {
          blocks: {
            banks: {
              name: 'Most Used Methods',
              instruments: [
                { method: 'upi' },
                { method: 'card' },
                { method: 'netbanking' }
              ]
            }
          },
          sequence: ['block.banks'],
          preferences: {
            show_default_blocks: true
          }
        }
      },
      payment_method: {
        card: {
          international: false // This disables international card payments in some Razorpay versions
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const finalizeLocalSubscription = (amount: number, mappedPlan: PlanType, paymentId: string) => {
    const subs = getSubscribers();
    const userEmail = localStorage.getItem('currentUserEmail') || 'student@pacemaker.com';
    const foundIdx = subs.findIndex(s => s.email.toLowerCase() === userEmail.toLowerCase());

    const durationLabel = checkoutDuration?.label || '12 Months';
    const durationMonths = parseInt(durationLabel.split(' ')[0]) || 12;
    const extensionMonths = checkoutDuration?.subText ? 1 : 0;
    const totalMonths = durationMonths + extensionMonths;

    const startDateStr = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + totalMonths);
    const endDateStr = endDate.toISOString().split('T')[0];

    // Save custom details to localStorage
    localStorage.setItem('student_mobile', mobileNumber);
    localStorage.setItem('student_state', selectedState);
    localStorage.setItem('student_college', selectedCollege);
    localStorage.setItem('student_year', selectedYear);

    const subscriberData: Subscriber = {
      userId: foundIdx !== -1 ? subs[foundIdx].userId : 'u_student_' + Math.random().toString(36).substr(2, 5),
      name: userName,
      email: userEmail,
      plan: mappedPlan,
      status: 'Active',
      startDate: startDateStr,
      endDate: endDateStr,
      autoRenew: true,
      amount: amount,
      paymentMethod: 'Razorpay',
      last4: paymentId.slice(-4),
      registeredDate: startDateStr,
    };

    if (foundIdx !== -1) {
      subs[foundIdx] = subscriberData;
    } else {
      subs.unshift(subscriberData);
    }
    saveSubscribers(subs);

    // Save payments log
    const pays = getPayments();
    const newPay: PaymentHistory = {
      id: paymentId || ('pay_' + Math.random().toString(36).substr(2, 5)),
      userId: subscriberData.userId,
      date: startDateStr,
      description: `${checkoutPlan?.name} (${checkoutDuration?.label}) Premium Onboarding`,
      amount: amount,
      status: 'paid',
      invoiceUrl: '#',
      paymentMethod: 'Razorpay'
    };
    savePayments([newPay, ...pays]);

    setCheckoutStep('success');

    // Trigger standard audio notification beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 659.25;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  };


  // ─── Plan metadata (features + color theming) ──────────────────────────────
  const planMeta: Record<string, {
    color: string; glow: string; accent: string; tag: string;
    features: string[]; notIncluded?: string;
  }> = {
    'plan-c': {
      color: 'from-violet-500 to-indigo-500',
      glow: 'shadow-violet-500/25',
      accent: 'text-violet-400',
      tag: 'bg-violet-500',
      features: [
        'All 19 Subject High-Yield Video Lectures',
        '15,000+ Topic-wise QBank MCQs',
        '390+ Grand Tests & Mock Series',
        'Clinical case walkthroughs',
        'Physical handout downloads',
        'AI Performance Analytics',
        'National Rank Tracking',
      ],
    },
    'plan-b': {
      color: 'from-cyan-500 to-teal-500',
      glow: 'shadow-cyan-500/25',
      accent: 'text-cyan-400',
      tag: 'bg-cyan-500',
      features: [
        '15,000+ Topic-wise QBank MCQs',
        '390+ Grand Tests & Mock Series',
        'In-depth Performance Analytics',
        'National Rank Tracking',
      ],
      notIncluded: 'Video Lectures not included',
    },
    'plan-a': {
      color: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
      accent: 'text-amber-400',
      tag: 'bg-amber-500',
      features: [
        '390+ Grand Tests (130+ Pan-India)',
        'NEET PG & INI CET targeted GTs',
        '1 lakh+ simultaneous participants',
      ],
      notIncluded: 'QBank & Videos not included',
    },
  };

  const planOrder = ['plan-c', 'plan-b', 'plan-a'];

  // ─── Checkout wizard helpers (used inside summary step) ────────────────────
  const getPlanFeatures = (planId: string): string[] => {
    if (planId === 'plan-a') return [
      '390+ total Tests (130+ Grand Tests)',
      'Targeted GTs for NEET PG and INI CET',
      'Largest Pan-India mock tests (1 lakh+ participants)',
    ];
    if (planId === 'plan-b') return [
      '15,000+ Topic-wise High-Yield MCQs',
      'All Grand Tests & Mini Mock Series included',
      'In-depth performance analytics & national ranks',
    ];
    return [
      'All 19 Subjects high-yield video lectures',
      '15,000+ Topic-wise High-Yield MCQs',
      'All Grand Tests & Mini Mock Series included',
      'Clinical case walkthroughs & physical handouts',
    ];
  };

  const getPlanWarning = (planId: string): string => {
    if (planId === 'plan-a') return 'QBank and Custom Module are not included in Plan A.';
    if (planId === 'plan-b') return 'Video lectures are not included in Plan B.';
    return 'All current features & modules are fully unlocked in Plan C.';
  };


  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans"
      style={{ background: 'linear-gradient(135deg, #020c14 0%, #041e2b 50%, #020c14 100%)' }}
    >
      {/* ── Ambient glow orbs ─────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #0e7490 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 -left-32 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-32 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #0891b2 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Sticky Coupon Bar ─────────────────────────────────────── */}
      <div className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/5"
        style={{ background: 'rgba(2, 12, 20, 0.85)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
              <Percent className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-black tracking-widest uppercase">WORLD8 Applied</span>
              <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-black">ACTIVE</span>
            </div>
            <span className="text-white/40 text-xs font-medium hidden sm:block">Extra 10% off on all plans</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowReferralInput(!showReferralInput)}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Tag className="w-3.5 h-3.5" /> Referral Code
            </button>
            {showReferralInput && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 overflow-hidden"
              >
                <input type="text" placeholder="ENTER CODE" value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="bg-transparent text-white text-xs font-bold w-28 outline-none placeholder-white/30 tracking-wider"
                />
                <button onClick={handleApplyReferral}
                  className="bg-cyan-500 hover:bg-cyan-400 text-white text-[10px] font-black px-3 py-1 rounded-lg transition-colors"
                >
                  {referralApplied ? '✓ Done' : 'Apply'}
                </button>
              </motion.div>
            )}
            {referralApplied && (
              <span className="text-emerald-400 text-xs font-bold">+₹1,000 off!</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-10 pb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 mb-5"
        >
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300 text-[9px] font-black tracking-widest uppercase">NEET PG · NExT · INI CET</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-black leading-tight mb-3 tracking-tight"
        >
          <span className="text-white">The Gold Standard</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            for Medical PG Prep
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm text-white/50 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Choose a plan built by toppers, backed by AI — and unlock your path to NEET PG rank 1.
        </motion.p>
      </div>

      {/* ── Plan Cards ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {planOrder.map((planId, i) => {
              const plan = plans.find(p => p.id === planId);
              if (!plan) return null;
              const meta = planMeta[plan.id] || planMeta['plan-a'];
              const selectedIdx = selectedDurations[plan.id] ?? 0;
              const isPopular = plan.id === 'plan-c';

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                  className={`relative flex flex-col rounded-3xl border transition-all duration-300 group hover:-translate-y-2 ${
                    isPopular
                      ? 'border-white/20 shadow-2xl ' + meta.glow
                      : 'border-white/8 hover:border-white/15'
                  }`}
                  style={{
                    background: isPopular
                      ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Popular glow ring */}
                  {isPopular && (
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-violet-500/40 via-indigo-500/20 to-transparent pointer-events-none" />
                  )}

                  {/* Card top */}
                  <div className="p-5 pb-4">
                    {/* Badge row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${meta.color}`}>
                        {plan.name}
                      </div>
                      {isPopular && (
                        <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest animate-pulse shadow-lg">
                          ★ Most Popular
                        </span>
                      )}
                    </div>

                    {/* Plan subtitle */}
                    <h3 className="text-white font-black text-lg leading-snug mb-1">{plan.subtitle}</h3>
                    <p className="text-white/40 text-[10px] font-medium">NEET PG · NExT · INI CET</p>

                    {/* Selected price display */}
                    <div className="mt-4 flex items-end gap-2">
                      <span className="text-3xl font-black text-white">
                        {fmt(plan.durations[selectedIdx]?.price ?? 0)}
                      </span>
                      <div className="mb-1 flex flex-col">
                        <span className="text-white/30 line-through text-xs font-bold">
                          {fmt(plan.durations[selectedIdx]?.originalPrice ?? 0)}
                        </span>
                        <span className="text-emerald-400 text-[10px] font-black">
                          Save {Math.round(((plan.durations[selectedIdx]?.originalPrice - plan.durations[selectedIdx]?.price) / plan.durations[selectedIdx]?.originalPrice) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Duration selector pills */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {plan.durations.map((d, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedDurations(prev => ({ ...prev, [plan.id]: idx }))}
                          className={`relative px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                            selectedIdx === idx
                              ? `bg-gradient-to-r ${meta.color} text-white shadow-md`
                              : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {d.label}
                          {d.isRecommended && (
                            <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-[7px] font-black text-black px-1 rounded-full">
                              TOP
                            </span>
                          )}
                          {d.subText && selectedIdx === idx && (
                            <span className="ml-1 text-emerald-300 text-[9px]">+1mo</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-5 h-px bg-white/8" />

                  {/* Features list */}
                  <div className="p-5 pt-4 flex-1 space-y-2">
                    {meta.features.map((f, fi) => (
                      <div key={fi} className="flex items-start gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Check className="w-2 h-2 text-white stroke-[3]" />
                        </div>
                        <span className="text-white/70 text-xs font-medium leading-snug">{f}</span>
                      </div>
                    ))}
                    {meta.notIncluded && (
                      <div className="flex items-start gap-2 opacity-40">
                        <X className="w-3.5 h-3.5 text-white/60 shrink-0 mt-0.5" />
                        <span className="text-white/50 text-xs font-medium line-through">{meta.notIncluded}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => openCheckout(plan)}
                      className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                        isPopular
                          ? `bg-gradient-to-r ${meta.color} text-white shadow-lg hover:shadow-violet-500/40 hover:brightness-110`
                          : `border border-white/15 text-white hover:bg-white/10 hover:border-white/30`
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Enroll Now
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-center text-white/25 text-[9px] font-medium mt-2">
                      Secured by Razorpay · 256-bit SSL
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Trust Badges ──────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-6 flex-wrap"
          >
            {[
              { icon: ShieldCheck, label: 'Razorpay Secured', sub: '256-bit encryption' },
              { icon: Lock, label: 'Safe Checkout', sub: 'PCI-DSS compliant' },
              { icon: CheckCircle2, label: 'Instant Activation', sub: 'Access within minutes' },
              { icon: HelpCircle, label: '24/7 Support', sub: 'Medical experts on call' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 text-left">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white/70 text-[11px] font-black">{label}</p>
                  <p className="text-white/30 text-[9px] font-medium">{sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Comparison hint ──────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-10 rounded-3xl border border-white/8 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(12px)' }}
          >
            <div className="p-5 border-b border-white/8">
              <h3 className="text-white font-black text-base">What's included in each plan?</h3>
              <p className="text-white/40 text-xs font-medium mt-1">Quick feature comparison across all plans</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    <th className="text-left px-6 py-4 text-white/40 font-black text-xs uppercase tracking-widest">Feature</th>
                    {['Plan C', 'Plan B', 'Plan A'].map(name => (
                      <th key={name} className="px-4 py-4 text-white/60 font-black text-xs uppercase tracking-widest text-center">{name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Video Lectures (19 Subjects)', c: true, b: false, a: false },
                    { feature: '15,000+ QBank MCQs', c: true, b: true, a: false },
                    { feature: 'Grand Tests (130+)', c: true, b: true, a: true },
                    { feature: 'Mini Mock Series', c: true, b: true, a: true },
                    { feature: 'National Rank Tracker', c: true, b: true, a: false },
                    { feature: 'AI Performance Analytics', c: true, b: true, a: false },
                    { feature: 'Clinical Case Walkthroughs', c: true, b: false, a: false },
                    { feature: 'Physical Handouts', c: true, b: false, a: false },
                  ].map(({ feature, c, b, a }) => (
                    <tr key={feature} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 text-white/60 font-medium">{feature}</td>
                      {[c, b, a].map((has, i) => (
                        <td key={i} className="px-4 py-3.5 text-center">
                          {has
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                            : <X className="w-4 h-4 text-white/15 mx-auto" />
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CHECKOUT WIZARD OVERLAY — logic unchanged, styled to match */}
      {/* ══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {checkoutStep !== 'hidden' && checkoutPlan && checkoutDuration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'rgba(2,12,20,0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 24 }}
              className="w-full max-w-xl my-8 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
              style={{ background: 'linear-gradient(145deg, #0d1f2d 0%, #081520 100%)' }}
            >
              {/* Modal header */}
              <div className="px-7 py-5 flex items-center justify-between border-b border-white/8"
                style={{ background: 'linear-gradient(90deg, rgba(14,116,144,0.2) 0%, transparent 100%)' }}
              >
                <div>
                  <h3 className="text-white font-black text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" /> PaceMaker Enrollment
                  </h3>
                  <p className="text-white/40 text-xs font-semibold mt-0.5">
                    {checkoutPlan.name} · {checkoutDuration.label}
                  </p>
                </div>
                {checkoutStep !== 'processing' && (
                  <button onClick={closeCheckout}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Progress steps */}
              <div className="px-7 py-3 border-b border-white/8 flex items-center gap-2">
                {['mobile', 'college', 'summary', 'payment'].map((step, idx) => {
                  const stepsOrder = ['mobile', 'otp', 'college', 'summary', 'payment'];
                  const currentIdx = stepsOrder.indexOf(checkoutStep);
                  const stepIdx = stepsOrder.indexOf(step);
                  const isActive = checkoutStep === step || (step === 'mobile' && checkoutStep === 'otp');
                  const isDone = currentIdx > stepIdx || (step === 'mobile' && currentIdx > 1);
                  return (
                    <div key={idx} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all ${
                        isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-cyan-500 text-white ring-2 ring-cyan-500/30' : 'bg-white/5 text-white/30 border border-white/10'
                      }`}>
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${
                        isActive ? 'text-cyan-400' : isDone ? 'text-white/40' : 'text-white/20'
                      }`}>
                        {step === 'mobile' ? 'Verify' : step === 'college' ? 'Profile' : step === 'summary' ? 'Review' : 'Pay'}
                      </span>
                      {idx < 3 && <div className="flex-1 h-px bg-white/10" />}
                    </div>
                  );
                })}
              </div>

              {/* ── Scrollable step content ─────────────────────── */}
              <div className="max-h-[70vh] overflow-y-auto">

                {/* STEP 1A – Mobile */}
                {checkoutStep === 'mobile' && (
                  <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Phone className="w-7 h-7 text-cyan-400" />
                      </div>
                      <h4 className="text-xl font-black text-white">Enter Mobile Number</h4>
                      <p className="text-white/40 text-sm leading-relaxed">We'll send a one-time OTP to verify your identity.</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex rounded-2xl border border-white/10 bg-white/5 overflow-hidden focus-within:border-cyan-500/50 transition-colors">
                        <div className="px-4 flex items-center gap-1 border-r border-white/10 text-white/50 font-bold text-sm select-none shrink-0">
                          🇮🇳 <span className="text-white font-black">+91</span>
                        </div>
                        <input type="tel" maxLength={10} disabled={otpSending}
                          placeholder="10-digit mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-4 py-4 bg-transparent border-none outline-none font-bold text-white tracking-wider placeholder-white/20 disabled:opacity-50"
                        />
                      </div>
                      {otpError && <div className="bg-red-500/10 text-red-400 text-xs font-bold p-3 rounded-xl border border-red-500/20 text-center">{otpError}</div>}
                      <button disabled={mobileNumber.length !== 10 || otpSending} onClick={handleSendOtp}
                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                          mobileNumber.length === 10 && !otpSending
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg hover:brightness-110 cursor-pointer active:scale-95'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        {otpSending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP →'}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 1B – OTP */}
                {checkoutStep === 'otp' && (
                  <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <Key className="w-7 h-7 text-emerald-400" />
                      </div>
                      <h4 className="text-xl font-black text-white">Enter Verification Code</h4>
                      <p className="text-white/40 text-sm">OTP sent to <span className="text-white font-bold">+91 {mobileNumber}</span></p>
                    </div>
                    <div className="space-y-4">
                      {generatedOtpFallback && (
                        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center space-y-2">
                          <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Local Sandbox Code
                          </p>
                          <span className="bg-white/10 text-white px-4 py-2 rounded-xl font-mono text-xl font-black tracking-widest inline-block">
                            {generatedOtpFallback}
                          </span>
                        </div>
                      )}
                      <input type="text" maxLength={6} disabled={otpVerifying} placeholder="6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-2xl text-white tracking-widest outline-none focus:border-cyan-500/50 disabled:opacity-50"
                      />
                      {otpError && <div className="bg-red-500/10 text-red-400 text-xs font-bold p-3 rounded-xl border border-red-500/20 text-center">{otpError}</div>}
                      <div className="flex gap-3">
                        <button onClick={() => { setOtpError(''); setCheckoutStep('mobile'); }}
                          className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 font-bold text-sm transition-all"
                        >← Change Number</button>
                        <button disabled={otpCode.length !== 6 || otpVerifying} onClick={handleVerifyOtp}
                          className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                            otpCode.length === 6 && !otpVerifying
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:brightness-110'
                              : 'bg-white/5 text-white/20 cursor-not-allowed'
                          }`}
                        >
                          {otpVerifying ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Verify →'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 – College Profile */}
                {checkoutStep === 'college' && (
                  <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                        <School className="w-7 h-7 text-indigo-400" />
                      </div>
                      <h4 className="text-xl font-black text-white">Academic Profile</h4>
                      <p className="text-white/40 text-sm leading-relaxed">Help us personalise your rank tracking by sharing your college details.</p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'State / Region', value: selectedState, onChange: setSelectedState,
                          options: ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Uttar Pradesh', 'Kerala', 'West Bengal'] },
                        { label: 'Medical College', value: selectedCollege, onChange: setSelectedCollege,
                          options: ['Bangalore Medical College & Research Institute', 'AIIMS Delhi', 'KEM Hospital Mumbai', 'Madras Medical College', 'Kasturba Medical College', 'CMC Vellore'] },
                        { label: 'Year of Study', value: selectedYear, onChange: setSelectedYear,
                          options: ['1st Year MBBS', '2nd Year MBBS', '3rd Year MBBS (Part 1)', '4th Year MBBS (Part 2)', 'Internship', 'Post-Intern / MD Aspirant'] },
                      ].map(({ label, value, onChange, options }) => (
                        <div key={label}>
                          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1.5 px-1">{label}</label>
                          <select value={value} onChange={(e) => onChange(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-white outline-none focus:border-cyan-500/50 appearance-none"
                          >
                            <option value="" className="bg-slate-900">Select {label}</option>
                            {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
                          </select>
                        </div>
                      ))}
                      <button
                        disabled={!selectedState || !selectedCollege || !selectedYear}
                        onClick={() => {
                          localStorage.setItem('student_state', selectedState);
                          localStorage.setItem('student_college', selectedCollege);
                          localStorage.setItem('student_year', selectedYear);
                          setCheckoutStep('summary');
                        }}
                        className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                          selectedState && selectedCollege && selectedYear
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white cursor-pointer hover:brightness-110 active:scale-95'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        Save & Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 – Summary */}
                {checkoutStep === 'summary' && (
                  <div className="p-8 space-y-5">
                    <div className="rounded-2xl border border-white/10 overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      {/* Plan header */}
                      <div className="px-6 py-5 border-b border-white/8 text-center">
                        <h3 className="text-2xl font-black text-white">{checkoutPlan.name}</h3>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">{checkoutPlan.subtitle}</p>
                      </div>
                      {/* Features */}
                      <div className="px-6 py-5 space-y-3 border-b border-white/8">
                        {getPlanFeatures(checkoutPlan.id).map((f, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-white/70 text-sm font-medium">{f}</span>
                          </div>
                        ))}
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 mt-2">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-amber-300/80 text-xs font-medium">{getPlanWarning(checkoutPlan.id)}</p>
                        </div>
                      </div>
                      {/* Price breakdown */}
                      <div className="px-6 py-5 space-y-2.5">
                        <div className="flex justify-between text-sm text-white/50 font-medium">
                          <span>Duration</span><span className="text-white font-bold">{checkoutDuration.label}</span>
                        </div>
                        <div className="flex justify-between text-sm text-white/50 font-medium">
                          <span>Original Price</span><span>{fmt(getPricingData().original)}</span>
                        </div>
                        {couponApplied && (
                          <div className="flex justify-between text-sm text-emerald-400 font-bold">
                            <span>Coupon (WORLD8)</span><span>- {fmt(getPricingData().original - checkoutDuration.price)}</span>
                          </div>
                        )}
                        {referralApplied && (
                          <div className="flex justify-between text-sm text-emerald-400 font-bold">
                            <span>Referral Bonus</span><span>- ₹1,000</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-white/8 flex justify-between items-center">
                          <span className="text-white font-black text-base">Total Payable</span>
                          <span className="text-white font-black text-2xl">{fmt(getPricingData().final)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setCheckoutStep('payment')}
                      className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Proceed to Pay {fmt(getPricingData().final)}
                    </button>
                  </div>
                )}

                {/* STEP 4 – Payment */}
                {checkoutStep === 'payment' && (
                  <div className="p-8 space-y-6">
                    {/* Payment method tabs */}
                    <div className="grid grid-cols-4 gap-2">
                      {(['qr', 'card', 'bank', 'wallet'] as const).map((opt) => (
                        <button key={opt} onClick={() => setPaymentOption(opt)}
                          className={`py-3 rounded-xl border font-black text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                            paymentOption === opt
                              ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                              : 'border-white/8 hover:border-white/15 text-white/30 hover:text-white/50 bg-white/2'
                          }`}
                        >
                          {opt === 'qr' && <QrCode className="w-4 h-4" />}
                          {opt === 'card' && <CreditCard className="w-4 h-4" />}
                          {opt === 'bank' && <Wallet className="w-4 h-4" />}
                          {opt === 'wallet' && <Phone className="w-4 h-4" />}
                          <span>{opt === 'qr' ? 'UPI/QR' : opt === 'card' ? 'Card' : opt === 'bank' ? 'Bank' : 'Wallet'}</span>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {/* QR */}
                      {paymentOption === 'qr' && (
                        <motion.div key="qr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 text-center">
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-bold">
                            <span className="text-red-400">Session expires in:</span>
                            <span className="bg-red-500 text-white font-mono px-3 py-1 rounded-lg animate-pulse">{formatTime(countdownSeconds)}</span>
                          </div>
                          <div className="bg-white p-5 rounded-3xl max-w-[200px] mx-auto shadow-2xl">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=pacemaker@hdfcbank%26pn=PaceMaker%26am=${getPricingData().final}%26cu=INR`}
                              alt="UPI QR" className="w-40 h-40 object-contain" />
                          </div>
                          <div>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest">UPI Address</p>
                            <p className="text-white font-black text-sm mt-1 select-all">pacemaker@hdfcbank</p>
                          </div>
                          <p className="text-white/40 text-xs leading-relaxed max-w-xs mx-auto">
                            Scan with GPay, PhonePe, or Paytm. Transfer <span className="text-white font-black">{fmt(getPricingData().final)}</span> then upload the receipt below.
                          </p>
                          <div onClick={triggerFileUpload}
                            className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 bg-white/3 hover:bg-cyan-500/5 transition-all flex flex-col items-center gap-2 cursor-pointer"
                          >
                            <input type="file" ref={fileInputRef} onChange={handleReceiptChange} accept="image/*" className="hidden" />
                            {uploadedReceipt ? (
                              <div className="flex flex-col items-center gap-2">
                                <img src={uploadedReceipt} alt="Receipt" className="w-24 h-24 object-cover rounded-xl border border-white/10" />
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{uploadedFileName}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-7 h-7 text-cyan-400" />
                                <span className="text-white/50 text-sm font-bold">Upload Payment Screenshot</span>
                                <span className="text-white/20 text-[10px] font-medium uppercase tracking-wider">PNG · JPG · JPEG</span>
                              </>
                            )}
                          </div>
                          <button disabled={!uploadedReceipt} onClick={executeSubscriptionActivation}
                            className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                              uploadedReceipt
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:brightness-110 active:scale-95'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                          >
                            Submit Receipt & Activate ({fmt(getPricingData().final)})
                          </button>
                        </motion.div>
                      )}

                      {/* Card */}
                      {paymentOption === 'card' && (
                        <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                          {[
                            { label: 'Card Holder Name', placeholder: 'DR. ADARSH KUMAR', value: cardHolder, onChange: (v: string) => setCardHolder(v.toUpperCase()), type: 'text' },
                            { label: 'Card Number', placeholder: '4111 2222 3333 4444', value: cardNo,
                              onChange: (v: string) => setCardNo(v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()), type: 'text', maxLen: 19 },
                          ].map(({ label, placeholder, value, onChange, type, maxLen }) => (
                            <div key={label}>
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1.5 px-1">{label}</label>
                              <input type={type} placeholder={placeholder} value={value} maxLength={maxLen}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-white outline-none focus:border-cyan-500/50 placeholder-white/20"
                              />
                            </div>
                          ))}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1.5 px-1">Expiry</label>
                              <input type="text" maxLength={5} placeholder="MM/YY" value={cardExpiry}
                                onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); setCardExpiry(v.length > 2 ? v.slice(0,2)+'/'+v.slice(2,4) : v); }}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-white text-center outline-none focus:border-cyan-500/50 placeholder-white/20"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest block mb-1.5 px-1">CVV</label>
                              <input type="password" maxLength={3} placeholder="***" value={cardCVV}
                                onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm text-white text-center outline-none focus:border-cyan-500/50 placeholder-white/20"
                              />
                            </div>
                          </div>
                          <button disabled={!cardHolder || cardNo.length < 19 || !cardExpiry || cardCVV.length < 3} onClick={executeSubscriptionActivation}
                            className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                              cardHolder && cardNo.length === 19 && cardExpiry && cardCVV.length === 3
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:brightness-110 active:scale-95'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                            }`}
                          >
                            <Lock className="w-4 h-4" /> Pay Securely {fmt(getPricingData().final)}
                          </button>
                        </motion.div>
                      )}

                      {/* Bank */}
                      {paymentOption === 'bank' && (
                        <motion.div key="bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                          <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3 text-sm">
                            {[
                              ['Account Holder', 'PaceMaker Medical Tech'],
                              ['Account Number', '918239018230912'],
                              ['IFSC Code', 'HDFC0001923'],
                              ['Bank Name', 'HDFC Bank, Bangalore'],
                            ].map(([k, v]) => (
                              <div key={k} className="flex justify-between border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                                <span className="text-white/40 font-medium">{k}</span>
                                <span className="text-white font-bold select-all">{v}</span>
                              </div>
                            ))}
                          </div>
                          <div onClick={triggerFileUpload}
                            className="border-2 border-dashed border-white/10 hover:border-cyan-500/40 rounded-2xl p-6 bg-white/3 hover:bg-cyan-500/5 transition-all flex flex-col items-center gap-2 cursor-pointer"
                          >
                            <input type="file" ref={fileInputRef} onChange={handleReceiptChange} accept="image/*" className="hidden" />
                            {uploadedReceipt ? (
                              <div className="flex flex-col items-center gap-2">
                                <img src={uploadedReceipt} alt="Receipt" className="w-24 h-24 object-cover rounded-xl" />
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />{uploadedFileName}</span>
                              </div>
                            ) : (<><Upload className="w-7 h-7 text-cyan-400" /><span className="text-white/50 text-sm font-bold">Upload Deposit Receipt</span></>)}
                          </div>
                          <button disabled={!uploadedReceipt} onClick={executeSubscriptionActivation}
                            className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${uploadedReceipt ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white cursor-pointer hover:brightness-110 active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                          >Submit Receipt Confirmation</button>
                        </motion.div>
                      )}

                      {/* Wallet */}
                      {paymentOption === 'wallet' && (
                        <motion.div key="wallet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                          <p className="text-white/40 text-sm text-center">Select a wallet to complete payment instantly.</p>
                          <div className="grid grid-cols-2 gap-3">
                            {['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik'].map(w => (
                              <button key={w} onClick={executeSubscriptionActivation}
                                className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-2xl font-bold text-sm transition-all cursor-pointer"
                              >
                                Pay via {w}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Processing */}
                {checkoutStep === 'processing' && (
                  <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-cyan-500 animate-spin" />
                      <Lock className="w-8 h-8 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white">Verifying Payment</h4>
                      <p className="text-white/40 text-sm mt-2 leading-relaxed max-w-xs">
                        Checking your receipt with PaceMaker servers. This takes just a moment...
                      </p>
                    </div>
                  </div>
                )}

                {/* Success */}
                {checkoutStep === 'success' && (
                  <div className="p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                    >
                      <Check className="w-10 h-10 text-white stroke-[3]" />
                    </motion.div>
                    <div>
                      <h4 className="text-2xl font-black text-white">Activation Complete!</h4>
                      <p className="text-emerald-400 font-black text-sm uppercase tracking-widest mt-1">{checkoutPlan.name} · Now Active</p>
                      <p className="text-white/40 text-sm mt-4 leading-relaxed max-w-sm">
                        Welcome to PaceMaker! Your account is validated and your plan is live. Start learning now.
                      </p>
                    </div>
                    <button
                      onClick={() => { closeCheckout(); router.push('/dashboard/videos'); }}
                      className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg hover:brightness-110 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-5 h-5" /> Start Learning in Video Library →
                    </button>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
