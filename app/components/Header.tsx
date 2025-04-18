"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";


export default function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="border-b-6 border-b-amber-500 text-black py-2 shadow-md">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:text-amber-700 transition-colors duration-200">
          <img src="/lagat-logo-transparent-bg.png" alt="Lagat logo" className="h-16 w-16" />
          <span className="text-6xl text-amber-500 font-extrabold">LAGAT</span>
        </Link>

        {/* Navbar */}
        <nav className="space-x-6 flex text-base font-bold">
          {user && (
            <>
              <Link
                href="/recipes"
                className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
              >
                <span className="text-3xl font-semibold">RECEPT</span>
              </Link>
              <Link
                href="/userdashboard"
                className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
              >
                <span className="text-3xl font-semibold">PROFIL</span>
              </Link>
            </>

          )}
          <Link
            href="/contact"
            className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
          >
            <span className="text-3xl font-semibold">KONTAKT</span>
          </Link>
          {!user && (
            <>
              <Link
                href="/signin"
                className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
              >
                <span className="text-3xl font-semibold">LOGGA IN</span>
              </Link>
              <Link
                href="/signup"
                className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
              >
                <span className="text-3xl font-semibold">REGISTRERA DIG</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
