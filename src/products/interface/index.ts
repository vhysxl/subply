export interface Products {
  type: 'topup' | 'voucher';
  value: number;
  price: number;
  gameId: string | null;
  gameName: string | null;
  stock?: number;
}

export interface ProductsList {
  products: Products[];
}
