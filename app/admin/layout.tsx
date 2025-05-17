"use client";

import { Geist } from "next/font/google";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { ReduxProvider } from "../store/ReduxProvider";
import { checkAuthStatus } from "../store/slices/authSlice";
import DashboardWrapper from "./components/DashboardWrapper/DashboardWrapper";
import LoginComponent from "./components/LoginComponent/LoginComponent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Anasity Admin Dashboard",
//   description: "Admin dashboard for Anasity E-Commerce platform",
// };

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${geistSans.variable}`}>
      <ReduxProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ReduxProvider>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated, show login component
  if (!isAuthenticated) {
    return <LoginComponent />;
  }

  // Otherwise, show the dashboard layout with the children
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
