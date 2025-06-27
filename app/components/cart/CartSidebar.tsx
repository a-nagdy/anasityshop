"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon, TrashIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { generateCartItemKey } from "../../../utils/cartUtils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  removeFromCart,
  removeLocalItem,
  setUpdating,
  updateCartItem,
  updateLocalQuantity,
} from "../../store/slices/cartSlice";
import QuantitySelector from "../ui/QuantitySelector";
import ThemeButton from "../ui/ThemeButton";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, loading, updating, totalItems, totalPrice } = useAppSelector(
    (state) => state.cart
  );

  const handleUpdateQuantity = async (
    cartItemKey: string,
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ) => {
    // Optimistic update for immediate UI feedback
    dispatch(updateLocalQuantity({ cartItemKey, quantity }));
    dispatch(setUpdating(productId));

    try {
      await dispatch(
        updateCartItem({ cartItemKey, productId, quantity, color, size })
      ).unwrap();
      toast.success("Cart updated!");
    } catch (error) {
      toast.error(error as string);
      // Revert optimistic update by refetching cart or reverting state
    }
  };

  const handleRemoveItem = async (
    cartItemKey: string,
    productId: string,
    color?: string,
    size?: string
  ) => {
    // Optimistic update for immediate UI feedback
    dispatch(removeLocalItem({ cartItemKey }));
    dispatch(setUpdating(productId));

    try {
      await dispatch(
        removeFromCart({ cartItemKey, productId, color, size })
      ).unwrap();
      toast.success("Item removed from cart!");
    } catch (error) {
      toast.error(error as string);
      // Revert optimistic update by refetching cart
    }
  };

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <ShoppingCartIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shopping Cart
                </h2>
                {totalItems > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Start shopping to add items to your cart
                  </p>
                  <ThemeButton onClick={onClose} variant="primary" size="md">
                    Continue Shopping
                  </ThemeButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    // Generate cart item key if not present (for backward compatibility)
                    const cartItemKey =
                      item.cartItemKey ||
                      generateCartItemKey(item.product._id, {
                        color: item.color || item.variants?.color,
                        size: item.size || item.variants?.size,
                      });

                    return (
                      <motion.div
                        key={cartItemKey}
                        layout
                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                      >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.product.name}
                          </h4>

                          {(item.color || item.size) && (
                            <div className="flex gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {item.color && <span>Color: {item.color}</span>}
                              {item.size && <span>Size: {item.size}</span>}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <QuantitySelector
                              value={item.quantity}
                              onChange={(quantity) =>
                                handleUpdateQuantity(
                                  cartItemKey,
                                  item.product._id,
                                  quantity,
                                  item.color ||
                                    item.variants?.color ||
                                    undefined,
                                  item.size || item.variants?.size || undefined
                                )
                              }
                              min={1}
                              max={item.product.quantity}
                              disabled={updating === item.product._id}
                              size="sm"
                            />

                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                $
                                {(
                                  item.totalPrice || item.price * item.quantity
                                ).toFixed(2)}
                              </div>
                              {item.product.discountPrice && (
                                <div className="text-xs text-gray-500 line-through">
                                  $
                                  {(item.product.price * item.quantity).toFixed(
                                    2
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleRemoveItem(
                              cartItemKey,
                              item.product._id,
                              (item.color || item.variants?.color) ?? undefined,
                              (item.size || item.variants?.size) ?? undefined
                            )
                          }
                          disabled={updating === item.product._id}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                <div className="space-y-3">
                  <ThemeButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </ThemeButton>

                  <ThemeButton
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={onClose}
                  >
                    Continue Shopping
                  </ThemeButton>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
