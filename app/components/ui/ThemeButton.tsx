"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ThemeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
}

const ThemeButton = forwardRef<HTMLButtonElement, ThemeButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      glow = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent";

    const variantClasses = {
      primary:
        "text-white font-semibold rounded-xl border transition-all duration-300 backdrop-blur-sm hover:scale-105",
      secondary: "btn-theme-secondary",
      accent: "theme-accent-bg text-white hover:opacity-90",
      ghost: "theme-accent hover:theme-accent-bg-10 border-transparent",
    };

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    const glowClass = glow ? "theme-glow" : "";

    const allClasses =
      `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClass} ${className}`.trim();

    // Apply gradient background for primary variant
    const style =
      variant === "primary"
        ? {
            background: "var(--theme-gradient-accent)",
            borderColor: "var(--theme-primary-30)",
            ...props.style,
          }
        : props.style;

    return (
      <button ref={ref} className={allClasses} style={style} {...props}>
        {children}
      </button>
    );
  }
);

ThemeButton.displayName = "ThemeButton";

export default ThemeButton;
