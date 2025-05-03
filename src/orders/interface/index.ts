export interface Order {
  orderId: string;
  userId: string;
  productId: string;
  customerName: string;
  email: string;
  target?: string | null;
  gameName: string;
  type: 'voucher' | 'topup';
  value: number;
  priceTotal: number;
  status: string;
  createdAt: Date;
  quantity: number;
}

export interface orderRequest {
  userId: string;
  gameId: string;
  customerName: string;
  email: string;
  target?: string | null;
  gameName: string;
  type: 'voucher' | 'topup';
  value: number;
  quantity: number;
}
