import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Role } from '../../types';
import { FocusTrap } from '../common/FocusTrap';
import { 
  validateEmailClient, 
  validateEgyptianPhoneClient, 
  validatePasswordClient 
} from '../../utils/validation';
import { 
  ShieldCheck, 
  User, 
  Store, 
  Scale, 
  Lock, 
  LogIn, 
  UserPlus, 
  X, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Mail,
  Phone,
  ArrowRight,
  Building2,
  FileCheck,
  Sparkles,
  MapPin,
  HelpCircle,
  Clock,
  ShieldAlert,
  Apple,
  Chrome
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    login, 
    register, 
    registerSeller, 
    verifyEmail,
    resendVerificationCode,
    changeVerificationEmail,
    socialLogin,
    switchPersona, 
    logout, 
    isLoading,
    authModalInitialTab,
    setAuthModalInitialTab,
    sessionExpiredNotice,
    clearSessionExpiredNotice,
    pendingDestination
  } = useMarketplace();

  const [tab, setTab] = useState<'login' | 'register' | 'register_seller' | 'verify_email'>('login');
  const [socialFlow, setSocialFlow] = useState<'none' | 'google' | 'apple'>('none');
  const [customSocialEmail, setCustomSocialEmail] = useState('');

  // Email Ownership Verification State
  const [verifyEmailAddress, setVerifyEmailAddress] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyDevOtp, setVerifyDevOtp] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccessMsg, setVerifySuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // In-place email change during verification
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [changeEmailError, setChangeEmailError] = useState<string | null>(null);

  // Multi-step Login Progressive Flow: 'identifier' -> 'password' -> 'authenticating'
  const [loginStep, setLoginStep] = useState<'identifier' | 'password'>('identifier');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Customer Registration Flow: Account -> Basic Info -> Verification
  const [customerStep, setCustomerStep] = useState<'account' | 'details' | 'confirm'>('account');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custFullName, setCustFullName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custError, setCustError] = useState<string | null>(null);

  // Seller Registration Progressive Pipeline:
  // Step 1: Account (email, password, phone, personal name)
  // Step 2: Business (Trade name, category, district)
  // Step 3: KYC (Commercial reg, Tax ID, National ID)
  // Step 4: Store (Store title, owner name)
  // Step 5: Review & Submit
  const [sellerStep, setSellerStep] = useState<'account' | 'business' | 'kyc' | 'store' | 'review'>('account');
  const [sellerFullName, setSellerFullName] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerPassword, setSellerPassword] = useState('');
  const [sellerStoreName, setSellerStoreName] = useState('');
  const [sellerTradeName, setSellerTradeName] = useState('');
  const [sellerDistrict, setSellerDistrict] = useState('حي وسط، شارع الجيش وميدان العارف بالله');
  const [sellerCategory, setSellerCategory] = useState('أقمشة ومنسوجات دسوقية');
  const [sellerCR, setSellerCR] = useState('');
  const [sellerTaxId, setSellerTaxId] = useState('');
  const [sellerNationalId, setSellerNationalId] = useState('');
  const [sellerError, setSellerError] = useState<string | null>(null);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Sync initial tab from Context
  useEffect(() => {
    if (isOpen) {
      if (sessionExpiredNotice) {
        setTab('login');
        setLoginStep('password');
      } else if (authModalInitialTab) {
        setTab(authModalInitialTab);
      }
    }
  }, [isOpen, authModalInitialTab, sessionExpiredNotice]);

  if (!isOpen) return null;

  // Google & Apple Social Login Handlers
  const handleDirectGoogleLogin = async (targetEmail: string) => {
    setLoginError(null);
    clearSessionExpiredNotice();
    const success = await socialLogin({
      provider: 'google',
      email: targetEmail,
      fullName: targetEmail.toLowerCase() === 'justokayp@gmail.com' 
        ? 'مدير عام منصة سوق دسوق (justokayp)' 
        : 'مستخدم Google المعتمد',
    });
    if (success) {
      setSocialFlow('none');
      onClose();
    } else {
      setLoginError('تعذر إتمام تسجيل الدخول بحساب Google');
    }
  };

  const handleDirectAppleLogin = async (targetEmail?: string) => {
    setLoginError(null);
    clearSessionExpiredNotice();
    const email = targetEmail || 'justokayp@icloud.com';
    const success = await socialLogin({
      provider: 'apple',
      email,
      fullName: email.toLowerCase().includes('justokayp') 
        ? 'justokayp (Apple Account)' 
        : 'مستخدم Apple المعتمد',
    });
    if (success) {
      setSocialFlow('none');
      onClose();
    } else {
      setLoginError('تعذر إتمام تسجيل الدخول بحساب Apple');
    }
  };

  // Progressive Login Step Handlers
  const handleProceedToPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleaned = loginIdentifier.trim();
    if (!cleaned) {
      setLoginError('يرجى كتابة البريد الإلكتروني أو رقم الهاتف أولاً');
      return;
    }
    setLoginStep('password');
  };

  const handleCompleteLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginPassword) {
      setLoginError('يرجى إدخال كلمة المرور');
      return;
    }
    const result = await login(loginIdentifier.trim(), loginPassword, pendingDestination || undefined);
    if (result.success) {
      clearSessionExpiredNotice();
      onClose();
    } else if (result.requireVerification) {
      setVerifyEmailAddress(result.email || loginIdentifier.trim());
      setVerifyCode('');
      setVerifyError('يرجى تأكيد بريدك الإلكتروني أولاً لاستكمال الدخول إلى حسابك');
      setResendCooldown(60);
      setTab('verify_email');
    } else {
      setLoginError(result.error || 'بيانات الدخول غير صحيحة، يرجى التأكد وإعادة المحاولة');
    }
  };

  // Customer Step Handlers
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustError(null);
    if (customerStep === 'account') {
      const emailVal = validateEmailClient(custEmail);
      if (!emailVal.valid) {
        setCustError(emailVal.error!);
        return;
      }
      const pwdVal = validatePasswordClient(custPassword);
      if (!pwdVal.valid) {
        setCustError(pwdVal.error!);
        return;
      }
      setCustomerStep('details');
      return;
    }

    if (customerStep === 'details') {
      if (!custFullName.trim()) {
        setCustError('يرجى إدخال الاسم الثلاثي بالكامل');
        return;
      }
      const phoneVal = validateEgyptianPhoneClient(custPhone);
      if (!phoneVal.valid) {
        setCustError(phoneVal.error!);
        return;
      }
      setCustomerStep('confirm');
      return;
    }

    // Step confirm -> submit
    const regRes = await register({
      fullName: custFullName.trim(),
      email: custEmail.trim(),
      phone: custPhone.trim(),
      password: custPassword,
      role: 'customer'
    });

    if (regRes.success) {
      if (regRes.requireVerification) {
        setVerifyEmailAddress(regRes.email || custEmail.trim());
        setVerifyDevOtp(regRes.devVerificationCode || null);
        setVerifyCode('');
        setVerifyError(null);
        setResendCooldown(60);
        setTab('verify_email');
      } else {
        clearSessionExpiredNotice();
        onClose();
      }
    } else {
      setCustError(regRes.error || 'فشل تسجيل الحساب، البريد أو الهاتف مسجل بالفعل');
    }
  };

  // Seller Onboarding Submission
  const handleSellerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellerError(null);

    const emailVal = validateEmailClient(sellerEmail);
    if (!emailVal.valid) {
      setSellerError(emailVal.error!);
      setSellerStep('account');
      return;
    }
    const phoneVal = validateEgyptianPhoneClient(sellerPhone);
    if (!phoneVal.valid) {
      setSellerError(phoneVal.error!);
      setSellerStep('account');
      return;
    }
    const pwdVal = validatePasswordClient(sellerPassword);
    if (!pwdVal.valid) {
      setSellerError(pwdVal.error!);
      setSellerStep('account');
      return;
    }

    const regRes = await registerSeller({
      fullName: sellerFullName.trim(),
      email: sellerEmail.trim(),
      phone: sellerPhone.trim(),
      password: sellerPassword,
      storeName: sellerStoreName.trim() || `متجر ${sellerFullName.trim()}`,
      tradeName: sellerTradeName.trim() || sellerStoreName.trim(),
      ownerName: sellerFullName.trim(),
      desoqDistrict: sellerDistrict,
      businessCategory: sellerCategory,
      commercialRecordNumber: sellerCR.trim(),
      taxRegistrationNumber: sellerTaxId.trim(),
      nationalIdNumber: sellerNationalId.trim()
    });

    if (regRes.success) {
      if (regRes.requireVerification) {
        setVerifyEmailAddress(regRes.email || sellerEmail.trim());
        setVerifyDevOtp(regRes.devVerificationCode || null);
        setVerifyCode('');
        setVerifyError(null);
        setResendCooldown(60);
        setTab('verify_email');
      } else {
        clearSessionExpiredNotice();
        onClose();
      }
    } else {
      setSellerError(regRes.error || 'فشل تسجيل حساب التاجر، يرجى التأكد من البيانات والمحاولة مجدداً');
    }
  };

  // Email Verification OTP Handlers
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);
    const cleanedCode = verifyCode.trim();
    if (!cleanedCode || cleanedCode.length !== 6 || !/^\d{6}$/.test(cleanedCode)) {
      setVerifyError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsVerifying(true);
    const res = await verifyEmail(verifyEmailAddress, cleanedCode);
    setIsVerifying(false);

    if (res.success) {
      clearSessionExpiredNotice();
      onClose();
    } else {
      setVerifyError(res.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setVerifyError(null);
    const res = await resendVerificationCode(verifyEmailAddress);
    setIsResending(false);

    if (res.success) {
      setResendCooldown(60);
      if (res.devVerificationCode) {
        setVerifyDevOtp(res.devVerificationCode);
      }
      setVerifySuccessMsg(res.message || 'تم إرسال رمز تحقق جديد بنجاح');
      setTimeout(() => setVerifySuccessMsg(null), 5000);
    } else {
      if (res.remainingSeconds) {
        setResendCooldown(res.remainingSeconds);
      }
      setVerifyError(res.error || 'تعذر إعادة إرسال الرمز');
    }
  };

  const handleChangeEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeEmailError(null);
    const val = validateEmailClient(newEmailInput);
    if (!val.valid) {
      setChangeEmailError(val.error!);
      return;
    }

    const res = await changeVerificationEmail(verifyEmailAddress, newEmailInput.trim().toLowerCase());
    if (res.success && res.email) {
      setVerifyEmailAddress(res.email);
      setIsChangingEmail(false);
      setNewEmailInput('');
      setVerifyCode('');
      setResendCooldown(60);
      if (res.devVerificationCode) {
        setVerifyDevOtp(res.devVerificationCode);
      }
      setVerifySuccessMsg('تم تحديث البريد الإلكتروني وإرسال رمز تحقق جديد');
      setTimeout(() => setVerifySuccessMsg(null), 5000);
    } else {
      setChangeEmailError(res.error || 'فشل تحديث البريد الإلكتروني');
    }
  };

  return (
    <FocusTrap 
      isActive={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800020] via-[#590016] to-[#1A1A1A] text-white p-5 sm:p-6 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 text-stone-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl border border-[#D4AF37]/40 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg sm:text-xl font-bold font-serif flex items-center gap-2">
                <span>سوق دسوق — بوابة الهوية والمصادقة</span>
                <span className="text-[10px] bg-[#D4AF37] text-[#800020] font-black px-2 py-0.5 rounded-full">
                  RBAC آمن
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                تسجيل آمن خاضع لرقابة الخادم مع حماية كاملة لعملياتك وسلة مشترياتك
              </p>
            </div>
          </div>

          {/* Session Expiration Graceful Banner */}
          {sessionExpiredNotice && (
            <div className="mt-3 bg-amber-500/20 border border-amber-400/40 rounded-xl p-3 flex items-center gap-3 text-amber-200 text-xs font-medium animate-pulse">
              <Clock className="w-5 h-5 text-amber-300 shrink-0" />
              <div className="flex-1">
                <span className="font-bold block text-white">تنبيه انتهاء الجلسة</span>
                <span>{sessionExpiredNotice} تم حفظ سلتك وخياراتك الحالية بأمان.</span>
              </div>
            </div>
          )}

          {/* Current Authenticated User Pill */}
          {user && (
            <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/15 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#800020] font-black flex items-center justify-center text-sm shadow">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-2 text-white">
                    {user.fullName}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-xs text-stone-300 font-mono">{user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs px-3 py-1.5 bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 rounded-lg border border-rose-500/30 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          )}

          {/* Primary Navigation Tabs */}
          {tab === 'verify_email' ? (
            <div className="flex items-center justify-between mt-4 bg-white/10 rounded-xl p-2.5 text-xs border border-white/10">
              <span className="font-bold flex items-center gap-2 text-amber-300">
                <Mail className="w-4 h-4 text-amber-300" />
                <span>خطوة التحقق من البريد الإلكتروني (رمز OTP)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setLoginStep('identifier');
                }}
                className="text-stone-300 hover:text-white underline text-[11px] font-medium cursor-pointer"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4">
              <button
                type="button"
                id="tab-btn-login"
                onClick={() => { setTab('login'); setAuthModalInitialTab('login'); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all text-center ${
                  tab === 'login'
                    ? 'bg-[#FAF6EE] text-[#800020] shadow-md'
                    : 'bg-white/10 text-stone-300 hover:bg-white/15'
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                type="button"
                id="tab-btn-register"
                onClick={() => { setTab('register'); setAuthModalInitialTab('register'); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all text-center ${
                  tab === 'register'
                    ? 'bg-[#FAF6EE] text-[#800020] shadow-md'
                    : 'bg-white/10 text-stone-300 hover:bg-white/15'
                }`}
              >
                حساب مشتري جديد
              </button>
              <button
                type="button"
                id="tab-btn-register-seller"
                onClick={() => { setTab('register_seller'); setAuthModalInitialTab('register_seller'); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all text-center ${
                  tab === 'register_seller'
                    ? 'bg-[#FAF6EE] text-[#800020] shadow-md'
                    : 'bg-white/10 text-stone-300 hover:bg-white/15'
                }`}
              >
                تسجيل تاجر 🏪
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 max-h-[75vh] overflow-y-auto">

          {/* TAB: LOGIN WITH GOOGLE, APPLE & CREDENTIALS */}
          {tab === 'login' && (
            <div className="max-w-md mx-auto py-2">
              
              {/* Social Login Buttons: Google & Apple */}
              <div className="mb-5 space-y-2.5">
                <div className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                  تسجيل الدخول السريع:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Google Login Button */}
                  <button
                    type="button"
                    id="btn-google-auth"
                    onClick={() => setSocialFlow(socialFlow === 'google' ? 'none' : 'google')}
                    className="w-full py-2.5 px-3 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-100 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Chrome className="w-4 h-4 text-[#4285F4] shrink-0" />
                    <span>متابعة بحساب Google</span>
                  </button>

                  {/* Apple Login Button */}
                  <button
                    type="button"
                    id="btn-apple-auth"
                    onClick={() => setSocialFlow(socialFlow === 'apple' ? 'none' : 'apple')}
                    className="w-full py-2.5 px-3 bg-black dark:bg-zinc-950 border border-black dark:border-zinc-700 hover:bg-stone-900 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Apple className="w-4 h-4 text-white shrink-0" />
                    <span>متابعة بـ Apple ID</span>
                  </button>
                </div>

                {/* Google Account Selector Dialog */}
                {socialFlow === 'google' && (
                  <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-2.5 transition-all text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Chrome className="w-4 h-4 text-[#4285F4]" />
                        <span>اختيار حساب Google للمتابعة:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSocialFlow('none')}
                        className="text-stone-400 hover:text-stone-600 text-xs"
                      >
                        إلغاء
                      </button>
                    </div>

                    {/* Primary Admin Choice: justokayp@gmail.com */}
                    <div
                      onClick={() => handleDirectGoogleLogin('justokayp@gmail.com')}
                      className="p-2.5 bg-white dark:bg-zinc-800 border-2 border-[#D4AF37] rounded-lg cursor-pointer hover:bg-amber-50/50 dark:hover:bg-zinc-700/60 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 font-bold flex items-center justify-center text-xs">
                          👑
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span>justokayp@gmail.com</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 rounded font-bold">
                              حساب الأدمن
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500">مدير عام منصة سوق دسوق المركزي</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#800020] dark:text-[#D4AF37]">
                        دخول فوري ←
                      </span>
                    </div>

                    {/* Custom Google Account Input */}
                    <div className="pt-1 border-t border-blue-100 dark:border-blue-900/30">
                      <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                        أو تسجيل الدخول بحساب Google آخر:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="email"
                          placeholder="your-name@gmail.com"
                          value={customSocialEmail}
                          onChange={(e) => setCustomSocialEmail(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-lg text-stone-900 dark:text-stone-100"
                        />
                        <button
                          type="button"
                          disabled={!customSocialEmail.trim() || isLoading}
                          onClick={() => handleDirectGoogleLogin(customSocialEmail.trim())}
                          className="px-3 py-1.5 bg-[#4285F4] hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-lg text-xs"
                        >
                          متابعة
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Apple Account Selector Dialog */}
                {socialFlow === 'apple' && (
                  <div className="p-3.5 bg-stone-100 dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl space-y-2.5 transition-all text-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <Apple className="w-4 h-4" />
                        <span>المصادقة عبر Apple ID:</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSocialFlow('none')}
                        className="text-stone-400 hover:text-stone-600 text-xs"
                      >
                        إلغاء
                      </button>
                    </div>

                    <div
                      onClick={() => handleDirectAppleLogin('justokayp@icloud.com')}
                      className="p-2.5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                          <Apple className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 dark:text-stone-100">justokayp@icloud.com</div>
                          <div className="text-[11px] text-stone-500">حساب Apple المعتمد</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        متابعة ←
                      </span>
                    </div>

                    <div className="pt-1 border-t border-stone-200 dark:border-zinc-700">
                      <label className="block text-[11px] text-stone-600 dark:text-stone-400 mb-1">
                        أو إدخال Apple ID آخر:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="email"
                          placeholder="example@icloud.com"
                          value={customSocialEmail}
                          onChange={(e) => setCustomSocialEmail(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-lg text-stone-900 dark:text-stone-100"
                        />
                        <button
                          type="button"
                          disabled={!customSocialEmail.trim() || isLoading}
                          onClick={() => handleDirectAppleLogin(customSocialEmail.trim())}
                          className="px-3 py-1.5 bg-black hover:bg-stone-800 disabled:opacity-50 text-white font-bold rounded-lg text-xs"
                        >
                          متابعة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-stone-200 dark:border-zinc-700 w-full" />
                <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-stone-500 font-medium whitespace-nowrap">
                  أو باستخدام البريد الإلكتروني / كلمة المرور
                </span>
              </div>

              {/* Root Admin Shortcut Badge */}
              <div
                onClick={() => {
                  setLoginIdentifier('justokayp@gmail.com');
                  setLoginPassword('Admin@2026!');
                  setLoginStep('password');
                }}
                className="mb-4 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <div>
                    <div className="font-bold text-amber-950 dark:text-amber-200">حساب الأدمن المثبت: justokayp@gmail.com</div>
                    <div className="text-[10px] text-amber-800 dark:text-amber-300">انقر هنا لتعبئة البيانات والدخول كمسؤول النظام</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-[#800020] text-white px-2 py-1 rounded-lg">
                  اختيار
                </span>
              </div>

              {/* Stepper indicator */}
              <div className="flex items-center justify-between mb-4 border-b border-stone-100 dark:border-zinc-800 pb-2">
                <div className={`flex items-center gap-2 text-xs font-bold ${loginStep === 'identifier' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-emerald-600'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
                  <span>معرّف الحساب</span>
                </div>
                <div className="h-0.5 w-12 bg-stone-200 dark:bg-zinc-700" />
                <div className={`flex items-center gap-2 text-xs font-bold ${loginStep === 'password' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-stone-400'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
                  <span>كلمة المرور والأمان</span>
                </div>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginStep === 'identifier' ? (
                <form onSubmit={handleProceedToPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      البريد الإلكتروني أو رقم الهاتف المسجل
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="customer@souqdesoq.eg أو 01012345678"
                        className="w-full pl-3 pr-10 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] focus:border-[#800020] text-stone-900 dark:text-stone-100"
                        autoFocus
                      />
                      <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      يدعم البريد الإلكتروني أو رقم الهاتف المصري المكون من 11 رقماً
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>المتابعة إلى كلمة المرور</span>
                    <ArrowRight className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteLogin} className="space-y-4">
                  <div className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-zinc-800/80 rounded-xl border border-stone-200 dark:border-zinc-700">
                    <div className="text-xs">
                      <span className="text-stone-500 block text-[10px]">تسجيل الدخول كـ:</span>
                      <span className="font-bold text-stone-800 dark:text-stone-200">{loginIdentifier}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLoginStep('identifier')}
                      className="text-xs text-[#800020] dark:text-[#D4AF37] hover:underline font-medium"
                    >
                      تغيير
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-10 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] focus:border-[#800020] text-stone-900 dark:text-stone-100"
                        autoFocus
                      />
                      <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div className="bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2">
                    <KeyRound className="w-4 h-4 text-[#800020] dark:text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>
                      جلسة مشفرة: بعد المصادقة الناجحة ستتم إعادتك مباشرة إلى وجهتك المقصودة دون فقدان تقدمك.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    {isLoading ? 'جاري التحقق والاتصال...' : 'تسجيل الدخول والوصول'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER REGISTRATION (Account -> Basic information -> Verification) */}
          {tab === 'register' && (
            <div className="max-w-md mx-auto py-2">
              <div className="flex items-center justify-between mb-5 border-b border-stone-100 dark:border-zinc-800 pb-3 text-xs">
                <div className={`font-bold flex items-center gap-1.5 ${customerStep === 'account' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-emerald-600'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">1</span>
                  <span>بيانات الحساب</span>
                </div>
                <div className="h-0.5 w-8 bg-stone-200 dark:bg-zinc-700" />
                <div className={`font-bold flex items-center gap-1.5 ${customerStep === 'details' ? 'text-[#800020] dark:text-[#D4AF37]' : customerStep === 'confirm' ? 'text-emerald-600' : 'text-stone-400'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">2</span>
                  <span>الاسم والتواصل</span>
                </div>
                <div className="h-0.5 w-8 bg-stone-200 dark:bg-zinc-700" />
                <div className={`font-bold flex items-center gap-1.5 ${customerStep === 'confirm' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-stone-400'}`}>
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px]">3</span>
                  <span>التأكيد والتفعيل</span>
                </div>
              </div>

              {custError && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{custError}</span>
                </div>
              )}

              {/* 1-Click Social Sign-Up */}
              {customerStep === 'account' && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    إنشاء حساب فوري بضغطة واحدة:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      id="btn-register-google"
                      onClick={() => handleDirectGoogleLogin('justokayp@gmail.com')}
                      className="w-full py-2 px-3 bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-700 text-stone-800 dark:text-stone-100 font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <Chrome className="w-4 h-4 text-[#4285F4] shrink-0" />
                      <span>التسجيل بحساب Google</span>
                    </button>
                    <button
                      type="button"
                      id="btn-register-apple"
                      onClick={() => handleDirectAppleLogin('justokayp@icloud.com')}
                      className="w-full py-2 px-3 bg-black dark:bg-zinc-950 border border-black hover:bg-stone-900 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                    >
                      <Apple className="w-4 h-4 text-white shrink-0" />
                      <span>التسجيل بـ Apple ID</span>
                    </button>
                  </div>
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-stone-200 dark:border-zinc-700 w-full" />
                    <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-stone-500 font-medium whitespace-nowrap">
                      أو التسجيل اليدوي
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                {customerStep === 'account' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        required
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="user@example.eg"
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] text-stone-900 dark:text-stone-100"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        كلمة المرور (6 خانات على الأقل)
                      </label>
                      <input
                        type="password"
                        required
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                    >
                      <span>المتابعة للمعلومات الشخصية</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </>
                )}

                {customerStep === 'details' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        الاسم الثلاثي بالكامل
                      </label>
                      <input
                        type="text"
                        required
                        value={custFullName}
                        onChange={(e) => setCustFullName(e.target.value)}
                        placeholder="أحمد محمود النجار"
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] text-stone-900 dark:text-stone-100"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        رقم الهاتف للتوصيل والتواصل
                      </label>
                      <input
                        type="tel"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="01012345678"
                        className="w-full px-3 py-2.5 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] text-stone-900 dark:text-stone-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomerStep('account')}
                        className="w-1/3 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs"
                      >
                        السابق
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>مراجعة الحساب</span>
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>
                  </>
                )}

                {customerStep === 'confirm' && (
                  <div className="space-y-4">
                    <div className="bg-stone-50 dark:bg-zinc-800/70 p-4 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-500">الاسم:</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100">{custFullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">البريد الإلكتروني:</span>
                        <span className="font-mono text-stone-900 dark:text-stone-100">{custEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">رقم الهاتف:</span>
                        <span className="font-mono text-stone-900 dark:text-stone-100">{custPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">نوع الحساب:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">مشتري دسوقي موثق</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomerStep('details')}
                        className="w-1/3 py-3 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs"
                      >
                        تعديل
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-2/3 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <UserPlus className="w-4 h-4" />
                        {isLoading ? 'جاري التسجيل...' : 'تأكيد وإنشاء الحساب'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 4: SELLER MULTI-STAGE ONBOARDING (Account -> Business -> KYC -> Store -> Review) */}
          {tab === 'register_seller' && (
            <div className="space-y-4">
              {/* Onboarding Stage Stepper */}
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-800 pb-3 text-[11px] overflow-x-auto gap-2">
                <div className={`font-bold shrink-0 flex items-center gap-1 ${sellerStep === 'account' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-emerald-600'}`}>
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">1</span>
                  <span>1. الحساب</span>
                </div>
                <span className="text-stone-300">←</span>
                <div className={`font-bold shrink-0 flex items-center gap-1 ${sellerStep === 'business' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-stone-500'}`}>
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">2</span>
                  <span>2. النشاط التجاري</span>
                </div>
                <span className="text-stone-300">←</span>
                <div className={`font-bold shrink-0 flex items-center gap-1 ${sellerStep === 'kyc' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-stone-500'}`}>
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">3</span>
                  <span>3. التوثيق (KYC)</span>
                </div>
                <span className="text-stone-300">←</span>
                <div className={`font-bold shrink-0 flex items-center gap-1 ${sellerStep === 'store' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-stone-500'}`}>
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">4</span>
                  <span>4. المتجر</span>
                </div>
                <span className="text-stone-300">←</span>
                <div className={`font-bold shrink-0 flex items-center gap-1 ${sellerStep === 'review' ? 'text-[#800020] dark:text-[#D4AF37]' : 'text-stone-500'}`}>
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px]">5</span>
                  <span>5. المراجعة</span>
                </div>
              </div>

              {sellerError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sellerError}</span>
                </div>
              )}

              {/* STEP 1: ACCOUNT */}
              {sellerStep === 'account' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>بيانات المسؤول والمالك القانوني للمتجر</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        اسم صاحب العمل / التاجر
                      </label>
                      <input
                        type="text"
                        required
                        value={sellerFullName}
                        onChange={(e) => setSellerFullName(e.target.value)}
                        placeholder="محمود إبراهيم الدسوقي"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        رقم هاتف التواصل والواتساب
                      </label>
                      <input
                        type="tel"
                        required
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        placeholder="01098765432"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        البريد الإلكتروني المهني
                      </label>
                      <input
                        type="email"
                        required
                        value={sellerEmail}
                        onChange={(e) => setSellerEmail(e.target.value)}
                        placeholder="merchant@souqdesoq.eg"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        كلمة مرور الدخول للبوابة
                      </label>
                      <input
                        type="password"
                        required
                        value={sellerPassword}
                        onChange={(e) => setSellerPassword(e.target.value)}
                        placeholder="اختر كلمة مرور آمنة"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!sellerFullName || !sellerEmail || !sellerPhone || !sellerPassword) {
                        setSellerError('يرجى ملء كافة بيانات الحساب أولاً');
                        return;
                      }
                      setSellerError(null);
                      setSellerStep('business');
                    }}
                    className="w-full py-2.5 mt-2 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow"
                  >
                    <span>المتابعة إلى بيانات النشاط التجاري</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              )}

              {/* STEP 2: BUSINESS */}
              {sellerStep === 'business' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>بيانات النشاط التجاري والموقع بدسوق</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        التصنيف الرئيسي للبضائع
                      </label>
                      <select
                        value={sellerCategory}
                        onChange={(e) => setSellerCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="أقمشة ومنسوجات دسوقية">أقمشة ومنسوجات دسوقية</option>
                        <option value="أزياء وعبايات حريمي ورجالي">أزياء وعبايات حريمي ورجالي</option>
                        <option value="عطور وساعات وإكسسوارات">عطور وساعات وإكسسوارات</option>
                        <option value="أحذية ومصنوعات جلدية">أحذية ومصنوعات جلدية</option>
                        <option value="منتجات ريفية وغذائية أصيلة">منتجات ريفية وغذائية أصيلة</option>
                        <option value="فضيات وهدايا">فضيات وهدايا تذكارية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        الحي / المنطقة داخل مدينة دسوق
                      </label>
                      <select
                        value={sellerDistrict}
                        onChange={(e) => setSellerDistrict(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      >
                        <option value="حي وسط، شارع الجيش وميدان العارف بالله">حي وسط، شارع الجيش وميدان العارف بالله</option>
                        <option value="حي دحروج وشارع الجمهورية">حي دحروج وشارع الجمهورية</option>
                        <option value="حي الكشلة ومنطقة المحطة">حي الكشلة ومنطقة المحطة</option>
                        <option value="حي الصفا وشارع الشركات">حي الصفا وشارع الشركات</option>
                        <option value="حي مكة ومنطقة الاستاد الرياضي">حي مكة ومنطقة الاستاد الرياضي</option>
                        <option value="شارع سعد زغلول والمنطقة التجارية">شارع سعد زغلول والمنطقة التجارية</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setSellerStep('account')}
                      className="w-1/3 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs"
                    >
                      السابق
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerStep('kyc')}
                      className="w-2/3 py-2.5 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>المتابعة إلى وثائق التحقق (KYC)</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: KYC */}
              {sellerStep === 'kyc' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>التوثيق الرسمي وقانون التجارة الإلكترونية (KYC)</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    يلتزم سوق دسوق بمعايير وزارة التجارة والصناعة لحماية حقوق المشترين والتجار.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        رقم السجل التجاري (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={sellerCR}
                        onChange={(e) => setSellerCR(e.target.value)}
                        placeholder="CR-198422"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                        رقم البطاقة الضريبية
                      </label>
                      <input
                        type="text"
                        value={sellerTaxId}
                        onChange={(e) => setSellerTaxId(e.target.value)}
                        placeholder="TR-582910"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      الرقم القومي للتاجر المسؤول (14 رقماً)
                    </label>
                    <input
                      type="text"
                      value={sellerNationalId}
                      onChange={(e) => setSellerNationalId(e.target.value)}
                      placeholder="29001011501234"
                      maxLength={14}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl font-mono"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setSellerStep('business')}
                      className="w-1/3 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs"
                    >
                      السابق
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerStep('store')}
                      className="w-2/3 py-2.5 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>المتابعة إلى هوية المتجر</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: STORE */}
              {sellerStep === 'store' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#800020] dark:text-[#D4AF37]" />
                    <span>اسم وهوية متجرك أمام الزبائن</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      اسم المتجر الظاهر للمشترين
                    </label>
                    <input
                      type="text"
                      required
                      value={sellerStoreName}
                      onChange={(e) => setSellerStoreName(e.target.value)}
                      placeholder="مثال: منسوجات الدلتا الفاخرة"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      الاسم التجاري أو اللافتة
                    </label>
                    <input
                      type="text"
                      value={sellerTradeName}
                      onChange={(e) => setSellerTradeName(e.target.value)}
                      placeholder="شركة الدلتا للأقمشة وتجارة القطن"
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-stone-300 dark:border-zinc-700 rounded-xl"
                    />
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => setSellerStep('kyc')}
                      className="w-1/3 py-2.5 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs"
                    >
                      السابق
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!sellerStoreName) {
                          setSellerError('يرجى تحديد اسم المتجر');
                          return;
                        }
                        setSellerError(null);
                        setSellerStep('review');
                      }}
                      className="w-2/3 py-2.5 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>المتابعة إلى مراجعة الملف</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & FINAL SUBMISSION */}
              {sellerStep === 'review' && (
                <form onSubmit={handleSellerSubmit} className="space-y-4">
                  <div className="bg-stone-50 dark:bg-zinc-800/80 p-4 rounded-xl border border-stone-200 dark:border-zinc-700 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-stone-200 dark:border-zinc-700 pb-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">ملف تسجيل المتجر الجديد</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">جاهز للإطلاق</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-stone-500">اسم المتجر:</span> <strong className="block text-stone-800 dark:text-stone-200">{sellerStoreName}</strong></div>
                      <div><span className="text-stone-500">المالك:</span> <strong className="block text-stone-800 dark:text-stone-200">{sellerFullName}</strong></div>
                      <div><span className="text-stone-500">النشاط:</span> <span className="block">{sellerCategory}</span></div>
                      <div><span className="text-stone-500">الموقع:</span> <span className="block">{sellerDistrict}</span></div>
                      <div><span className="text-stone-500">الهاتف:</span> <span className="block font-mono">{sellerPhone}</span></div>
                      <div><span className="text-stone-500">البريد:</span> <span className="block font-mono">{sellerEmail}</span></div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-stone-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>بالضغط على إنشاء، سيتم توثيق متجرك فوراً وفتح لوحة تحكم التاجر لإضافة المنتجات واستقبال المبيعات.</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSellerStep('store')}
                      className="w-1/3 py-3 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold rounded-xl text-xs"
                    >
                      تعديل
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-2/3 py-3 bg-[#800020] hover:bg-[#66001A] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Store className="w-4 h-4 text-[#D4AF37]" />
                      {isLoading ? 'جاري تفعيل المتجر...' : 'اعتماد وتسجيل المتجر الآن'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB: EMAIL OWNERSHIP VERIFICATION (OTP Verification) */}
          {tab === 'verify_email' && (
            <div className="max-w-md mx-auto py-2">
              {/* Header Icon & Title */}
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-2.5 border border-amber-200 dark:border-amber-800/60 shadow-inner">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-serif">
                  تأكيد ملكية البريد الإلكتروني
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  أدخل رمز التحقق المكون من 6 أرقام لتفعيل حسابك وضمان أمان معاملاتك في سوق دسوق ومنع الحسابات الوهمية
                </p>
              </div>

              {/* Target Email Card with in-place change option */}
              <div className="bg-stone-50 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 rounded-xl p-3 mb-4">
                {!isChangingEmail ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-zinc-700 flex items-center justify-center text-stone-600 dark:text-stone-300">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-500">البريد المرسل إليه الرمز:</div>
                        <div className="text-xs font-mono font-bold text-stone-900 dark:text-stone-100 dir-ltr text-right">
                          {verifyEmailAddress}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingEmail(true);
                        setNewEmailInput(verifyEmailAddress);
                        setChangeEmailError(null);
                      }}
                      className="text-[11px] text-[#800020] dark:text-[#D4AF37] hover:underline font-bold px-2 py-1 rounded bg-stone-100 dark:bg-zinc-700 cursor-pointer"
                    >
                      تعديل البريد
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleChangeEmailSubmit} className="space-y-2">
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      تعديل البريد الإلكتروني للحساب:
                    </div>
                    <input
                      type="email"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      placeholder="أدخل بريدك الحقيقي الصحيح"
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-stone-300 dark:border-zinc-700 rounded-lg text-stone-900 dark:text-stone-100"
                      autoFocus
                    />
                    {changeEmailError && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        {changeEmailError}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-3 py-1.5 bg-[#800020] hover:bg-[#66001A] text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        حفظ وإرسال رمز جديد
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsChangingEmail(false)}
                        className="px-3 py-1.5 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-lg cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Dev / Quick-Test OTP Callout */}
              {verifyDevOtp && (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      رمز التحقق السريع: <strong className="font-mono text-sm tracking-widest text-[#800020] dark:text-[#D4AF37] font-bold mx-1">{verifyDevOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyCode(verifyDevOtp);
                      setVerifyError(null);
                    }}
                    className="text-[11px] bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 text-amber-900 dark:text-amber-100 font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    تعبئة تلقائية
                  </button>
                </div>
              )}

              {/* Error or Success Feedback */}
              {verifyError && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {verifySuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{verifySuccessMsg}</span>
                </div>
              )}

              {/* Verification Code Input Form */}
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 text-center">
                    رمز التحقق المكون من 6 أرقام (OTP)
                  </label>
                  
                  <div className="flex justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verifyCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerifyCode(val);
                        if (verifyError) setVerifyError(null);
                      }}
                      placeholder="••••••"
                      className="w-60 text-center text-2xl font-mono font-bold tracking-[0.4em] py-3 bg-stone-50 dark:bg-zinc-800 border-2 border-stone-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#800020] focus:border-[#800020] text-stone-900 dark:text-stone-100 shadow-inner"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 text-center mt-2">
                    الرمز صالح لمدة 10 دقائق من تاريخ الإرسال
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || verifyCode.trim().length !== 6}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isVerifying ? 'جاري التحقق وتفعيل الحساب...' : 'تأكيد الحساب والدخول'}
                </button>

                {/* Resend Code Section with Cooldown */}
                <div className="pt-3 border-t border-stone-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-stone-500">لم يصلك الرمز؟</span>
                  {resendCooldown > 0 ? (
                    <span className="text-stone-400 font-mono text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      إعادة الإرسال بعد {resendCooldown} ثانية
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendCode}
                      className="text-[#800020] dark:text-[#D4AF37] hover:underline font-bold text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                    </button>
                  )}
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setLoginStep('identifier');
                    }}
                    className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs hover:underline cursor-pointer"
                  >
                    الرجوع إلى شاشة تسجيل الدخول
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-stone-50 dark:bg-zinc-950 border-t border-stone-200 dark:border-zinc-800 px-6 py-3 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#800020] dark:text-[#D4AF37]" />
            <span>جلسة موثقة بالخادم: لن تفقد عملية الشراء أو سلتك عند تجديد الجلسة</span>
          </div>
          <span className="font-mono text-[10px]">JWT HMAC-SHA256 • SOUQ DESOQ</span>
        </div>

      </div>
    </FocusTrap>
  );
};
