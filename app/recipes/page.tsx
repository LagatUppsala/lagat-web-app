"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/firebaseConfig";
import Header from "../components/Header";
import { onAuthStateChanged, User } from "firebase/auth";
import RecipeCard from "../components/RecipeCard";
import LoadingSpinner from "../components/LoadingSpinner";

type DisplayRecipe = {
  id: string;
  name: string;
  sourceId: string;
  imgUrl: string;
  price: number;
};

const RECOMMEND_ENDPOINT =
  "https://europe-north1-lagat-e1c30.cloudfunctions.net/recommend_recipes";

export default function RecipePage() {
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<DisplayRecipe[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [recipeLoading, setRecipeLoading] = useState(true);

  // Listen for auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setUserLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userLoading || !user) return;

    const fetchRecipeIds = async () => {
      setRecipeLoading(true);
      try {
        const idToken = await user.getIdToken();

        const res = await fetch(RECOMMEND_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ exclude_ids: recipeIds }),
        });

        const data = await res.json();
        const ids = data.recipe_ids;

        if (!Array.isArray(ids)) {
          console.error("Unexpected response format from recommend_recipes");
          return;
        }

        setRecipeIds((prev) => [...prev, ...ids]);

        const fetchedRecipes: DisplayRecipe[] = [];

        await Promise.all(
          ids.map(async (id) => {
            try {
              const docRef = doc(db, "recipes", id);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const d = docSnap.data();
                const recipe: DisplayRecipe = {
                  id,
                  name: d.name,
                  sourceId: d.sourceId || "unknown",
                  imgUrl: d.img_url,
                  price: d.price ?? 0,
                };
                fetchedRecipes.push(recipe);
              }
            } catch (err) {
              console.error(`Failed to fetch recipe ${id}`);
            }
          })
        );

        setRecipes((prev) => [...prev, ...fetchedRecipes]);
      } catch (err) {
        console.error("Failed to fetch recipe IDs");
      }
      setRecipeLoading(false);
    };

    fetchRecipeIds();
  }, [user, userLoading]);

  const handleLoadMore = async () => {
    if (userLoading || !user) return;
    setRecipeLoading(true);
    try {
      const idToken = await user.getIdToken();

      const res = await fetch(RECOMMEND_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ exclude_ids: recipeIds }),
      });

      const data = await res.json();
      const ids = data.recipe_ids;

      if (!Array.isArray(ids)) {
        console.error("Unexpected response format from recommend_recipes:");
        return;
      }

      setRecipeIds((prev) => [...prev, ...ids]);

      const fetchedRecipes: DisplayRecipe[] = [];

      await Promise.all(
        ids.map(async (id) => {
          try {
            const docRef = doc(db, "recipes", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const d = docSnap.data();
              const recipe: DisplayRecipe = {
                id,
                name: d.name,
                sourceId: d.sourceId || "unknown",
                imgUrl: d.img_url,
                price: d.price ?? 0,
              };
              fetchedRecipes.push(recipe);
            }
          } catch (err) {
            console.error(`Failed to fetch recipe ${id}`);
          }
        })
      );
      setRecipes((prev) => [...prev, ...fetchedRecipes]);
    } catch (err) {
      console.error("Failed to load more recipes");
    }
    setRecipeLoading(false);
  };

  if (userLoading) {
    return (
      <>
        <Header />
        <LoadingSpinner />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg text-gray-700">Logga in för att se recept</p>
        </div>
      </>
    );
  }

  return (
    <div className="pb-12">
      <Header />
      <div className="flex justify-center">
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-w-5xl w-full">
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              recipeId={r.id}
              name={r.name}
              imgUrl={r.imgUrl}
              sourceId={r.sourceId}
              price={r.price}
            />
          ))}
        </div>
      </div>
      {recipeLoading ? (
        <div className="flex justify-center items-center w-full">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex justify-center align-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-amber-500 text-white rounded cursor-pointer hover:bg-amber-700 transition-colors duration-200"
          >
            Mer recept
          </button>
        </div>
      )}
    </div>
  );
}
