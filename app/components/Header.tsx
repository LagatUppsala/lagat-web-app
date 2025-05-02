"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
    return () => unsubscribe();
  }, []);

  return (
    <header className="border-b-6 border-b-amber-500 text-black py-2 shadow-md w-full bg-white z-50">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:text-amber-700 transition-colors duration-200">
          <img src="/lagat-logo-transparent-bg.png" alt="Lagat logo" className="h-12 w-12" />
          <span className="text-5xl text-amber-500 font-extrabold">LAGAT</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-base font-bold">
          {user && (
            <>
              <Link href="/recipes" className="group hover:text-amber-500 transition-transform hover:-translate-y-1 duration-200">
                <span className="text-3xl font-semibold">RECEPT</span>
              </Link>
              <Link href="/userdashboard" className="group hover:text-amber-500 transition-transform hover:-translate-y-1 duration-200">
                <span className="text-3xl font-semibold">PROFIL</span>
              </Link>
            </>
          )}
          <Link href="/contact" className="group hover:text-amber-500 transition-transform hover:-translate-y-1 duration-200">
            <span className="text-3xl font-semibold">KONTAKT</span>
          </Link>
          {!user && (
            <>
              <Link href="/signin" className="group hover:text-amber-500 transition-transform hover:-translate-y-1 duration-200">
                <span className="text-3xl font-semibold">LOGGA IN</span>
              </Link>
              <Link href="/signup" className="group hover:text-amber-500 transition-transform hover:-translate-y-1 duration-200">
                <span className="text-3xl font-semibold">REGISTRERA DIG</span>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setMenuOpen(true)} className="md:hidden focus:outline-none" aria-label="Open menu">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 text-amber-500"
          >
            <path d="M5 12H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 17H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 7H20" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Sliding Menu */}
      <div
        className={`fixed inset-0 bg-amber-500 z-50 transform ${menuOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform duration-150 ease-out flex flex-col`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button onClick={() => setMenuOpen(false)} className="focus:outline-none absolute top-4 right-4" aria-label="Close menu">
            <svg
              viewBox="-0.5 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-14 w-14 text-white"
            >
              <path d="M3 21.32L21 3.32001" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 3.32001L21 21.32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 flex flex-col justify-center px-8 space-y-8 text-5xl bg-amber-500 font-bold">
          {user && (
            <>
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-white">
                HEM
              </Link>
              <Link href="/recipes" onClick={() => setMenuOpen(false)} className="text-white">
                RECEPT
              </Link>
              <Link href="/userdashboard" onClick={() => setMenuOpen(false)} className="text-white">
                PROFIL
              </Link>
            </>
          )}
          <Link href="/contact" onClick={() => setMenuOpen(false)} className="text-white">
            KONTAKT
          </Link>
          {!user && (
            <>
              <Link href="/" onClick={() => setMenuOpen(false)} className="text-white">
                HEM
              </Link>
              <Link href="/signin" onClick={() => setMenuOpen(false)} className="text-white">
                LOGGA IN
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="text-white">
                REGISTRERA DIG
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
