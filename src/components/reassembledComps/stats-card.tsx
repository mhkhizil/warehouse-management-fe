import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color = "text-primary",
  bgColor = "bg-primary/10",
  className,
  onClick,
  hoverEffect = true,
  trend,
  subtitle,
}: StatsCardProps) {
  const CardWrapper = onClick ? "button" : "div";
  const cardProps = onClick ? { onClick, type: "button" as const } : {};

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -5 } : undefined}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardContent className="pt-6">
          <CardWrapper
            {...cardProps}
            className={cn(
              "w-full text-left",
              onClick &&
                "cursor-pointer hover:bg-muted/50 transition-colors rounded-lg p-2 -m-2"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{title}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
                {trend && (
                  <div className="flex items-center gap-1 mt-2">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        trend.isPositive ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {trend.isPositive ? "+" : ""}
                      {trend.value}%
                    </span>
                    {trend.label && (
                      <span className="text-xs text-muted-foreground">
                        {trend.label}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className={cn("p-2 rounded-full flex-shrink-0", bgColor)}>
                <Icon className={cn("h-6 w-6", color)} />
              </div>
            </div>
          </CardWrapper>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function StatsGrid({
  children,
  columns = 3,
  className,
}: StatsGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
}

interface StatsSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function StatsSection({
  title,
  description,
  children,
  className,
}: StatsSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
