// Validation utilities for authentication forms
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

// Email validation following RFC 5322 standards (simplified but robust)
export const validateEmail = (email: string): ValidationResult => {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, error: "Email address is required" };
  }
  
  // Check length limits (RFC 5321: local part max 64, domain max 253, total max 320)
  if (trimmedEmail.length > 320) {
    return { isValid: false, error: "Email address is too long" };
  }
  
  // Split email into local and domain parts
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  const [localPart, domain] = parts;
  
  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  if (localPart.length > 64) {
    return { isValid: false, error: "Email address is too long" };
  }
  
  // Local part cannot start or end with a dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  // Local part cannot have consecutive dots
  if (localPart.includes('..')) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  // Validate domain part (after @)
  if (!domain || domain.length === 0) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  if (domain.length > 253) {
    return { isValid: false, error: "Email domain is too long" };
  }
  
  // Domain cannot start or end with a dot or hyphen
  if (domain.startsWith('.') || domain.endsWith('.') || 
      domain.startsWith('-') || domain.endsWith('-')) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  // Domain must contain at least one dot
  if (!domain.includes('.')) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  // More comprehensive email regex that handles most valid cases
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  
  // Check for common typos in popular domains
  const commonDomainTypos = {
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmail.co': 'hotmail.com',
    'hotmail.cm': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'outlook.co': 'outlook.com',
    'outlook.cm': 'outlook.com',
    'outlok.com': 'outlook.com',
  };
  
  const domainLower = domain.toLowerCase();
  if (commonDomainTypos[domainLower as keyof typeof commonDomainTypos]) {
    const suggestedDomain = commonDomainTypos[domainLower as keyof typeof commonDomainTypos];
    const suggestedEmail = `${localPart}@${suggestedDomain}`;
    return { 
      isValid: false, 
      error: `Did you mean ${suggestedEmail}?` 
    };
  }
  
  return { isValid: true };
};

// Phone number validation
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const trimmedPhone = phone.trim();
  
  if (!trimmedPhone) {
    return { isValid: false, error: "Phone number is required" };
  }
  
  // Handle +1 prefix specifically
  let workingPhone = trimmedPhone;
  if (trimmedPhone.startsWith('+1')) {
    workingPhone = trimmedPhone.replace(/^\+1\s*/, '');
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = workingPhone.replace(/\D/g, '');
  
  // Handle US numbers with +1 prefix (11 digits total when including country code)
  let validationDigits = digitsOnly;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    // Remove the leading 1 for US number validation
    validationDigits = digitsOnly.slice(1);
  }
  
  // For partial input during typing, be more lenient
  if (validationDigits.length < 10) {
    // Don't show errors for partial input during real-time validation
    return { isValid: true };
  }
  
  // Check for minimum length (US: 10 digits, International: 7-15 digits)
  if (validationDigits.length < 7) {
    return { isValid: false, error: "Phone number is too short" };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, error: "Phone number is too long" };
  }
  
  // US phone number validation (10 digits after removing +1)
  if (validationDigits.length === 10) {
    // Check for valid US area code (first digit can't be 0 or 1)
    if (validationDigits[0] === '0' || validationDigits[0] === '1') {
      return { isValid: false, error: "Please enter a valid US phone number" };
    }
    
    // Check for valid exchange code (4th digit can't be 0 or 1)
    if (validationDigits[3] === '0' || validationDigits[3] === '1') {
      return { isValid: false, error: "Please enter a valid US phone number" };
    }
  }
  
  // Check for obviously invalid patterns
  const invalidPatterns = [
    /^0+$/, // All zeros
    /^1+$/, // All ones
    /^(\d)\1{6,}$/, // Same digit repeated 7+ times
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(validationDigits)) {
      return { isValid: false, error: "Please enter a valid phone number" };
    }
  }
  
  return { isValid: true };
};

// Password validation following NIST 800-63B and OWASP guidelines
export const validatePassword = (password: string, isSignUp: boolean = false): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  
  // For sign-in, we don't enforce strength requirements
  if (!isSignUp) {
    return { isValid: true };
  }
  
  // NIST 800-63B recommendations: 8-64 characters minimum
  const minLength = 8;
  const maxLength = 128; // Allow longer passwords for better security
  
  if (password.length < minLength) {
    return { 
      isValid: false, 
      error: `Password must be at least ${minLength} characters long` 
    };
  }
  
  if (password.length > maxLength) {
    return { 
      isValid: false, 
      error: `Password must be less than ${maxLength} characters long` 
    };
  }
  
  // Check for at least 3 of 4 character types (more flexible than requiring all)
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  
  const characterTypeCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  
  if (characterTypeCount < 3) {
    return { 
      isValid: false, 
      error: "Password must contain at least 3 of: lowercase, uppercase, numbers, or special characters" 
    };
  }
  
  // Check against common weak passwords (expanded list)
  const commonWeakPasswords = [
    'password', 'password123', '12345678', 'qwerty123', 'abc123456', 
    'password1', 'welcome123', 'admin123', 'letmein123', 'monkey123',
    'dragon123', 'master123', 'shadow123', 'qwerty12', 'football123',
    'baseball123', 'superman123', 'batman123', 'trustno1', 'hello123',
    'welcome1', 'password12', 'iloveyou123', 'princess123', 'rockyou123'
  ];
  
  if (commonWeakPasswords.includes(password.toLowerCase())) {
    return { 
      isValid: false, 
      error: "This password is too common. Please choose a stronger password" 
    };
  }
  
  // Check for simple patterns (keyboard walks, repeated patterns)
  const simplePatterns = [
    /^(.)\1{7,}$/, // Same character repeated 8+ times
    /^(..)\1{3,}$/, // Two characters repeated 4+ times
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i, // Alphabetical sequences
    /^(123|234|345|456|567|678|789|890|012)/, // Numerical sequences
    /^(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i, // Keyboard patterns
  ];
  
  for (const pattern of simplePatterns) {
    if (pattern.test(password)) {
      return { 
        isValid: false, 
        error: "Password contains common patterns. Please choose a more complex password" 
      };
    }
  }
  
  // Check for personal information patterns (basic check)
  const personalInfoPatterns = [
    /^(admin|user|guest|test|demo)/i,
    /^(name|email|phone|address)/i,
  ];
  
  for (const pattern of personalInfoPatterns) {
    if (pattern.test(password)) {
      return { 
        isValid: false, 
        error: "Password should not contain common words or personal information" 
      };
    }
  }
  
  return { isValid: true };
};

// Verification code validation
export const validateVerificationCode = (code: string): ValidationResult => {
  const trimmedCode = code.trim();
  
  if (!trimmedCode) {
    return { isValid: false, error: "Verification code is required" };
  }
  
  // Remove any spaces or dashes
  const cleanCode = trimmedCode.replace(/[\s-]/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleanCode)) {
    return { isValid: false, error: "Verification code should only contain numbers" };
  }
  
  // Check length (typically 4-8 digits)
  if (cleanCode.length < 4 || cleanCode.length > 8) {
    return { isValid: false, error: "Please enter a valid verification code" };
  }
  
  return { isValid: true };
};

// Name validation (for OAuth completion)
export const validateName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: "Name is required" };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: "Name must be less than 50 characters long" };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return { isValid: false, error: "Name can only contain letters, spaces, hyphens, and apostrophes" };
  }
  
  return { isValid: true };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  // If the input already starts with +1, extract just the digits after it
  let workingPhone = phone;
  let hasCountryCode = false;
  
  if (phone.startsWith('+1')) {
    hasCountryCode = true;
    // Extract everything after +1 and any spaces/formatting
    workingPhone = phone.replace(/^\+1\s*/, '');
  }
  
  const digitsOnly = workingPhone.replace(/\D/g, '');
  
  // If no digits, return +1 prefix ready for input
  if (digitsOnly.length === 0) {
    return '+1 ';
  }
  
  // US phone number formatting (10 digits) - add +1 prefix
  if (digitsOnly.length === 10) {
    return `+1 (${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  // Handle 11 digits (user typed 1 + 10 digit number)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const usNumber = digitsOnly.slice(1);
    return `+1 (${usNumber.slice(0, 3)}) ${usNumber.slice(3, 6)}-${usNumber.slice(6)}`;
  }
  
  // International formatting (more than 11 digits)
  if (digitsOnly.length > 11) {
    return `+${digitsOnly}`;
  }
  
  // For partial input (less than 10 digits), show +1 prefix with the digits
  if (digitsOnly.length > 0 && digitsOnly.length < 10) {
    return `+1 ${digitsOnly}`;
  }
  
  return `+1 `;
};

// Real-time validation for better UX
export const validateFieldRealTime = (
  fieldType: 'email' | 'phone' | 'password' | 'verification' | 'name',
  value: string,
  options?: { isSignUp?: boolean }
): ValidationResult => {
  // Don't show errors for empty fields during real-time validation
  if (!value.trim()) {
    return { isValid: true };
  }
  
  switch (fieldType) {
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhoneNumber(value);
    case 'password':
      return validatePassword(value, options?.isSignUp);
    case 'verification':
      return validateVerificationCode(value);
    case 'name':
      return validateName(value);
    default:
      return { isValid: true };
  }
};

// Validate on submit (stricter - shows required field errors)
export const validateFieldOnSubmit = (
  fieldType: 'email' | 'phone' | 'password' | 'verification' | 'name',
  value: string,
  options?: { isSignUp?: boolean; isRequired?: boolean }
): ValidationResult => {
  const { isRequired = true } = options || {};
  
  // Special handling for phone numbers - check if there are actual digits
  if (fieldType === 'phone') {
    const digitsOnly = value.replace(/\D/g, '');
    if (isRequired && digitsOnly.length === 0) {
      return { 
        isValid: false, 
        error: 'Phone number is required' 
      };
    }
    
    if (!isRequired && digitsOnly.length === 0) {
      return { isValid: true };
    }
    
    // For phone numbers, we need at least 10 digits for a complete US number
    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      return { 
        isValid: false, 
        error: 'Please enter a complete phone number' 
      };
    }
  } else {
    // Check if field is required and empty (for non-phone fields)
    if (isRequired && !value.trim()) {
      const fieldNames = {
        email: 'Email address',
        phone: 'Phone number',
        password: 'Password',
        verification: 'Verification code',
        name: 'Name'
      };
      
      return { 
        isValid: false, 
        error: `${fieldNames[fieldType]} is required` 
      };
    }
    
    // If not required and empty, it's valid
    if (!isRequired && !value.trim()) {
      return { isValid: true };
    }
  }
  
  // Use the same validation logic as real-time
  return validateFieldRealTime(fieldType, value, options);
}; 