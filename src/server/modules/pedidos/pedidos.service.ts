import { TRPCError } from "@trpc/server";

import { IdInput } from "~/lib/validators";
import { db } from "~/server/db/index";

import { OrdersRepo, OrderProductRepo, StateOrderRepo } from "./pedidos.repo";
import {
  FilterOrderInput,
  CreateOrderInput,
  AddOrderProductFrontendInput,
  AddOrderProductInBetweenInput,
  UpdateOrderInput,
  UpdateOrderProductInput,
  ChangeOrderStateInput
} from "./pedidos.validators";
import { ClientsService } from "../clientes/clientes.service";
import { ProductService } from "../productos/productos.service";
import { generateOrderCode } from "~/lib/string.utils";
import { DBconn } from "~/server/db/types";
import { calculateItemTotal, parsePrice, formatPrice, addPrices } from "~/lib/price.utils";

/*export const PedidosService = {
  async getPedidoById(reference: IdInput) {
    const pedido = await PedidosRepo.getById(reference);
    if (!pedido) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Pedido no encontrado",
      });
    }
    return pedido;
  },

  async getAllPedidos(user: IdInput) {
    return await PedidosRepo.getAll(user);
  },

  async getPedidosByCliente(user: IdInput, cliente: IdInput) {
    return await PedidosRepo.getByCliente(user, cliente);
  },

  async getPedidosPendientes(user: IdInput) {
    return await PedidosRepo.getPendientes(user);
  },

  async crearPedido(user: IdInput, data: CrearPedidoInput) {
    // Verificar que el cliente existe
    const cliente = await PedidosRepo.getClienteByUserId(user);
    if (!cliente) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Perfil de cliente no encontrado",
      });
    }

    // Verificar que la dirección existe y pertenece al cliente
    const direccion = await PedidosRepo.getDireccionById(data.direccionID);
    if (!direccion || direccion.clienteID !== cliente.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Dirección no válida o no pertenece al cliente",
      });
    }

    // Calcular totales
    const { subtotal, impuestos, costesEnvio } = data;
    const precioTotal = subtotal + impuestos + costesEnvio;

    return await db.transaction(async (tx) => {
      // Crear el pedido
      const nuevoPedido = await PedidosRepo.crear(
        {
          ...data,
          precioTotal,
          clienteID: cliente.id,
          estadoID: data.estadoID || (await PedidosRepo.getEstadoPendiente()).id,
        },
        tx,
      );

      // Agregar productos al pedido
      for (const item of data.productos) {
        await PedidosService.agregarProductoATransaccion(
          tx,
          nuevoPedido[0].id,
          item,
        );
      }

      return nuevoPedido[0];
    });
  },

  async actualizarPedido(user: IdInput, reference: IdInput, data: ActualizarPedidoInput) {
    const pedido = await this.getPedidoById(reference);

    // Verificar que el pedido pertenece al usuario
    if (pedido.clienteID !== (await PedidosRepo.getClienteByUserId(user)).id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar este pedido",
      });
    }

    // Solo permitir actualizar si el pedido está en estado PENDIENTE
    if (pedido.estadoID !== (await PedidosRepo.getEstadoPendiente()).id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puede modificar un pedido que ya está en proceso",
      });
    }

    const { id, ...updateData } = data;
    const pedidoActualizado = await PedidosRepo.actualizar(reference, updateData);
    return pedidoActualizado[0];
  },

  async cambiarEstadoPedido(user: IdInput, data: CambiarEstadoPedidoInput) {
    const pedido = await this.getPedidoById(data.pedidoID);

    // Verificar que el usuario es administrador
    if (user.id !== (await PedidosRepo.getAdminUserId()).id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Solo los administradores pueden cambiar el estado de los pedidos",
      });
    }

    return await db.transaction(async (tx) => {
      // Actualizar estado del pedido
      const pedidoActualizado = await PedidosRepo.actualizarEstado(
        { id: data.pedidoID },
        { estadoID: data.nuevoEstadoID },
        tx,
      );

      // Agregar evento al historial
      await PedidosRepo.agregarEventoHistorial(
        {
          pedidoID: data.pedidoID,
          fromStatusID: pedido.estadoID,
          toStatusID: data.nuevoEstadoID,
          notas: data.notas,
          createdBy: user.id,
        },
        tx,
      );

      return pedidoActualizado[0];
    });
  },

  async agregarProductoPedido(user: IdInput, data: AgregarProductoPedidoInput) {
    const pedido = await this.getPedidoById(data.pedidoID);

    // Verificar que el pedido pertenece al usuario
    if (pedido.clienteID !== (await PedidosRepo.getClienteByUserId(user)).id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para agregar productos a este pedido",
      });
    }

    // Verificar que el pedido está en estado PENDIENTE
    if (pedido.estadoID !== (await PedidosRepo.getEstadoPendiente()).id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puede agregar productos a un pedido que ya está en proceso",
      });
    }

    return await PedidosService.agregarProductoATransaccion(
      db,
      data.pedidoID,
      data,
    );
  },

  async actualizarProductoPedido(user: IdInput, reference: IdInput, data: ActualizarProductoPedidoInput) {
    const productoPedido = await PedidosRepo.getProductoPedidoById(reference);
    const pedido = await this.getPedidoById(productoPedido.pedidoID);

    // Verificar que el pedido pertenece al usuario
    if (pedido.clienteID !== (await PedidosRepo.getClienteByUserId(user)).id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar este producto del pedido",
      });
    }

    // Verificar que el pedido está en estado PENDIENTE
    if (pedido.estadoID !== (await PedidosRepo.getEstadoPendiente()).id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puede modificar productos de un pedido que ya está en proceso",
      });
    }

    const { id, ...updateData } = data;
    const productoPedidoActualizado = await PedidosRepo.actualizarProductoPedido(
      reference,
      updateData,
    );
    return productoPedidoActualizado[0];
  },

  async eliminarProductoPedido(user: IdInput, reference: IdInput) {
    const productoPedido = await PedidosRepo.getProductoPedidoById(reference);
    const pedido = await this.getPedidoById(productoPedido.pedidoID);

    // Verificar que el pedido pertenece al usuario
    if (pedido.clienteID !== (await PedidosRepo.getClienteByUserId(user)).id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para eliminar este producto del pedido",
      });
    }

    // Verificar que el pedido está en estado PENDIENTE
    if (pedido.estadoID !== (await PedidosRepo.getEstadoPendiente()).id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puede eliminar productos de un pedido que ya está en proceso",
      });
    }

    return await PedidosRepo.eliminarProductoPedido(reference);
  },

  async getAllEstadosPedido() {
    return await PedidosRepo.getAllEstados();
  },

  async getEstadoPedidoById(reference: IdInput) {
    const estado = await PedidosRepo.getEstadoById(reference);
    if (!estado) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Estado de pedido no encontrado",
      });
    }
    return estado;
  },

  async agregarProductoATransaccion(
    tx: any,
    pedidoID: string,
    data: AgregarProductoPedidoInput,
  ) {
    // Verificar que la variante del producto existe
    const variante = await PedidosRepo.getVarianteProductoById(data.varianteProductoID);
    if (!variante) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Variante del producto no encontrada",
      });
    }

    // Calcular precio total
    const precioTotal = parseFloat(data.cantidad) * parseFloat(variante.pricePerUnit);

    return await PedidosRepo.agregarProductoPedido(
      {
        pedidoID,
        varianteProductoID: data.varianteProductoID,
        cantidad: data.cantidad,
        unidadCantidad: data.unidadCantidad,
        opcionesSeleccionadas: data.opcionesSeleccionadas,
        precioUnidad: variante.pricePerUnit,
        precioTotal: precioTotal.toString(),
      },
      tx,
    );
  },
};*/

export const OrdersService = {
  async getAllOrders(filters: FilterOrderInput) {
    return await OrdersRepo.getAll(filters);
  },

  async getOrderByID(reference: IdInput) {
    const order = await OrdersRepo.getByID(reference);
    if (!order) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe el pedido"
      })
    }
    return order
  },

  async getMyOrders(client: IdInput) {
    return await OrdersRepo.getMyOrders(client);
  },

  async createOrder(user: IdInput, input: CreateOrderInput) {
    const client = await ClientsService.getProfileByUserID(user);

    const direction = await ClientsService.getDirectionByID({ id: input.directionID });
    if (direction.clientID !== client.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Dirección no pertenece al cliente",
      });
    }

    const orderCode = generateOrderCode();
    const { products } = input;

    return await db.transaction(async (tx) => {
      const order = await OrdersRepo.create({ orderCode, ...input }, tx);

      let subtotal = 0;
      for (const item of products) {
        const itemTotalPrice = await this.addProductToOrderTx({ orderID: order[0].id, ...item }, tx);
        subtotal += itemTotalPrice;
      }

      await OrdersRepo.update({ id: order[0].id }, { totalPrice: formatPrice(subtotal) }, tx);

      return order[0]
    })

  },

  async updateOrder(user: IdInput, reference: IdInput, data: UpdateOrderInput) {
    const client = await ClientsService.getProfileByUserID(user);
    const order = await this.getOrderByID(reference);

    if (client.id !== order[0].clientID) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar este pedido"
      })
    }
    if (order[0].stateID !== (await StateOrderRepo.getPendingID())[0].id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puedo modificar un pedido que ya esta en proceso"
      })
    }

    const updated = await OrdersRepo.update(reference, data);
    return updated[0];
  },

  async updateOrderState(staff: IdInput, data: ChangeOrderStateInput) {
    const order = await this.getOrderByID({ id: data.orderID });

    return await db.transaction(async (tx) => {
      await OrdersRepo.logChangeState({
        orderID: data.orderID,
        fromStatusID: order[0].stateID,
        toStatusID: data.newStateID,
        notes: data.notes,
        createdBy: staff.id
      }, tx)

      const updated = await OrdersRepo.changeState(data, tx);
      return updated[0]
    })
  },

  async addProductToOrder(user: IdInput, reference: IdInput, data: AddOrderProductFrontendInput) {
    const client = await ClientsService.getProfileByUserID(user);
    const order = await this.getOrderByID(reference);

    if (client.id !== order[0].clientID) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar este pedido"
      })
    }
    if (order[0].stateID !== (await StateOrderRepo.getPendingID())[0].id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puedo modificar un pedido que ya esta en proceso"
      })
    }

    return await db.transaction(async (tx) => {
      const newPrice = await OrdersService.addProductToOrderTx({ orderID: order[0].id, ...data }, tx);
      return await OrdersRepo.update(reference, { totalPrice: formatPrice(addPrices(parsePrice(order[0].totalPrice), newPrice))}, tx);
    })
  },

  async updateOrderProduct(user: IdInput, reference: IdInput, data: UpdateOrderProductInput) {
    const client = await ClientsService.getProfileByUserID(user);
    const product = await OrderProductRepo.getByID(reference);
    const order = await this.getOrderByID({ id: product[0].orderID })

    if (client.id !== order[0].clientID) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar este pedido"
      })
    }
    if (order[0].stateID !== (await StateOrderRepo.getPendingID())[0].id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puedo modificar un pedido que ya esta en proceso"
      })
    }
    
    const updated = await OrderProductRepo.updateProduct(reference, data);
    return updated[0]
  },

  async deleteOrderProduct(user: IdInput, reference: IdInput) {
    const client = await ClientsService.getProfileByUserID(user);
    const order = await this.getOrderByID(reference);
    
    if (client.id !== order[0].clientID) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No tienes permiso para modificar este pedido"
      })
    }
    if (order[0].stateID !== (await StateOrderRepo.getPendingID())[0].id) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "No se puedo modificar un pedido que ya esta en proceso"
      })
    }

    return await OrdersRepo.delete(reference);
  },

  async addProductToOrderTx(data: AddOrderProductInBetweenInput, tx?: DBconn) {
    const product = await ProductService.getVariantByID({ id: data.productVariantID });

    // TODO: Arreglar los ??
    const total = calculateItemTotal({
      quantity: parsePrice(data.quantity),
      options: data.selectedOptions ?? {},
      salesTypes: product.salesType,
      pricePerKg: parsePrice(product.pricePerKG ?? "0"),
      pricePerUnit: parsePrice(product.pricePerUnit ?? "0"),
      estimatedUnitWeight: product.estimatedUnitWeight
    });

    await OrderProductRepo.addProduct({
      totalPrice: formatPrice(total),
      orderID: data.orderID,
      productVariantID: data.productVariantID,
      quantity: data.quantity,
      unitPrice: product.pricePerKG ? product.pricePerKG : product.pricePerUnit ?? "0",
      quantityUnit: data.quantityUnit,
      selectedOptions: data.selectedOptions,
    }, tx);

    return total;
  },
}
