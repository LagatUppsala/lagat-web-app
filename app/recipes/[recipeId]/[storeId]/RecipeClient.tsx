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
    const [offers, setOffers] = useState<Offer[]>([]);
    const [recipeData, setRecipeData] = useState<any>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [dots, setDots] = useState("");

    // animate dots while loading
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
        if (!recipeId || !storeId) return;
        const user = auth.currentUser;
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);

            // Fetch matches
            const userId = user.uid;
            const matchesRef = collection(
                db,
                `users/${userId}/recommended_recipes/${recipeId}/matches`
            );
            const matchesSnap = await getDocs(matchesRef);
            setMatches(matchesSnap.docs.map((d) => d.data() as Match));

            // Fetch recipe
            const recipeRef = doc(db, "recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            if (!recipeSnap.exists()) {
                setLoading(false);
                return;
            }
            const data = recipeSnap.data();
            setRecipeData(data);

            // Fetch ingredients
            const ingSnap = await getDocs(collection(recipeRef, "ingredients"));
            setIngredients(ingSnap.docs.map((d) => d.data() as Ingredient));

            // Fetch offers
            const offSnap = await getDocs(
                collection(recipeRef, `offers_${storeId}`)
            );
            setOffers(offSnap.docs.map((d) => d.data() as Offer));

            setLoading(false);
        };

        fetchData();
    }, [recipeId, storeId, auth.currentUser]);

    // loading state
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

    // no recipe
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

    const cleanedImgUrl = recipeData.img_url.replace(/"/g, "");
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
                    {/* Ingredients */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Ingredienser</h2>
                        <ul className="space-y-2 text-gray-800 text-base">
                            {ingredients.map((ing, idx) => {
                                const keyName = ing.name.trim().toLowerCase();
                                const offerMatch = offers.find(
                                    (o) => o.ingredient.trim().toLowerCase() === keyName
                                );
                                const recipeMatch = matches.find(
                                    (m) => m.match.trim().toLowerCase() === keyName
                                );
                                return (
                                    <li key={idx} className="flex items-center">
                                        <span>{ing.name}</span>
                                        {offerMatch && (
                                            <span className="text-orange-600 font-medium ml-2">
                                                ({offerMatch.name})
                                            </span>
                                        )}
                                        {recipeMatch && (
                                            <span className="text-green-600 font-medium ml-2">
                                                Du har {recipeMatch.name}!
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
                                    Du kan byta ut{' '}
                                    <span className="text-orange-600 font-medium">
                                        {o.ingredient}
                                    </span>{' '}
                                    mot{' '}
                                    <span className="text-orange-600 font-medium">
                                        {o.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
