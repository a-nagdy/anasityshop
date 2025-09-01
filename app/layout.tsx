import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initCronJobs } from "../utils/cron";
import connectToDatabase from "../utils/db";
import { initializeOptimizations } from "../utils/initOptimizations";
import CartProvider from "./components/cart/CartProvider";
import GlobalBackground from "./components/GlobalBackground";
import ThemeProvider from "./components/ThemeProvider";
import "./globals.css";
import ReduxProvider from "./store/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Initialize database connection and optimizations only once
let isAppInitialized = false;

async function initializeApp() {
  if (isAppInitialized) return;

  try {
    console.log("🚀 Initializing Anasity Shop application...");
    await connectToDatabase();
    await initializeOptimizations();

    // Initialize cron jobs (in production only to avoid duplicate cron jobs in development)
    if (process.env.NODE_ENV === "production") {
      initCronJobs();
    }

    isAppInitialized = true;
    console.log("✅ Anasity Shop application initialized successfully");
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
}

export const metadata: Metadata = {
  title: "Anasity Shop - Futuristic E-Commerce Experience",
  description:
    "Experience the future of online shopping with our cyberpunk-inspired e-commerce platform featuring dynamic themes and cutting-edge design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize app on first render
  if (typeof window === "undefined") {
    initializeApp();
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <ThemeProvider>
            <CartProvider>
              <GlobalBackground />
              <div className="relative z-10">{children}</div>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
              />
            </CartProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
