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

    useEffect(() => {
        if (!uid) return;
        const collRef = collection(db, "users", uid, "ingredients");
        const unsubscribe = onSnapshot(collRef, (snap) => {
            setIngredients((prev) => {
                const serverItems: Ingredient[] = snap.docs.map((doc) => ({
                    id: doc.id,
                    name: doc.data().name as string,
                }));
                // Filter out optimistic items that have been confirmed by server
                const serverNames = new Set(serverItems.map((i) => i.name));
                const optimistic = prev.filter(
                    (i) => i.isOptimistic && !serverNames.has(i.name)
                );
                return [...optimistic, ...serverItems];
            });
        });
        return () => unsubscribe();
    }, [uid]);

    // Add new ingredient
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const name = newIngredient.trim();
        if (!name) return;

        const tempId = `temp-${Date.now()}`;
        // Optimistic UI update
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
                body: JSON.stringify({ ingredient: name }),
            });

        } catch (err) {
            setIngredients((prev) => prev.filter((i) => i.id !== tempId));
            console.error(err);
        }
    };

    // Remove ingredient
    const handleRemove = async (item: Ingredient) => {
        // Optimistic removal
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
            // Rollback on error
            setIngredients((prev) => [item, ...prev]);
            console.error(err);
        }
    };

    return (
        <div>
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
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
