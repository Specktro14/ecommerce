import { APIEvent } from "@solidjs/start/server";

import { auth } from "~/server/auth";

const handler = (event: APIEvent) => {
  return auth.handler(event.request);
};

export const GET = handler;
export const POST = handler;
