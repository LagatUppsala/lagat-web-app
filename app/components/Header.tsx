// components/Header.tsx
"use client";

export default function Header() {
    return (
        <header className="bg-orange-400 text-white py-4 shadow-md">
            <div className="max-w-screen-lg mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2 text-2xl font-bold gap-2">
                    <img src="/lagat-logo-micro.png" alt="" className="h-8 w-8"/>
                    Lagat
                </div>

                {/* Navbar */}
                <nav className="space-x-6 text-base">
                    <a href="#" className="hover:underline">Home</a>
                    <a href="#" className="hover:underline">Recipes</a>
                    <a href="#" className="hover:underline">Offers</a>
                    <a href="#" className="hover:underline">Contact</a>
                </nav>
            </div>
        </header>
    );
}
