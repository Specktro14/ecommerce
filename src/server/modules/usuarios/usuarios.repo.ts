import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { DBconn } from "~/server/db/types";

import { user } from "./usuarios.tables";

export const userRepo = {
  getAll(conn: DBconn = db) {
    return conn.select().from(user);
  },

  getByEmail(conn: DBconn = db, email: string) {
    return conn.select().from(user).where(eq(user.email, email));
  },

  getById(conn: DBconn = db, id: string) {
    return conn.select().from(user).where(eq(user.id, id));
  },

  getPasswordWithEmail(conn: DBconn = db, email: string) {
    return conn
      .select({ hashedPasswork: user.hashedPassword })
      .from(user)
      .where(eq(user.email, email));
  },

  create(conn: DBconn = db, data: userInsert) {
    return conn.insert(user).values(data).returning();
  },

  update(conn: DBconn = db, id: string, data: Partial<userInsert>) {
    return conn.update(user).set(data).where(eq(user.id, id)).returning();
  },

  delete(conn: DBconn = db, id: string) {
    return conn.delete(user).where(eq(user.id, id));
  },
};
