import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./../styles/globals.css";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pulse",
  description: "Your AI-powered brand strategist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white`}>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
} 