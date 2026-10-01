/**
 * Anti-Abuse, Real Email Verification & Phone Number Validator
 * Enforces strict RFC compliance, blocks disposable/temporary email services,
 * blocks fake/dummy emails, and verifies legitimate Egyptian phone numbers.
 */

// Comprehensive blocklist of disposable, temporary, and spam email domains
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

// Dummy, placeholder, and test domains
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

// Blocked dummy/fake email prefixes
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

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedEmail?: string;
  normalizedPhone?: string;
}

/**
 * Validates an email address against RFC standards, security rules,
 * disposable domain blocklists, and fake patterns.
 */
export function validateEmail(rawEmail: string): ValidationResult {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return { valid: false, error: 'البريد الإلكتروني مطلوب' };
  }

  const email = rawEmail.trim().toLowerCase();

  // 1. Length validation (RFC 5321: max 254 characters)
  if (email.length < 5 || email.length > 254) {
    return { valid: false, error: 'طول البريد الإلكتروني غير صالح (يجب أن يكون بين 5 و 254 حرفاً)' };
  }

  // 2. Format structure check
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'صيغة البريد الإلكتروني غير صحيحة (يجب أن يحتوي على علامة @ واحدة)' };
  }

  const [localPart, domainPart] = parts;

  // Local part validation
  if (!localPart || localPart.length > 64) {
    return { valid: false, error: 'اسم المستخدم في البريد الإلكتروني غير صالح (بين 1 و 64 حرفاً)' };
  }

  // Check dangerous or disallowed characters
  const localRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localRegex.test(localPart)) {
    return { valid: false, error: 'يحتوي اسم البريد الإلكتروني على أحرف أو رموز غير مسموح بها' };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return { valid: false, error: 'صيغة البريد الإلكتروني غير صحيحة (لا يمكن أن تبدأ بنقطة أو تحتوي على نقاط متتالية)' };
  }

  // Domain part validation
  if (!domainPart || domainPart.length > 253) {
    return { valid: false, error: 'نطاق البريد الإلكتروني غير صالح' };
  }

  const domainLabels = domainPart.split('.');
  if (domainLabels.length < 2) {
    return { valid: false, error: 'يجب أن يحتوي نطاق البريد على امتداد صحيح (مثل .com أو .eg)' };
  }

  const tld = domainLabels[domainLabels.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]{2,}$/.test(tld)) {
    return { valid: false, error: 'امتداد نطاق البريد الإلكتروني غير صالح' };
  }

  // 3. Block disposable/temporary email providers
  if (DISPOSABLE_EMAIL_DOMAINS.has(domainPart)) {
    return { 
      valid: false, 
      error: 'لا يُسمح باستخدام خدمات البريد المؤقت (Temporary / Disposable Email) لحماية أمان المعاملات والحسابات' 
    };
  }

  // 4. Block placeholder/dummy domains
  if (DUMMY_DOMAINS.has(domainPart)) {
    return { 
      valid: false, 
      error: 'البريد الإلكتروني المدخل وهمي أو تجريبي. يرجى استخدام بريدك الحقيقي لاستلام الفواتير وتأكيد الحساب' 
    };
  }

  // 5. Block obvious dummy prefixes on generic domains
  if (BLOCKED_PREFIXES.has(localPart) && (domainPart === 'gmail.com' || domainPart === 'yahoo.com' || domainPart === 'hotmail.com' || domainPart === 'outlook.com')) {
    return {
      valid: false,
      error: 'يرجى إدخال بريدك الإلكتروني الشخصي الحقيقي وعدم استخدام أسماء وهمية تجريبية'
    };
  }

  return { 
    valid: true, 
    normalizedEmail: email 
  };
}

/**
 * Validates and normalizes Egyptian mobile phone numbers.
 * Valid Egyptian mobile numbers are 11 digits starting with 010, 011, 012, or 015.
 */
export function validateEgyptianPhone(rawPhone: string): ValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { valid: false, error: 'رقم الهاتف مطلوب' };
  }

  // Clean input from spaces, hyphens, parentheses
  let cleaned = rawPhone.replace(/[\s\-\(\)\.]/g, '');

  // Handle international prefix +2 or 002
  if (cleaned.startsWith('+20')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('0020')) {
    cleaned = '0' + cleaned.substring(4);
  } else if (cleaned.startsWith('20') && cleaned.length === 12) {
    cleaned = '0' + cleaned.substring(2);
  }

  // Egyptian mobile format: 010, 011, 012, 015 followed by 8 digits
  const egMobileRegex = /^01[0125][0-9]{8}$/;
  if (!egMobileRegex.test(cleaned)) {
    return { 
      valid: false, 
      error: 'رقم الهاتف غير صالح. يجب أن يكون رقم جوال مصري صحيح مكون من 11 رقماً ويبدأ بـ (010, 011, 012, 015)' 
    };
  }

  // Block repetitive dummy phone numbers (e.g., 01000000000, 01111111111)
  const last8 = cleaned.substring(3);
  const isRepetitive = /^(\d)\1{7}$/.test(last8);
  if (isRepetitive) {
    return { 
      valid: false, 
      error: 'رقم الهاتف المدخل وهمي. يرجى إدخال رقم هاتفك الحقيقي لاستلام تأكيدات الشحن والطلبات' 
    };
  }

  return {
    valid: true,
    normalizedPhone: cleaned
  };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'كلمة المرور مطلوبة' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'يجب أن لا تقل كلمة المرور عن 8 أحرف لضمان حماية الحساب' };
  }

  return { valid: true };
}
