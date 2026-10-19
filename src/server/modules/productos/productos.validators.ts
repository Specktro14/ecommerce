import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { idSchema } from "~/lib/validators";

import {
  imageTypes,
  salesType,
  stockChangeReason,
  stockHistory,
  stockState,
  product,
  productImages,
  productVariants,
  units
} from "./productos.tables";

const salesTypeSchema = z.enum(salesType.enumValues, {
  error:
    "Tipo de venta no valido. Debe ser UNIDAD_FIJA, UNIDAD_VARIABLE o PESO_VARIABLE",
});

const unitsSchema = z.enum(units.enumValues, {
  error: "Tipo de unidades no valido. Debe ser kg, gr, ud",
});

const stockStateSchema = z.enum(stockState.enumValues, {
  error: "Tipo de stock no valido. Debe ser DISPONIBLE, AGOTADO o PROXIMAMENTE",
});

const stockChangeReasonSchema = z.enum(stockChangeReason.enumValues, {
  error:
    "Tipo de motivo no valido. Debe ser VENTA, MERMA, AJUSTE_MANUAL, DEVOLUCION, RECEPCION o ELIMINACION",
});

const imageTypesSchema = z.enum(imageTypes.enumValues, {
  error: "Tipo de imagen no valida. Debe ser MAIN o GALLERY",
});

const baseProductSchema = createInsertSchema(product, {
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150, "Maximo 150 caracteres"),
  description: z.string().optional(),
  shortDescription: z.string().max(255, "Maximo 255 caracteres").optional(),
  categoryID: z.uuid("El ID no es valido"),
  subcategoryID: z.uuid("El ID no es valido"),
  createdBy: z.uuid("El ID no es valido").optional(),
});

const baseProductVariantSchema = createInsertSchema(productVariants, {
  productID: z.uuid("El ID no es valido"),
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150, "Maximo 150 caracteres"),
  salesType: salesTypeSchema,
  pricePerUnit: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .transform((p) => p?.toString()),
  pricePerKG: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .transform((p) => p?.toString()),
  weight: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .transform((w) => w?.toString()),
  weightUnit: unitsSchema,
  estimatedWeightPerUnit: z.number(),
  minOrderQuantity: z.number().min(1, "Se debe pedir al menos un producto"),
  stock: z.number().min(0, "El stock no puede ser negativo"),
  minStockAlert: z.number(),
  stockState: stockStateSchema,
});

export const selectProductVariantSchema = createSelectSchema(productVariants)

export const createProductVariantSchema = baseProductVariantSchema.omit({
  id: true,
  sku: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductVariantSchema = baseProductVariantSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .extend(idSchema.shape);

export const createProductSchema = baseProductSchema
  .omit({
    id: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    baseVariant: createProductVariantSchema,
  });

export const updateProductSchema = baseProductSchema
  .omit({
    createdBy: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .extend(idSchema.shape);

export const logStockChangeSchema = createInsertSchema(stockHistory, {
  productVariantID: z.uuid("El ID no es valido"),
  reason: stockChangeReasonSchema,
  reference: z
    .string()
    .max(150, "La referencia solo puede contener 150 caracteres"),
}).omit({
  createdBy: true,
  id: true,
});

export const addImageSchema = createInsertSchema(productImages, {
  productID: z.uuid("El ID no es valido"),
  productVariantID: z.uuid("El ID no es valido"),
  url: z.url("La url no es valida"),
  type: imageTypesSchema,
}).omit({
  id: true,
  createdAt: true,
});

export const filterCatalogSchema = z.object({
  categoryId: z.uuid().optional(),
  subcategoryId: z.uuid().optional(),
  search: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStockOnly: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(24),
  sortBy: z
    .enum(["newest", "price_asc", "price_desc", "relevance"])
    .default("newest"),
});

export const unlinkSchema = z.object({
  category: z.boolean().optional(),
  subcategory: z.boolean().optional()
})

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = Omit<
  z.infer<typeof updateProductSchema>,
  "id"
  >;
export type SelectProductVariantInput = z.infer<typeof selectProductVariantSchema>
export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;
export type UpdateProductVariantInput = Omit<
  z.infer<typeof updateProductVariantSchema>,
  "id"
>;
export type AddImageInput = z.infer<typeof addImageSchema>;
export type StockChangeInput = z.infer<typeof logStockChangeSchema>;

export type FilterCatalogInput = z.infer<typeof filterCatalogSchema>;
export type UnlinkInput = z.infer<typeof unlinkSchema>