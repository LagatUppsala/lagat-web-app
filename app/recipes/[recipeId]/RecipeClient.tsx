"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import Header from "@/app/components/Header";
import { Ingredient, Offer, Match } from "@/app/lib/types";


export default function RecipeClient() {
    const { recipeId, storeId } = useParams<{ recipeId: string; storeId: string }>();

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [recipeData, setRecipeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [dots, setDots] = useState("");

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (loading) {
            interval = setInterval(() => {
                setDots((prev) => (prev.length < 3 ? prev + "." : ""));
            }, 500);
        } else {
            setDots("");
        }
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (!recipeId) return;
        const user = auth.currentUser;
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            const recipeRef = doc(db, "recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            if (!recipeSnap.exists()) {
                setLoading(false);
                return;
            }
            const data = recipeSnap.data();
            setRecipeData({
                id: recipeId,
                name: data.name,
                instructions: data.instructions || [],
                img_url: data.img_url || "",
            })
            console.log("Recipe data:", data);
            const ingSnap = await getDocs(collection(recipeRef, "ingredients"));
            setIngredients(ingSnap.docs.map((d) => d.data() as Ingredient));


            setLoading(false);
        };

        fetchData();
    }, [recipeId, storeId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-amber-500 text-center text-lg font-semibold">
                        Laddar{dots}
                    </p>
                </div>
            </div>
        );
    }

    if (!recipeData) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-amber-500 text-center text-lg font-semibold">
                        Recipe not found
                    </p>
                </div>
            </div>
        );
    }

    const cleanedImgUrl = recipeData.img_url.replace(/\"/g, "");
    const proxyUrl = cleanedImgUrl
        ? `/api/image-proxy?url=${encodeURIComponent(cleanedImgUrl)}`
        : "/lagat-logo-kilo.png";

    const capitalizedName =
        recipeData.name.charAt(0).toUpperCase() + recipeData.name.slice(1);

    return (
        <div>
            <Header />
            <div className="max-w-screen-lg mx-auto px-4 py-10">
                <h1 className="text-4xl font-bold mb-2">{capitalizedName}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    <div className="order-last md:order-first">
                    {/* Ingredients */}
                        <h2 className="text-2xl font-semibold mb-4">Ingredienser</h2>
                        <ul className="space-y-2 text-gray-800 text-base">
                            {ingredients.map((ing, idx) => {
                                const keyName = ing.name.trim().toLowerCase();
                                return (
                                    <li key={idx} className="flex items-center">
                                        <span>{ing.name}</span>
                                    </li>
                                );
                            })}
                        </ul>
                        {/* Instructions */}
                        <h2 className="text-2xl font-semibold mb-4 mt-4">Beskrivning</h2>
                        <div className="text-gray-800 text-base">
                            {recipeData.instructions.length > 0 ? (
                                recipeData.instructions.map((inst: string, idx: number) => (
                                    <p key={idx} className="mb-2">
                                        {idx + 1}. {inst}
                                    </p>
                                ))
                            ) : (
                                <p>Ingen beskrivning tillgänglig.</p>
                            )}
                        </div>
                    </div>


                    {/* Recipe Image */}
                    {proxyUrl && (
                        <div className="order-first md:order-last w-full h-64 md:h-auto rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={proxyUrl}
                                alt={recipeData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
