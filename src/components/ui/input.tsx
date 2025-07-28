import * as React from "react";
import { cn } from "@/lib/utils";
import {
  validateEmail,
  validatePhone,
  validateName,
  validateUrl,
  validateInput,
  sanitizeInput,
  type ValidationRule,
  type ValidationResult,
} from "@/lib/utils/validation";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  validationRule?: ValidationRule;
  onValidationChange?: (result: ValidationResult) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showValidationMessage?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      validationRule,
      onValidationChange,
      validateOnChange = false,
      validateOnBlur = true,
      showValidationMessage = true,
      onChange,
      onBlur,
      value,
      ...props
    },
    ref
  ) => {
    const [validationError, setValidationError] = React.useState<
      string | undefined
    >(error);
    const [isValidating, setIsValidating] = React.useState(false);

    // Update validation error when external error prop changes
    React.useEffect(() => {
      setValidationError(error);
    }, [error]);

    // Validate input based on type and rules
    const validateInputValue = React.useCallback(
      (inputValue: string): ValidationResult => {
        if (!validationRule) {
          return { isValid: true };
        }

        // Auto-detect validation based on input type if no custom rule
        if (!validationRule.pattern && !validationRule.custom) {
          switch (type) {
            case "email":
              return validateEmail(inputValue);
            case "tel":
              return validatePhone(inputValue);
            case "text":
              // Check if it's likely a name field
              if (props.name?.toLowerCase().includes("name")) {
                return validateName(inputValue);
              }
              if (props.name?.toLowerCase().includes("url")) {
                return validateUrl(inputValue);
              }
              break;
          }
        }

        // Use custom validation rule
        return validateInput(inputValue, validationRule);
      },
      [validationRule, type, props.name]
    );

    // Handle input change with validation
    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Sanitize input for security
        const sanitizedValue = sanitizeInput(inputValue);

        // Update the event with sanitized value
        e.target.value = sanitizedValue;

        // Validate on change if enabled
        if (validateOnChange && validationRule) {
          setIsValidating(true);
          const validationResult = validateInputValue(sanitizedValue);
          setValidationError(
            validationResult.isValid ? undefined : validationResult.error
          );
          onValidationChange?.(validationResult);
          setIsValidating(false);
        }

        // Call original onChange
        onChange?.(e);
      },
      [
        validateOnChange,
        validationRule,
        validateInputValue,
        onValidationChange,
        onChange,
      ]
    );

    // Handle input blur with validation
    const handleBlur = React.useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Validate on blur if enabled
        if (validateOnBlur && validationRule) {
          setIsValidating(true);
          const validationResult = validateInputValue(inputValue);
          setValidationError(
            validationResult.isValid ? undefined : validationResult.error
          );
          onValidationChange?.(validationResult);
          setIsValidating(false);
        }

        // Call original onBlur
        onBlur?.(e);
      },
      [
        validateOnBlur,
        validationRule,
        validateInputValue,
        onValidationChange,
        onBlur,
      ]
    );

    // Determine if we should show an error
    const shouldShowError = showValidationMessage && (validationError || error);
    const finalError = validationError || error;

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            shouldShowError &&
              "border-destructive focus-visible:ring-destructive",
            isValidating && "border-yellow-500 focus-visible:ring-yellow-500",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          {...props}
        />
        {shouldShowError && (
          <p className="mt-1 text-sm text-destructive flex items-center gap-1">
            {isValidating && (
              <div className="w-3 h-3 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
            )}
            {finalError}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
