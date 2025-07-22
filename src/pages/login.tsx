import { useNavigate } from "react-router-dom";

// Components and utils
import { AuthLayout } from "@/components/layout/auth-layout";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const handleSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      // Login successful, redirect to dashboard
      navigate("/");
    } catch {
      // Error already handled in auth context
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
