import { idSchema } from "~/lib/validators";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "~/server/trpc/trpc";

import { PedidosService } from "./pedidos.service";
import {
  crearPedidoSchema,
  actualizarPedidoSchema,
  cambiarEstadoPedidoSchema,
  agregarProductoPedidoSchema,
  actualizarProductoPedidoSchema,
} from "./pedidos.validators";

export const PedidosRouter = router({
  // ==========================================
  // 🛒 RUTAS PÚBLICAS (Para clientes)
  // ==========================================

  getPedidoById: publicProcedure.input(idSchema).query(async ({ input }) => {
    return await PedidosService.getPedidoById(input);
  }),

  // ==========================================
  // 📋 RUTAS DE CLIENTES (Protegidas)
  // ==========================================

  crearPedido: protectedProcedure
    .input(crearPedidoSchema)
    .mutation(async ({ ctx, input }) => {
      return await PedidosService.crearPedido(
        { id: ctx.session.userId },
        input,
      );
    }),

  actualizarPedido: protectedProcedure
    .input(actualizarPedidoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await PedidosService.actualizarPedido(
        { id: ctx.session.userId },
        { id, ...data },
      );
    }),

  cambiarEstadoPedido: protectedProcedure
    .input(cambiarEstadoPedidoSchema)
    .mutation(async ({ ctx, input }) => {
      return await PedidosService.cambiarEstadoPedido(
        { id: ctx.session.userId },
        input,
      );
    }),

  // ==========================================
  // 🍽️ RUTAS DE PRODUCTOS EN PEDIDOS
  // ==========================================

  agregarProductoPedido: protectedProcedure
    .input(agregarProductoPedidoSchema)
    .mutation(async ({ ctx, input }) => {
      return await PedidosService.agregarProductoPedido(
        { id: ctx.session.userId },
        input,
      );
    }),

  actualizarProductoPedido: protectedProcedure
    .input(actualizarProductoPedidoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await PedidosService.actualizarProductoPedido(
        { id: ctx.session.userId },
        { id, ...data },
      );
    }),

  eliminarProductoPedido: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      return await PedidosService.eliminarProductoPedido(
        { id: ctx.session.userId },
        input,
      );
    }),

  // ==========================================
  // 📊 RUTAS DE ADMINISTRACIÓN (Protegidas)
  // ==========================================

  getAllPedidos: protectedProcedure.query(async ({ ctx }) => {
    return await PedidosService.getAllPedidos({ id: ctx.session.userId });
  }),

  getPedidosByCliente: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      return await PedidosService.getPedidosByCliente(
        { id: ctx.session.userId },
        input,
      );
    }),

  getPedidosPendientes: protectedProcedure.query(async ({ ctx }) => {
    return await PedidosService.getPedidosPendientes({
      id: ctx.session.userId,
    });
  }),

  // ==========================================
  // ⚡ RUTAS DE ESTADO (Protegidas)
  // ==========================================

  getAllEstadosPedido: publicProcedure.query(async () => {
    return await PedidosService.getAllEstadosPedido();
  }),

  getEstadoPedidoById: publicProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await PedidosService.getEstadoPedidoById(input);
    }),
});

export const OrdersRouter = router({
  
})
