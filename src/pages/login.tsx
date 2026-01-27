import { useNavigate } from "react-router-dom";

// Components and utils
import { AuthLayout } from "@/components/layout/auth-layout";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { LoginForm } from "@/components/login/login-form";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: authError, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (data: { email: string; password: string }) => {
    console.log("Login attempt with email:", data.email);
    try {
      await login(data.email, data.password);
      // Login successful, show success toast and redirect to dashboard
      toast({
        title: "Login Successful",
        description: "Welcome back! Redirecting to dashboard...",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      // Show error toast
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
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

        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={authError || undefined}
          showForgotPassword={true}
          forgotPasswordLink="/forgot-password"
        />

        <div className="text-center text-sm text-muted-foreground">
          <p>New users can be registered by administrators</p>
        </div>
      </div>
    </AuthLayout>
  );
}
