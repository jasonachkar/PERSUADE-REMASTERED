import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";
import UserSync from '@/components/UserSync';
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PERSUADE",
  description: "Your personalized sales trainer",
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <ClerkProvider>
      <UserSync />
      <html lang="en">
        <body
          className={`${inter.className} bg-white`}
        >
          <header className="sticky top-0 z-50 w-full bg-white">
            <div className='navContent flex items-center justify-between px-4 py-3 container mx-auto'>
              <div className="flex items-center">
                <Link href="/" className="flex items-center text-xl font-bold space-x-2">
                  <Image
                    src="/logo.svg"
                    alt="Persuade"
                    width={25}
                    height={25}
                    className="w-6 h-6"
                  />
                  <span>PERSUADE</span>
                </Link>
              </div>

              <nav className='navbar flex items-center justify-center space-x-4 flex-1'>
                <Link href="/dashboard" className="navLink">
                  <button className="px-4 py-2 rounded-md hover:bg-gray-100">Dashboard</button>
                </Link>
                <Link href="/about" className="navLink">
                  <button className="px-4 py-2 rounded-md hover:bg-gray-100">About</button>
                </Link>
                <Link href="/pricing" className="navLink">
                  <button className="px-4 py-2 rounded-md hover:bg-gray-100">Pricing</button>
                </Link>
              </nav>

              <SignedOut>
                <div className="flex items-center gap-4">
                  <SignInButton mode="modal">
                    <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium 
                      transform hover:scale-105 hover:shadow-lg transition-all duration-300 
                      active:scale-95">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 rounded-lg font-medium 
                      hover:bg-indigo-50 transform hover:scale-105 hover:shadow-lg transition-all duration-300 
                      active:scale-95">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
