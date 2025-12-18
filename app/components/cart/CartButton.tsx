"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useAppSelector } from "../../store/hooks";

interface CartButtonProps {
  onClick: () => void;
  className?: string;
}

export default function CartButton({
  onClick,
  className = "",
}: CartButtonProps) {
  const { totalItems, loading } = useAppSelector((state) => state.cart);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 dark:text-primary hover:text-gray-900 dark:hover:text-white transition-colors ${className}`}
      aria-label="Shopping cart"
    >
      <ShoppingCartIcon className="w-6 h-6" />

      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[1.25rem] h-5 flex items-center justify-center px-1">
          {totalItems > 99 ? "99+" : totalItems}
        </span>
      )}

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </span>
      )}
    </button>
  );
}
