// app/recipes/[recipeId]/[storeId]/RecipeClient.tsx
"use client";

import { useParams } from "next/navigation";                    // client‑only hook :contentReference[oaicite:0]{index=0}
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Header from "@/app/components/Header";
import { Ingredient, Offer } from "@/app/lib/types";

export default function RecipeClient() {
    const { recipeId, storeId } = useParams<{
        recipeId: string;
        storeId: string;
    }>();                                                       // reads /recipes/[recipeId]/[storeId] :contentReference[oaicite:1]{index=1}

    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [recipeData, setRecipeData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!recipeId || !storeId) return;

        const fetchData = async () => {
            setLoading(true);

            // 1) Fetch recipe
            const recipeRef = doc(db, "recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            if (!recipeSnap.exists()) {
                setLoading(false);
                return;
            }
            const data = recipeSnap.data();
            setRecipeData(data);

            // 2) Fetch ingredients
            const ingSnap = await getDocs(collection(recipeRef, "ingredients"));
            setIngredients(
                ingSnap.docs.map(d => d.data() as Ingredient)
            );

            // 3) Fetch offers
            const offSnap = await getDocs(collection(recipeRef, `offers_${storeId}`));
            setOffers(
                offSnap.docs.map(d => d.data() as Offer)
            );

            setLoading(false);
        };

        fetchData();
    }, [recipeId, storeId]);

    if (loading) return <p>Loading…</p>;
    if (!recipeData) return <p>Recipe not found</p>;

    const cleanedImgUrl = recipeData.img_url.replace(/"/g, "");  // Remove any quotes from img_url
    const proxyUrl = cleanedImgUrl
        ? `/api/image-proxy?url=${encodeURIComponent(cleanedImgUrl)}`
        : "/lagat-logo-kilo.png";
    console.log("proxyUrl: ", proxyUrl)

    const capitalizedName =
        recipeData.name.charAt(0).toUpperCase() + recipeData.name.slice(1);

    return (
        <div>
            <Header />

            <div className="max-w-screen-lg mx-auto px-4 py-10">
                <h1 className="text-4xl font-bold mb-2">{capitalizedName}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    {/* Ingredients */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Ingredienser</h2>
                        <ul className="space-y-2 text-gray-800 text-base">
                            {ingredients.map((ing, idx) => {
                                const keyName = ing.name.trim().toLowerCase();
                                const match = offers.find(
                                    o => o.ingredient.trim().toLowerCase() === keyName
                                );
                                return (
                                    <li key={idx}>
                                        {ing.name}
                                        {match && (
                                            <span className="text-orange-600 font-medium ml-2">
                                                ({match.name})
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Recipe Image */}
                    {proxyUrl && (
                        <div className="w-full h-[80%] rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={proxyUrl}
                                alt={recipeData.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                    )}
                </div>

                {/* Offers */}
                {offers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">Alla erbjudanden</h2>
                        <ul className="list-disc pl-5 text-gray-700">
                            {offers.map((o, i) => (
                                <li key={i}>
                                    Du kan byta ut{" "}
                                    <span className="text-orange-600 font-medium">
                                        {o.ingredient}
                                    </span>{" "}
                                    mot{" "}
                                    <span className="text-orange-600 font-medium">{o.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
