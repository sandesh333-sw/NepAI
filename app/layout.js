import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import NavBar from "./(main)/navbar/page";
import Footer from "./(main)/footer/page";
import { assertClerkProdKeys } from "@/lib/envGuard";
import ToastProvider from "./ToastProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NepAI - AI-powered solutions",
  description: "AI-powered solutions for your needs",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  }
};

export default function RootLayout({ children }) {
  assertClerkProdKeys();

  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        >
          <NavBar />
          <main className="flex-1 min-h-0">
            {children}
          </main>
          <Footer />
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  );
}