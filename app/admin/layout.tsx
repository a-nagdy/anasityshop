"use client";

import { Geist } from "next/font/google";
import { Suspense, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import ReduxProvider from "../store/ReduxProvider";
import { checkAuthStatus } from "../store/slices/authSlice";
import DashboardWrapper from "./components/DashboardWrapper/DashboardWrapper";
import Loader from "./components/Loader/Loader";
import LoginComponent from "./components/LoginComponent/LoginComponent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Elyana Admin Dashboard",
//   description: "Admin dashboard for Elyana E-Commerce platform",
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
        <Loader />
      </div>
    );
  }

  // If user is not authenticated, show login component
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<Loader />}>
        <LoginComponent />
      </Suspense>
    );
  }

  // Otherwise, show the dashboard layout with the children
  return (
    <Suspense fallback={<Loader />}>
      <DashboardWrapper>{children}</DashboardWrapper>
    </Suspense>
  );
}
