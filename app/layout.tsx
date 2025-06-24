import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { SessionProvider } from 'next-auth/react';
import { AuthButton } from '../components/AuthButton';
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pulse",
  description: "Generate user personas from brand briefs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body className={`${inter.className} bg-white`}>
          <header className="fixed top-0 left-0 w-full p-4 bg-white/80 backdrop-blur-sm z-50 flex justify-between items-center border-b">
            <Link href="/" className="text-xl font-bold">
              Pulse
            </Link>
            <AuthButton />
          </header>
          <main className="pt-16">{children}</main>
        </body>
      </html>
    </SessionProvider>
  );
} 