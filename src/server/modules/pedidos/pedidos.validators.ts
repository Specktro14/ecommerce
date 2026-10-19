import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { idSchema } from "~/lib/validators";

import { order, orderProducts, orderState } from "./pedidos.tables";

const baseOrderSchema = createInsertSchema(order).extend({
  orderCode: z
    .string()
    .min(1, "El código del pedido es obligatorio")
    .max(50, "El código del pedido no puede tener más de 50 caracteres"),
  clientID: z.uuid("El ID del cliente no es válido"),
  directionID: z.uuid("El ID de la dirección no es válido"),
  stateID: z.uuid("El ID del estado no es válido"),
  subtotal: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "El subtotal debe ser un número válido",
    ),
  taxes: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "Los impuestos deben ser un número válido",
    )
    .default("0"),
  shipmentTaxes: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "Los costes de envío deben ser un número válido",
    )
    .default("0"),
  totalPrice: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "El precio total debe ser un número válido",
    ),
});

const baseOrderProductsSchema = createInsertSchema(orderProducts).extend({
  orderID: z.uuid("El ID del pedido no es válido"),
  productVariantID: z.uuid("El ID de la variante del producto no es válido"),
  quantity: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "La cantidad debe ser un número válido",
    ),
  unitPrice: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "El precio unitario debe ser un número válido",
    ),
  totalPrice: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)),
      "El precio total debe ser un número válido",
    ),
});

const baseOrderStateSchema = createInsertSchema(orderState).extend({
  name: z.string().max(100, "El nombre no puede tener más de 100 caracteres"),
  color: z.string().max(30, "El color no puede tener más de 30 caracteres"),
});

export const changeOrderStateSchema = z.object({
  orderID: z.uuid(),
  newStateID: z.uuid(),
  notes: z.string().optional(),
});

export const addOrderProductSchema = baseOrderProductsSchema.omit({
  id: true,
  createdAt: true,
});

export const updateOrderProductSchema = baseOrderProductsSchema
  .omit({
    createdAt: true,
  })
  .partial()
  .extend(idSchema.shape);

export const updateOrderStateSchema = baseOrderStateSchema
  .omit({
    id: true,
    order: true,
  })
  .partial()
  .extend(idSchema.shape);

export const createOrderSchema = baseOrderSchema
  .omit({
    id: true,
    orderCode: true,
    createdAt: true,
    updatedAt: true,
    completedAt: true,
    updatedBy: true,
  })
  .extend({
    products: z.array(
      addOrderProductSchema.omit({
        orderID: true,
        totalPrice: true,
        unitPrice: true,
      }),
    ),
  });

export const updateOrderSchema = baseOrderSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    completedAt: true,
    updatedBy: true,
  })
  .partial()
  .extend(idSchema.shape);

export const filterOrderSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(24),
  sortBy: z.enum(["newest", "delivery", "default"]).default("default"),
});

/* export const stateSchema = z
  .object({
    state: z.uuid("El ID del pedido no es válido"),
  })
  .extend(idSchema.shape); */

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = Omit<z.infer<typeof updateOrderSchema>, "id">;
export type ChangeOrderStateInput = z.infer<typeof changeOrderStateSchema>;
export type AddOrderProductInput = z.infer<typeof addOrderProductSchema>;
export type UpdateOrderProductInput = Omit<
  z.infer<typeof updateOrderProductSchema>,
  "id"
>;
export type UpdateOrderStateInput = Omit<
  z.infer<typeof updateOrderStateSchema>,
  "id"
>;
export type FilterOrderInput = z.infer<typeof filterOrderSchema>;
//export type StateInput = z.infer<typeof stateSchema>;

export type AddOrderProductInBetweenInput = Omit<
  Omit<AddOrderProductInput, "totalPrice">,
  "unitPrice"
  >;

export type AddOrderProductFrontendInput = Omit<AddOrderProductInBetweenInput, "orderID">
