import { createAuthClient } from "better-auth/solid";

type Role = "ADMIN" | "MANAGER" | "USER";

export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL,
  user: {
    addicionalFields: {
      role: {
        type: "string",
      } as const,
      fechaBorradoProgramado: {
        type: "date",
      },
      isActive: {
        type: "boolean",
      },
    },
  },
});
