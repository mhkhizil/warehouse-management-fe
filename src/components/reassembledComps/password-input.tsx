import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Check } from "lucide-react";
import {
  checkPasswordStrength,
  calculatePasswordStrength,
  type PasswordRequirement,
} from "@/lib/utils/password";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
  required = false,
  minLength = 6,
  showStrengthIndicator = true,
  showRequirements = true,
  className,
}: PasswordInputProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Update password requirements when password changes
  useEffect(() => {
    if (value) {
      const requirements = checkPasswordStrength(value, t);
      setPasswordRequirements(requirements);
      setPasswordStrength(calculatePasswordStrength(value, t));
    } else {
      setPasswordRequirements([]);
      setPasswordStrength(0);
    }
  }, [value, t]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || t("password.enterPassword")}
          minLength={minLength}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {t("password.passwordStrength")}
            </span>
            <span className="text-xs font-medium">{passwordStrength}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                passwordStrength < 40
                  ? "bg-destructive"
                  : passwordStrength < 80
                  ? "bg-primary/60"
                  : "bg-primary"
              )}
              style={{ width: `${passwordStrength}%` }}
            />
          </div>
        </div>
      )}

      {/* Password Requirements */}
      {showRequirements && value && passwordRequirements.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">
            {t("password.passwordRequirements")}:
          </span>
          <div className="grid grid-cols-1 gap-1">
            {passwordRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <Check
                  className={cn(
                    "h-3 w-3 flex-shrink-0",
                    requirement.isValid
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "leading-tight",
                    requirement.isValid
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRequirements && (
        <p className="text-xs text-muted-foreground">
          {t("password.passwordMustMeet")}
        </p>
      )}
    </div>
  );
}
