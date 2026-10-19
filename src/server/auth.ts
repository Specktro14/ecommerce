import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { db } from "./db/index";
import * as authSchema from "./modules/usuarios/usuarios.tables";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: authSchema,
  }),
  
  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
      setDeleteDate: {
        type: "date",
        required: false,
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
      },
    },
  },

  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          const user = await db.query.user.findFirst({
            where: eq(authSchema.user.id, session.userId),
          });

          if (user?.setDeleteDate) {
            await db
              .update(authSchema.user)
              .set({ setDeleteDate: null })
              .where(eq(authSchema.user.id, session.userId));
          }
        },
      },
    },
  },
});
