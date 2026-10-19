import { eq, ne, and } from "drizzle-orm";

import { IdInput, KeyInput, IsActiveInput } from "~/lib/validators";
import { db } from "~/server/db";
import { DBconn } from "~/server/db/types";

import {
  OptionTypeInsert,
  OptionValueInsert,
  OptionProductInsert,
  optionTypes,
  optionsValues,
  productOptions
} from "./opciones.tables";
import {
  DeassignOptionInput,
  UpdateOptionTypeInput,
} from "./opciones.validators";

export const OptionRepo = {
  async getAllTypes(conn: DBconn = db) {
    return await conn.query.optionTypes.findMany({
      with: {
        values: true,
      },
    });
  },

  async createType(data: OptionTypeInsert, conn: DBconn = db) {
    return await conn.insert(optionTypes).values(data).returning();
  },

  async updateType(
    reference: IdInput,
    data: UpdateOptionTypeInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(optionTypes)
      .set(data)
      .where(eq(optionTypes.id, reference.id))
      .returning();
  },

  async existByCode(
    reference: KeyInput,
    idOmited?: IdInput,
    conn: DBconn = db,
  ) {
    let query = conn
      .select({ id: optionTypes.id })
      .from(optionTypes)
      .$dynamic();
    if (idOmited) {
      query = query.where(
        and(
          eq(optionTypes.key, reference.key),
          ne(optionTypes.id, idOmited.id),
        ),
      );
    } else {
      query = query.where(eq(optionTypes.key, reference.key));
    }
    const result = await query.limit(1);
    return result.length > 0;
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(optionTypes)
      .set({ isActive: data.isActive })
      .where(eq(optionTypes.id, data.id))
      .returning();
  },

  async createValue(data: OptionValueInsert, conn: DBconn = db) {
    return await conn.insert(optionsValues).values(data).returning();
  },

  async deleteValue(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(optionsValues)
      .where(eq(optionsValues.id, reference.id))
      .returning();
  },

  async assignOption(data: OptionProductInsert, conn: DBconn = db) {
    return await conn.insert(productOptions).values(data).returning();
  },

  async deassignOption(reference: DeassignOptionInput, conn: DBconn = db) {
    return await conn
      .delete(productOptions)
      .where(
        and(
          eq(productOptions.productID, reference.productID),
          eq(productOptions.optionTypeID, reference.optionTypeID),
        ),
      )
      .returning();
  },
};
