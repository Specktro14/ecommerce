import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { idSchema } from "~/lib/validators";

import { category, subcategory } from "./categorias.tables";

const baseCategorySchema = createInsertSchema(category).extend({
  name: z
    .string()
    .min(2, "El nombre tiene que tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener mas de 100 caracteres"),
  slug: z.string().max(100, "El slug no puede tener mas de 100 caracteres"),
  description: z
    .string()
    .max(255, "La descripcion no puede tener mas de 255 caracteres"),
});

const baseSubcategorySchema = createInsertSchema(subcategory).extend({
  name: z
    .string()
    .min(2, "El nombre tiene que tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener mas de 100 caracteres"),
  slug: z.string().max(100, "El slug no puede tener mas de 100 caracteres"),
  categoriaID: z.uuid("El ID de la categoria no es correcto"),
});

export const createCategorySchema = baseCategorySchema.omit({
  id: true,
  slug: true,
  isActive: true,
  updatedAt: true,
  createdAt: true,
});

export const createSubcategorySchema = baseSubcategorySchema.omit({
  id: true,
  slug: true,
  isActive: true,
  updatedAt: true,
  createdAt: true,
});

export const updateCategorySchema = baseCategorySchema
  .omit({
    updatedAt: true,
    createdAt: true,
  })
  .partial()
  .extend(idSchema.shape);

export const updateSubcategorySchema = baseSubcategorySchema
  .omit({
    updatedAt: true,
    createdAt: true,
  })
  .partial()
  .extend(idSchema.shape);

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateCategoryInput = Omit<
  z.infer<typeof updateCategorySchema>,
  "id"
>;
export type UpdateSubcategoryInput = Omit<
  z.infer<typeof updateSubcategorySchema>,
  "id"
  >;
