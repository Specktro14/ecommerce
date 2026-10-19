import { AsyncLocalStorage } from "node:async_hooks";

type GlobalStore = {
  isAdmin: boolean;
};

export const requestStore = new AsyncLocalStorage<GlobalStore>();
