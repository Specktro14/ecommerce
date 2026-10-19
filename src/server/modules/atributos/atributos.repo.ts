import { eq, ne, and } from "drizzle-orm";

import { IdInput, IsActiveInput, KeyInput } from "~/lib/validators";
import {
  applySQLVisibilityFilter,
} from "~/server/utils/db-filters";

import { db } from "../../db/index";
import { DBconn } from "../../db/types";
import { atribute, atributesProduct, AtributeInsert } from "./atributos.tables";
import {
  UpdateAtributeInput,
  AssignAtributeInput,
  DeassignAtributeInput,
  SincronizeAtributesInput
} from "./atributos.validators";

export const AtributesRepo = {
  async getAll(conn: DBconn = db) {
    return await conn
      .select()
      .from(atribute)
      .where(applySQLVisibilityFilter(atribute));
  },

  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(atribute)
      .where(
        and(eq(atribute.id, reference.id), applySQLVisibilityFilter(atribute)),
      );
  },

  async getByKey(reference: KeyInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(atribute)
      .where(
        and(
          eq(atribute.key, reference.key),
          applySQLVisibilityFilter(atribute),
        ),
      );
  },

  async existByCode(
    reference: KeyInput,
    idOmited?: IdInput,
    conn: DBconn = db,
  ) {
    let query = conn.select({ id: atribute.id }).from(atribute).$dynamic();
    if (idOmited) {
      query = query.where(
        and(eq(atribute.key, reference.key), ne(atribute.id, idOmited.id)),
      );
    } else {
      query = query.where(eq(atribute.key, reference.key));
    }
    const result = await query.limit(1);
    return result.length > 0;
  },

  async create(data: AtributeInsert, conn: DBconn = db) {
    return await conn.insert(atribute).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateAtributeInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(atribute)
      .set(data)
      .where(eq(atribute.id, reference.id))
      .returning();
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(atribute)
      .set({ isActive: data.isActive })
      .where(eq(atribute.id, data.id))
      .returning();
  },

  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(atribute)
      .where(eq(atribute.id, reference.id))
      .returning();
  },
};

export const AtributesProductRepo = {
  async getAll(conn: DBconn = db) {
    return await conn.select().from(atributesProduct)
  },

  async getByProductID(reference: IdInput, conn: DBconn = db) {
    return await conn
        .select()
        .from(atributesProduct)
        .where(eq(atributesProduct.productID, reference.id))
  },

  async assignOption(data: AssignAtributeInput, conn: DBconn = db) {
    return await conn
      .insert(atributesProduct)
      .values(data)
      .onConflictDoNothing()
      .returning();
  },

  async bulkAssign(data: SincronizeAtributesInput, conn: DBconn = db) {
    if (data.atributeIDs.length === 0) {
      return [];
    }
    const filasAInsertar = data.atributeIDs.map((idDelAtributo) => ({
      productID: data.productID,
      atributeID: idDelAtributo,
    }));

    return await conn
      .insert(atributesProduct)
      .values(filasAInsertar)
      .onConflictDoNothing()
      .returning();
  },

  async removeOption(reference: DeassignAtributeInput, conn: DBconn = db) {
    return await conn
      .delete(atributesProduct)
      .where(
        and(
          eq(atributesProduct.atributeID, reference.atributeID),
          eq(atributesProduct.productID, reference.productID),
        ),
      )
      .returning();
  },

  async removeAllFromProduct(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(atributesProduct)
      .where(eq(atributesProduct.productID, reference.id))
      .returning();
  },
};
