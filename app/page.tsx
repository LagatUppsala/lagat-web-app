"use client";

import { useState } from "react";
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
import { db } from "../firebase/firebaseConfig";
import Header from "./components/Header";

type Ingredient = {
  embedding: number[];
  name: string;
};

type Recipe = {
  id: string;
  name: string;
  link_url: string;
  offer_count?: number;
  ingredients: Ingredient[];
};

const PAGE_SIZE = 10;

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecipes = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    const baseQuery = query(
      collection(db, "recipes"),
      orderBy("offer_count", "desc"), // Prioritize recipes with more offers
      limit(PAGE_SIZE),
      ...(lastDoc ? [startAfter(lastDoc)] : [])
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

      recipeList.push({
        id: doc.id,
        name: recipeData.name,
        link_url: recipeData.link_url,
        offer_count: recipeData.offer_count,
        ingredients,
      });
    }

    setRecipes((prev) => [...prev, ...recipeList]);
    setLastDoc(recipesSnap.docs[recipesSnap.docs.length - 1]);
    setHasMore(recipesSnap.size === PAGE_SIZE);
    setLoading(false);
  };

  return (
    <div>
      <Header/>
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition hover:cursor-pointer"
            >
              <h2 className="text-xl font-semibold mb-1">{recipe.name.charAt(0).toUpperCase() + recipe.name.slice(1)}</h2>
              <p className="text-sm text-gray-600">
                {recipe.offer_count ?? 0} ingrediens{(recipe.offer_count ?? 0) === 1 ? "" : "er"} är på extrapris
              </p>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={fetchRecipes}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded hover:cursor-pointer"
              disabled={loading}
            >
              {loading ? "Loading..." : recipes.length > 0 ? "Load More Recipes" : "View Recipes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
