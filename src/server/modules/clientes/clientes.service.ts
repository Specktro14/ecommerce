import { Temporal } from "@js-temporal/polyfill";
import { TRPCError } from "@trpc/server";

import { IdInput } from "~/lib/validators";
import { db } from "~/server/db/index";

import { AuthUserRepo, ClientsRepo, DirectionRepo } from "./clientes.repo";
import {
  CreateClientInput,
  CreateDirectionInput,
  UpdateClientInput,
  UpdateDirectionInput
} from "./clientes.validators";

export const ClientsService = {
  async getProfileByUserID(reference: IdInput) {
    const user = await ClientsRepo.getByUserID(reference);
    if (!user) {
      throw new TRPCError ({
        code: "NOT_FOUND",
        message: "No existe este cliente"
      })
    }
    return user;
  },

  async createProfile(reference: IdInput, data: CreateClientInput) {
    const exist = await ClientsRepo.getByUserID(reference);
    if (exist) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe este perfil",
      });
    }

    const result = await ClientsRepo.create({
      userID: reference.id,
      ...data,
    });
    return result[0];
  },

  async updateProfile(reference: IdInput, data: UpdateClientInput) {
    const profile = await this.getProfileByUserID(reference);
    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El perfil no existe",
      });
    }
    const result = await ClientsRepo.update({ id: profile.id }, data);
    return result[0];
  },

  async getDirectionByID(reference: IdInput) {
    const result = await DirectionRepo.getByID(reference);
    const direction = result[0];
    if (!direction) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No existe esta dirección"
      })
    }
    
    return direction;
  },

  async createDirection(reference: IdInput, data: CreateDirectionInput) {
    const profile = await this.getProfileByUserID(reference);
    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Crea tu perfil antes de añadir direcciones",
      });
    }

    return await db.transaction(async (tx) => {
      if (data.isDefault) {
        await DirectionRepo.clearDefaults({ id: profile.id }, tx);
      }

      const result = await DirectionRepo.create(
        {
          ...data,
          clientID: reference.id,
        },
        tx,
      );

      return result[0];
    });
  },

  async updateDirection(
    user: IdInput,
    direction: IdInput,
    data: UpdateDirectionInput,
  ) {
    return await db.transaction(async (tx) => {
      if (data.isDefault) {
        await DirectionRepo.clearDefaults(user, tx);
      }

      const result = await DirectionRepo.update(direction, data, tx);
      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Direccion no encontrado",
        });
      }

      return result[0];
    });
  },

  async deleteDirection(reference: IdInput) {
    const result = await DirectionRepo.delete(reference);
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Direccion no encontrada",
      });
    }
    return result[0];
  },

  async setDefaultDireccion(user: IdInput, direction: IdInput) {
    const profile = await this.getProfileByUserID(user);
    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Perfil no encontrado",
      });
    }

    return await db.transaction(async (tx) => {
      await DirectionRepo.clearDefaults(user, tx);
      const result = await DirectionRepo.update(
        direction,
        { isDefault: true },
        tx,
      );
      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Direccion no encontrado",
        });
      }
      return result[0];
    });
  },

  async requestAccountDelete(reference: IdInput) {
    const now = Temporal.Now.zonedDateTimeISO("UTC");
    const limitDate = now.add({ days: 30 });
    await AuthUserRepo.programmedDelete(reference, limitDate);
    return { mensaje: "Tu cuenta se eliminará definitivamente en 30 dias" };
  },
};
