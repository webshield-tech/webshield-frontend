export const validateUsername = (
  username: string
): { isValid: boolean; message: string } => {
  const sqliPatterns = [
    /'OR\s+'\d+'\s*=\s*'\d+'/i,
    /--/i,
    /;\s*DROP/i,
    /UNION\s+SELECT/i,
    /admin'\s*--/i
  ];

  if (sqliPatterns.some(pattern => pattern.test(username))) {
    return {
      isValid: false,
      message: "Nice try, but our developer is smarter than that! 😉 SQLi won't work here.",
    };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "Username must be at least 3 characters",
    };
  }
  if (username.length > 20) {
    return {
      isValid: false,
      message: "Username must be less than 20 characters",
    };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: "Username can only contain letters, numbers, and underscores",
    };
  }
  return { isValid: true, message: "" };
};

export const validateEmail = (
  email: string
): { isValid: boolean; message: string } => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  const sqliPatterns = [
    /'OR\s+'\d+'\s*=\s*'\d+'/i,
    /--/i,
    /;\s*DROP/i,
    /UNION\s+SELECT/i
  ];

  if (sqliPatterns.some(pattern => pattern.test(email))) {
    return {
      isValid: false,
      message: "An injection attempt? On a security platform? Bold move! But it's blocked. 🛡️",
    };
  }

  const emailLower = email.toLowerCase().trim();
  
  // Basic email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Extract local part (before @) and domain
  const [localPart, domain] = emailLower.split('@');
  
  // 1. BLOCK OBVIOUSLY FAKE EMAILS
  const blockedLocalParts = [
    '12345', '123456', '1234567', '12345678', '123456789',
    'test', 'demo', 'example', 'fake', 'dummy',
    'temp', 'admin', 'user', 'guest', 'no-reply', 'noreply',
    'name', 'firstname', 'lastname', 'first', 'last', 'username',
    'user123', 'user1', 'user2', 'user3', 'abcd', 'abcde', 'qwerty',
    'asdf', 'zxcv', 'password', '111111', '222222', '333333',
    '000000', '111222', '222333', '333444', 'aaaaaa', 'bbbbbb'
  ];
  
  for (const blocked of blockedLocalParts) {
    if (localPart === blocked) {
      return { 
        isValid: false, 
        message: "Please use a real email address, not a test email" 
      };
    }
  }
  
  // 2. BLOCK EMAILS WITH ONLY NUMBERS
  if (/^\d+$/.test(localPart)) {
    return { 
      isValid: false, 
      message: "Email cannot contain only numbers before the @" 
    };
  }
  
  // 3. BLOCK EMAILS WITH REPEATING PATTERNS
  if (/(.)\1{3,}/.test(localPart)) { // 4 or more repeating characters
    return { 
      isValid: false, 
      message: "Email appears to be invalid" 
    };
  }
  
  // 4. BLOCK DISPOSABLE EMAIL DOMAINS (Partial list)
  const disposableDomains = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
    'grr.la', 'maildrop.cc', 'getairmail.com', 'tempmailaddress.com',
    'fakeinbox.com', 'throwawaymail.com', 'discard.email'
  ];
  
  if (disposableDomains.includes(domain)) {
    return { 
      isValid: false, 
      message: "Temporary/disposable email addresses are not allowed" 
    };
  }
  
  // 5. BLOCK COMMON TEST DOMAINS
  const testDomains = [
    'example.com', 'test.com', 'demo.com', 'fake.com',
    'domain.com', 'email.com', 'mail.com', 'email.net',
    'test.org', 'example.org', 'test.net'
  ];
  
  if (testDomains.includes(domain)) {
    return { 
      isValid: false, 
      message: "Please use a real email provider (Gmail, Outlook, etc.)" 
    };
  }
  
  // 6. ENSURE LOCAL PART HAS REASONABLE LENGTH
  if (localPart.length < 2) {
    return { 
      isValid: false, 
      message: "Email username is too short" 
    };
  }
  
  // 7. BLOCK EMAILS WITH TOO MANY DOTS OR SPECIAL CHARS
  const dotCount = (localPart.match(/\./g) || []).length;
  if (dotCount > 3) {
    return { 
      isValid: false, 
      message: "Email contains too many special characters" 
    };
  }
  
  // 8. BLOCK EMAILS WITH CONSECUTIVE SPECIAL CHARS
  if (/[._-]{2,}/.test(localPart)) {
    return { 
      isValid: false, 
      message: "Email contains invalid character sequences" 
    };
  }

  // 9. BLOCK COMMON SEQUENTIAL PATTERNS
  const sequentialPatterns = [
    /12345/, /23456/, /34567/, /45678/, /56789/,
    /abcdef/, /bcdefg/, /cdefgh/, /defghi/, /efghij/,
    /qwerty/, /asdfgh/, /zxcvbn/
  ];
  
  for (const pattern of sequentialPatterns) {
    if (pattern.test(localPart)) {
      return { 
        isValid: false, 
        message: "Email appears to be automatically generated" 
      };
    }
  }

  return { isValid: true, message: "" };
};

export const validatePassword = (
  password: string
): {
  isValid: boolean;
  message: string;
  details: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    // eslint-disable-next-line no-useless-escape
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  let message = "";
  if (!checks.length) {
    message = "Password must be at least 8 characters";
  } else if (!checks.uppercase) {
    message = "Password must contain at least 1 uppercase letter";
  } else if (!checks.lowercase) {
    message = "Password must contain at least 1 lowercase letter";
  } else if (!checks.number) {
    message = "Password must contain at least 1 number";
  } else if (!checks.special) {
    message = "Password must contain at least 1 special character (!@#$%^&*)";
  }

  const isValid = Object.values(checks).every((check) => check);

  return {
    isValid,
    message,
    details: checks,
  };
};

export const isValidUsername = (username: string) =>
  validateUsername(username).isValid;

export const isValidEmail = (email: string) => validateEmail(email).isValid;

export const isStrongPassword = (password: string) =>
  validatePassword(password).isValid;

export const validateUrl = (
  url: string
): { isValid: boolean; message: string } => {
  const trimmedUrl = url.trim();
  try {
    new URL(trimmedUrl);
  } catch {
    return {
      isValid: false,
      message: "Please enter a valid URL (e.g., https://example.com/)",
    };
  }

  if (!/^https?:\/\/.+\..+/.test(trimmedUrl)) {
    return {
      isValid: false,
      message:
        "URL must start with http:// or https:// and have a valid domain",
    };
  }

  return { isValid: true, message: "" };
};

export const isValidUrl = (url: string) => validateUrl(url).isValid;