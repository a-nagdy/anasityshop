"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToCart, fetchCart } from "../../store/slices/cartSlice";
import ThemeButton from "./ThemeButton";

interface AddToCartButtonProps {
  productId: string;
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
  inStock?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onCartUpdate?: () => void;
  showIcon?: boolean;
  children?: React.ReactNode;
  iconOnly?: boolean;
  customIcon?: React.ReactNode;
  loadingText?: string;
  successText?: string;
  outOfStockText?: string;
  fullWidth?: boolean;
}

export default function AddToCartButton({
  productId,
  quantity = 1,
  selectedColor,
  selectedSize,
  inStock = true,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  onCartUpdate,
  showIcon = true,
  children,
  iconOnly = false,
  customIcon,
  loadingText = "Adding...",
  successText,
  outOfStockText = "Out of Stock",
  fullWidth = false,
}: AddToCartButtonProps) {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.cart);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!inStock || disabled) return;

    setIsLoading(true);

    try {
      const result = await dispatch(
        addToCart({
          productId,
          quantity,
          color: selectedColor,
          size: selectedSize,
        })
      ).unwrap();

      console.log("AddToCart result:", result);

      await dispatch(fetchCart());

      toast.success("Product added to cart!");
      onCartUpdate?.();
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error(error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonLoading = isLoading || loading;

  // Determine icon size based on button size
  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  // Render the appropriate icon
  const renderIcon = () => {
    if (!showIcon && !iconOnly) return null;

    const iconClass = getIconSize();

    if (customIcon) {
      return <span className={iconClass}>{customIcon}</span>;
    }

    return <ShoppingCartIcon className={iconClass} />;
  };

  // Determine button text
  const getButtonText = () => {
    if (isButtonLoading) return loadingText;
    if (!inStock) return outOfStockText;
    if (successText && !isButtonLoading) return successText;
    return "Add to Cart";
  };

  // Build button content
  const buttonContent = children || (
    <>
      {renderIcon()}
      {!iconOnly && getButtonText()}
    </>
  );

  // Build final className
  const finalClassName = [
    "flex items-center",
    iconOnly ? "justify-center" : "gap-2",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ThemeButton
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={!inStock || disabled || isButtonLoading}
      className={finalClassName}
      glow={variant === "primary"}
    >
      {isButtonLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )}
      {buttonContent}
    </ThemeButton>
  );
}
