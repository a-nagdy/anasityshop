"use client";

import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

interface DualRangeSliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: "top" | "bottom";
  label?: (value: number | undefined) => React.ReactNode;
  accentColor?: string;
}

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(
  (
    {
      className,
      label,
      labelPosition = "top",
      accentColor = "#06b6d4",
      ...props
    },
    ref
  ) => {
    const initialValue = Array.isArray(props.value)
      ? props.value
      : [props.min, props.max];

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center py-3",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-lg bg-gradient-to-r from-slate-700 to-slate-600">
          <SliderPrimitive.Range
            className="absolute h-full rounded-lg"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`,
              boxShadow: `0 0 10px rgba(${hexToRgb(accentColor)}, 0.5)`,
            }}
          />
        </SliderPrimitive.Track>
        {initialValue.map((value, index) => (
          <React.Fragment key={index}>
            <SliderPrimitive.Thumb
              className="relative block h-5 w-5 rounded-full border-2 border-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, #ffffff)`,
                boxShadow: `0 4px 15px rgba(${hexToRgb(accentColor)}, 0.4)`,
              }}
            >
              {label && (
                <span
                  className={cn(
                    "absolute flex w-full justify-center text-white font-mono bg-white/10 px-2 py-1 rounded-lg text-sm",
                    labelPosition === "top" && "-top-9",
                    labelPosition === "bottom" && "top-7"
                  )}
                >
                  {label(value)}
                </span>
              )}
            </SliderPrimitive.Thumb>
          </React.Fragment>
        ))}
      </SliderPrimitive.Root>
    );
  }
);
DualRangeSlider.displayName = "DualRangeSlider";

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "6, 182, 212";
}

export { DualRangeSlider };
