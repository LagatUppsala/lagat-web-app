import Link from "next/link";
import { Match, Offer } from "../lib/types";

type RecipeCardProps = {
  recipeId: string;
  name: string;
  imgUrl?: string;
  offers: Offer[];
  matchingIngredients: Match[];
  storeId: string;
};

export default function RecipeCard({ recipeId, name, imgUrl = "", offers = [], matchingIngredients, storeId }: RecipeCardProps) {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(
    imgUrl.replace(/"/g, "")
  )}`;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Link href={`/recipes/${recipeId}/${storeId}`} className="group block w-full max-w-md">
      <div className="relative h-full flex flex-col rounded-2xl border border-gray-200 bg-white hover:shadow-sm transition-shadow overflow-hidden">
        <div className="relative w-full h-72 overflow-hidden">
          <img
            src={imgUrl ? proxyUrl : "/lagat-logo-kilo.png"}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "/lagat-logo-mega.png";
            }}
          />
          <img
            src="/ica-logo-transparent-bg.png"
            alt="ICA logo"
            className="absolute top-3 right-3 w-8 h-auto bg-white rounded-md p-1"
          />
        </div>
        <div className="flex-grow px-5 py-4">
          <h2 className="text-2xl font-medium text-amber-500">{capitalizedName}</h2>
          <p>
            {matchingIngredients.length} ingrediens{matchingIngredients.length === 1 ? "" : "er"} matchar med ditt kylskåp
          </p>
          <p>
            {offers.length} ingrediens{offers.length === 1 ? "" : "er"} på extrapris
          </p>
        </div>
      </div>
    </Link>
  );
}
