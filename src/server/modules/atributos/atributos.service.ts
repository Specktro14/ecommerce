import { TRPCError } from "@trpc/server";

import { generateKey } from "~/lib/string.utils";
import { IdInput, KeyInput, IsActiveInput } from "~/lib/validators";

import { AtributesProductRepo, AtributesRepo } from "./atributos.repo";
import { AtributeInsert } from "./atributos.tables";
import {
  CreateAtributeInput,
  UpdateAtributeInput,
  AssignAtributeInput,
  DeassignAtributeInput,
  SincronizeAtributesInput,
} from "./atributos.validators";

export const AtributesService = {
  async getAll() {
    return await AtributesRepo.getAll();
  },

  async getById(reference: IdInput) {
    const result = await AtributesRepo.getByID(reference);
    const atribute = result[0];
    if (!atribute) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Atributo no encontrado",
      });
    }
    return atribute;
  },

  async getByKey(reference: KeyInput) {
    const result = await AtributesRepo.getByKey(reference);
    const atribute = result[0];
    if (!atribute) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Atributo no encontrado",
      });
    }
    return atribute;
  },

  async create(input: CreateAtributeInput) {
    const key: string = generateKey(input.name);
    const keyOcupied = await AtributesRepo.existByCode({ key: key });
    if (keyOcupied) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe un atributo parecido. La key ${key} ya esta en uso`,
      });
    }

    const data: AtributeInsert = {
      ...input,
      key: key,
    };
    const result = await AtributesRepo.create(data);
    return result[0];
  },

  async update(reference: IdInput, data: UpdateAtributeInput) {
    await this.getById(reference);

    if (data.name) {
      const key: string = generateKey(data.name);
      const keyOcupied = await AtributesRepo.existByCode({ key: key });
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

    const result = await AtributesRepo.update(reference, data);
    return result[0];
  },

  async changeVisibility(data: IsActiveInput) {
    await this.getById({ id: data.id });
    const result = await AtributesRepo.changeVisibility(data);
    return result[0];
  },

  async delete(reference: IdInput) {
    await this.getById(reference);
    //Posible restriccion para no borrar si se esta usando
    const result = await AtributesRepo.delete(reference);
    return result[0];
  },

  //Relacion Atributos-Producto
  async getAllRelations() {
    return await AtributesProductRepo.getAll();
  },

  async getByProductID(reference: IdInput) {
    const result = await AtributesProductRepo.getByProductID(reference);
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Este producto no tiene atributos asignados",
      });
    }
    return result;
  },

  async assignOption(data: AssignAtributeInput) {
    const result = await AtributesProductRepo.assignOption(data);
    if (result.length === 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ese atributo ya ha sido asignado al producto",
      });
    }
    return result[0];
  },

  async bulkAssign(data: SincronizeAtributesInput) {
    const result = await AtributesProductRepo.bulkAssign(data);
    if (result.length === 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Estos atributos ya ha sido asignado al producto",
      });
    }
    return result;
  },

  async removeOption(reference: DeassignAtributeInput) {
    const result = await AtributesProductRepo.removeOption(reference);
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message:
          "No se puede desasignar: este atributo no estaba asignado al producto",
      });
    }
    return result[0];
  },

  async removeAllOptions(reference: IdInput) {
    await this.getByProductID(reference);
    const result = await AtributesProductRepo.removeAllFromProduct(reference);
    return result;
  },
};
