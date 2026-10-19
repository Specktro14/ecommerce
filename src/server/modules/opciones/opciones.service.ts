import { TRPCError } from "@trpc/server";

import { IdInput, IsActiveInput } from "~/lib/validators";
import { generateKey } from "~/lib/string.utils";

import { OptionRepo } from "./opciones.repo";
import {
  AssignOptionInput,
  CreateOptionTypeInput,
  CreateOptionValueInput,
  DeassignOptionInput,
  UpdateOptionTypeInput,
} from "./opciones.validators";

export const OptionService = {
  async getAllTypes() {
    return await OptionRepo.getAllTypes();
  },

  async createType(data: CreateOptionTypeInput) {
    const key = generateKey(data.name);
    const keyOcupied = await OptionRepo.existByCode({ key: key });
    if (keyOcupied) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe un tipo parecido. La key ${key} ya esta usada`,
      });
    }
    const result = await OptionRepo.createType({ ...data, key: key });
    return result[0];
  },

  async updateType(reference: IdInput, data: UpdateOptionTypeInput) {
    if (data.name) {
      const key = generateKey(data.name);
      const keyOcupied = await OptionRepo.existByCode({ key: key });
      if (keyOcupied) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Ya existe un atributo parecido. La key ${key} ya esta en uso`,
        });
      }

      data = {
        ...data,
        key: key,
      };
    }
    const result = await OptionRepo.updateType(reference, data);
    if (result.length === 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tipo no encontrado",
      });
    return result[0];
  },

  async changeVisibility(reference: IsActiveInput) {
    const result = await OptionRepo.changeVisibility(reference);
    if (result.length === 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tipo no encontrado",
      });
    return result[0];
  },

  async createValue(data: CreateOptionValueInput) {
    const result = await OptionRepo.createValue(data);
    return result[0];
  },

  async deleteValue(reference: IdInput) {
    const result = await OptionRepo.deleteValue(reference);
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tipo no encontrado",
      });
    }
    return result[0];
  },

  async assignOption(data: AssignOptionInput) {
    const result = await OptionRepo.assignOption(data);
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tipo no encontrado",
      });
    }
    return result[0];
  },

  async deassignOption(reference: DeassignOptionInput) {
    const result = await OptionRepo.deassignOption(reference);
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "No se puede desasignar: esta opcion no estaba asignada al producto",
      });
    }
    return result[0];
  },
};
