import { TRPCError } from "@trpc/server";
import { and, eq, asc, desc, gt, gte, inArray, lte, ne, or, sql } from "drizzle-orm";

import { IdInput } from "~/lib/validators";
import { db } from "~/server/db/index";
import { DBconn } from "~/server/db/types";
import {
  applySQLVisibilityFilter,
} from "~/server/utils/filters";

import { client } from "../clientes/clientes.tables";
import {
  order,
  orderState,
  orderProducts,
  orderEventsHistory,
  OrderInsert,
  EventLogInsert,
} from "./pedidos.tables";
import {
  UpdateOrderInput,
  UpdateOrderStateInput,
  ChangeOrderStateInput,
  AddOrderProductInput,
  UpdateOrderProductInput,
  FilterOrderInput,
} from "./pedidos.validators";

// Ignorar por completo
/*export const PedidosRepo = {
  // Private Procedure
  // Falta añadir los filtros de visibilidad, Pendientes, en reparto, etc
  async getAll(filters: FilterOrderInput ,conn: DBconn = db) {
    return await conn.query.order.findMany({
      with: {
        client: true,
        orderState: true,
      },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit
    });
  },

  async getById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.order.findFirst({
      where: (ord) => eq(ord.id, reference.id),
      with: {
        client: true,
        direction: true,
        orderState: true,
        orderProducts: true,
        eventHistory: true,
      },
    });
  },

  async getByClient(input: IdInput, conn: DBconn = db) {
    const clientData = await conn.query.client.findFirst({
      where: eq(client.id, input.id),
    });
    
    if (!clientData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cliente no encontrado",
      });
    }

    return await conn.query.order.findMany({
      where: (order) => eq(order.clientID, clientData.id),
      with: {
        client: true,
        orderState: true,
      },
      orderBy: (pedidos, { desc }) => [desc(pedidos.createdAt)],
    });
  },

  //No tocar, seguramente la borre
  // DELETE 
  async getPendientes(user: IdInput, conn: DBconn = db) {
    const cliente = await conn.query.clientes.findFirst({
      where: eq(clientes.userID, user.id),
    });
    if (!cliente) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Perfil de cliente no encontrado",
      });
    }

    const estadoPendiente = await conn.query.estadoPedido.findFirst({
      where: eq(estadoPedido.code, "PENDIENTE"),
    });
    if (!estadoPendiente) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Estado PENDIENTE no encontrado",
      });
    }

    return await conn.query.pedidos.findMany({
      where: (pedido) =>
        and(
          eq(pedidos.clienteID, cliente.id),
          eq(pedidos.estadoID, estadoPendiente.id),
          applySQLVisibilityFilter(pedidos),
        ),
      with: {
        cliente: true,
        direccion: true,
        estado: true,
        productos: {
          where: (producto) => applySQLVisibilityFilter(producto),
        },
      },
      orderBy: (pedidos, { desc }) => [desc(pedidos.createdAt)],
    });
  },

  async create(data: OrderInsert, conn: DBconn = db) {
    return await conn.insert(order).values(data).returning();
  },

  async update(
    reference: IdInput,
    data: UpdateOrderInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(order)
      .set(data)
      .where(eq(order.id, reference.id))
      .returning();
  },

  async actualizarEstado(
    reference: IdInput,
    data: { estadoID: string },
    conn: DBconn = db,
  ) {
    return await conn
      .update(pedidos)
      .set(data)
      .where(eq(pedidos.id, reference.id))
      .returning();
  },

  async getEstadoPendiente(conn: DBconn = db) {
    return await conn.query.estadoPedido.findFirst({
      where: eq(estadoPedido.code, "PENDIENTE"),
    });
  },

  //NO
  async getClienteByUserId(user: IdInput, conn: DBconn = db) {
    return await conn.query.clientes.findFirst({
      where: eq(clientes.userID, user.id),
      with: {
        direcciones: true,
      },
    });
  },
  async getDireccionById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.direccion.findFirst({
      where: eq(direccion.id, reference.id),
    });
  },
  async getVarianteProductoById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.variantesProductos.findFirst({
      where: (variante) =>
        and(
          eq(variantesProductos.id, reference.id),
          applySQLVisibilityFilter(variante),
        ),
    });
  },

  async agregarProductoPedido(
    data: AgregarProductoPedidoInput,
    conn: DBconn = db,
  ) {
    return await conn.insert(productosPedidos).values(data).returning();
  },

  async actualizarProductoPedido(
    reference: IdInput,
    data: ActualizarProductoPedidoInput,
    conn: DBconn = db,
  ) {
    return await conn
      .update(productosPedidos)
      .set(data)
      .where(eq(productosPedidos.id, reference.id))
      .returning();
  },

  async eliminarProductoPedido(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(productosPedidos)
      .where(eq(productosPedidos.id, reference.id))
      .returning();
  },

  async getProductoPedidoById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.productosPedidos.findFirst({
      where: eq(productosPedidos.id, reference.id),
      with: {
        variante: true,
      },
    });
  },

  //NO
  async getAllEstados(conn: DBconn = db) {
    return await conn.query.estadoPedido.findMany({
      orderBy: (estado, { asc }) => [asc(estado.order), asc(estado.name)],
    });
  },
  async getEstadoById(reference: IdInput, conn: DBconn = db) {
    return await conn.query.estadoPedido.findFirst({
      where: eq(estadoPedido.id, reference.id),
    });
  },
  async getAdminUserId(conn: DBconn = db) {
    const adminUser = await conn.query.user.findFirst({
      where: eq(user.role, "ADMIN"),
    });
    if (!adminUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No se encontró ningún usuario administrador",
      });
    }
    return adminUser;
  },
  async clearDefaults(reference: IdInput, conn: DBconn = db) {
    return await conn
      .update(direccion)
      .set({ isDefault: false })
      .where(eq(direccion.clienteID, reference.id))
      .returning();
  },

  async agregarEventoHistorial(data: any, conn: DBconn = db) {
    return await conn.insert(historialEventosPedidos).values(data).returning();
  },
};*/

export const OrdersRepo = {
  async getAll(filters: FilterOrderInput, conn: DBconn = db) {
    return await conn.query.order.findMany({
      columns: {
        orderCode: true,
        deliverDate: true,
      },
      with: {
        client: {
          columns: {
            firstName: true,
            lastName: true,
          },
        },
        orderState: {
          columns: {
            code: true,
            color: true,
          },
        },
      },
      orderBy: (order, { asc, desc }) => {
        switch (filters.sortBy) {
          case "delivery": { return [asc(order.deliverDate)] }
          case "newest": { return [desc(order.createdAt)] }
          default: { return [asc(order.deliverDate), desc(order.createdAt)] }
        }
      },
      limit: filters.limit,
      offset: (filters.page - 1) * filters.limit
    });
  },

  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(order)
      .where(eq(order.id, reference.id))
      .limit(1);
  },

  async getMyOrders(client: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(order)
      .where(eq(order.clientID, client.id))
  },

  async create(data: OrderInsert, conn: DBconn = db) {
    return await conn
      .insert(order)
      .values(data)
      .returning()
  },

  async update(reference: IdInput, data: UpdateOrderInput, conn: DBconn = db) {
    return await conn
      .update(order)
      .set(data)
      .where(eq(order.id, reference.id))
      .returning()
  },

  // REVISAR POSIBLE FUNCION DEL SERVICE
  async changeState(input: ChangeOrderStateInput, conn: DBconn = db) {
    return await conn
      .update(order)
      .set({ stateID: input.newStateID })
      .where(eq(order.id, input.orderID))
      .returning()
  },
  
  async delete(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(order)
      .where(eq(order.id, reference.id))
      .returning()
  },

  async logChangeState(data: EventLogInsert, conn: DBconn = db) {
    return await conn
      .insert(orderEventsHistory)
      .values(data)
      .returning()
  }
};

export const StateOrderRepo = {
  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(orderState)
      .where(eq(orderState.id, reference.id))
  },

  async getPendingID(conn: DBconn = db) {
    return await conn
      .select({ id: orderState.id })
      .from(orderState)
      .where(eq(orderState.code, "PENDIENTE"))
  },

  async update(reference: IdInput, data: UpdateOrderStateInput, conn: DBconn = db) {
    return await conn
      .update(orderState)
      .set(data)
      .where(eq(orderState.id, reference.id))
      .returning()
  }
}

export const OrderProductRepo = {
  async getByID(reference: IdInput, conn: DBconn = db) {
    return await conn
      .select()
      .from(orderProducts)
      .where(eq(orderProducts.id, reference.id))
      .limit(1)
  },
  
  async addProduct(data: AddOrderProductInput, conn: DBconn = db) {
    return await conn
      .insert(orderProducts)
      .values(data)
      .returning()
  },

  async updateProduct(reference: IdInput, data: UpdateOrderProductInput, conn: DBconn = db) {
    return await conn
      .update(orderProducts)
      .set(data)
      .where(eq(orderProducts.id, reference.id))
      .returning()
  },

  async deleteProduct(reference: IdInput, conn: DBconn = db) {
    return await conn
      .delete(orderProducts)
      .where(eq(orderProducts.id, reference.id))
      .returning()
  }
}