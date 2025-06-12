"use client";

import Footer from "./Footer";
import Header from "./Header";

interface ShopLayoutProps {
  children: React.ReactNode;
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow pt-16">{children}</div>
      <Footer />
    </div>
  );
}
