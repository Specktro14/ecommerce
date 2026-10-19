import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { idSchema } from "~/lib/validators";

import {
  productOptions,
  optionTypes,
  optionsValues
} from "./opciones.tables";

const baseOptionTypeSchema = createInsertSchema(optionTypes, {
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(150, "Maximo 150 caracteres"),
  key: z
    .string()
    .min(1, "La key es obligatoria")
    .max(150, "Maximo 150 caracteres"),
});

const baseOptionValueSchema = createInsertSchema(optionsValues, {
  optionTypeID: z.uuid("El ID no es valido"),
  value: z
    .string()
    .min(1, "El valor es obligatorio")
    .max(100, "Maxiomo 100 caracteres"),
  label: z
    .string()
    .min(1, "La etiqueta es obligatoria")
    .max(150, "Maximo 150 caracteres"),
});

const baseAssignOptionSchema = createInsertSchema(productOptions, {
  productID: z.uuid("El ID no es valido"),
  optionTypeID: z.uuid("El ID no es valido"),
});

export const createOptionTypeSchema = baseOptionTypeSchema.omit({
  id: true,
  key: true,
});

export const updateOptionTypeSchema = baseOptionTypeSchema
  .omit({ id: true })
  .partial()
  .extend(idSchema.shape);

export const createOptionValueSchema = baseOptionValueSchema.omit({
  id: true,
});

export const assignOptionSchema = baseAssignOptionSchema.omit({
  id: true,
});
export const deassignOptionSchema = baseAssignOptionSchema.omit({
  id: true,
  isRequired: true,
  order: true,
});

export type CreateOptionTypeInput = z.infer<typeof createOptionTypeSchema>;
export type UpdateOptionTypeInput = Omit<
  z.infer<typeof updateOptionTypeSchema>,
  "id"
>;
export type CreateOptionValueInput = z.infer<typeof createOptionValueSchema>;
export type AssignOptionInput = z.infer<typeof assignOptionSchema>;
export type DeassignOptionInput = z.infer<typeof deassignOptionSchema>;
