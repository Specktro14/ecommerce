import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  smallint,
  text,
  boolean,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { productos } from "../productos/productos.tables";

export const atributeType = pgEnum("tipo_atributo", [
  "ALERGENO",
  "CERTIFICACION",
  "CARACTERISTICA",
]);

export const atribute = pgTable("atributos", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).unique().notNull(),
  key: varchar({ length: 50 }).unique().notNull(),
  type: atributeType(),
  icon: varchar({ length: 255 }),
  description: text(),
  color: varchar({ length: 30 }),
  priority: smallint().default(0),
  isActive: boolean().default(true),
  updatedAt: timestamp().defaultNow().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const atributesProduct = pgTable(
  "atributos_producto",
  {
    id: uuid().primaryKey().defaultRandom(),
    productID: uuid()
      .notNull()
      .references(() => productos.id, { onDelete: "cascade" }),
    atributeID: uuid()
      .notNull()
      .references(() => atribute.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique("uniqueProductoAtributo").on(t.productID, t.atributeID),
    index("producto_idx").on(t.productID),
    index("atributo_idx").on(t.atributeID),
  ],
);

export type AtributeInsert = typeof atribute.$inferInsert;
