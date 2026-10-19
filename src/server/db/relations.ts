import { relations } from "drizzle-orm";

import * as schema from "./schema";

export const categoryRelations = relations(schema.category, ({ many }) => ({
  subcategories: many(schema.subcategory),
  products: many(schema.product),
}));

export const subcategoryRelations = relations(
  schema.subcategory,
  ({ one, many }) => ({
    category: one(schema.category, {
      fields: [schema.subcategory.categoryID],
      references: [schema.category.id],
    }),
    products: many(schema.product),
  }),
);

export const userRelations = relations(schema.user, ({ many, one }) => ({
  createdProducts: many(schema.product),
  stockHistory: many(schema.stockHistory),
  pricesHistory: many(schema.pricesHistory),
  updatedOrders: many(schema.order),
  orderEventsHistory: many(schema.orderEventsHistory),
  client: one(schema.client, {
    fields: [schema.user.id],
    references: [schema.client.userID],
  }),
}));

export const clientRelations = relations(schema.client, ({ many, one }) => ({
  orders: many(schema.order),
  directions: many(schema.direction),
  user: one(schema.user, {
    fields: [schema.client.userID],
    references: [schema.user.id],
  }),
}));

export const directionRelations = relations(schema.direction, ({ one }) => ({
  client: one(schema.client, {
    fields: [schema.direction.clientID],
    references: [schema.client.id],
  }),
}));

export const optionTypesRelations = relations(
  schema.optionTypes,
  ({ many }) => ({
    values: many(schema.optionsValues),
    productOptions: many(schema.productOptions),
  }),
);

export const optionsValuesRelations = relations(
  schema.optionsValues,
  ({ one }) => ({
    optionTypes: one(schema.optionTypes, {
      fields: [schema.optionsValues.optionTypeID],
      references: [schema.optionTypes.id],
    }),
  }),
);

export const productOptionsRelations = relations(
  schema.productOptions,
  ({ one }) => ({
    product: one(schema.product, {
      fields: [schema.productOptions.productID],
      references: [schema.product.id],
    }),
    optionTypes: one(schema.optionTypes, {
      fields: [schema.productOptions.optionTypeID],
      references: [schema.optionTypes.id],
    }),
  }),
);

export const productRelations = relations(schema.product, ({ one, many }) => ({
  category: one(schema.category, {
    fields: [schema.product.categoryID],
    references: [schema.category.id],
  }),
  subcategory: one(schema.subcategory, {
    fields: [schema.product.subcategoryID],
    references: [schema.subcategory.id],
  }),
  creator: one(schema.user, {
    fields: [schema.product.createdBy],
    references: [schema.user.id],
  }),
  variants: many(schema.productVariants),
  images: many(schema.productImages),
  options: many(schema.productOptions),
  atributes: many(schema.atributesProduct),
}));

export const productVariantsRelations = relations(
  schema.productVariants,
  ({ one, many }) => ({
    product: one(schema.product, {
      fields: [schema.productVariants.productID],
      references: [schema.product.id],
    }),
    stockHistory: many(schema.stockHistory),
    pricesHistory: many(schema.pricesHistory),
    images: many(schema.productImages),
    orders: many(schema.orderProducts),
  }),
);

export const atributeRelations = relations(schema.atribute, ({ many }) => ({
  products: many(schema.atributesProduct),
}));

export const productAtributesRelations = relations(
  schema.atributesProduct,
  ({ one }) => ({
    product: one(schema.product, {
      fields: [schema.atributesProduct.productID],
      references: [schema.product.id],
    }),
    aribute: one(schema.atribute, {
      fields: [schema.atributesProduct.atributeID],
      references: [schema.atribute.id],
    }),
  }),
);

export const productImagesRelations = relations(
  schema.productImages,
  ({ one }) => ({
    product: one(schema.product, {
      fields: [schema.productImages.productID],
      references: [schema.product.id],
    }),
    variant: one(schema.productVariants, {
      fields: [schema.productImages.productVariantID],
      references: [schema.productVariants.id],
    }),
  }),
);

export const stockHistoryRelations = relations(
  schema.stockHistory,
  ({ one }) => ({
    variant: one(schema.productVariants, {
      fields: [schema.stockHistory.productVariantID],
      references: [schema.productVariants.id],
    }),
    creator: one(schema.user, {
      fields: [schema.stockHistory.createdBy],
      references: [schema.user.id],
    }),
  }),
);

export const pricesHistoryRelations = relations(
  schema.pricesHistory,
  ({ one }) => ({
    variant: one(schema.productVariants, {
      fields: [schema.pricesHistory.productVariantID],
      references: [schema.productVariants.id],
    }),
    creator: one(schema.user, {
      fields: [schema.pricesHistory.createdBy],
      references: [schema.user.id],
    }),
  }),
);

export const orderStateRelations = relations(
  schema.orderState,
  ({ many }) => ({
    orders: many(schema.order),
    events: many(schema.orderEventsHistory),
  }),
);

export const orderRelations = relations(schema.order, ({ many, one }) => ({
  client: one(schema.client, {
    fields: [schema.order.clientID],
    references: [schema.client.id],
  }),
  direction: one(schema.direction, {
    fields: [schema.order.directionID],
    references: [schema.direction.id],
  }),
  orderState: one(schema.orderState, {
    fields: [schema.order.stateID],
    references: [schema.orderState.id],
  }),
  updater: one(schema.user, {
    fields: [schema.order.updatedBy],
    references: [schema.user.id],
  }),
  orderProducts: many(schema.orderProducts),
  eventHistory: many(schema.orderEventsHistory),
}));

export const orderProductsRelations = relations(
  schema.orderProducts,
  ({ one }) => ({
    order: one(schema.order, {
      fields: [schema.orderProducts.orderID],
      references: [schema.order.id],
    }),
    variant: one(schema.productVariants, {
      fields: [schema.orderProducts.productVariantID],
      references: [schema.productVariants.id],
    }),
  }),
);

export const orderEventsHistoryRelations = relations(
  schema.orderEventsHistory,
  ({ one }) => ({
    creator: one(schema.user, {
      fields: [schema.orderEventsHistory.createdBy],
      references: [schema.user.id],
    }),
    order: one(schema.order, {
      fields: [schema.orderEventsHistory.orderID],
      references: [schema.order.id],
    }),
    previousState: one(schema.orderState, {
      fields: [schema.orderEventsHistory.fromStatusID],
      references: [schema.orderState.id],
    }),
    actualState: one(schema.orderState, {
      fields: [schema.orderEventsHistory.toStatusID],
      references: [schema.orderState.id],
    }),
  }),
);
