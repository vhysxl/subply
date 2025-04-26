export interface QuickOrder {
  id: string;
  userId: string;
  voucherId: string | null;
  target?: string | null;
  value: string;
  priceTotal: string;
  status: string;
  type: string;
  createdAt: Date;
}
