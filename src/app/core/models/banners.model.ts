export interface Banner {
    id: string;
    type: string; //carrousel/promo/category
    category?: string;
    subCategories?: string[];
    products?:string[]; //array de ids
    photoURL: string;
    photoPath: string;
    photomovilURL?: string;
    photomovilPath?: string;
    published?: boolean;
    position: number
}