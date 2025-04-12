import Link from "next/link";

type RecipeCardProps = {
  id: string;
  name: string;
  offerCount?: number;
  imgUrl?: string;
};

export default function RecipeCard({ id, name, offerCount = 0, imgUrl = "" }: RecipeCardProps) {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imgUrl.replace(/"/g, ""))}`;
  console.log("Proxy image URL:", proxyUrl);


  return (
    <Link href={`/recipe/${id}`}>
      <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 p-4 cursor-pointer">
        {imgUrl && (
          <img
            src={proxyUrl}
            alt={name}
            className="w-full h-48 object-cover rounded-xl mb-3"
          />
        )}

        <img
          src="/ica-logo-transparent-bg.png"
          alt="ICA logo"
          className="absolute top-6 right-6 w-8 h-4 z-10"
        />

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
