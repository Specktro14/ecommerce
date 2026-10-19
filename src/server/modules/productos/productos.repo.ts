import { SQL, exists, eq, ne, or, ilike, and, gte, gt, lte, inArray } from "drizzle-orm";

import { IdInput, SlugInput, SkuInput, IsActiveInput } from "~/lib/validators";
import { db } from "~/server/db";
import { DBconn } from "~/server/db/types";
import {
  productsSortLogic,
  applySQLVisibilityFilter
} from "~/server/utils/filters";

import {
  product,
  productVariants,
  productImages,
  pricesHistory,
  stockHistory,
  ProductInsert,
  ProductVariantInsert,
  ProductImagesInsert,
  StockLogInsert,
  PriceLogInsert,
} from "./productos.tables";
import {
  FilterCatalogInput,
  UpdateProductInput,
  UpdateProductVariantInput,
  UnlinkInput,
} from "./productos.validators";

export const ProductRepo = {
  async getAdminCatalog(conn: DBconn = db) {
    return await conn.query.product.findMany({
      with: {
        variants: true,
        images: true,
      },
      orderBy: (product, { desc }) => [desc(product.createdAt)],
    });
  },

  async getPublicCatalog(filters: FilterCatalogInput, conn: DBconn = db) {
    const conditions: (SQL | undefined)[] = [eq(product.isActive, true)];

    if (filters.categoryId)
      conditions.push(eq(product.categoryID, filters.categoryId));
    if (filters.subcategoryId)
      conditions.push(eq(product.subcategoryID, filters.subcategoryId));
    if (filters.search)
      conditions.push(
        or(
          ilike(product.name, `%${filters.search}%`),
          ilike(product.description, `%${filters.search}%`),
        ),
      );

    const needsVariantFilter =
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.inStockOnly;

    if (needsVariantFilter) {
      const variantConds: (SQL | undefined)[] = [
        eq(productVariants.isActive, true),
        eq(productVariants.productID, product.id),
      ];

      if (filters.minPrice !== undefined)
        variantConds.push(
          or(
            gte(productVariants.pricePerUnit, filters.minPrice.toString()),
            gte(productVariants.pricePerKG, filters.minPrice.toString()),
          ),
        );

      if (filters.maxPrice !== undefined)
        variantConds.push(
          or(
            lte(productVariants.pricePerUnit, filters.maxPrice.toString()),
            lte(productVariants.pricePerKG, filters.maxPrice.toString()),
          ),
        );

      if (filters.inStockOnly)
        variantConds.push(gt(productVariants.stock, 0));

      conditions.push(
        exists(
          conn
            .select()
            .from(productVariants)
            .where(and(...variantConds)),
        ),
      );
    }

    const limit = filters.limit;
    const offset = (filters.page - 1) * limit;

    return await conn.query.product.findMany({
      where: and(...conditions),
      with: {
        variants: {
          where: eq(productVariants.isActive, true),
        },
        images: {
          where: eq(productImages.isActive, true),
        },
      },
      limit,
      offset,
      orderBy: productsSortLogic(filters.sortBy),
    });
  },

  async getById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.product.findFirst({
      where: (product) =>
        and(eq(product.id, reference.id), applySQLVisibilityFilter(product)),
      with: {
        variants: {
          where: (variant) => applySQLVisibilityFilter(variant),
        },
        images: {
          where: (image, { eq }) => eq(image.isActive, true),
        },
      },
    });
  },

  // async getUncategorizedProducts

  async existByCode(
    reference: SlugInput,
    idOmited?: IdInput,
    conn: DBconn = db,
  ) {
    let query = conn.select({ id: product.id }).from(product).$dynamic();
    if (idOmited) {
      query = query.where(
        and(eq(product.slug, reference.slug), ne(product.id, idOmited.id)),
      );
    } else {
      query = query.where(eq(product.slug, reference.slug));
    }
    const resultado = await query.limit(1);
    return resultado.length > 0;
  },

  async create(data: ProductInsert, conn: DBconn = db) {
    return await conn.insert(product).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateProductInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(product)
      .set(data)
      .where(eq(product.id, reference.id))
      .returning();
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(product)
      .set({ isActive: data.isActive })
      .where(eq(product.id, data.id))
      .returning();
  },

  async transferByCategoryID(reference: IdInput, target: IdInput, conn: DBconn = db) {
    return await conn
      .update(product)
      .set({ categoryID: target.id })
      .where(eq(product.categoryID, reference.id))
  },

  // No necesarias
  async unlink(reference: IdInput, input: UnlinkInput, conn: DBconn = db) {
    const data: UpdateProductInput = {};
    if (input.category) {
      data.categoryID = undefined
      data.subcategoryID = undefined;
    }
    if (input.subcategory) data.subcategoryID = undefined;

    return await conn
      .update(product)
      .set(data)
      .where(eq(product.id, reference.id))
      .returning();
  },

  async bulkUnlink(ids: string[], input: UnlinkInput, conn: DBconn = db) {
    const data: UpdateProductInput = {};
    if (input.category) {
      data.categoryID = undefined
      data.subcategoryID = undefined;
    }
    if (input.subcategory) data.subcategoryID = undefined;

    return await conn
      .update(product)
      .set(data)
      .where(inArray(product.id, ids))
      .returning();
  },
  ////////////////
  
  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(product)
      .where(eq(product.id, reference.id))
      .returning();
  },
};

export const VariantRepo = {
  async getById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.productVariants.findFirst({
      where: (variant) =>
        and(
          eq(variant.id, reference.id),
          applySQLVisibilityFilter(variant),
        ),
    });
  },

  async create(data: ProductVariantInsert, conn: DBconn = db) {
    return await conn.insert(productVariants).values(data).returning();
  },

  async existByCode(
    reference: SkuInput,
    idOmited?: IdInput,
    conn: DBconn = db,
  ) {
    let query = conn
      .select({ id: productVariants.id })
      .from(productVariants)
      .$dynamic();
    if (idOmited) {
      query = query.where(
        and(
          eq(productVariants.sku, reference.sku),
          ne(productVariants.id, idOmited.id),
        ),
      );
    } else {
      query = query.where(eq(productVariants.sku, reference.sku));
    }
    const resultado = await query.limit(1);
    return resultado.length > 0;
  },

  async update(
    reference: IdInput,
    data: UpdateProductVariantInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(productVariants)
      .set(data)
      .where(eq(productVariants.id, reference.id))
      .returning();
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(productVariants)
      .set({ isActive: data.isActive })
      .where(eq(productVariants.id, data.id))
      .returning();
  },

  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(productVariants)
      .where(eq(productVariants.id, reference.id))
      .returning();
  },

  async logStockChange(data: StockLogInsert, conn: DBconn = db) {
    return await conn.insert(stockHistory).values(data).returning();
  },

  async logPriceChange(data: PriceLogInsert, conn: DBconn = db) {
    return await conn.insert(pricesHistory).values(data).returning();
  },
};

export const ImageRepo = {
  async getById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.productImages.findFirst({
      where: eq(productImages.id, reference.id),
    });
  },

  async create(data: ProductImagesInsert, conn: DBconn = db) {
    return await conn.insert(productImages).values(data).returning();
  },

  async changeVisibility(data: IsActiveInput, conn: DBconn = db) {
    return await conn
      .update(productImages)
      .set({ isActive: data.isActive })
      .where(eq(productImages.id, data.id))
      .returning();
  },

  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(productImages)
      .where(eq(productImages.id, reference.id))
      .returning();
  },
};
