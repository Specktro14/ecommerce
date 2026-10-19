import { eq, ne, and, inArray } from "drizzle-orm";

import { IsActiveInput, SlugInput, IdInput } from "~/lib/validators";
import { db } from "~/server/db";
import { DBconn } from "~/server/db/types";
import { applySQLVisibilityFilter } from "~/server/utils/db-filters";

import {
  category,
  subcategory,
  CategoryInsert,
  SubcategoryInsert,
} from "./categorias.tables";
import {
  UpdateCategoryInput,
  UpdateSubcategoryInput,
} from "./categorias.validators";

export const CategoriesRepo = {
  async getCategoriesTree(conn: DBconn = db) {
    return await conn.query.category.findMany({
      where: (cats) => applySQLVisibilityFilter(cats),
      with: {
        subcategories: {
          where: (subcats) => applySQLVisibilityFilter(subcats),
        },
      },
    });
  },

  // No usada en el service, no es necesaria
  // Se sustituye con getCategoriesTree
  async getAll(conn: DBconn = db) {
    return await conn
      .select()
      .from(category)
      .where(applySQLVisibilityFilter(category));
  },

  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(category)
      .where(
        and(eq(category.id, reference.id), applySQLVisibilityFilter(category)),
      )
      .limit(1);
  },

  async getBySlug(reference: SlugInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(category)
      .where(
        and(
          eq(category.slug, reference.slug),
          applySQLVisibilityFilter(category),
        ),
      )
      .limit(1);
  },

  async getWithRelations(reference: IdInput, conn: DBconn = db) {
    return await conn.query.category.findFirst({
      where: eq(category.id, reference.id),
      with: {
        subcategories: {
          columns: {
            id: true
          }
        },
        products: {
          columns: {
            id: true
          }
        }
      }
    });
  },
  
  async existByCode(
    reference: SlugInput,
    idOmited?: IdInput,
    conn: DBconn = db,
  ) {
    let query = conn.select({ id: category.id }).from(category).$dynamic();
    if (idOmited) {
      query = query.where(
        and(eq(category.slug, reference.slug), ne(category.id, idOmited.id)),
      );
    } else {
      query = query.where(eq(category.slug, reference.slug));
    }
    const result = await query.limit(1);
    return result.length > 0;
  },

  async create(data: CategoryInsert, conn: DBconn = db) {
    return await conn.insert(category).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateCategoryInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(category)
      .set(data)
      .where(eq(category.id, reference.id))
      .returning();
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(category)
      .set({ isActive: data.isActive })
      .where(eq(category.id, data.id))
      .returning();
  },
  
  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(category)
      .where(eq(category.id, reference.id))
      .returning();
  },
};

export const SubcategoriesRepo = {
  // No usada en el service
  // Se sustituye con getCategoriesTree
  async getAll(conn: DBconn = db) {
    return await conn
      .select()
      .from(subcategory)
      .where(applySQLVisibilityFilter(subcategory));
  },

  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(subcategory)
      .where(
        and(
          eq(subcategory.id, reference.id),
          applySQLVisibilityFilter(subcategory),
        ),
      )
      .limit(1);
  },

  async getBySlug(reference: SlugInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(subcategory)
      .where(
        and(
          eq(subcategory.slug, reference.slug),
          applySQLVisibilityFilter(subcategory),
        ),
      )
      .limit(1);
  },

  async getByCategoryID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(subcategory)
      .where(
        and(
          eq(subcategory.categoryID, reference.id),
          applySQLVisibilityFilter(subcategory),
        ),
      )
      .limit(1)
  },

  async getIdsByCategoryID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select({ id: subcategory.id })
      .from(subcategory)
      .where(
          eq(subcategory.categoryID, reference.id),
      )
  },

  async getWithRelations(reference: IdInput, conn: DBconn = db) {
    return await conn.query.subcategory.findFirst({
      where: eq(subcategory.id, reference.id),
      with: {
        products: {
          columns: {
            id: true
          }
        }
      }
    })
  },

  async existByCode(
    reference: SlugInput,
    idOmited?: IdInput,
    conn: DBconn = db,
  ) {
    let query = conn
      .select({ id: subcategory.id })
      .from(subcategory)
      .$dynamic();
    if (idOmited) {
      query = query.where(
        and(
          eq(subcategory.slug, reference.slug),
          ne(subcategory.id, idOmited.id),
        ),
      );
    } else {
      query = query.where(eq(subcategory.slug, reference.slug));
    }
    const result = await query.limit(1);
    return result.length > 0;
  },

  async create(data: SubcategoryInsert, conn: DBconn = db) {
    return await conn.insert(subcategory).values(data).returning();
  },

  // No usada en el service
  // Usar create normal con un posible for
  async createMany(data: SubcategoryInsert[], conn: DBconn = db) {
    return await conn.insert(subcategory).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateSubcategoryInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(subcategory)
      .set(data)
      .where(eq(subcategory.id, reference.id))
      .returning();
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(subcategory)
      .set({ isActive: data.isActive })
      .where(eq(subcategory.id, data.id))
      .returning();
  },

  async transferByCategoryID(reference: IdInput, target: IdInput, conn: DBconn = db) {
    return await conn
      .update(subcategory)
      .set({ categoryID: target.id })
      .where(eq(subcategory.categoryID, reference.id))
  },

  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(subcategory)
      .where(eq(subcategory.id, reference.id))
      .returning();
  },

  async bulkDelete(ids: string[], conn: DBconn = db) {
    return await conn
      .delete(subcategory)
      .where(inArray(subcategory.id, ids))
      .returning();
  },
};
