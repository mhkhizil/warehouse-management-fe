import React, { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { tokenManagementService } from "@/core/infrastructure/services/TokenManagementService";

interface TokenExpirationWarningProps {
  warningMinutes?: number;
  onExpire?: () => void;
}

export function TokenExpirationWarning({
  warningMinutes = 5,
  onExpire,
}: TokenExpirationWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    // Subscribe to token expiration warnings
    const unsubscribeWarning = tokenManagementService.onExpirationWarning(
      (timeLeft) => {
        setTimeLeft(timeLeft);
        setShowWarning(true);
      }
    );

    // Subscribe to token expiration
    const unsubscribeExpiration = tokenManagementService.onExpiration(() => {
      setShowWarning(false);
      onExpire?.();
    });

    // Check immediately
    if (tokenManagementService.isTokenExpiringSoon(warningMinutes)) {
      const remainingTime = tokenManagementService.getTimeUntilExpiration();
      setTimeLeft(remainingTime);
      setShowWarning(true);
    }

    return () => {
      unsubscribeWarning();
      unsubscribeExpiration();
    };
  }, [warningMinutes, onExpire]);

  useEffect(() => {
    if (timeLeft <= 0 && showWarning) {
      setShowWarning(false);
      onExpire?.();
    }
  }, [timeLeft, showWarning, onExpire]);

  useEffect(() => {
    if (showWarning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showWarning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Session Expiring Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Your session will expire in{" "}
                <span className="font-semibold">{formatTime(timeLeft)}</span>.
              </p>
              <p className="mt-1">
                Please save your work and log in again to continue.
              </p>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              onClick={() => setShowWarning(false)}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
