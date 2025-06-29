import { relations } from 'drizzle-orm';
import {
  orderProductsTable,
  ordersTable,
  paymentsTable,
  productsTable,
} from 'schemas';

//relations ordersTable
export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  payment: one(paymentsTable, {
    fields: [ordersTable.orderId],
    references: [paymentsTable.orderId],
  }), //orderstable punya 1-1 relations ke payment table
  orderProducts: many(orderProductsTable), //one to many ke junction (orderProductsTable)
}));

//relations paymentsRelations
export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [paymentsTable.orderId],
    references: [ordersTable.orderId], //orderstable punya 1-1 relations ke payment table
  }),
}));

export const orderProductsRelations = relations(
  //many to one ke prodcutsTable dan ordersTabel
  orderProductsTable,
  ({ one }) => ({
    order: one(ordersTable, {
      fields: [orderProductsTable.orderId],
      references: [ordersTable.orderId],
    }),
    product: one(productsTable, {
      fields: [orderProductsTable.productId],
      references: [productsTable.productId],
    }),
  }),
);
