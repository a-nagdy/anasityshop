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

      // Fetch fresh cart data after successful add
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

  const buttonContent = children || (
    <>
      {showIcon && (
        <ShoppingCartIcon
          className={
            size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5"
          }
        />
      )}
      {isButtonLoading ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}
    </>
  );

  return (
    <ThemeButton
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={!inStock || disabled || isButtonLoading}
      className={`flex items-center gap-2 ${className}`}
      glow={variant === "primary"}
    >
      {isButtonLoading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      )}
      {buttonContent}
    </ThemeButton>
  );
}
