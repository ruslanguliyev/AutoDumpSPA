const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

export const isValidEmail = (email: string) =>
  EMAIL_REGEX.test(String(email ?? '').trim());

export const isValidPassword = (password: string) => {
  const value = String(password ?? '');
  if (value.length < PASSWORD_MIN_LENGTH) return false;
  return /\d/.test(value);
};

export type LoginValues = {
  email: string;
  password: string;
};

export type RegisterValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

/** Returns i18n keys under auth namespace, e.g. "validation.emailRequired". */
export const validateLogin = (values: LoginValues) => {
  const errors: Partial<Record<keyof LoginValues, string>> = {};

  if (!values.email.trim()) {
    errors.email = 'validation.emailRequired';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'validation.invalidEmail';
  }

  if (!values.password) {
    errors.password = 'validation.passwordRequired';
  }

  return errors;
};

/** Returns i18n keys under auth namespace, e.g. "validation.fullNameRequired". */
export const validateRegister = (values: RegisterValues) => {
  const errors: Partial<Record<keyof RegisterValues, string>> = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'validation.fullNameRequired';
  }

  if (!values.email.trim()) {
    errors.email = 'validation.emailRequired';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'validation.invalidEmail';
  }

  if (!values.password) {
    errors.password = 'validation.passwordRequired';
  } else if (!isValidPassword(values.password)) {
    errors.password = 'validation.passwordMin';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'validation.confirmPasswordRequired';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'validation.passwordMismatch';
  }

  if (!values.termsAccepted) {
    errors.termsAccepted = 'validation.termsRequired';
  }

  return errors;
};
