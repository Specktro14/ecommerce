import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { idSchema } from "~/lib/validators";

import { client, direction } from "./clientes.tables";

const baseClientSchema = createInsertSchema(client).extend({
  firstName: z
    .string()
    .max(100, "El nombre no puede tener mas de 100 caracteres"),
  lastName: z
    .string()
    .max(100, "Los apellidos no puede tener mas de 100 caracteres"),
  email: z.email("El email no es correcto"),
  phone: z
    .string()
    .max(
      15,
      "El numero de telefono más el prefijo no puede tener mas de 15 caracteres",
    ),
  direccionID: z.uuid("El ID de la direccion no es correcto"),
});

const baseDirectionSchema = createInsertSchema(direction).extend({
  clienteID: z.uuid("El ID del cliente no es correcto"),
  fullName: z
    .string()
    .max(200, "El nombre completo no puede tener mas de 100 caracteres"),
  phone: z
    .string()
    .max(
      15,
      "El numero de telefono más el prefijo no puede tener mas de 15 caracteres",
    ),
  streetAddress: z
    .string()
    .max(255, "La calle no puede tener mas de 255 caracteres"),
  streetNumber: z
    .string()
    .max(20, "El numero del domicilio no puede tener mas de 20 caracteres"),
  apartment: z
    .string()
    .max(
      50,
      "La descripcion del apartamento no puede tener mas de 50 caracteres",
    ),
  zipCode: z
    .string()
    .max(20, "El codigo postal no puede tener mas de 20 caracteres"),
  municipio: z
    .string()
    .max(100, "El nombre del municipio no puede tener mas de 100 caracteres"),
  provincia: z
    .string()
    .max(100, "El nombre de la provincia no puede tener mas de 100 caracteres"),
  pais: z
    .string()
    .max(100, "El nombre del pais no puede tener mas de 100 caracteres"),
});

export const createClientSchema = baseClientSchema.omit({
  id: true,
  userID: true,
  createdAt: true,
  updatedAt: true,
});

export const updateClientSchema = baseClientSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const createDirectionSchema = baseDirectionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDirectionSchema = baseDirectionSchema
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .extend(idSchema.shape);

export const emailSchema = z.object({
  email: z.string(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateDirectionInput = z.infer<typeof createDirectionSchema>;
export type UpdateClientInput = Omit<
  z.infer<typeof updateClientSchema>,
  "id"
>;
export type UpdateDirectionInput = Omit<
  z.infer<typeof updateDirectionSchema >,
  "id"
>;
export type EmailInput = z.infer<typeof emailSchema>;
