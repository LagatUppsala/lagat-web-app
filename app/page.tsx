import Header from "./components/Header";
import Link from "next/link";


export default function HomePage() {


    return (
        <div>
            <Header />
            <section className="min-h-screen flex items-center justify-between px-8 py-16 bg-white">
                {/* Left Text Section */}
                <div className="max-w-xl">
                    <h1 className="text-5xl font-bold leading-tight text-amber-500 mb-6">
                        Smartare matlagning börjar här
                    </h1>
                    <p className="text-lg text-gray-800 mb-8">
                        Laga god mat utifrån nuvarande extrapriser för en hållbarare ekonomi och miljö.
                    </p>
                    <Link href="./signup">
                        <button className="hover:cursor-pointer px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white text-lg font-medium rounded-2xl shadow-md transition duration-200">
                            Kom igång!
                        </button>
                    </Link>

                </div>

                {/* Right Image Section */}
                <div className="hidden md:block md:w-1/2 pl-12">
                    <img
                        src="/hero-img.png"
                        alt="Fresh ingredients and a recipe book"
                        className="rounded-3xl shadow-lg object-cover w-full h-auto"
                    />
                </div>
            </section>
        </div>
    );
}