import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  boolean,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";

import { category, subcategory } from "../categorias/categorias.tables";
import { user } from "../usuarios/usuarios.tables";

export const salesType = pgEnum("tipo_venta", [
  "UNIDAD_FIJA",
  "UNIDAD_VARIABLE",
  "PESO_VARIABLE",
]);
export const stockState = pgEnum("estado_stock", [
  "DISPONIBLE",
  "AGOTADO",
  "PROXIMAMENTE",
]);
export const imageTypes = pgEnum("image_types", ["MAIN", "GALLERY"]);
// Cambio inminente
export const units = pgEnum("unidades", ["kg", "gr", "ud", "1"]); 
export const stockChangeReason = pgEnum("motivos_cambio_stock", [
  "VENTA",
  "AJUSTE_MANUAL",
  "DEVOLUCION",
  "MERMA",
  "RECEPCION",
  "ELIMINACION",
]);

export const product = pgTable("productos", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 150 }).notNull(),
  slug: varchar({ length: 150 }).unique().notNull(),
  description: text(),
  shortDescription: varchar({ length: 255 }),
  isFeatured: boolean().default(false),
  isActive: boolean().default(true),
  categoryID: uuid()
    .references(() => category.id, { onUpdate: "cascade", onDelete: "set null"}),
  subcategoryID: uuid()
    .references(() => subcategory.id, { onUpdate: "cascade", onDelete: "set null"}),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  createdBy: uuid().references(() => user.id),
});

export const productVariants = pgTable("variantes_productos", {
  id: uuid().primaryKey().defaultRandom(),
  productID: uuid()
    .references(() => product.id)
    .notNull(),
  sku: varchar({ length: 100 }).unique().notNull(),
  name: varchar({ length: 150 }),
  salesType: salesType().notNull(),
  pricePerUnit: decimal({ precision: 10, scale: 2 }),
  pricePerKG: decimal({ precision: 10, scale: 2 }),
  // Peso predefinido de las variantes tipo PESO_VARIABLE
  weight: decimal({ precision: 10, scale: 3 }),
  // Tipo unidad de medida (Todos)
  weightUnit: units().notNull(),
  // Peso estimado de una unidad de las variantes UNIDAD_VARIABLE
  estimatedUnitWeight: integer(),
  minOrderQuantity: integer(),
  stock: integer().default(0),
  minStockAlert: integer().default(5),
  stockState: stockState().default("DISPONIBLE"),
  estimatedAvailabilityDate: timestamp(),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
  isActive: boolean().default(true),
});

export const stockHistory = pgTable("historial_stock", {
  id: uuid().primaryKey().defaultRandom(),
  productVariantID: uuid()
    .references(() => productVariants.id)
    .notNull(),
  quantityVariation: integer().notNull(),
  reason: stockChangeReason(),
  reference: varchar({ length: 150 }),
  notes: text(),
  createdBy: uuid().references(() => user.id),
  createdAt: timestamp().defaultNow(),
});

export const pricesHistory = pgTable("historial_precios", {
  id: uuid().primaryKey().defaultRandom(),
  productVariantID: uuid()
    .references(() => productVariants.id)
    .notNull(),
  pricePerUnit: decimal({ precision: 10, scale: 2 }),
  pricePerKG: decimal({ precision: 10, scale: 2 }),
  validFrom: timestamp().defaultNow(),
  validUntil: timestamp(),
  reason: varchar({ length: 150 }),
  createdBy: uuid().references(() => user.id),
});

export const productImages = pgTable("imagenes_productos", {
  id: uuid().primaryKey().defaultRandom(),
  productID: uuid()
    .references(() => product.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  productVariantID: uuid().references(() => productVariants.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  url: text().notNull(),
  type: imageTypes().notNull(),
  order: smallint(),
  isActive: boolean(),
  createdAt: timestamp().defaultNow(),
});

export type ProductInsert = typeof product.$inferInsert;
export type ProductVariantInsert = typeof productVariants.$inferInsert;
export type ProductImagesInsert = typeof productImages.$inferInsert;
export type StockLogInsert = typeof stockHistory.$inferInsert;
export type PriceLogInsert = typeof pricesHistory.$inferInsert;
