/**
 * Client-side Real Email and Egyptian Phone Number Validation
 */

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  '10minutemail.org',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'crazymailing.com',
  'nada.ltd',
  'getnada.com',
  'inboxkitten.com',
  'burnermail.io',
  'mohmal.com',
  'tempmailo.com',
  'emailondeck.com',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'maildrop.cc',
  'mytemp.email',
  'generator.email',
  'fakemailgenerator.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
  'klzlv.com',
  'dropmail.me',
  'tempail.com',
  'abcvg.com',
  'zetmail.com',
  'boximail.com',
  'proton-temp.com',
  'mailforspam.com',
  'getairmail.com',
  'harakirimail.com',
  'mytempemail.com',
  'tempr.email',
  'discard.email',
  'discardmail.com',
  'spambog.com',
  'mintemail.com',
]);

const DUMMY_DOMAINS = new Set([
  'test.com',
  'test.org',
  'test.net',
  'example.com',
  'example.org',
  'example.net',
  'fake.com',
  'dummy.com',
  'sample.com',
  'invalid.com',
  'localhost',
  'foo.com',
  'bar.com',
  'asdf.com',
  'none.com',
]);

const BLOCKED_PREFIXES = new Set([
  'test',
  'testing',
  'fake',
  'dummy',
  'sample',
  'asdf',
  'qwerty',
  '123',
  '1234',
  '12345',
  '1111',
  'aaaa',
  'none',
  'noone',
  'noreply',
  'no-reply',
  'dontreply',
]);

export interface ValidationCheck {
  valid: boolean;
  error?: string;
}

export function validateEmailClient(rawEmail: string): ValidationCheck {
  if (!rawEmail || !rawEmail.trim()) {
    return { valid: false, error: 'يرجى إدخال البريد الإلكتروني' };
  }

  const email = rawEmail.trim().toLowerCase();

  if (email.length < 5 || email.length > 254) {
    return { valid: false, error: 'طول البريد الإلكتروني غير صالح (بين 5 و 254 حرفاً)' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'صيغة البريد الإلكتروني غير صحيحة (يجب أن يحتوي على علامة @ واحدة)' };
  }

  const [localPart, domainPart] = parts;
  if (!localPart || localPart.length > 64) {
    return { valid: false, error: 'اسم البريد غير صالح (بين 1 و 64 حرفاً)' };
  }

  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(localPart)) {
    return { valid: false, error: 'يحتوي اسم البريد على رموز غير مسموح بها' };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { valid: false, error: 'صيغة البريد غير صحيحة (لا يمكن أن تبدأ بنقطة أو نقاط متتالية)' };
  }

  if (!domainPart || domainPart.length > 253) {
    return { valid: false, error: 'نطاق البريد الإلكتروني غير صالح' };
  }

  const domainLabels = domainPart.split('.');
  if (domainLabels.length < 2) {
    return { valid: false, error: 'يجب أن يحتوي النطاق على امتداد صحيح (مثل .com أو .eg)' };
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return { valid: false, error: 'امتداد نطاق البريد غير صالح' };
  }

  if (DISPOSABLE_EMAIL_DOMAINS.has(domainPart)) {
    return { 
      valid: false, 
      error: 'لا يُسمح باستخدام خدمات البريد المؤقت أو الوهمي لحماية أمان الحساب' 
    };
  }

  if (DUMMY_DOMAINS.has(domainPart)) {
    return { 
      valid: false, 
      error: 'البريد الإلكتروني تجريبي أو وهمي. يرجى إدخال بريدك الحقيقي لاستلام رمز التحقق والفواتير' 
    };
  }

  if (BLOCKED_PREFIXES.has(localPart) && (domainPart === 'gmail.com' || domainPart === 'yahoo.com' || domainPart === 'hotmail.com' || domainPart === 'outlook.com')) {
    return {
      valid: false,
      error: 'يرجى إدخال بريدك الحقيقي وعدم استخدام أسماء تجريبية أو وهمية'
    };
  }

  return { valid: true };
}

export function validateEgyptianPhoneClient(rawPhone: string): ValidationCheck {
  if (!rawPhone || !rawPhone.trim()) {
    return { valid: false, error: 'يرجى إدخال رقم الهاتف' };
  }

  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+20')) cleaned = '0' + cleaned.substring(3);
  else if (cleaned.startsWith('0020')) cleaned = '0' + cleaned.substring(4);
  else if (cleaned.startsWith('20') && cleaned.length === 12) cleaned = '0' + cleaned.substring(2);

  const egMobileRegex = /^01[0125][0-9]{8}$/;
  if (!egMobileRegex.test(cleaned)) {
    return { 
      valid: false, 
      error: 'رقم الهاتف يجب أن يكون رقم جوال مصري صحيح مكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015' 
    };
  }

  const last8 = cleaned.substring(3);
  if (/^(\d)\1{7}$/.test(last8)) {
    return { 
      valid: false, 
      error: 'رقم الهاتف وهمي. يرجى إدخال رقمك الحقيقي لمتابعة الشحن والتوصيل' 
    };
  }

  return { valid: true };
}

export function validatePasswordClient(pwd: string): ValidationCheck {
  if (!pwd) {
    return { valid: false, error: 'يرجى إدخال كلمة المرور' };
  }
  if (pwd.length < 8) {
    return { valid: false, error: 'يجب ألا تقل كلمة المرور عن 8 أحرف لضمان أمان حسابك' };
  }
  return { valid: true };
}
