import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function Header({
  title,
  description,
  children,
  className,
}: HeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className
      )}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row gap-2">{children}</div>
      )}
    </div>
  );
}

interface HeaderButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
  className?: string;
  title?: string;
}

export function HeaderButton({
  onClick,
  disabled = false,
  variant = "default",
  size = "default",
  children,
  className,
  title,
}: HeaderButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={className}
      title={title}
    >
      {children}
    </Button>
  );
}

interface HeaderActionGroupProps {
  children: ReactNode;
  className?: string;
}

export function HeaderActionGroup({
  children,
  className,
}: HeaderActionGroupProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-2", className)}>
      {children}
    </div>
  );
}

interface HeaderNoticeProps {
  message: string;
  variant?: "info" | "warning" | "error" | "success";
  icon?: ReactNode;
  className?: string;
}

export function HeaderNotice({
  message,
  variant = "info",
  icon,
  className,
}: HeaderNoticeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
      case "error":
        return "border-destructive/50 bg-destructive/10";
      case "success":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "warning":
        return "text-amber-600 dark:text-amber-400";
      case "error":
        return "text-destructive";
      case "success":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  return (
    <div className={cn("border rounded-lg p-4", getVariantStyles(), className)}>
      <div className="flex items-center gap-2">
        {icon && <div className={getIconColor()}>{icon}</div>}
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
