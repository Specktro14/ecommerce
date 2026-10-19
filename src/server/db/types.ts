import { db } from "./index";

type DB = typeof db;
type TX = Parameters<Parameters<DB["transaction"]>[0]>[0];

export type DBconn = DB | TX;
