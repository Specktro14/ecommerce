import { idSchema, isActiveSchema } from "~/lib/validators";
import { adminProcedure, router } from "~/server/trpc/trpc";

import { OptionService } from "./opciones.service";
import {
  createOptionTypeSchema,
  updateOptionTypeSchema,
  createOptionValueSchema,
  assignOptionSchema,
  deassignOptionSchema,
} from "./opciones.validators";

export const OptionRouter = router({
  getAllTypes: adminProcedure.query(async () => {
    return await OptionService.getAllTypes();
  }),

  createType: adminProcedure
    .input(createOptionTypeSchema)
    .mutation(async ({ input }) => {
      return await OptionService.createType(input);
    }),

  updateType: adminProcedure
    .input(updateOptionTypeSchema)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await OptionService.updateType({ id: id }, data);
    }),

  changeVisibility: adminProcedure
    .input(isActiveSchema)
    .mutation(async ({ input }) => {
      return await OptionService.changeVisibility(input);
    }),

  createValue: adminProcedure
    .input(createOptionValueSchema)
    .mutation(async ({ input }) => {
      return await OptionService.createValue(input);
    }),

  deleteValue: adminProcedure.input(idSchema).mutation(async ({ input }) => {
    return await OptionService.deleteValue(input);
  }),

  assignOption: adminProcedure
    .input(assignOptionSchema)
    .mutation(async ({ input }) => {
      return await OptionService.assignOption(input);
    }),

  deassignOption: adminProcedure
    .input(deassignOptionSchema)
    .mutation(async ({ input }) => {
      return await OptionService.deassignOption(input);
    }),
});
