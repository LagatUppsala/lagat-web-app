import Header from "../components/Header";

export default function ContactPage() {
    return (
        <div>
            <Header />
            <div className="max-w-screen-sm mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-4">Kontakta oss</h1>
                <p className="text-lg mb-4">
                    Har du frågor, feedback eller idéer? Tveka inte att höra av dig!
                </p>
                <p className="text-lg">
                    Du kan nå oss via e-post på{" "}
                    <a
                        href="mailto:lagatuppsala@gmail.com"
                        className="text-blue-600 underline hover:text-blue-800"
                    >
                        lagatuppsala@gmail.com
                    </a>
                    .
                </p>
            </div>
        </div>
    );
}
