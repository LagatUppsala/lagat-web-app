import Link from "next/link";

type RecipeCardProps = {
  id: string;
  name: string;
  offerCount?: number;
  imgUrl?: string;
};

export default function RecipeCard({
  id,
  name,
  offerCount = 0,
  imgUrl = "",
}: RecipeCardProps) {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(
    imgUrl.replace(/"/g, "")
  )}`;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Link href={`/recipe/${id}`} className="block w-full max-w-md h-full">
      <div className="h-full flex flex-col rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white">
        <div className="relative w-full h-48 shrink-0">
          <img
            src={imgUrl ? proxyUrl : "/lagat-logo-kilo.png"}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/lagat-logo-mega.png";
            }}
          />
          <img
            src="/ica-logo-transparent-bg.png"
            alt="ICA logo"
            className="absolute top-3 right-3 w-9 h-auto"
          />
        </div>
        <div className="flex-grow p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-md font-semibold text-gray-800">{capitalizedName}</h2>
            <p className="text-sm text-gray-700 mt-1">
              {offerCount} ingrediens{offerCount === 1 ? "" : "er"} på extrapris
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
