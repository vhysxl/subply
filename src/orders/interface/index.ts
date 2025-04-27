export interface QuickOrder {
  id: string;
  userId: string;
  name: string;
  email: string;
  voucherId: string | null;
  target?: string | null;
  value: number;
  priceTotal: number;
  status: string;
  type: string;
  createdAt: Date;
}

// export interface order {
//   id: string;
//   userId: string;
//   name: string;
//   email: string;
//   voucherId: string | null;
//   target?: string | null;
//   value: number;
//   priceTotal: number;
//   status: string;
//   type: string;
//   createdAt: Date;
// }
