import { idSchema } from "~/lib/validators";
import { protectedProcedure, router } from "~/server/trpc/trpc";

import { ClientsService } from "./clientes.service";
import {
  createClientSchema,
  createDirectionSchema,
  updateClientSchema,
  updateDirectionSchema
} from "./clientes.validators";

export const ClientsRouter = router({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    return await ClientsService.getProfileByUserID({ id: ctx.session.userId });
  }),

  createProfile: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      return await ClientsService.createProfile(
        { id: ctx.session.userId },
        input,
      );
    }),

  updateProfile: protectedProcedure
    .input(updateClientSchema)
    .mutation(async ({ ctx, input }) => {
      return await ClientsService.updateProfile(
        { id: ctx.session.userId },
        input,
      );
    }),

  getDirectionByID: protectedProcedure
    .input(idSchema)
    .query(async ({ input }) => {
      return await ClientsService.getDirectionByID(input)
    }),
  
  createDirection: protectedProcedure
    .input(createDirectionSchema)
    .mutation(async ({ ctx, input }) => {
      return await ClientsService.createDirection(
        { id: ctx.session.userId },
        input,
      );
    }),

  updateDirection: protectedProcedure
    .input(updateDirectionSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const perfil = await ClientsService.getProfileByUserID({
        id: ctx.session.userId,
      });
      if (!perfil) throw new Error("Perfil no encontrado");
      return await ClientsService.updateDirection(
        { id: id },
        { id: perfil.id },
        data,
      );
    }),

  deleteDirection: protectedProcedure
    .input(idSchema)
    .mutation(async ({ input }) => {
      return await ClientsService.deleteDirection(input);
    }),

  setDefaultDirection: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      return await ClientsService.setDefaultDireccion(
        { id: ctx.session.userId },
        input,
      );
    }),

  requestCancellation: protectedProcedure.mutation(async ({ ctx }) => {
    return await ClientsService.requestAccountDelete({
      id: ctx.session.userId,
    });
  }),
});
