import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import AppBar from "@/components/AppBar";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Planner | OC Transpo (COMP 3008 prototype)",
  description: "A guided, step-by-step trip planner. Student project for COMP 3008, not an official OC Transpo site.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>
            <a href="#main" className="skip-link">
              Skip to the trip planner
            </a>
            <AppBar />
            <main id="main" className="flex flex-1 flex-col items-center bg-white sm:bg-transparent sm:px-10 sm:py-6">
              {children}
            </main>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
