export const validateUsername = (
  username: string
): { isValid: boolean; message: string } => {
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
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
