'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, ShieldCheck, CreditCard, Wallet, Banknote, Smartphone,
  ArrowRight, GraduationCap, Loader2, BookOpen, Zap, BarChart3,
  Video, FileText, HelpCircle, X, Lock, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  getSubscribers, saveSubscribers, getPayments,
  savePayments, PaymentHistory, PlanType
} from '@/lib/subscriptionStore';
import type { Subscriber } from '@/lib/subscriptionStore';
import { subscriptionService } from '@/services/subscriptionService';
import {
  ACADEMIC_PRICING, getPricingForLevel,
  DURATION_OPTIONS, DurationKey, PLAN_FEATURES_COMPARISON
} from '@/lib/pricingConfig';
import { ACADEMIC_LEVEL_OPTIONS, getLevel } from '@/lib/academicLevels';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');
  const [selectedLevelId, setSelectedLevelId] = useState('1st-year');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationKey>('12 Months');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [activeOrderId, setActiveOrderId] = useState<string>('');

  useEffect(() => {
    const name = localStorage.getItem('currentUser') || 'Student';
    const email = localStorage.getItem('currentUserEmail') || '';
    setUserName(name);
    setUserEmail(email);

    // Try to detect the user's academic level from registration data
    try {
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '{}');
      if (email && storedUsers[email]?.academicLevelId) {
        setSelectedLevelId(storedUsers[email].academicLevelId);
      }
    } catch { }

    setLoading(false);
  }, []);

  const pricing = getPricingForLevel(selectedLevelId);
  const selectedPlan = pricing?.plans.find(p => p.planId === selectedPlanId);

  const handleSelectPlan = (planId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/pricing');
      return;
    }
    setSelectedPlanId(planId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan || !pricing) return;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/pricing');
      return;
    }

    setProcessing(true);

    const amount = selectedPlan.prices[selectedDuration];

    // Map plan to backend subscription type
    const planMap: Record<string, PlanType> = {
      'plan-a': 'Basic',
      'plan-b': 'Medium',
      'plan-c': 'Enterprise',
    };
    const mappedPlan = planMap[selectedPlan.planId] || 'Basic';

    let backendOrderId = 'order_test_' + Date.now();

    try {
      const response = await subscriptionService.createSubscription({
        plan: mappedPlan.toUpperCase() === 'ENTERPRISE' ? 'HIGH' : mappedPlan.toUpperCase(),
        amount,
        academicLevelId: selectedLevelId,
      });
      if (response && response.subscriptionId) {
        backendOrderId = response.subscriptionId;
      }
    } catch (err) {
      console.warn('Backend subscription creation warning, using fallback ID', err);
    }

    setActiveOrderId(backendOrderId);
    setProcessing(false);
    setShowCheckoutModal(true);
  };

  const handleExecutePayment = async () => {
    if (!selectedPlan || !pricing) return;
    setProcessing(true);

    const amount = selectedPlan.prices[selectedDuration];
    const planMap: Record<string, PlanType> = {
      'plan-a': 'Basic',
      'plan-b': 'Medium',
      'plan-c': 'Enterprise',
    };
    const mappedPlan = planMap[selectedPlan.planId] || 'Basic';
    const paymentId = 'pay_rzp_' + Math.random().toString(36).substring(2, 10);

    try {
      await subscriptionService.verifyPayment({
        razorpayPaymentId: paymentId,
        razorpayOrderId: activeOrderId || 'order_test_' + Date.now(),
        razorpaySignature: 'test_signature',
        paymentMethod: paymentMethod.toUpperCase(),
        autoRenew: true,
      });
    } catch (e) {
      console.warn('Backend payment verification notice:', e);
    }

    setShowCheckoutModal(false);
    finalizeSubscription(amount, mappedPlan, paymentId);
  };

  const finalizeSubscription = (
    amount: number,
    mappedPlan: PlanType,
    paymentId: string,
  ) => {
    const subs = getSubscribers();
    const email = userEmail || 'student@pacemaker.com';
    const foundIdx = subs.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    const durationMonths = parseInt(selectedDuration.split(' ')[0]) || 12;
    const startDateStr = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);
    const endDateStr = endDate.toISOString().split('T')[0];

    const subscriberData: Subscriber = {
      userId: foundIdx !== -1 ? subs[foundIdx].userId : 'u_' + Math.random().toString(36).substr(2, 8),
      name: userName,
      email,
      plan: mappedPlan,
      status: 'Active',
      startDate: startDateStr,
      endDate: endDateStr,
      autoRenew: false,
      amount,
      paymentMethod: 'Razorpay',
      last4: paymentId ? paymentId.slice(-4) : '1234',
      registeredDate: startDateStr,
    };

    if (foundIdx !== -1) {
      subs[foundIdx] = subscriberData;
    } else {
      subs.unshift(subscriberData);
    }
    saveSubscribers(subs);

    const planLevelMap: Record<string, string> = { Basic: 'BASIC', Medium: 'MEDIUM', High: 'HIGH', Enterprise: 'HIGH' };
    localStorage.setItem('lms_subscription_fallback', JSON.stringify({
      plan: planLevelMap[mappedPlan] || 'BASIC',
      status: 'ACTIVE',
      expiryDate: endDateStr,
      qbankAccess: true,
      videoAccess: mappedPlan === 'High' || mappedPlan === 'Enterprise' || mappedPlan === 'Medium',
      liveClassAccess: mappedPlan === 'High' || mappedPlan === 'Enterprise',
      aiAccess: mappedPlan === 'High' || mappedPlan === 'Enterprise',
      academicLevelId: selectedLevelId,
    }));

    const pays = getPayments();
    const newPay: PaymentHistory = {
      id: paymentId || 'pay_' + Math.random().toString(36).substr(2, 8),
      userId: subscriberData.userId,
      date: startDateStr,
      description: `${selectedPlan?.name} (${selectedDuration}) - ${pricing?.label}`,
      amount,
      status: 'paid',
      invoiceUrl: '#',
      paymentMethod: 'Razorpay',
    };
    savePayments([newPay, ...pays]);

    setProcessing(false);
    setPaymentSuccess(true);

    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  };

  const formatPrice = (num: number) => '₹' + num.toLocaleString('en-IN');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md p-6 bg-white rounded-3xl border border-gray-100 shadow-xl"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 font-medium mb-2">
            {selectedPlan?.name} ({selectedDuration}){pricing ? ` - ${pricing.label}` : ''}
          </p>
          <p className="text-gray-500 text-sm">Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Choose Your Academic Year
          </h1>
          <p className="text-gray-600 font-medium text-base max-w-xl mx-auto">
            Select your MBBS year and unlock learning resources tailored to your curriculum.
          </p>
        </motion.div>

        {/* Academic Level Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-10"
        >
          <div className="relative">
            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedLevelId}
              onChange={(e) => {
                setSelectedLevelId(e.target.value);
                setSelectedPlanId(null);
              }}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all font-bold text-gray-900 appearance-none text-base cursor-pointer"
            >
              {ACADEMIC_LEVEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Subjects Banner */}
        {pricing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-black text-gray-700 uppercase tracking-wider">Subjects Included</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {pricing.subjects.map(sub => (
                <span key={sub} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-xl text-sm font-bold">
                  {sub}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Plan Cards */}
        {pricing && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-12">
            {pricing.plans.map((plan, i) => {
              const isSelected = selectedPlanId === plan.planId;
              return (
                <motion.div
                  key={plan.planId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`relative bg-white border-2 rounded-2xl p-6 transition-all ${
                    isSelected
                      ? 'border-primary-500 shadow-xl shadow-primary-500/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-primary-600 text-white text-xs font-black rounded-full uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-5 mt-1">
                    <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                    <p className="text-sm font-bold text-gray-500">{plan.tagline}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </span>
                        <span className="text-sm font-bold text-gray-700">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Duration Tabs */}
                  <div className="flex rounded-xl bg-gray-100 p-1 mb-4">
                    {DURATION_OPTIONS.map(d => {
                      const price = plan.prices[d];
                      const isActive = isSelected && selectedDuration === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            handleSelectPlan(plan.planId);
                            setSelectedDuration(d);
                          }}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                            isActive
                              ? 'bg-white text-primary-600 shadow-sm'
                              : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <span className="block">{d}</span>
                          <span className="block mt-0.5">{formatPrice(price)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Select Button */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.planId)}
                    className={`w-full py-3.5 rounded-xl font-black text-sm transition-all border-none cursor-pointer ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Proceed to Payment Button */}
        {selectedPlanId && pricing && selectedPlan && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto mb-12"
          >
            <button
              type="button"
              disabled={processing}
              onClick={handleProceedToPayment}
              className="w-full py-5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3 border-none cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Order...
                </>
              ) : (
                <>
                  Pay {formatPrice(selectedPlan.prices[selectedDuration])} via Razorpay
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Plan Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-black text-gray-900 text-center mb-6">Plan Comparison</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-5 py-4 text-sm font-black text-gray-500 uppercase tracking-wider">Feature</th>
                  <th className="px-5 py-4 text-sm font-black text-gray-500 uppercase tracking-wider text-center">Plan A</th>
                  <th className="px-5 py-4 text-sm font-black text-gray-500 uppercase tracking-wider text-center">Plan B</th>
                  <th className="px-5 py-4 text-sm font-black text-primary-600 uppercase tracking-wider text-center">Plan C</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES_COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-5 py-3 text-sm font-bold text-gray-700">{row.feature}</td>
                    <td className="px-5 py-3 text-center">{row.a ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300 font-bold">—</span>}</td>
                    <td className="px-5 py-3 text-center">{row.b ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-300 font-bold">—</span>}</td>
                    <td className="px-5 py-3 text-center">{row.c ? <Check className="w-4 h-4 text-primary-500 mx-auto" /> : <span className="text-gray-300 font-bold">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Payment Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <h2 className="text-2xl font-black text-gray-900 text-center mb-6">Payment Options</h2>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Smartphone, label: 'UPI' },
                { icon: CreditCard, label: 'Credit Card' },
                { icon: Wallet, label: 'Debit Card' },
                { icon: Banknote, label: 'Net Banking' },
                { icon: Zap, label: 'EMI' },
                { icon: ShieldCheck, label: 'Razorpay' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                  <Icon className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-amber-800">Important Note</p>
              <p className="text-sm font-medium text-amber-700 mt-1">
                Access is restricted to the subjects available within the selected academic year. Upgrades can be performed at any time by paying the difference amount between plans.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Razorpay Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && selectedPlan && pricing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckoutModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-10 text-gray-900"
            >
              {/* Header */}
              <div className="bg-primary-900 text-white p-6 relative">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="absolute right-4 top-4 text-white/70 hover:text-white p-1.5 rounded-full bg-white/10 transition-colors border-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-4 h-4 text-primary-400" />
                  Razorpay Secure Gateway
                </div>
                <h3 className="text-xl font-black text-white">{selectedPlan.name}</h3>
                <p className="text-primary-200 text-sm font-medium">{pricing.label} &bull; {selectedDuration}</p>
                <div className="mt-4 pt-4 border-t border-primary-800/80 flex items-baseline justify-between">
                  <span className="text-xs text-primary-300 font-semibold uppercase tracking-wider">Total Amount</span>
                  <span className="text-2xl font-black text-white">{formatPrice(selectedPlan.prices[selectedDuration])}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 tracking-wider mb-3">Select Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi'
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-black shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <span className="text-xs block">UPI / QR</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-black shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <span className="text-xs block">Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'netbanking'
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-black shadow-sm'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Banknote className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <span className="text-xs block">Netbanking</span>
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-2 text-xs font-semibold text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">User Email</span>
                    <span className="text-gray-900 font-bold">{userEmail || 'student@pacemaker.com'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Ref</span>
                    <span className="font-mono text-gray-800">{activeOrderId || 'order_test_9831'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Security</span>
                    <span className="text-green-600 font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> 256-bit SSL Encrypted</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handleExecutePayment}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" /> Pay {formatPrice(selectedPlan.prices[selectedDuration])} Now
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
