import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

export const getAuth = (db: D1Database, authSecret: string) => {
  const drizzleDb = drizzle(db);

  return betterAuth({
    database: drizzleAdapter(drizzleDb, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: authSecret,
    baseURL: "http://localhost:8787",
    trustedOrigins: ["http://localhost:8787", "http://localhost:5173"],
    emailAndPassword: {
      enabled: true,
    },
  });
};
