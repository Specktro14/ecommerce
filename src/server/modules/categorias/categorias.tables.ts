import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const category = pgTable("categorias", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 255 }).notNull(),
  isActive: boolean().default(true).notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const subcategory = pgTable("subcategorias", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 100 }).notNull().unique(),
  categoryID: uuid()
    .references(() => category.id, { onUpdate: "cascade" }) // Decidir onDelete
    .notNull(),
  isActive: boolean().default(true).notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export type CategoryInsert = typeof category.$inferInsert;
export type SubcategoryInsert = typeof subcategory.$inferInsert;
