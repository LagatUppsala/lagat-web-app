import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Header from "@/app/components/Header";

type Props = {
    params: { id: string };
};

type Offer = {
    name: string;
};

export default async function RecipePage({ params }: Props) {
    const recipeRef = doc(db, "recipes", params.id);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
        return <div>Recipe not found</div>;
    }

    const recipeData = recipeSnap.data();

    const ingredientsSnap = await getDocs(collection(recipeRef, "ingredients"));
    const ingredients = ingredientsSnap.docs.map((doc) => doc.data());

    const offersSnap = await getDocs(collection(recipeRef, "offers"));
    const offers: Offer[] = offersSnap.docs.map((doc) => doc.data() as Offer);

    return (
        <div>
            <Header />
            <div className="max-w-screen-md mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-4">{recipeData.name}</h1>
                <p className="mb-6 text-gray-600">
                    {recipeData.offer_count ?? 0} ingrediens{(recipeData.offer_count ?? 0) === 1 ? "" : "er"} är på extrapris
                </p>

                {offers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-2">Erbjudanden</h2>
                        <ul className="list-disc pl-6 text-gray-700">
                            {offers.map((offer, idx) => (
                                <li key={idx}>{offer.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <h2 className="text-xl font-semibold mb-2">Ingredienser</h2>
                <ul className="list-disc pl-6 text-gray-700">
                    {ingredients.map((ingredient: any, idx: number) => (
                        <li key={idx}>{ingredient.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
