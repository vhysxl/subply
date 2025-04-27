import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

// Define enum untuk status voucher
export const statusEnum = pgEnum('status', ['available', 'used']);

// Define enum untuk status pembayaran
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'expired',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'completed',
  'cancelled',
]);

// Table users
export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table vouchers
export const vouchersTable = pgTable('vouchers', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  status: statusEnum('status').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table orders
export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  voucherId: uuid('voucher_id').references(() => vouchersTable.id, {
    onDelete: 'set null',
  }),
  target: varchar('target', { length: 255 }),
  status: orderStatusEnum('status').notNull().default('pending'), // baru
  createdAt: timestamp('created_at').defaultNow().notNull(),
  priceTotal: numeric('price_total', { precision: 10, scale: 2 }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 })
    .notNull()
    .references(() => usersTable.email, { onDelete: 'set null' }),
});

export const paymentsTable = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }), // payment harus terkait order
  externalId: varchar('external_id', { length: 255 }).notNull(), // ID dari Xendit
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(), // total yang harus dibayar
  status: paymentStatusEnum('status').notNull(), // pending, paid, failed, expired
  paymentMethod: varchar('payment_method', { length: 100 }), // optional, contoh: "DANA", "QRIS", "BCA"
  paidAt: timestamp('paid_at'), // nullable, hanya isi kalau sudah dibayar
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// todo: add table direct_topup.
