"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../firebase/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function SignInForm() {
    const router = useRouter();

    // State variables to store email, password, and potential error message.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    // Handles form submission and Firebase sign in.
    const handleSignIn = async (e:any) => {
        e.preventDefault();
        setError(null);

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            router.push('/userdashboard');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="bg-white p-4 md:p-8 rounded shadow-lg w-full max-w-md">
            <h1 className="text-4xl font-bold text-amber-500 mb-6 text-center">
                Välkommen tillbaka
            </h1>
            <form onSubmit={handleSignIn}>
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-gray-700 text-2xl font-bold mb-2"
                    >
                        EMAIL
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="godochbillig@mat.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded text-lg focus:outline-none focus:border-amber-500"
                    />
                </div>
                <div className="mb-6">
                    <label
                        htmlFor="password"
                        className="block text-gray-700 text-2xl font-bold mb-2"
                    >
                        LÖSENORD
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Ange ditt lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded text-lg focus:outline-none focus:border-amber-500"
                    />
                </div>
                {error && (
                    <p className="text-red-500 text-lg mb-4">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    className="w-full bg-amber-500 text-white font-bold py-2 px-4 rounded hover:bg-amber-600 focus:outline-none"
                >
                    LOGGA IN
                </button>
            </form>
        </div>
    );
}
