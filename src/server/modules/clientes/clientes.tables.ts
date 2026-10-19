import {
  pgTable,
  uuid,
  varchar,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "../usuarios/usuarios.tables";

export const client = pgTable("clientes", {
  id: uuid().primaryKey().defaultRandom(),
  userID: text()
    .references(() => user.id)
    .notNull()
    .unique(),
  firstName: varchar({ length: 100 }).notNull(),
  lastName: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }),
  phone: varchar({ length: 20 }).notNull(),
  subscribedNewsletter: boolean().notNull().default(false),
  subscribedWhatsapp: boolean().notNull().default(false),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export const direction = pgTable("direccion", {
  id: uuid().primaryKey().defaultRandom(),
  clientID: uuid()
    .references(() => client.id, { onDelete: "cascade" })
    .notNull(),
  fullName: varchar({ length: 200 }).notNull(),
  phone: varchar({ length: 20 }),
  streetAddress: varchar({ length: 255 }).notNull(),
  streetNumber: varchar({ length: 20 }),
  apartment: varchar({ length: 50 }),
  zipCode: varchar({ length: 20 }).notNull(),
  town: varchar({ length: 100 }).notNull(),
  province: varchar({ length: 100 }),
  country: varchar({ length: 100 }).default("España"),
  extra: text(),
  isDefault: boolean().default(false),
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
});

export type ClientInsert = typeof client.$inferInsert;
export type DirectionInsert = typeof direction.$inferInsert;
