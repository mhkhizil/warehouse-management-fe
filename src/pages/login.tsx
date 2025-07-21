import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

// Components and utils
import { AuthLayout } from "@/components/layout/auth-layout";
import { Form, FormField, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";

// Validation
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);

      // Login successful, redirect to dashboard
      navigate("/");
    } catch {
      // Error already handled in auth context
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
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
            <FormLabel required>Email Address</FormLabel>
            <Input
              {...register("email")}
              type="email"
              placeholder="Enter your email address"
              error={errors.email?.message}
              autoComplete="email"
            />
          </FormField>

          <FormField>
            <div className="flex items-center justify-between">
              <FormLabel required>Password</FormLabel>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                error={errors.password?.message}
                autoComplete="current-password"
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

          <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <CarPartsLoader
                size="xs"
                variant="inline"
                showText={false}
                className="mr-2"
              />
            ) : null}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          <p>New users can be registered by administrators</p>
        </div>
      </div>
    </AuthLayout>
  );
}
