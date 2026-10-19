import { idSchema, keySchema } from "~/lib/validators";
import { isActiveSchema } from "~/lib/validators";
import { router, publicProcedure, adminProcedure } from "~/server/trpc/trpc";

import { AtributesService } from "./atributos.service";
import {
  createAtributeSchema,
  updateAtributeSchema,
  assignAtributesSchema,
  deassignAtributeSchema,
  sincronizeAtributesSchema,
} from "./atributos.validators";

export const AtributesRouter = router({
  getAll: publicProcedure.query(async () => {
    return await AtributesService.getAll();
  }),

  getByID: publicProcedure.input(idSchema).query(async ({ input }) => {
    return await AtributesService.getById(input);
  }),

  getByKey: publicProcedure.input(keySchema).query(async ({ input }) => {
    return await AtributesService.getByKey(input);
  }),

  create: adminProcedure
    .input(createAtributeSchema)
    .mutation(async ({ input }) => {
      return await AtributesService.create(input);
    }),

  update: adminProcedure
    .input(updateAtributeSchema)
    .mutation(async ({ input }) => {
      const { id, ...datos } = input;
      return await AtributesService.update({ id: id }, datos);
    }),

  changeVisibility: adminProcedure
    .input(isActiveSchema)
    .mutation(async ({ input }) => {
      return await AtributesService.changeVisibility(input);
    }),

  delete: adminProcedure.input(idSchema).mutation(async ({ input }) => {
    return await AtributesService.delete(input);
  }),

  getAllRelations: adminProcedure.query(async () => {
    return await AtributesService.getAllRelations();
  }),

  getByProductoID: adminProcedure.input(idSchema).query(async ({ input }) => {
    return await AtributesService.getByProductID(input);
  }),

  assignOption: adminProcedure
    .input(assignAtributesSchema)
    .mutation(async ({ input }) => {
      return await AtributesService.assignOption(input);
    }),

  bulkAssign: adminProcedure
    .input(sincronizeAtributesSchema)
    .mutation(async ({ input }) => {
      return await AtributesService.bulkAssign(input);
    }),

  removeOption: adminProcedure
    .input(deassignAtributeSchema)
    .mutation(async ({ input }) => {
      return await AtributesService.removeOption(input);
    }),

  removeAllOptions: adminProcedure
    .input(idSchema)
    .mutation(async ({ input }) => {
      return await AtributesService.removeAllOptions(input);
    }),
});
