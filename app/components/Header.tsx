

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-amber-500 text-white py-4 shadow-md">
      <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold hover:text-amber-800 transition-colors duration-200"
        >
          <img src="/lagat-logo-micro.png" alt="Lagat logo" className="h-8 w-8" />
          Lagat
        </Link>

        {/* Navbar */}
        <nav className="space-x-6 text-base font-bold">
          <Link
            href="/"
            className="hover:text-amber-800 transition-colors duration-200"
          >
            Recept
          </Link>
          <Link
            href="/contact"
            className="hover:text-amber-800 transition-colors duration-200"
          >
            Kontakt
          </Link>
        </nav>
      </div>
    </header>
  );
}
