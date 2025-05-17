"use client";

import { ReactNode } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
