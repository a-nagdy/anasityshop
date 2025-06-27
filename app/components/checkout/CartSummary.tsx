"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import Image from "next/image";
import { CartItem } from "../../store/slices/cartSlice";
import ThemeButton from "../ui/ThemeButton";

interface CartSummaryProps {
  items: CartItem[];
  onContinue: () => void;
  onBack: () => void;
}

export default function CartSummary({
  items,
  onContinue,
  onBack,
}: CartSummaryProps) {
  const calculateSubtotal = () => {
    return items.reduce(
      (total, item) => total + (item.totalPrice || item.price * item.quantity),
      0
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Review Your Order
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <motion.div
            key={item.cartItemKey}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {item.product.name}
              </h3>

              {(item.color ||
                item.size ||
                item.variants?.color ||
                item.variants?.size) && (
                <div className="flex gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {(item.color || item.variants?.color) && (
                    <span>Color: {item.color || item.variants?.color}</span>
                  )}
                  {(item.size || item.variants?.size) && (
                    <span>Size: {item.size || item.variants?.size}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Qty: {item.quantity}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    × ${item.price.toFixed(2)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    $
                    {(item.totalPrice || item.price * item.quantity).toFixed(2)}
                  </span>
                  {item.product.discountPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                {item.product.quantity >= item.quantity ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    Low Stock ({item.product.quantity} left)
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtotal */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900 dark:text-white">
            Subtotal
          </span>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${calculateSubtotal().toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Shipping and taxes calculated at next step
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <ThemeButton
          variant="secondary"
          size="lg"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Continue Shopping
        </ThemeButton>

        <ThemeButton
          variant="primary"
          size="lg"
          onClick={onContinue}
          className="flex-1 flex items-center justify-center gap-2"
          glow
        >
          Proceed to Shipping
          <ArrowRightIcon className="w-5 h-5" />
        </ThemeButton>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-400 text-center">
          🔒 Your order is secured with SSL encryption
        </p>
      </div>
    </motion.div>
  );
}
