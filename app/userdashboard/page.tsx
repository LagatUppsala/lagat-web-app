"use client";
import Link from "next/link";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import UserIngredientList from "../components/UserIngredientsList";
import { useRouter } from "next/navigation";
import { storeOptions } from "../lib/constants";
import { Store } from "../lib/types";

export default function UserDashboard() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [prefStoreId, setPrefStoreId] = useState("")

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
                const userRef = doc(db, "users", u.uid);
                const snap = await getDoc(userRef);
                setUserData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
                setPrefStoreId(snap.exists() ? snap.data().preferred_store : "")
            } else {
                setUser(null);
                setUserData(null);
                setPrefStoreId("")
            }
        });
        return () => unsubscribe();
    }, []);

    if (user == null || userData == null) {
        return (
            <>
                <Header />
                <p>Användare kunde inte hittas</p>
            </>
        );
    }

    const handleSignOut = () => {
        auth.signOut();
        router.push("/");
    }

    const handlePrefStoreChange = async (id: string) => {
        const storeId = id.trim()

        try {
            const token = await auth.currentUser!.getIdToken()
            await fetch("https://europe-north1-lagat-e1c30.cloudfunctions.net/update_preferred_store", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ store_id: storeId }),
            })
        } catch (e) {
            console.error(e)
        }
        
    }

    return (
        <>
            <Header />
            <div className="max-w-screen-lg mx-auto p-4">
                <div className="mt-8">
                    {/* User greeting and settings link */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold">
                                Hej, {userData?.name || user?.email || "Användare"}!
                            </h1>
                            <Link
                                href="/usersettings"
                                className="p-2 rounded-full transition-colors duration-200 hover:bg-amber-100 cursor-pointer"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    stroke="#f59e0b"
                                    className="w-8 h-8"
                                >
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0" />
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                                    <g id="SVGRepo_iconCarrier">
                                        <path
                                            d="M10.255 4.18806C9.84269 5.17755 8.68655 5.62456 7.71327 5.17535C6.10289 4.4321 4.4321 6.10289 5.17535 7.71327C5.62456 8.68655 5.17755 9.84269 4.18806 10.255C2.63693 10.9013 2.63693 13.0987 4.18806 13.745C5.17755 14.1573 5.62456 15.3135 5.17535 16.2867C4.4321 17.8971 6.10289 19.5679 7.71327 18.8246C8.68655 18.3754 9.84269 18.8224 10.255 19.8119C10.9013 21.3631 13.0987 21.3631 13.745 19.8119C14.1573 18.8224 15.3135 18.3754 16.2867 18.8246C17.8971 19.5679 19.5679 17.8971 18.8246 16.2867C18.3754 15.3135 18.8224 14.1573 19.8119 13.745C21.3631 13.0987 21.3631 10.9013 19.8119 10.255C18.8224 9.84269 18.3754 8.68655 18.8246 7.71327C19.5679 6.10289 17.8971 4.4321 16.2867 5.17535C15.3135 5.62456 14.1573 5.17755 13.745 4.18806C13.0987 2.63693 10.9013 2.63693 10.255 4.18806Z"
                                            stroke="#f59e0b"
                                            strokeWidth="2.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                                            stroke="#f59e0b"
                                            strokeWidth="2.4"
                                        />
                                    </g>
                                </svg>

                            </Link>
                        </div>
                        <button
                            onClick={() => handleSignOut()}
                            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:cursor-pointer hover:bg-red-700 transition-colors duration-200"
                        >
                            Logga ut
                        </button>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="storeSelect" className="mr-2 font-medium">
                            Välj din huvudbutik i Uppsala:
                        </label>
                        <select
                            id="storeSelect"
                            value={prefStoreId}
                            onChange={(e) => handlePrefStoreChange(e.target.value)}
                            className="border rounded px-2 py-1"
                        >
                            <option value="">-- Välj butik --</option>
                            {storeOptions.map((store) => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {user.uid ? <UserIngredientList uid={user.uid} /> : <p>Kunde inte hitta aktiv användare</p>}
                </div>
            </div>
        </>
    );
}
