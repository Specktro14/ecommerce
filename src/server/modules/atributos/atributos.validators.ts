import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { idSchema } from "~/lib/validators";

import { atribute, atributesProduct, atributeType } from "./atributos.tables";

const atributeTypeSchema = z.enum(atributeType.enumValues, {
  error:
    "Tipo de atributo no válido. Debe ser ALERGENO, CERTIFICACION, CARACTERISTICA",
});

export const baseAtributeSchema = createInsertSchema(atribute).extend({
  name: z
    .string()
    .min(2, "El nombre tiene que tener al menos 2 caracteres")
    .max(100, "El nombre no puede tener mas de 100 caracteres"),
  type: atributeTypeSchema,
  icon: z
    .url("Debe ser una URL valida")
    .max(255, "El enlace al icono no puede tener mas de 255 caracteres"),
  description: z.string().optional(),
  color: z.string().max(30, "El color en oklch solo puede tener 30 caracteres"),
  priority: z.int().min(0, "La prioridad maxima es 0"),
});

// Schemas Creacion
export const createAtributeSchema = baseAtributeSchema.omit({
  id: true,
  key: true,
  priority: true,
  isActive: true,
  updatedAt: true,
  createdAt: true,
});

export const assignAtributesSchema = createInsertSchema(atributesProduct)
  .extend({
    productID: z.uuid("El ID del producto no es valido"),
    atributeID: z.uuid("El ID del atributo no es valido"),
  })
  .omit({
    id: true,
  });

export const sincronizeAtributesSchema = z.object({
  productID: z.uuid("El ID del producto no es valido"),
  atributeIDs: z.array(z.uuid("El ID del atributo no es valido")),
});

// Schemas Actualizacion
export const updateAtributeSchema = baseAtributeSchema
  .omit({
    updatedAt: true,
    createdAt: true,
  })
  .partial()
  .extend(idSchema.shape);

// Schemas Borrado
export const deassignAtributeSchema = z.object({
  productID: z.uuid("El ID del producto no es valido"),
  atributeID: z.uuid("El ID del atributo no es valido"),
});

// Exportacion de tipos
export type CreateAtributeInput = z.infer<typeof createAtributeSchema>;
export type UpdateAtributeInput = Omit<
  z.infer<typeof updateAtributeSchema>,
  "id"
>;

export type AssignAtributeInput = z.infer<typeof assignAtributesSchema>;
export type DeassignAtributeInput = z.infer<typeof deassignAtributeSchema>;
export type SincronizeAtributesInput = z.infer<
  typeof sincronizeAtributesSchema
>;
