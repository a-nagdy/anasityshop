"use client";

import { useState, useEffect } from "react";

interface ColorSettingsProps {
  backgroundColor: string;
  accentColor: string;
  onChange: (colors: { backgroundColor: string; accentColor: string }) => void;
}

export default function ColorSettings({
  backgroundColor,
  accentColor,
  onChange,
}: ColorSettingsProps) {
  const [colors, setColors] = useState({
    backgroundColor,
    accentColor,
  });

  useEffect(() => {
    setColors({
      backgroundColor,
      accentColor,
    });
  }, [backgroundColor, accentColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedColors = {
      ...colors,
      [name]: value,
    };
    setColors(updatedColors);
    onChange(updatedColors);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Color Settings
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Background Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              name="backgroundColor"
              value={colors.backgroundColor}
              onChange={handleColorChange}
              className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600 mr-2"
            />
            <input
              type="text"
              name="backgroundColor"
              value={colors.backgroundColor}
              onChange={handleColorChange}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div 
            className="mt-2 h-10 w-full rounded-md border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: colors.backgroundColor }}
          ></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Accent Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              name="accentColor"
              value={colors.accentColor}
              onChange={handleColorChange}
              className="h-10 w-10 rounded border border-gray-300 dark:border-gray-600 mr-2"
            />
            <input
              type="text"
              name="accentColor"
              value={colors.accentColor}
              onChange={handleColorChange}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div 
            className="mt-2 h-10 w-full rounded-md border border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: colors.accentColor }}
          ></div>
        </div>
      </div>
    </div>
  );
}
