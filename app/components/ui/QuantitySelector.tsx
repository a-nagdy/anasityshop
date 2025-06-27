"use client";

import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { forwardRef } from "react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  (
    {
      value,
      onChange,
      min = 1,
      max = 99,
      disabled = false,
      size = "md",
      className = "",
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    };

    const buttonSizeClasses = {
      sm: "w-8 h-8",
      md: "w-10 h-10",
      lg: "w-12 h-12",
    };

    const iconSizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const inputSizeClasses = {
      sm: "w-12 px-2 py-1",
      md: "w-16 px-3 py-2",
      lg: "w-20 px-4 py-3",
    };

    const handleDecrease = () => {
      if (value > min) {
        onChange(value - 1);
      }
    };

    const handleIncrease = () => {
      if (value < max) {
        onChange(value + 1);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value) || min;
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    };

    return (
      <div
        ref={ref}
        className={`flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}
      >
        <button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          className={`${buttonSizeClasses[size]} flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-300 dark:border-gray-600`}
        >
          <MinusIcon className={iconSizeClasses[size]} />
        </button>

        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          disabled={disabled}
          className={`${inputSizeClasses[size]} ${sizeClasses[size]} text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
        />

        <button
          type="button"
          onClick={handleIncrease}
          disabled={disabled || value >= max}
          className={`${buttonSizeClasses[size]} flex items-center justify-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-300 dark:border-gray-600`}
        >
          <PlusIcon className={iconSizeClasses[size]} />
        </button>
      </div>
    );
  }
);

QuantitySelector.displayName = "QuantitySelector";

export default QuantitySelector;
