"use client";

import Header from "../components/Header";
import RecipeCard from "../components/RecipeCard";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase/firebaseConfig";
import { Offer, Recipe, Match } from "../lib/types";
import { storeOptions } from "../lib/constants";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";

const PAGE_SIZE = 10;



export default function RecipePage() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [prefetchRecipes, setPrefetchRecipes] = useState<Recipe[]>([]); // Added state for prefetched next page
    const [selectedStore, setSelectedStore] = useState("");
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [prefetchLastVisible, setPrefetchLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null); // Cursor for prefetched page
    const [hasMore, setHasMore] = useState(true);

    // Listen for auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    // fetch preferred store
    useEffect(() => {
        if (!user) return;

        const fetchPref = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setSelectedStore(data.preferred_store || "");
                }
            } catch (err) {
                console.error("Could not load preferred store:", err);
            }
        };
        fetchPref();
    }, [user]);

    // Reset and fetch initial recipes when user or store changes
    useEffect(() => {
        if (!user) return;

        setRecipes([]);
        setLastVisible(null);
        setPrefetchRecipes([]); // Clear prefetched
        setPrefetchLastVisible(null);
        setHasMore(true);

        // slight delay for UX
        const timer = window.setTimeout(() => {
            loadInitialAndPrefetch(); // load first page & background prefetch
        }, 50);

        return () => clearTimeout(timer);
    }, [user, selectedStore]);

    // Load first page and prefetch next
    const loadInitialAndPrefetch = async () => {
        setLoading(true);

        // build query for first page
        let recQuery = query(
            collection(db, "users", user!.uid, "recommended_recipes"),
            orderBy("match_count", "desc"),
            limit(PAGE_SIZE)
        );

        const recSnap = await getDocs(recQuery);
        const fetched: Recipe[] = [];

        for (const recDoc of recSnap.docs) {
            const recipeId = recDoc.id;
            // fetch recipe data
            const recipeRef = doc(db, "recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            if (!recipeSnap.exists()) continue;
            const data = recipeSnap.data();

            // offers
            const offersSnap = await getDocs(
                collection(recipeRef, `offers_${selectedStore}`)
            );
            const offers: Offer[] = offersSnap.docs.map((o) => o.data() as Offer);

            // matching ingredients
            const matchSnap = await getDocs(
                collection(
                    db,
                    "users",
                    user!.uid,
                    "recommended_recipes",
                    recipeId,
                    "matches"
                )
            );
            const matchingIngredients = matchSnap.docs.map((m) => m.data() as Match);

            fetched.push({
                id: recipeId,
                name: data.name,
                link_url: data.link_url,
                img_url: data.img_url,
                offer_count: data.offer_count,
                ingredients: [],
                offers,
                matchingIngredients,
            });
        }

        // set first page
        setRecipes(fetched);

        // update cursor for first page
        const lastDoc = recSnap.docs[recSnap.docs.length - 1];
        setLastVisible(lastDoc || null);
        setHasMore(recSnap.docs.length === PAGE_SIZE);
        setLoading(false);

        // background prefetch next page
        if (lastDoc) prefetchNextPage(lastDoc);
    };

    // Prefetch next page into state
    const prefetchNextPage = async (cursor: QueryDocumentSnapshot<DocumentData>) => {
        // build query starting after cursor
        const nextQuery = query(
            collection(db, "users", user!.uid, "recommended_recipes"),
            orderBy("match_count", "desc"),
            startAfter(cursor),
            limit(PAGE_SIZE)
        );
        const nextSnap = await getDocs(nextQuery);
        const nextFetched: Recipe[] = [];

        for (const recDoc of nextSnap.docs) {
            const recipeId = recDoc.id;
            const recipeRef = doc(db, "recipes", recipeId);
            const recipeSnap = await getDoc(recipeRef);
            if (!recipeSnap.exists()) continue;
            const data = recipeSnap.data();

            const offersSnap = await getDocs(
                collection(recipeRef, `offers_${selectedStore}`)
            );
            const offers: Offer[] = offersSnap.docs.map((o) => o.data() as Offer);

            const matchSnap = await getDocs(
                collection(
                    db,
                    "users",
                    user!.uid,
                    "recommended_recipes",
                    recipeId,
                    "matches"
                )
            );
            const matchingIngredients = matchSnap.docs.map((m) => m.data() as Match);

            nextFetched.push({
                id: recipeId,
                name: data.name,
                link_url: data.link_url,
                img_url: data.img_url,
                offer_count: data.offer_count,
                ingredients: [],
                offers,
                matchingIngredients,
            });
        }

        setPrefetchRecipes(nextFetched);
        setPrefetchLastVisible(
            nextSnap.docs[nextSnap.docs.length - 1] || null
        );
    };

    // Handle "View more" to show prefetched recipes and kick off next prefetch
    const handleViewMore = () => {
        if (loading || prefetchRecipes.length === 0) return;
        setRecipes((prev) => [...prev, ...prefetchRecipes]); // show prefetched
        setLastVisible(prefetchLastVisible);
        setHasMore(prefetchRecipes.length === PAGE_SIZE);
        setPrefetchRecipes([]);
        setLoading(false);
        if (prefetchLastVisible) prefetchNextPage(prefetchLastVisible); // prefetch following chunk
    };

    if (loading && recipes.length === 0) {
        return (
            <>
                <Header />
                <p>Laddar...</p>
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <p>Skapa ett konto för att se rekommendationer och erbjudanden</p>
            </>
        );
    }

    return (
        <>
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
                        <option value="">-- Välj butik --</option>
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
                            matchingIngredients={recipe.matchingIngredients}
                            storeId={selectedStore}
                        />
                    ))}
                </div>

                {hasMore && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleViewMore}
                            disabled={loading}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            {loading ? "Laddar fler..." : "Visa fler recept"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
