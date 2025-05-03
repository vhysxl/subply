export interface Transaction {
  token: string;
  redirect_url: string;
}

export interface Payment {
  id: string;
  order_id: string;
  transaction_status: string;
  transaction_id: string;
  issuer?: string;
  payment_type?: string;
  gross_amount: string;
  transaction_time: string;
  settlement_time: string;
}
