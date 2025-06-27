"use client";

import { CheckIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: number;
}

export default function CheckoutSteps({
  steps,
  currentStep,
}: CheckoutStepsProps) {
  return (
    <div className="flex items-center justify-center max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                ${
                  currentStep > step.number
                    ? "bg-green-600 border-green-600 text-white"
                    : currentStep === step.number
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                }
              `}
            >
              {currentStep > step.number ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckIcon className="w-6 h-6" />
                </motion.div>
              ) : (
                <span className="text-sm font-semibold">{step.number}</span>
              )}
            </motion.div>

            {/* Step Labels */}
            <div className="mt-2 text-center">
              <div
                className={`
                  text-sm font-medium transition-colors duration-300
                  ${
                    currentStep >= step.number
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {step.title}
              </div>
              <div
                className={`
                  text-xs transition-colors duration-300
                  ${
                    currentStep >= step.number
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }
                `}
              >
                {step.description}
              </div>
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className={`
                h-0.5 w-16 mx-4 mt-[-2rem] transition-colors duration-500
                ${
                  currentStep > step.number
                    ? "bg-green-600"
                    : currentStep === step.number
                    ? "bg-gradient-to-r from-blue-600 to-gray-300 dark:to-gray-600"
                    : "bg-gray-300 dark:bg-gray-600"
                }
              `}
              style={{ originX: 0 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
