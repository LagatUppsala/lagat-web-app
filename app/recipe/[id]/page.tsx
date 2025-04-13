import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Header from "@/app/components/Header";

type Offer = {
    name: string;
    ingredient: string;
    similarity: number;
};

type Props = {
    params: Promise<{ id: string }>;
};

export default async function RecipePage({ params }: Props) {
    const { id } = await params;

    const recipeRef = doc(db, "recipes", id);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
        return <div>Recipe not found</div>;
    }

    const recipeData = recipeSnap.data();
    const ingredientsSnap = await getDocs(collection(recipeRef, "ingredients"));
    const ingredients = ingredientsSnap.docs.map((doc) => doc.data());
    const offersSnap = await getDocs(collection(recipeRef, "offers"));
    const offers: Offer[] = offersSnap.docs.map((doc) => doc.data() as Offer);



    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(
        recipeData.img_url.replace(/"/g, "")
    )}`;

    const capitalizedName = recipeData.name.charAt(0).toUpperCase() + recipeData.name.slice(1)

    return (
        <div>
            <Header />
            <div className="max-w-screen-lg mx-auto px-4 py-10">
                <h1 className="text-4xl font-bold mb-2">{capitalizedName}</h1>
                <p className="text-gray-600 mb-8">
                    {recipeData.offer_count ?? 0} ingrediens
                    {(recipeData.offer_count ?? 0) === 1 ? "" : "er"} är på extrapris
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                    {/* Ingredients */}
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Ingredienser</h2>
                        <ul className="space-y-2 text-gray-800 text-base">
                            {ingredients.map((ingredient: any, idx: number) => {
                                const ingName = ingredient.name?.trim().toLowerCase();

                                const matchingOffer = offers.find(
                                    (offer) => offer.ingredient?.trim().toLowerCase() === ingName
                                );

                                return (
                                    <li key={idx}>
                                        {ingredient.name}
                                        {matchingOffer && (
                                            <span className="text-orange-600 font-medium ml-2">
                                                ({matchingOffer.name})
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Recipe Image */}
                    <div className="w-full h-64 md:h-full rounded-xl overflow-hidden shadow-lg">
                        <img
                            src={proxyUrl}
                            alt={recipeData.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {offers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-3">Alla erbjudanden</h2>
                        <ul className="list-disc pl-5 text-gray-700">
                            {offers.map((offer, idx) => (
                                <li key={idx}>Du kan byta ut <span className="text-orange-600 font-medium">{offer.ingredient}</span> mot <span className="text-orange-600 font-medium">{offer.name}</span></li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
