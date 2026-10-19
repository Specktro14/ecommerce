import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  smallint,
  unique,
} from "drizzle-orm/pg-core";

import { productos } from "../productos/productos.tables";

export const UItype = pgEnum("tipo-opciones", [
  "INPUT_NUMBER",
  "RADIO",
  "CHECKBOX",
  "SELECT",
]);

export const optionTypes = pgTable("opciones", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 150 }).unique().notNull(),
  key: varchar({ length: 100 }).unique().notNull(),
  UItype: UItype().notNull(),
  isActive: boolean().default(true),
});

export const optionsValues = pgTable(
  "valores_opciones",
  {
    id: uuid().defaultRandom().primaryKey(),
    optionTypeID: uuid()
      .references(() => optionTypes.id)
      .notNull(),
    value: varchar({ length: 100 }).notNull(),
    label: varchar({ length: 150 }).notNull(),
    order: smallint(),
  },
  (t) => [unique("uniqueValorTipoOpcion").on(t.optionTypeID, t.value)],
);

export const productOptions = pgTable(
  "opciones_productos",
  {
    id: uuid().primaryKey().defaultRandom(),
    productID: uuid()
      .references(() => productos.id)
      .notNull(),
    optionTypeID: uuid()
      .references(() => optionTypes.id)
      .notNull(),
    isRequired: boolean().default(true),
    order: smallint(),
  },
  (t) => [unique("uniqueProductoTipoOpcion").on(t.productID, t.optionTypeID)],
);

export type OptionTypeInsert = typeof optionTypes.$inferInsert;
export type OptionValueInsert = typeof optionsValues.$inferInsert;
export type OptionProductInsert = typeof productOptions.$inferInsert;
