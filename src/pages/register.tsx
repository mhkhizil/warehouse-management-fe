import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

// Components and utils
import { AuthLayout } from "@/components/layout/auth-layout";
import {
  Form,
  FormField,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import {
  checkPasswordStrength,
  calculatePasswordStrength,
} from "@/lib/utils/password";

// Validation
import { registerSchema, RegisterFormValues } from "@/lib/validations/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");
  const passwordStrength = calculatePasswordStrength(passwordValue);
  const passwordRequirements = checkPasswordStrength(passwordValue);

  // Get color for password strength bar
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-destructive";
    if (strength < 80) return "bg-amber-500";
    return "bg-green-500";
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });

      // Registration successful, redirect to dashboard
      navigate("/");
    } catch (error) {
      // Error already handled in auth context
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your details below to create your account
          </p>
        </div>

        {authError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
          >
            {authError}
          </motion.div>
        )}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormField>
            <FormLabel required>Username</FormLabel>
            <Input
              {...register("username")}
              placeholder="Enter your username"
              error={errors.username?.message}
              autoComplete="username"
            />
          </FormField>

          <FormField>
            <FormLabel required>Email</FormLabel>
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              autoComplete="email"
            />
          </FormField>

          <FormField>
            <FormLabel required>Phone Number</FormLabel>
            <Input
              {...register("phone")}
              placeholder="Enter your phone number"
              error={errors.phone?.message}
              autoComplete="tel"
            />
            <FormDescription>This will be used for login</FormDescription>
          </FormField>

          <FormField>
            <FormLabel required>Password</FormLabel>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                error={errors.password?.message}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormField>

          {/* Password strength indicator */}
          {passwordValue && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2 rounded-md bg-muted p-3"
            >
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-xs font-medium">Password strength</span>
                  <span className="text-xs font-medium">
                    {passwordStrength < 40
                      ? "Weak"
                      : passwordStrength < 80
                      ? "Medium"
                      : "Strong"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${passwordStrength}%` }}
                    className={`h-full ${getStrengthColor(passwordStrength)}`}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-medium">Requirements:</h3>
                <ul className="space-y-1 text-xs">
                  {passwordRequirements.map((req, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center"
                    >
                      {req.isValid ? (
                        <CheckCircle2 className="mr-2 h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="mr-2 h-3 w-3 text-muted-foreground" />
                      )}
                      <span
                        className={
                          req.isValid
                            ? "text-green-500"
                            : "text-muted-foreground"
                        }
                      >
                        {req.label}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          <FormField>
            <FormLabel required>Confirm Password</FormLabel>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </FormField>

          <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </Form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
