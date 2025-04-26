export type Ingredient = {
    embedding: number[];
    name: string;
};

export type Recipe = {
    id: string;
    name: string;
    link_url: string;
    offer_count?: number;
    img_url?: string;
    ingredients: Ingredient[];
    offers: Offer[];
    matchingIngredients: Match[];
};

export type Match = {
    name: string;
    match: string;
    simliarity: number;
}

export type Offer = {
    name: string;
    ingredient: string;
    simliarity: number;
};

export type Store = {
    id: string;
    name: string;
};