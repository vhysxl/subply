import { sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  pgEnum,
  boolean,
  text,
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
  'processed',
  'failed',
]);
export const typeEnum = pgEnum('type', ['voucher', 'topup']);
export const roleEnum = pgEnum('role', ['admin', 'user', 'superadmin']);

// Users
export const usersTable = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  password: varchar('password', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  roles: roleEnum('roles')
    .array()
    .notNull()
    .default(sql`ARRAY['user']::role[]`),
});

// Games
export const games = pgTable('games', {
  gameId: uuid('game_id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  isPopular: boolean('is_popular').notNull().default(false),
  currency: varchar('currency', { length: 50 }).notNull(),
  imageUrl: varchar('image_url', { length: 200 }),
});

// Products
export const productsTable = pgTable('products', {
  productId: uuid('product_id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  value: numeric('value').notNull(),
  status: statusEnum('status').notNull(),
  type: typeEnum('type').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  gameId: uuid('game_id')
    .references(() => games.gameId, {
      onDelete: 'cascade',
    })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders
export const ordersTable = pgTable('orders', {
  orderId: uuid('order_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.userId, { onDelete: 'cascade' }),
  productIds: varchar('product_ids', { length: 1000 }).notNull(),
  target: varchar('target', { length: 255 }),
  status: orderStatusEnum('status').notNull().default('pending'),
  priceTotal: numeric('price_total', { precision: 10, scale: 2 }).notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(), //in game value
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
  paymentLink: varchar('payment_link', { length: 255 }),
});

//audit_logs
export const auditLogs = pgTable('audit_logs', {
  auditId: uuid('audit_id').primaryKey().defaultRandom(),
  admin_id: uuid('admin_id').references(() => usersTable.userId, {
    onDelete: 'set null',
  }),
  action: text('action').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});
