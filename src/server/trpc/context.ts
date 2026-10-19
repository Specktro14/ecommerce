import { APIEvent } from "@solidjs/start/server";

import { auth } from "~/server/auth";
import { db } from "~/server/db/index";

export async function createContext(event: APIEvent) {
  const sessionData = await auth.api.getSession({
    headers: event.request.headers,
  });

  return {
    db,
    req: event.request,
    user: sessionData?.user || null,
    session: sessionData?.session || null,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
