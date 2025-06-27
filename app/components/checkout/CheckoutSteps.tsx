"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface CheckoutStepsProps {
  currentStep: number;
  steps?: Step[];
}

const defaultSteps: Step[] = [
  { number: 1, title: "Shipping", description: "Delivery information" },
  { number: 2, title: "Payment", description: "Payment details" },
  { number: 3, title: "Confirmation", description: "Order placed" },
];

export default function CheckoutSteps({
  currentStep,
  steps = defaultSteps,
}: CheckoutStepsProps) {
  return (
    <div className="px-4 py-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-5">
          {steps.map((step, stepIdx) => (
            <li key={step.number} className="relative">
              {stepIdx !== steps.length - 1 ? (
                <div
                  className="absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-full bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="group relative flex items-start">
                <span className="flex h-9 items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200 ${
                      step.number < currentStep
                        ? "border-blue-600 bg-blue-600 text-white"
                        : step.number === currentStep
                        ? "border-blue-600 bg-white dark:bg-gray-800 text-blue-600"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckIcon className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      step.number
                    )}
                  </span>
                </span>
                <span className="ml-4 flex min-w-0 flex-col">
                  <span
                    className={`text-sm font-medium transition-colors duration-200 ${
                      step.number <= currentStep
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {step.description}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
