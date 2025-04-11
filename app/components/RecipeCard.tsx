// components/RecipeCard.tsx
import Link from "next/link";

type RecipeCardProps = {
  id: string;
  name: string;
  offerCount?: number;
};

export default function RecipeCard({ id, name, offerCount = 0 }: RecipeCardProps) {
  return (
    <Link href={`/recipe/${id}`}>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 p-4 cursor-pointer">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </h2>
        <p className="text-sm text-gray-600">
          {offerCount} ingrediens{offerCount === 1 ? "" : "er"} på extrapris
        </p>
      </div>
    </Link>
  );
}
