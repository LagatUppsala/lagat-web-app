import Link from "next/link";

type Offer = {
  name: string;
  ingredient: string;
  simliarity: number;
};

type RecipeCardProps = {
  id: string;
  name: string;
  offerCount?: number;
  imgUrl?: string;
  offers: Offer[];
};

export default function RecipeCard({id, name, offerCount = 0, imgUrl = "", offers = []}: RecipeCardProps) {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(
    imgUrl.replace(/"/g, "")
  )}`;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Link href={`/recipe/${id}`} className="group block w-full max-w-md">
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
          <p className="mb-1 text-sm text-gray-600">
            {offerCount} ingrediens{offerCount === 1 ? "" : "er"} på extrapris
          </p>
          {offers.length > 0 ? <p>{offers[0].name.charAt(0).toUpperCase() + offers[0].name.slice(1)} är på extrapris!</p> : <></>}
          {offers.length > 1 ? <p>{offers[1].name.charAt(0).toUpperCase() + offers[1].name.slice(1)} är på extrapris!</p> : <></>}
          {offers.length > 2 ? <p className="text-bold">Och mer!</p> : <></>}
        </div>
      </div>
    </Link>
  );
}
