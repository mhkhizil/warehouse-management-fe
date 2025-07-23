/**
 * Comprehensive validation utilities for input sanitization and validation
 * Addresses security concerns: XSS prevention, input validation, file upload security
 */

// Email validation regex (RFC 5322 compliant)
export const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone number validation (international format)
export const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// Name validation (letters, spaces, hyphens, apostrophes)
export const nameRegex = /^[a-zA-Z\s\-'\.]+$/;

// URL validation
export const urlRegex =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

// File type validation
export const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const allowedDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const maxFileSize = 5 * 1024 * 1024; // 5MB

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null; // Returns error message or null if valid
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Sanitize input to prevent XSS attacks
 * @param input The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
}

/**
 * Validate email address
 * @param email Email to validate
 * @returns Validation result
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const sanitizedEmail = sanitizeInput(email);

  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  if (sanitizedEmail.length > 254) {
    return { isValid: false, error: "Email address is too long" };
  }

  return { isValid: true };
}

/**
 * Validate phone number
 * @param phone Phone number to validate
 * @returns Validation result
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }

  const sanitizedPhone = sanitizeInput(phone);

  if (!phoneRegex.test(sanitizedPhone)) {
    return { isValid: false, error: "Please enter a valid phone number" };
  }

  return { isValid: true };
}

/**
 * Validate name (first name, last name, etc.)
 * @param name Name to validate
 * @returns Validation result
 */
export function validateName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }

  const sanitizedName = sanitizeInput(name);

  if (sanitizedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  if (sanitizedName.length > 50) {
    return { isValid: false, error: "Name is too long" };
  }

  if (!nameRegex.test(sanitizedName)) {
    return { isValid: false, error: "Name contains invalid characters" };
  }

  return { isValid: true };
}

/**
 * Validate URL
 * @param url URL to validate
 * @returns Validation result
 */
export function validateUrl(url: string): ValidationResult {
  if (!url) {
    return { isValid: false, error: "URL is required" };
  }

  const sanitizedUrl = sanitizeInput(url);

  if (!urlRegex.test(sanitizedUrl)) {
    return { isValid: false, error: "Please enter a valid URL" };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 * @param file File to validate
 * @param allowedTypes Array of allowed MIME types
 * @param maxSize Maximum file size in bytes
 * @returns Validation result
 */
export function validateFile(
  file: File,
  allowedTypes: string[] = allowedImageTypes,
  maxSize: number = maxFileSize
): ValidationResult {
  if (!file) {
    return { isValid: false, error: "File is required" };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map((type) => type.split("/")[1])
      .join(", ");
    return { isValid: false, error: `File type must be: ${allowedExtensions}` };
  }

  // Check file name for malicious extensions
  const fileName = file.name.toLowerCase();
  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".js",
  ];
  const hasDangerousExtension = dangerousExtensions.some((ext) =>
    fileName.endsWith(ext)
  );

  if (hasDangerousExtension) {
    return {
      isValid: false,
      error: "File type not allowed for security reasons",
    };
  }

  return { isValid: true };
}

/**
 * Generic validation function
 * @param value Value to validate
 * @param rules Validation rules to apply
 * @returns Validation result
 */
export function validateInput(
  value: string,
  rules: ValidationRule
): ValidationResult {
  const sanitizedValue = sanitizeInput(value);

  // Required validation
  if (rules.required && !sanitizedValue) {
    return { isValid: false, error: "This field is required" };
  }

  // Skip other validations if value is empty and not required
  if (!sanitizedValue) {
    return { isValid: true };
  }

  // Min length validation
  if (rules.minLength && sanitizedValue.length < rules.minLength) {
    return {
      isValid: false,
      error: `Must be at least ${rules.minLength} characters long`,
    };
  }

  // Max length validation
  if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
    return {
      isValid: false,
      error: `Must be no more than ${rules.maxLength} characters long`,
    };
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
    return { isValid: false, error: "Invalid format" };
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(sanitizedValue);
    if (customError) {
      return { isValid: false, error: customError };
    }
  }

  return { isValid: true };
}

/**
 * Validate form data
 * @param formData Object containing form fields and their validation rules
 * @returns Object with validation results for each field
 */
export function validateForm<T extends Record<string, any>>(
  formData: T,
  validationRules: Record<keyof T, ValidationRule>
): Record<keyof T, ValidationResult> {
  const results: Record<keyof T, ValidationResult> = {} as Record<
    keyof T,
    ValidationResult
  >;

  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field as keyof T];
    results[field as keyof T] = validateInput(String(value || ""), rules);
  }

  return results;
}

/**
 * Check if form is valid
 * @param validationResults Results from validateForm
 * @returns True if all fields are valid
 */
export function isFormValid<T extends Record<string, any>>(
  validationResults: Record<keyof T, ValidationResult>
): boolean {
  return Object.values(validationResults).every((result) => result.isValid);
}

/**
 * Get all form errors
 * @param validationResults Results from validateForm
 * @returns Array of error messages
 */
export function getFormErrors<T extends Record<string, any>>(
  validationResults: Record<keyof T, ValidationResult>
): string[] {
  return Object.values(validationResults)
    .filter((result) => !result.isValid)
    .map((result) => result.error!)
    .filter(Boolean);
}
