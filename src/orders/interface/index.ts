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

export interface GetOrderData {
  orderId: string;
  target?: string | null;
  status: string;
  createdAt: Date;
  priceTotal: number;
  value: number;
  type: 'voucher' | 'topup';
  gameName: string;
  quantity: number;
}

export interface GetOrderDetails extends GetOrderData {
  paymentLink?: string | null;
  voucherCode?: string | null;
}

export type OrdersDataByUser = GetOrderData[];
