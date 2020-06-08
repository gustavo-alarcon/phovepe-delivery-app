export interface Product {
  id: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  ref: boolean;             //This will indicate wheter product has a referential price
  refPrice?: number;
  refUnit?: string;
  photoURL: string;
  photoPath: string;
  promo: boolean;           //Indicates wheter there is a promo
  promoData?: PromoData;
  published?: boolean;
}

interface PromoData {
  quantity: number;
  promoPrice: number;
}