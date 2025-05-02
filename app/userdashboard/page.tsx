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

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [prefStoreId, setPrefStoreId] = useState("");
    const [showStoreDesc, setShowStoreDesc] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
                const userRef = doc(db, "users", u.uid);
                const snap = await getDoc(userRef);
                setUserData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
                setPrefStoreId(snap.exists() ? snap.data().preferred_store : "");
            } else {
                setUser(null);
                setUserData(null);
                setPrefStoreId("");
            }
        });
        return () => unsubscribe();
    }, []);

    if (!user || !userData) {
        return (
            <>
                <Header />
                <div className="flex items-center justify-center h-screen">
                    <p className="text-red-500">Användare kunde inte hittas</p>
                </div>
            </>
        );
    }

    const handleSignOut = () => {
        auth.signOut();
        router.push("/");
    };

    const handlePrefStoreChange = async (id: string) => {
        const storeId = id.trim();
        try {
            const token = await auth.currentUser!.getIdToken();
            await fetch(
                "https://europe-north1-lagat-e1c30.cloudfunctions.net/update_preferred_store",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ store_id: storeId }),
                }
            );
            setPrefStoreId(storeId);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Header />
            <div className="max-w-screen-lg mx-auto p-4 space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <h1 className="text-5xl font-bold mb-4 md:mb-0">
                        Hej, {userData.name || user.email}!
                    </h1>
                    <div className="flex space-x-4">
                        {/* Will use later, no need for settings yet though */}
                        {/* <Link
                            href="/usersettings"
                            className="p-2 rounded-full transition-colors duration-200 hover:bg-amber-100"
                            aria-label="Inställningar"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-8 h-8 stroke-amber-500"
                            >
                                <path
                                    d="M10.255 4.188C9.843 5.178 8.687 5.625 7.713 5.175C6.103 4.432 4.432 6.103 5.175 7.713C5.625 8.687 5.178 9.843 4.188 10.255C2.637 10.901 2.637 13.099 4.188 13.745C5.178 14.157 5.625 15.313 5.175 16.287C4.432 17.897 6.103 19.568 7.713 18.825C8.687 18.375 9.843 18.822 10.255 19.812C10.901 21.363 13.099 21.363 13.745 19.812C14.157 18.822 15.313 18.375 16.287 18.825C17.897 19.568 19.568 17.897 18.825 16.287C18.375 15.313 18.822 14.157 19.812 13.745C21.363 13.099 21.363 10.901 19.812 10.255C18.822 9.843 18.375 8.687 18.825 7.713C19.568 6.103 17.897 4.432 16.287 5.175C15.313 5.625 14.157 5.178 13.745 4.188C13.099 2.637 10.901 2.637 10.255 4.188Z"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <circle cx="12" cy="12" r="3" strokeWidth="2.4" />
                            </svg>
                        </Link> */}
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition-colors duration-200"
                        >
                            Logga ut
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center md:space-x-6">
                    <div className="flex-1 relative md:flex-[2]">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => setShowStoreDesc(prev => !prev)}
                        >
                            <p className="font-medium">Välj din huvudbutik i Uppsala</p>
                            <svg
                                className={`w-6 h-6 transform transition-transform duration-200 ${showStoreDesc ? 'rotate-90' : ''}`}
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                stroke="#000000"
                                strokeWidth="2.04"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M9.96967 16.2803C9.67678 15.9874 9.67678 15.5126 9.96967 15.2197L13.1893 12L9.96967 8.78033C9.67678 8.48744 9.67678 8.01256 9.96967 7.71967C10.2626 7.42678 10.7374 7.42678 11.0303 7.71967L14.7803 11.4697C15.0732 11.7626 15.0732 12.2374 14.7803 12.5303L11.0303 16.2803C10.7374 16.5732 10.2626 16.5732 9.96967 16.2803Z"
                                    fill="#000000"
                                />
                            </svg>
                        </div>

                        {showStoreDesc && (
                            <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-md shadow-lg p-4 z-20">
                                <p className="text-md text-gray-600">
                                    Välj den affärer du brukar handla ifrån. Därefter kan du se vilka ingredienser i varje recept som är på extrapris i just din favoritbutik!
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-2 md:mt-0 w-full md:w-110">
                        <select
                            id="storeSelect"
                            value={prefStoreId}
                            onChange={e => handlePrefStoreChange(e.target.value)}
                            className="w-full md:w-full border rounded px-2 py-1"
                        >
                            <option value="">-- Välj butik --</option>
                            {storeOptions.map(store => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <UserIngredientList uid={user.uid} />
                </div>
            </div>
        </>
    );
}