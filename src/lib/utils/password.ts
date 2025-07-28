// Regex patterns for password validation
export const passwordRegex = {
  upperCase: /[A-Z]/,
  lowerCase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export interface PasswordRequirement {
  label: string;
  isValid: boolean;
}

/**
 * Check password strength based on various criteria
 * @param password The password to check
 * @returns An array of password requirements with validity indicators
 */
export function checkPasswordStrength(password: string): PasswordRequirement[] {
  const minLength = 8;

  return [
    {
      label: "At least 8 characters",
      isValid: password.length >= minLength,
    },
    {
      label: "At least one uppercase letter",
      isValid: passwordRegex.upperCase.test(password),
    },
    {
      label: "At least one lowercase letter",
      isValid: passwordRegex.lowerCase.test(password),
    },
    {
      label: "At least one number",
      isValid: passwordRegex.number.test(password),
    },
    {
      label: "At least one special character",
      isValid: passwordRegex.special.test(password),
    },
  ];
}

/**
 * Calculate overall password strength percentage
 * @param password The password to check
 * @returns A number between 0-100 representing password strength
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;

  const requirements = checkPasswordStrength(password);
  const validRequirements = requirements.filter((req) => req.isValid).length;

  return Math.round((validRequirements / requirements.length) * 100);
}
