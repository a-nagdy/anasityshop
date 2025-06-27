"use client";

import { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  closeCart,
  fetchCart,
  openCart,
  toggleCart,
} from "../../store/slices/cartSlice";
import CartSidebar from "./CartSidebar";

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: React.ReactNode;
}

export default function CartProvider({ children }: CartProviderProps) {
  const dispatch = useAppDispatch();
  const { isOpen, totalItems, totalPrice, loading, error } = useAppSelector(
    (state) => state.cart
  );

  // Fetch cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleOpenCart = () => {
    dispatch(openCart());
  };

  const handleCloseCart = () => {
    dispatch(closeCart());
  };

  const handleToggleCart = () => {
    dispatch(toggleCart());
  };

  const value = {
    isCartOpen: isOpen,
    openCart: handleOpenCart,
    closeCart: handleCloseCart,
    toggleCart: handleToggleCart,
    totalItems,
    totalPrice,
    loading,
    error,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartSidebar isOpen={isOpen} onClose={handleCloseCart} />
    </CartContext.Provider>
  );
}
