export interface Products {
  productId: string;
  type: 'topup' | 'voucher';
  value: number;
  price: number;
  gameId: string;
  gameName: string | null;
  stock?: number;
  isPopular: boolean;
  currency: string;
  imageUrl: string | null;
  code?: string;
  status?: 'available' | 'used';
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
