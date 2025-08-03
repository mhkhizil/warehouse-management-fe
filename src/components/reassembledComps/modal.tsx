import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
}

export function  Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
  maxHeight = "max-h-[95vh]",
  className,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card
        className={cn("w-full flex flex-col", maxWidth, maxHeight, className)}
      >
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex justify-between items-center">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">{children}</CardContent>
        {footer && <div className="flex-shrink-0 p-6 pt-0">{footer}</div>}
      </Card>
    </div>
  );
}

interface FormModalProps extends Omit<ModalProps, "children" | "footer"> {
  onSubmit: (e: React.FormEvent) => void;
  formContent: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  loadingText?: string;
  showCancelButton?: boolean;
  submitDisabled?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  formContent,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  isLoading = false,
  loadingText = "Saving...",
  showCancelButton = true,
  submitDisabled = false,
  maxWidth = "max-w-md",
  maxHeight = "max-h-[95vh]",
  className,
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const footer = (
    <div className="flex justify-end space-x-2 pt-4 border-t">
      {showCancelButton && (
        <Button type="button" variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isLoading || submitDisabled}
        form="modal-form"
      >
        {isLoading ? loadingText : submitText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      className={className}
    >
      <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">
        {formContent}
      </form>
    </Modal>
  );
}

interface ConfirmModalProps extends Omit<ModalProps, "children" | "footer"> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
  maxWidth = "max-w-md",
  className,
}: ConfirmModalProps) {
  const footer = (
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onClose}>
        {cancelText}
      </Button>
      <Button
        type="button"
        variant={variant}
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      maxWidth={maxWidth}
      className={className}
    >
      <p className="text-muted-foreground">{message}</p>
    </Modal>
  );
}
