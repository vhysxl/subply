export interface Products {
  type: 'topup' | 'voucher';
  value: number;
  price: number;
  gameId: string | null;
  gameName: string | null;
  stock?: number;
  isPopular: boolean;
  currency: string;
}

export interface ProductsList {
  products: Products[];
}
