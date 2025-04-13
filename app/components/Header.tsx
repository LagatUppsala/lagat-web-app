

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b-6 border-b-amber-500 text-black py-2 shadow-md">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold hover:text-amber-700 transition-colors duration-200">
          <img src="/lagat-logo-transparent-bg.png" alt="Lagat logo" className="h-16 w-16" />
          <span className="text-5xl text-amber-500 font-extrabold">LAGAT</span> 
        </Link>

        {/* Navbar */}
        <nav className="space-x-6 flex text-base font-bold">
          <Link
            href="/"
            className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
          >
            <span className="text-4xl font-semibold ">RECEPT</span>
          </Link>
          <Link
            href="/contact"
            className="group block hover:text-amber-500 transition-colors transition-transform hover:-translate-y-1 duration-200"
          >
            <span className="text-4xl font-semibold transition-transform hover:-translate-y-1">KONTAKT</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
