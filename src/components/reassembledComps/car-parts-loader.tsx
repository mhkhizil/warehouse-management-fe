import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarPartsLoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  text?: string;
  variant?: "full" | "inline";
}

export const CarPartsLoader: React.FC<CarPartsLoaderProps> = ({
  size = "md",
  className,
  showText = true,
  text = "Loading...",
  variant = "full",
}) => {
  const sizeClasses = {
    xs: "w-8 h-8",
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const textSizeClasses = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Inline variant for buttons and smaller spaces
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          {/* Realistic timing belt gear */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-border bg-gradient-to-br from-muted to-muted-foreground"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            {/* Gear teeth - more realistic */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-3 bg-foreground"
                style={{
                  top: "-6px",
                  left: "50%",
                  transformOrigin: "50% 18px",
                  transform: `translateX(-50%) rotate(${i * 30}deg)`,
                }}
              />
            ))}
            {/* Center hub */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/60 to-primary border border-primary/70">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-background to-muted" />
            </div>
          </motion.div>
        </div>
        {showText && (
          <span className={cn("text-muted-foreground", textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Full variant with comprehensive car parts animations
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
    >
      {/* Main Engine Block Container */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Brake Rotor - Large outer disc */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-border bg-gradient-to-br from-muted to-muted-foreground"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          {/* Brake disc cooling vanes */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-6 bg-foreground/70"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "50% 50%",
                transform: `translate(-50%, -50%) rotate(${
                  i * 22.5
                }deg) translateY(-${
                  size === "lg" ? "48" : size === "md" ? "36" : "24"
                }px)`,
              }}
            />
          ))}

          {/* Brake disc holes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-background rounded-full border border-border"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "50% 50%",
                transform: `translate(-50%, -50%) rotate(${
                  i * 45
                }deg) translateY(-${
                  size === "lg" ? "32" : size === "md" ? "24" : "16"
                }px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Timing Belt Pulley - Counter-rotating */}
        <motion.div
          className="absolute inset-6 rounded-full border-3 border-primary bg-gradient-to-br from-primary/40 to-primary/80"
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        >
          {/* Belt teeth */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-2 bg-primary/90"
              style={{
                top: "-4px",
                left: "50%",
                transformOrigin: "50% 16px",
                transform: `translateX(-50%) rotate(${i * 18}deg)`,
              }}
            />
          ))}

          {/* Center hub with realistic details */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-muted to-muted-foreground border border-border">
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-background to-muted">
              {/* Hub bolt pattern */}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-foreground rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transformOrigin: "50% 50%",
                    transform: `translate(-50%, -50%) rotate(${
                      i * 72
                    }deg) translateY(-4px)`,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Crankshaft - Central rotating element */}
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/60 to-primary border-2 border-primary/70"
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Connecting rod bearings */}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-primary/90 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: "50% 50%",
                transform: `translate(-50%, -50%) rotate(${
                  i * 90
                }deg) translateY(-6px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Alternator - Realistic car alternator */}
        <motion.div
          className="absolute -top-3 -right-4 w-6 h-8 bg-gradient-to-b from-secondary to-secondary/80 rounded-lg border border-border"
          animate={{
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Alternator pulley */}
          <motion.div
            className="absolute -bottom-1 left-1/2 w-3 h-3 bg-gradient-to-br from-muted to-muted-foreground rounded-full border border-border"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ transform: "translateX(-50%)" }}
          >
            <div className="absolute inset-0.5 rounded-full bg-gradient-to-br from-background to-muted" />
          </motion.div>

          {/* Alternator wires */}
          <div className="absolute top-1 right-0 w-1 h-2 bg-destructive rounded-full" />
          <div className="absolute top-2 right-0 w-1 h-2 bg-primary rounded-full" />
        </motion.div>

        {/* Spark Plug - More realistic design */}
        <motion.div
          className="absolute -top-4 -left-4 w-3 h-8 bg-gradient-to-b from-muted to-muted-foreground rounded-t-lg"
          animate={{
            y: [0, -3, 0],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Spark plug threads */}
          <div className="absolute top-4 left-0 w-full h-2 bg-foreground/60 border-t border-b border-border" />
          <div className="absolute top-5 left-0 w-full h-1 bg-muted" />

          {/* Spark plug electrode */}
          <div className="absolute bottom-0 left-1/2 w-1 h-3 bg-foreground rounded-b-full transform -translate-x-1/2" />

          {/* Spark effect */}
          <motion.div
            className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-primary rounded-full"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transform: "translateX(-50%)" }}
          />
        </motion.div>

        {/* Exhaust Pipe */}
        <motion.div
          className="absolute -bottom-3 -left-5 w-8 h-3 bg-gradient-to-r from-muted-foreground to-foreground rounded-full border border-border"
          animate={{
            x: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Exhaust heat waves */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute -top-1 right-0 w-0.5 h-2 bg-primary/60 rounded-full opacity-60"
              animate={{
                y: [-2, -6, -2],
                opacity: [0.6, 0.2, 0.6],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Brake Caliper */}
        <motion.div
          className="absolute -bottom-2 -right-4 w-4 h-5 bg-gradient-to-br from-destructive/80 to-destructive rounded-sm border border-destructive/70"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Brake pads */}
          <div className="absolute top-1 left-0 w-1 h-3 bg-muted rounded-sm" />
          <div className="absolute top-1 right-0 w-1 h-3 bg-muted rounded-sm" />

          {/* Brake fluid line */}
          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-primary rounded-full transform -translate-x-1/2" />
        </motion.div>

        {/* Oil Pump - Realistic oil circulation */}
        <motion.div
          className="absolute -left-3 top-1/2 w-3 h-4 bg-gradient-to-br from-secondary to-secondary/80 rounded-sm border border-border"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translateY(-50%)" }}
        >
          {/* Oil drops */}
          <motion.div
            className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary/80 rounded-full"
            animate={{
              y: [0, 8, 0],
              opacity: [0.8, 0.3, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ transform: "translateX(-50%)" }}
          />
        </motion.div>

        {/* Timing Belt - Connecting elements */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 opacity-30"
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Pistons with realistic movement */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-6 bg-gradient-to-b from-muted to-muted-foreground rounded-t-full border border-border"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "50% 50%",
            }}
            animate={{
              rotate: [0, 360],
              y: [-2, 2, -2],
              x: [
                Math.cos((i * Math.PI) / 2) * 20,
                Math.cos((i * Math.PI) / 2) * 24,
                Math.cos((i * Math.PI) / 2) * 20,
              ],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              y: { duration: 1, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {/* Piston rings */}
            <div className="absolute top-1 left-0 w-full h-0.5 bg-foreground rounded-full" />
            <div className="absolute top-2 left-0 w-full h-0.5 bg-foreground rounded-full" />

            {/* Connecting rod */}
            <div className="absolute bottom-0 left-1/2 w-1 h-4 bg-muted rounded-full transform -translate-x-1/2" />
          </motion.div>
        ))}

        {/* Engine Temperature Gauge */}
        <motion.div
          className="absolute top-0 left-1/2 w-1 h-4 bg-gradient-to-t from-primary/60 to-destructive/80 rounded-full"
          animate={{
            scaleY: [0.5, 1, 0.7, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translateX(-50%)" }}
        />

        {/* Radiator Fan Blades */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-8 bg-muted rounded-full"
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: "50% 50%",
            }}
            animate={{
              rotate: [i * 60, i * 60 + 360],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Loading Text with Engine Sound Effect */}
      {showText && (
        <motion.div
          className={cn(
            "text-center font-medium text-muted-foreground flex items-center gap-2",
            textSizeClasses[size]
          )}
          animate={{
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.span
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🔧
          </motion.span>
          {text}
          <motion.span
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.25,
            }}
          >
            ⚙️
          </motion.span>
        </motion.div>
      )}

      {/* Animated Status Indicators */}
      {showText && (
        <div className="flex gap-2 items-center">
          {/* Oil Pressure */}
          <motion.div
            className="flex items-center gap-1"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 bg-primary rounded-full" />
            <span className="text-xs text-muted-foreground">OIL</span>
          </motion.div>

          {/* Battery */}
          <motion.div
            className="flex items-center gap-1"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          >
            <div className="w-2 h-2 bg-secondary rounded-full" />
            <span className="text-xs text-muted-foreground">BATT</span>
          </motion.div>

          {/* Engine Temperature */}
          <motion.div
            className="flex items-center gap-1"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          >
            <div className="w-2 h-2 bg-destructive rounded-full" />
            <span className="text-xs text-muted-foreground">TEMP</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CarPartsLoader;
