'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="w-24 h-10 bg-gray-200 rounded-md animate-pulse" />;
  }

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
    >
      <LogIn size={16} />
      Sign In
    </button>
  );
} 