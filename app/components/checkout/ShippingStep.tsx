"use client";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CheckoutService } from "../../services/checkoutService";
import { CheckoutData, SavedAddress } from "../../types/checkout";
import ThemeButton from "../ui/ThemeButton";

interface ShippingStepProps {
  initialData: CheckoutData["shipping"];
  onComplete: (data: CheckoutData["shipping"]) => void;
  onBack: () => void;
}

interface LoadingStates {
  fetchingAddresses: boolean;
  savingAddress: boolean;
  submitting: boolean;
}

export default function ShippingStep({
  initialData,
  onComplete,
  onBack,
}: ShippingStepProps) {
  const [formData, setFormData] =
    useState<CheckoutData["shipping"]>(initialData);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    fetchingAddresses: false,
    savingAddress: false,
    submitting: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (hasUserInteracted) {
      const timer = setTimeout(() => {
        localStorage.setItem(
          "checkout-shipping-draft",
          JSON.stringify(formData)
        );
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, hasUserInteracted]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const draft = localStorage.getItem("checkout-shipping-draft");
    if (draft && !initialData.fullName) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
        toast.info("Restored your previous shipping information");
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [initialData.fullName]);

  const fetchSavedAddresses = async () => {
    setLoadingStates((prev) => ({ ...prev, fetchingAddresses: true }));
    try {
      const addresses = await CheckoutService.getSavedAddresses();
      setSavedAddresses(addresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load saved addresses");
    } finally {
      setLoadingStates((prev) => ({ ...prev, fetchingAddresses: false }));
    }
  };

  const validateForm = useCallback((): boolean => {
    const mockCheckoutData: CheckoutData = {
      shipping: formData,
      payment: { method: "" }, // Mock payment data for validation
    };

    const validation = CheckoutService.validateCheckoutData(mockCheckoutData);

    // Extract only shipping-related errors
    const shippingErrors: Record<string, string> = {};
    Object.entries(validation.errors).forEach(([key, value]) => {
      if (key.startsWith("shipping.")) {
        shippingErrors[key.replace("shipping.", "")] = value;
      }
    });

    setErrors(shippingErrors);
    return Object.keys(shippingErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof CheckoutData["shipping"], value: string) => {
      setHasUserInteracted(true);
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    },
    [errors]
  );

  const handleAddressSelect = useCallback(
    (address: SavedAddress) => {
      setHasUserInteracted(true);
      setFormData({
        fullName: address.fullName || "",
        address: address.addressLine1 || "",
        city: address.city || "",
        state: address.state || "",
        postalCode: address.postalCode || "",
        country: address.country || "",
        phone: address.phone || "",
        notes: formData.notes || "", // Keep existing notes
      });
      setErrors({});
      toast.success("Address loaded successfully");
    },
    [formData.notes]
  );

  const handleSaveAddress = async () => {
    if (!saveAddress) return;

    setLoadingStates((prev) => ({ ...prev, savingAddress: true }));
    try {
      // Convert formData to match Address model schema
      const addressData = {
        fullName: formData.fullName,
        addressLine1: formData.address, // Map 'address' to 'addressLine1'
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
      };

      await CheckoutService.saveAddress(addressData);
      toast.success("Address saved successfully!");
      setSaveAddress(false);
      await fetchSavedAddresses(); // Refresh the list
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setLoadingStates((prev) => ({ ...prev, savingAddress: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loadingStates.submitting) return;

    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoadingStates((prev) => ({ ...prev, submitting: true }));

    try {
      // Save address if requested
      if (saveAddress) {
        await handleSaveAddress();
      }

      // Clear draft from localStorage
      localStorage.removeItem("checkout-shipping-draft");

      onComplete(formData);
      toast.success("Shipping information saved!");
    } catch (error) {
      console.error("Error processing shipping:", error);
      toast.error("Failed to process shipping information");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submitting: false }));
    }
  };

  const isFormValid = useMemo(() => {
    return (
      formData.fullName?.trim() &&
      formData.address?.trim() &&
      formData.city?.trim() &&
      formData.state?.trim() &&
      formData.postalCode?.trim() &&
      formData.country?.trim() &&
      formData.phone?.trim()
    );
  }, [formData]);

  const isSubmitting = loadingStates.submitting || loadingStates.savingAddress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <MapPinIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shipping Information
        </h2>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Saved Addresses
          </h3>
          {loadingStates.fetchingAddresses ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid gap-3 mb-4">
              {savedAddresses.map((address) => (
                <motion.div
                  key={address._id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {address.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.addressLine1}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {address.country}
                      </p>
                    </div>
                    {address.isDefault && (
                      <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shipping Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName || ""}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.fullName
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="John Doe"
              disabled={isSubmitting}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.phone
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="+1 (555) 123-4567"
              disabled={isSubmitting}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address *
          </label>
          <input
            type="text"
            value={formData.address || ""}
            onChange={(e) => handleInputChange("address", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.address
                ? "border-red-500 ring-2 ring-red-500/20"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="123 Main Street, Apt 4B"
            disabled={isSubmitting}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.address}
            </p>
          )}
        </div>

        {/* City, State, Postal Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              City *
            </label>
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.city
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="New York"
              disabled={isSubmitting}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              State/Province *
            </label>
            <input
              type="text"
              value={formData.state || ""}
              onChange={(e) => handleInputChange("state", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.state
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="NY"
              disabled={isSubmitting}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.state}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              value={formData.postalCode || ""}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.postalCode
                  ? "border-red-500 ring-2 ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="10001"
              disabled={isSubmitting}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.postalCode}
              </p>
            )}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Country *
          </label>
          <select
            value={formData.country || ""}
            onChange={(e) => handleInputChange("country", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.country
                ? "border-red-500 ring-2 ring-red-500/20"
                : "border-gray-300 dark:border-gray-600"
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select Country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="IT">Italy</option>
            <option value="ES">Spain</option>
            <option value="AU">Australia</option>
            <option value="JP">Japan</option>
            <option value="CN">China</option>
            <option value="IN">India</option>
            <option value="BR">Brazil</option>
            <option value="MX">Mexico</option>
            <option value="KR">South Korea</option>
            <option value="SG">Singapore</option>
            <option value="AE">United Arab Emirates</option>
            <option value="ZA">South Africa</option>
            <option value="EG">Egypt</option>
            <option value="NG">Nigeria</option>
            <option value="FI">Finland</option>
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.country}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Delivery Notes (Optional)
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={3}
            placeholder="Special delivery instructions, preferred delivery time, etc."
            disabled={isSubmitting}
          />
        </div>

        {/* Save Address Option */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="saveAddress"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label
            htmlFor="saveAddress"
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            Save this address for future orders
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <ThemeButton
            type="button"
            variant="secondary"
            onClick={onBack}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Cart
          </ThemeButton>

          <ThemeButton
            type="submit"
            variant="primary"
            className="flex items-center justify-center gap-2 flex-1"
            disabled={!isFormValid || isSubmitting}
            glow
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {loadingStates.savingAddress
                  ? "Saving Address..."
                  : "Processing..."}
              </>
            ) : (
              <>
                <ArrowRightIcon className="w-4 h-4" />
                Continue to Payment
              </>
            )}
          </ThemeButton>
        </div>
      </form>
    </motion.div>
  );
}
