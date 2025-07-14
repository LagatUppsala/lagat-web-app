"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

interface Ingredient {
    id: string;
    name: string;
    isOptimistic?: boolean;
}

export default function UserIngredientList({ uid }: { uid: string }) {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [showFridgeDesc, setShowFridgeDesc] = useState(false);

    useEffect(() => {
        if (!uid) return;
        const collRef = collection(db, "users", uid, "ingredients");
        const unsubscribe = onSnapshot(collRef, (snap) => {
            setIngredients((prev) => {
                const serverItems: Ingredient[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name as string,
                }));
                const serverNames = new Set(serverItems.map((i) => i.name));
                const optimistic = prev.filter((i) => i.isOptimistic && !serverNames.has(i.name));
                return [...optimistic, ...serverItems];
            });
        });
        return () => unsubscribe();
    }, [uid]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newIngredient.trim();
        if (!name) return;

        const tempId = `temp-${Date.now()}`;
        setIngredients((prev) => [{ id: tempId, name, isOptimistic: true }, ...prev]);
        setNewIngredient("");

        try {
            const token = await auth.currentUser!.getIdToken();
            await fetch("https://europe-north1-lagat-e1c30.cloudfunctions.net/add_ingredient", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ingredient: name }), // TODO add quantity and check response for error handling
            });
        } catch (err) {
            setIngredients((prev) => prev.filter((i) => i.id !== tempId));
            console.error("Failed to add ingredient");
        }
    };

    const handleRemove = async (item: Ingredient) => {
        setIngredients((prev) => prev.filter((i) => i.id !== item.id));
        if (item.isOptimistic) return;

        try {
            const token = await auth.currentUser!.getIdToken();
            await fetch("https://europe-north1-lagat-e1c30.cloudfunctions.net/remove_ingredient", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id: item.id }),
            });
        } catch (err) {
            setIngredients((prev) => [item, ...prev]);
            console.error("failed to remove ingredient");
        }
    };

    return (
        <div className="min-w-screen-md">
            <div className="flex-1 relative md:flex-[2]">
                <div
                    className="flex items-center cursor-pointer"
                    onClick={() => setShowFridgeDesc(prev => !prev)}
                >
                    <h2 className="text-2xl font-bold">Mitt Kylskåp</h2>
                    <svg
                        className={`w-6 h-6 ml-2 transform transition-transform duration-200 ${showFridgeDesc ? 'rotate-90' : ''}`}
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

                {showFridgeDesc && (
                    <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-md shadow-lg p-4 z-20">
                        <p className="text-md text-gray-600">
                            Lägg till ingredienser i ditt kylskåp! Vi matchar ingredienserna mot recept så att du kan spara pengar och få matinspiration. Klicka på en ingrediens för att ta bort den.
                        </p>
                    </div>
                )}
            </div>
            <span className="text-gray-500 text-sm leading-thight">Du kan behöva vänta ett ögonblick efter du har lagt till ingredienser innan du kan se rätt rekommenderade recept i receptflödet!</span>
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-4">
                <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Lägg till ingrediens"
                    className="border p-2 flex-1"
                />
                <button
                    type="submit"
                    className="bg-amber-500 text-white px-4 py-2 rounded hover:cursor-pointer transition-color hover:bg-amber-600"
                >
                    Lägg till
                </button>
            </form>

            <ul className="list-none space-y-2">
                {ingredients.length > 0 ? (
                    ingredients.map((item) => (
                        <li
                            key={item.id}
                            onClick={() => handleRemove(item)}
                            className="px-4 py-2 bg-gray-100 rounded cursor-pointer transition-colors duration-200 hover:bg-red-100 hover:text-red-600"
                        >
                            {item.name}
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500">Inga ingredienser tillagda än.</p>
                )}
            </ul>
        </div>
    );
}
