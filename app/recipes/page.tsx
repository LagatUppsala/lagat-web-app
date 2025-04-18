"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseConfig";
import Header from "../components/Header";
import RecipeCard from "../components/RecipeCard";

type Ingredient = {
    embedding: number[];
    name: string;
};

type Recipe = {
    id: string;
    name: string;
    link_url: string;
    offer_count?: number;
    img_url?: string;
    ingredients: Ingredient[];
    offers: Offer[];
};

type Offer = {
    name: string;
    ingredient: string;
    simliarity: number;
};

type Store = {
    id: string;
    name: string;
};

const storeOptions: Store[] = [
    { id: "0", name: "ICA Supermarket Luthagens Livs" },
    { id: "1", name: "ICA Folkes Livs" },
    { id: "2", name: "ICA Supermarket Väst" },
    { id: "3", name: "Ica Supermarket City, Uppsala" },
    { id: "4", name: "Maxi ICA Stormarknad Stenhagen Uppsala" },
    { id: "5", name: "ICA Vretgränd" },
    { id: "6", name: "ICA Nära Hörnan" },
    { id: "7", name: "ICA Nära Rosendal" },
];

const PAGE_SIZE = 10;

export default function RecipesPage() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedStore, setSelectedStore] = useState("0");

    useEffect(() => {
        setRecipes([]);
        setLastDoc(null);
        setHasMore(true);
    }, [selectedStore]);

    useEffect(() => {
        let hasFetched = false;

        const resetAndFetch = async () => {
            if (hasFetched || recipes.length > 0) return;
            hasFetched = true;

            setRecipes([]);
            setLastDoc(null);
            setHasMore(true);
            await fetchRecipes(null);
        };

        const timeout = setTimeout(() => {
            resetAndFetch();
        }, 100);

        return () => clearTimeout(timeout);
    }, []);

    const fetchRecipes = async (
        startAfterDoc: QueryDocumentSnapshot<DocumentData> | null = null,
        currentStore: string = selectedStore
    ) => {
        if (loading || !hasMore) return;
        setLoading(true);

        const orderField = `offer_counts.${currentStore}`;

        const baseQuery = query(
            collection(db, "recipes"),
            orderBy(orderField, "desc"),
            limit(PAGE_SIZE),
            ...(startAfterDoc ? [startAfter(startAfterDoc)] : [])
        );

        const recipesSnap = await getDocs(baseQuery);

        if (recipesSnap.empty) {
            setHasMore(false);
            setLoading(false);
            return;
        }

        const recipeList: Recipe[] = [];

        for (const doc of recipesSnap.docs) {
            const recipeData = doc.data();
            const ingredientsSnap = await getDocs(collection(doc.ref, "ingredients"));

            const ingredients: Ingredient[] = ingredientsSnap.docs.map((ingDoc) => {
                const data = ingDoc.data();
                return {
                    name: data.name,
                    embedding: data.embedding,
                };
            });

            const offersSnap = await getDocs(collection(doc.ref, `offers_${currentStore}`));
            const offers: Offer[] = offersSnap.docs.map((offDoc) => {
                const data = offDoc.data();
                return {
                    name: data.name,
                    ingredient: data.ingredient,
                    simliarity: data.similarity,
                };
            });

            recipeList.push({
                id: doc.id,
                name: recipeData.name,
                link_url: recipeData.link_url,
                offer_count: recipeData.offer_count,
                img_url: recipeData.img_url,
                ingredients,
                offers,
            });
        }

        setRecipes((prev) => [...prev, ...recipeList]);
        setLastDoc(recipesSnap.docs[recipesSnap.docs.length - 1]);
        setHasMore(recipesSnap.size === PAGE_SIZE);
        setLoading(false);
    };

    if (!user) {
        return (
            <>
                <Header />
                <p>Skapa ett konto för att se aktuella erbjudanden</p>
            </>
        );
    }

    return (
        <div>
            <Header />
            <div className="max-w-screen-lg mx-auto px-4 py-6">
                <div className="mb-6">
                    <label htmlFor="storeSelect" className="mr-2 font-medium">
                        Välj butik:
                    </label>
                    <select
                        id="storeSelect"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        {storeOptions.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            recipeId={recipe.id}
                            name={recipe.name}
                            imgUrl={recipe.img_url}
                            offers={recipe.offers}
                            storeId={selectedStore}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => {
                                if (!loading) fetchRecipes(lastDoc);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded hover:cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Laddar..." : recipes.length > 0 ? "Visa fler recept" : "Visa recept"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
