import Header from "./components/Header";
import Link from "next/link";

export default function HomePage() {
    return (
        <div>
            <Header />
            <section className="min-h-screen flex flex-col md:flex-row items-center justify-between px-8 py-8 md:py-16 bg-white">
                {/* Left Text Section */}
                <div className="w-full md:w-1/2 max-w-xl mb-8 md:mb-0">
                    <h1 className="text-5xl md:text-7xl font-bold leading-none text-amber-500 mb-6">
                        Smartare matlagning börjar här
                    </h1>
                    <p className="text-base md:text-lg text-gray-800 mb-8">
                        Laga god mat utifrån nuvarande extrapriser för en hållbarare ekonomi och miljö.
                    </p>
                    <Link href="./signup">
                        <button className="hover:cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white text-lg font-medium rounded-2xl shadow-md transition duration-200">
                            Kom igång!
                        </button>
                    </Link>
                </div>

                {/* Right Image Section */}
                <div className="w-full md:w-1/2 flex justify-center">
                    <img
                        src="/hero-img.png"
                        alt="Fresh ingredients and a recipe book"
                        className="rounded-3xl shadow-lg object-cover w-full h-auto max-w-md"
                    />
                </div>
            </section>
        </div>
    );
}
