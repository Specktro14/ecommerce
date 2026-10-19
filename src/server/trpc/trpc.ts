import { initTRPC, TRPCError } from "@trpc/server";

import { requestStore } from "../utils/context-store";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create();
export const router = t.router;

const globalMiddleware = t.middleware(({ ctx, next }) => {
  const isAdmin = ctx.user?.role === "ADMIN";

  return requestStore.run({ isAdmin }, () => {
    return next({ ctx });
  });
});

export const publicProcedure = t.procedure.use(globalMiddleware);

export const protectedProcedure = t.procedure
  .use(globalMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || !ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Debes iniciar sesion para realizar esta accion",
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        session: ctx.session,
      },
    });
  })
  .use(({ ctx, next }) => {
    if (!ctx.user.isActive || ctx.user.setDeleteDate) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "La cuenta no esta activa"
      })
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
        session: ctx.session
    }})
  })

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No tienes permisos de administrador",
    });
  }

  return next({ ctx });
});
