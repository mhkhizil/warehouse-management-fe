import  { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel } from "@/components/ui/form";
import { Link } from "react-router-dom";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  disabled?: boolean;
  className?: string;
  submitText?: string;
  showSubmitButton?: boolean;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error,
  showForgotPassword = true,
  forgotPasswordLink = "/forgot-password",
  disabled = false,
  className,
  submitText = "Sign in",
  showSubmitButton = true,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      await onSubmit(data);
      // Don't reset form on error, let the parent handle it
    } catch {
      // Error is handled by the parent component
    }
  };

  const isFormDisabled = disabled || isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={className}>
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Email Field */}
      <FormField>
        <FormLabel required>Email Address</FormLabel>
        <Input
          {...register("email")}
          type="email"
          placeholder="Enter your email address"
          error={errors.email?.message}
          autoComplete="email"
          disabled={isFormDisabled}
        />
      </FormField>

      {/* Password Field */}
      <FormField>
        <div className="flex items-center justify-between">
          <FormLabel required>Password</FormLabel>
          {showForgotPassword && (
            <Link
              to={forgotPasswordLink}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            error={errors.password?.message}
            autoComplete="current-password"
            disabled={isFormDisabled}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            disabled={isFormDisabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </FormField>

      {/* Submit Button */}
      {showSubmitButton && (
        <Button type="submit" className="mt-4 w-full" disabled={isFormDisabled}>
          {isSubmitting ? (
            <CarPartsLoader
              size="xs"
              variant="inline"
              showText={false}
              className="mr-2"
            />
          ) : null}
          {isSubmitting ? "Signing in..." : submitText}
        </Button>
      )}

      {/* Loading State (only show if no submit button) */}
      {!showSubmitButton && (isLoading || isSubmitting) && (
        <div className="flex items-center justify-center py-2">
          <CarPartsLoader
            size="xs"
            variant="inline"
            showText={false}
            className="mr-2"
          />
          <span className="text-sm text-muted-foreground">
            {isSubmitting ? "Signing in..." : "Loading..."}
          </span>
        </div>
      )}
    </form>
  );
}
