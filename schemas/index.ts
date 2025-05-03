import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  pgEnum,
  boolean,
} from 'drizzle-orm/pg-core';

// Enums
export const statusEnum = pgEnum('status', ['available', 'used']);
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
export const typeEnum = pgEnum('type', ['voucher', 'topup']);

// Users
export const usersTable = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Games
export const games = pgTable('games', {
  gameId: uuid('game_id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  isPopular: boolean('is_popular').notNull().default(false),
  currency: varchar('currency', { length: 50 }).notNull(),
});

// Products
export const productsTable = pgTable('products', {
  productId: uuid('product_id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  value: numeric('value').notNull(),
  status: statusEnum('status').notNull(),
  type: typeEnum('type').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  name: varchar('name', { length: 100 }),
  gameId: uuid('game_id').references(() => games.gameId, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders
export const ordersTable = pgTable('orders', {
  orderId: uuid('order_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.userId, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .references(() => productsTable.productId, {
      onDelete: 'restrict',
    })
    .notNull(),
  target: varchar('target', { length: 255 }),
  status: orderStatusEnum('status').notNull().default('pending'),
  priceTotal: numeric('price_total', { precision: 10, scale: 2 }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  type: typeEnum('type').notNull(),
  gameName: varchar('game_name', { length: 100 }).notNull(),
  customerName: varchar('customer_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  quantity: numeric('quantity').notNull(),
});

// Payments
export const paymentsTable = pgTable('payments', {
  paymentId: uuid('payment_id').primaryKey().defaultRandom(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.orderId, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull(),
  paymentMethod: varchar('payment_method', { length: 100 }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
