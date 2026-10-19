import {
  pgEnum,
  pgTable,
  varchar,
  text,
  uuid,
  smallint,
  boolean,
  timestamp,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";

import { client, direction } from "../clientes/clientes.tables";
import { productVariants, units } from "../productos/productos.tables";
import { user } from "../usuarios/usuarios.tables";

export const orderStateCode = pgEnum("estado_pedido", [
  "PENDIENTE",
  "EN_PROCESO",
  "COMPLETADO",
  "CANCELADO",
]);

export const orderState = pgTable("estado_pedido", {
  id: uuid().primaryKey().defaultRandom(),
  code: orderStateCode().unique().notNull(),
  name: varchar({ length: 100 }).notNull(),
  color: varchar({ length: 30 }),
  description: text(),
  isTerminal: boolean().default(false),
  order: smallint(),
});

// Añadir fecha de recogida
export const order = pgTable("pedidos", {
  id: uuid().primaryKey().defaultRandom(),
  orderCode: varchar({ length: 50 }).unique().notNull(),
  clientID: uuid()
    .references(() => client.id)
    .notNull(),
  directionID: uuid()
    .references(() => direction.id)
    .notNull(),
  deliverDate: timestamp().notNull(),
  subtotal: decimal({ precision: 10, scale: 2 }).notNull(),
  taxes: decimal({ precision: 10, scale: 2 }).default("0"),
  shipmentTaxes: decimal({ precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  stateID: uuid()
    .references(() => orderState.id)
    .notNull(),
  clientNotes: text(),
  staffNotes: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  completedAt: timestamp(),
  updatedBy: uuid().references(() => user.id),
});

export const orderProducts = pgTable("productos_pedidos", {
  id: uuid().primaryKey().defaultRandom(),
  orderID: uuid()
    .references(() => order.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  productVariantID: uuid()
    .references(() => productVariants.id)
    .notNull(),
  quantity: decimal({ precision: 10, scale: 3 }).notNull(),
  quantityUnit: units(),
  selectedOptions: jsonb(),
  unitPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp().defaultNow(),
});

export const orderEventsHistory = pgTable("historial_eventos_pedidos", {
  id: uuid().primaryKey().defaultRandom(),
  orderID: uuid()
    .references(() => order.id)
    .notNull(),
  fromStatusID: uuid().references(() => orderState.id),
  toStatusID: uuid()
    .references(() => orderState.id)
    .notNull(),
  notes: text(),
  createdBy: uuid().references(() => user.id),
  createdAt: timestamp().defaultNow(),
});

export type OrderInsert = typeof order.$inferInsert;
export type EventLogInsert = typeof orderEventsHistory.$inferInsert;