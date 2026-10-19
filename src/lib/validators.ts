import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

export const idSchema = z.object({
  id: z.uuid("El ID proporcionado no es valido"),
});

export const slugSchema = z.object({
  slug: z.string("El slug proporcionado no es valido"),
});

export const keySchema = z.object({
  key: z.string("La key proporcionada no es valida"),
});

export const skuSchema = z.object({
  sku: z.string("El sku proporcionado no es valido"),
});

export const isActiveSchema = z
  .object({
    isActive: z.boolean(),
  })
  .extend(idSchema.shape);

export const paginacionSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const temporalDateSchema = z.iso
  .datetime({ error: "Formato de fecha invalido. Usa ISO 8601" })
  .transform((str) => Temporal.Instant.from(str).toZonedDateTimeISO("UTC"));

export const rangoFechasSchema = z.object({
  fechaInicio: temporalDateSchema.optional(),
  fechaFinal: temporalDateSchema.optional(),
});

export const hardDeleteSchema = z.enum([
  "restrict",
  "cascade",
  "transfer",
  "selection"
])

export const deleteSchema = z.object({
  mode: hardDeleteSchema,
  targetID: z.uuid("El ID proporcionado no es valido").optional(),
  selectedIDs: z.array(z.uuid("El ID proporcionado no es valido")).optional()
}).extend(idSchema.shape)

export type IdInput = z.infer<typeof idSchema>;
export type SlugInput = z.infer<typeof slugSchema>;
export type KeyInput = z.infer<typeof keySchema>;
export type SkuInput = z.infer<typeof skuSchema>;
export type IsActiveInput = z.infer<typeof isActiveSchema>;
export type PaginationInput = z.infer<typeof paginacionSchema>;
export type RangoFechasInput = z.infer<typeof rangoFechasSchema>;
export type HardDeleteMode = z.infer<typeof hardDeleteSchema>;
export type DeleteInput = Omit<z.infer<typeof deleteSchema>, "id">

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
}
