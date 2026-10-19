import {
  varchar,
  text,
  uuid,
  boolean,
  timestamp,
  pgEnum,
  pgTable,
} from "drizzle-orm/pg-core";

export const roles = pgEnum("roles", ["ADMIN", "MANAGER", "USER"]);

export const user = pgTable("usuarios", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: boolean().notNull(),
  image: text(),
  role: roles().notNull().default("USER"),
  setDeleteDate: timestamp(),
  isActive: boolean().default(true),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const session = pgTable("session", {
  id: text().primaryKey(),
  userID: uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: varchar({ length: 255 }).notNull().unique(),
  expiresAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  ipAddress: text(),
  userAgent: text(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const account = pgTable("cuenta", {
  id: text().primaryKey().notNull(),
  userID: uuid()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountID: text().notNull(),
  providerID: text().notNull(),
  accessToken: text(),
  refreshToken: text(),
  accessTokenExpiresAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  refreshTokenExpiresAt: timestamp({
    precision: 6,
    withTimezone: true,
  }).notNull(),
  scope: text(),
  tokenID: text(),
  password: text(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});

export const verification = pgTable("verificacion", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  updatedAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
  createdAt: timestamp({ precision: 6, withTimezone: true }).notNull(),
});
