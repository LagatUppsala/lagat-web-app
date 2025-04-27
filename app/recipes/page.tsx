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
    const [loadingMore, setLoadingMore] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [prefetchRecipes, setPrefetchRecipes] = useState<Recipe[]>([]);
    const [selectedStore, setSelectedStore] = useState("");
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [prefetchLastVisible, setPrefetchLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [dots, setDots] = useState("");

    // dots animation for both initial and loading more
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        const isLoading = (loading && recipes.length === 0) || loadingMore;
        if (isLoading) {
            interval = setInterval(() => {
                setDots((prev) => (prev.length < 3 ? prev + "." : ""));
            }, 500);
        } else {
            setDots("");
        }
        return () => clearInterval(interval);
    }, [loading, loadingMore, recipes.length]);

    // auth listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    // fetch preferred store
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setSelectedStore(userDoc.data().preferred_store || "");
                }
            } catch (err) {
                console.error("Could not load preferred store:", err);
            }
        })();
    }, [user]);

    // reset & load initial + prefetch
    useEffect(() => {
        if (!user) return;
        setRecipes([]);
        setLastVisible(null);
        setPrefetchRecipes([]);
        setPrefetchLastVisible(null);
        setHasMore(true);
        const timer = window.setTimeout(loadInitialAndPrefetch, 50);
        return () => clearTimeout(timer);
    }, [user, selectedStore]);

    const loadInitialAndPrefetch = async () => {
        setLoading(true);
        const baseCol = collection(db, "users", user!.uid, "recommended_recipes");
        const recSnap = await getDocs(
            query(baseCol, orderBy("match_count", "desc"), limit(PAGE_SIZE))
        );
        const fetched: Recipe[] = await Promise.all(
            recSnap.docs.map(async (docSnap) => {
                const id = docSnap.id;
                const dataSnap = await getDoc(doc(db, "recipes", id));
                if (!dataSnap.exists()) throw new Error("Missing recipe");
                const data = dataSnap.data();
                const offers = (await getDocs(
                    collection(dataSnap.ref, `offers_${selectedStore}`)
                )).docs.map(o => o.data() as Offer);
                const matches = (await getDocs(
                    collection(db, "users", user!.uid, "recommended_recipes", id, "matches")
                )).docs.map(m => m.data() as Match);
                return { id, name: data.name, link_url: data.link_url, img_url: data.img_url, offer_count: data.offer_count, ingredients: [], offers, matchingIngredients: matches };
            })
        );
        setRecipes(fetched);
        const lastDoc = recSnap.docs[recSnap.docs.length - 1] || null;
        setLastVisible(lastDoc);
        setHasMore(recSnap.docs.length === PAGE_SIZE);
        setLoading(false);
        if (lastDoc) prefetchNextPage(lastDoc);
    };

    // prefetch next page
    const prefetchNextPage = async (cursor: QueryDocumentSnapshot<DocumentData>) => {
        const baseCol = collection(db, "users", user!.uid, "recommended_recipes");
        const nextSnap = await getDocs(
            query(baseCol, orderBy("match_count", "desc"), startAfter(cursor), limit(PAGE_SIZE))
        );
        const nextFetched: Recipe[] = await Promise.all(
            nextSnap.docs.map(async (docSnap) => {
                const id = docSnap.id;
                const dataSnap = await getDoc(doc(db, "recipes", id));
                if (!dataSnap.exists()) throw new Error("Missing recipe");
                const data = dataSnap.data();
                const offers = (await getDocs(
                    collection(dataSnap.ref, `offers_${selectedStore}`)
                )).docs.map(o => o.data() as Offer);
                const matches = (await getDocs(
                    collection(db, "users", user!.uid, "recommended_recipes", id, "matches")
                )).docs.map(m => m.data() as Match);
                return { id, name: data.name, link_url: data.link_url, img_url: data.img_url, offer_count: data.offer_count, ingredients: [], offers, matchingIngredients: matches };
            })
        );
        setPrefetchRecipes(nextFetched);
        setPrefetchLastVisible(nextSnap.docs[nextSnap.docs.length - 1] || null);
    };

    // handle view more always clickable
    const handleViewMore = async () => {
        setLoadingMore(true);
        // if prefetched exists, show immediately
        if (prefetchRecipes.length > 0) {
            setRecipes(prev => [...prev, ...prefetchRecipes]);
            setLastVisible(prefetchLastVisible);
            setHasMore(prefetchRecipes.length === PAGE_SIZE);
            const nextCursor = prefetchLastVisible;
            setPrefetchRecipes([]);
            if (nextCursor) await prefetchNextPage(nextCursor);
        } else {
            // no prefetch yet: fetch next directly
            const cursor = lastVisible;
            const baseCol = collection(db, "users", user!.uid, "recommended_recipes");
            const nextSnap = await getDocs(
                query(baseCol, orderBy("match_count", "desc"), startAfter(cursor!), limit(PAGE_SIZE))
            );
            const fetched: Recipe[] = await Promise.all(
                nextSnap.docs.map(async docSnap => {
                    const id = docSnap.id;
                    const dataSnap = await getDoc(doc(db, "recipes", id));
                    if (!dataSnap.exists()) throw new Error("Missing recipe");
                    const data = dataSnap.data();
                    const offers = (await getDocs(
                        collection(dataSnap.ref, `offers_${selectedStore}`)
                    )).docs.map(o => o.data() as Offer);
                    const matches = (await getDocs(
                        collection(db, "users", user!.uid, "recommended_recipes", id, "matches")
                    )).docs.map(m => m.data() as Match);
                    return { id, name: data.name, link_url: data.link_url, img_url: data.img_url, offer_count: data.offer_count, ingredients: [], offers, matchingIngredients: matches };
                })
            );
            setRecipes(prev => [...prev, ...fetched]);
            const lastDoc = nextSnap.docs[nextSnap.docs.length - 1] || lastVisible;
            setLastVisible(lastDoc);
            setHasMore(nextSnap.docs.length === PAGE_SIZE);
            if (lastDoc) await prefetchNextPage(lastDoc);
        }
        setLoadingMore(false);
    };

    if (loading && recipes.length === 0) {
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

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-amber-500 text-center">
                        Skapa ett konto för att se rekommendationer och erbjudanden
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-1">
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
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                {loadingMore ? `Laddar fler${dots}` : "Visa fler recept"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
