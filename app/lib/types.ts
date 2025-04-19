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
};

export type Offer = {
    name: string;
    ingredient: string;
    simliarity: number;
};

export type Store = {
    id: string;
    name: string;
};