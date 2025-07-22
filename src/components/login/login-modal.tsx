import React, { useState } from "react";
import { FormModal } from "@/components/reassembledComps";
import { LoginForm, LoginFormData } from "./login-form";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  title?: string;
  description?: string;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  className?: string;
}

export function LoginModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error,
  title = "Sign In",
  description = "Enter your credentials to access your account",
  showForgotPassword = true,
  forgotPasswordLink = "/forgot-password",
  className,
}: LoginModalProps) {
  const handleClose = () => {
    onClose();
  };

  const formContent = (
    <LoginForm
      onSubmit={onSubmit}
      isLoading={isLoading}
      error={error}
      showForgotPassword={showForgotPassword}
      forgotPasswordLink={forgotPasswordLink}
    />
  );

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={(e) => {
        e.preventDefault();
        // Form submission is handled by the LoginForm component
      }}
      title={description ? `${title} - ${description}` : title}
      formContent={formContent}
      submitText="Sign in"
      cancelText="Cancel"
      isLoading={isLoading}
      className={className}
      maxWidth="max-w-sm"
    />
  );
}

// Hook for managing login modal state
interface UseLoginModalProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  title?: string;
  description?: string;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
}

export function useLoginModal({
  onSubmit,
  title,
  description,
  showForgotPassword,
  forgotPasswordLink,
}: UseLoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      await onSubmit(data);
      setIsOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during login"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsOpen(true);
    setError(undefined);
  };

  const closeModal = () => {
    setIsOpen(false);
    setError(undefined);
  };

  return {
    isOpen,
    isLoading,
    error,
    openModal,
    closeModal,
    LoginModalComponent: (
      <LoginModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        title={title}
        description={description}
        showForgotPassword={showForgotPassword}
        forgotPasswordLink={forgotPasswordLink}
      />
    ),
  };
}
