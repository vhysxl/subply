export interface Transaction {
  token: string;
  redirect_url: string;
}

export interface va_data {
  va_number: string;
  bank: string;
}

export interface Payment {
  va_numbers: va_data[];
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
