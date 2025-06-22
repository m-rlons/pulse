import '../styles/globals.css';
import { Inter } from 'next/font/google';
import Header from '../components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pulse',
  description: 'AI-driven Persona Development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full flex flex-col`}>
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
} 