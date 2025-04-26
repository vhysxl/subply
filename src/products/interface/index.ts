export interface Voucher {
  type: string;
  value: number;
  stock: number;
}

export interface VoucherList {
  vouchers: Voucher[];
}
