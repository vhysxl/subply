export interface Products {
  type: 'topup' | 'voucher';
  value: number;
  price: number;
  gameId: string | null;
  gameName: string | null;
  stock?: number;
  isPopular: boolean;
  currency: string;
  imageUrl: string | null;
  code?: string;
}

export interface NewlyCreatedProduct {
  productId: string;
  code: string;
  value: number;
  status: 'available' | 'used';
  type: 'topup' | 'voucher';
  price: number;
  gameId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductsList {
  products: Products[];
}
