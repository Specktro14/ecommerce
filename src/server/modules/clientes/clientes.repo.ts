import { Temporal } from "@js-temporal/polyfill";
import { eq, lte } from "drizzle-orm";

import { IdInput } from "~/lib/validators";
import { db } from "~/server/db/index";
import { DBconn } from "~/server/db/types";

import { user } from "../usuarios/usuarios.tables";
import {
  ClientInsert,
  client,
  direction,
  DirectionInsert,
} from "./clientes.tables";
import {
  UpdateClientInput,
  UpdateDirectionInput,
} from "./clientes.validators";

export const ClientsRepo = {
  async getByUserID(reference: IdInput, conn: DBconn = db) {
    return await conn.query.client.findFirst({
      where: eq(client.userID, reference.id),
      with: {
        directions: true,
      },
    });
  },

  async create(data: ClientInsert, conn: DBconn = db) {
    return await conn.insert(client).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateClientInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(client)
      .set(data)
      .where(eq(client.id, reference.id))
      .returning();
  },
};

export const DirectionRepo = {
  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn.select().from(direction).where(eq(direction.id, reference.id));
  },
  
  async create(data: DirectionInsert, conn: DBconn = db) {
    return await conn.insert(direction).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateDirectionInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(direction)
      .set(data)
      .where(eq(direction.id, reference.id))
      .returning();
  },

  async clearDefaults(reference: IdInput, conn: DBconn = db) {
    return await conn
      .update(direction)
      .set({ isDefault: false })
      .where(eq(direction.clientID, reference.id))
      .returning();
  },

  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(direction)
      .where(eq(direction.id, reference.id))
      .returning();
  },
};

export const AuthUserRepo = {
  async programmedDelete(
    reference: IdInput,
    date: Temporal.ZonedDateTime | null,
    conn: DBconn = db,
  ) {
    const drizzleDate = date ? new Date(date.epochMilliseconds) : null;
    return await conn
      .update(user)
      .set({ setDeleteDate: drizzleDate })
      .where(eq(user.id, reference.id))
      .returning();
  },

  async getExpiredUsers(now: Temporal.ZonedDateTime, conn: DBconn = db) {
    const drizzleDate = new Date(now.epochMilliseconds);
    return await conn
      .select()
      .from(user)
      .where(lte(user.setDeleteDate, drizzleDate));
  },

  async hardDelete(reference: IdInput, conn: DBconn = db) {
    return await conn.delete(user).where(eq(user.id, reference.id)).returning();
  },
};
