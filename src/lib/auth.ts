import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import type { BindingsType } from "./types";

const getBetterAuthInstance = (
  db: D1Database,
  authSecret: string,
  bindings: Pick<
    BindingsType,
    | "GOOGLE_CLIENT_ID"
    | "GOOGLE_CLIENT_SECRET"
    | "GITHUB_CLIENT_ID"
    | "GITHUB_CLIENT_SECRET"
    | "BETTER_AUTH_URL"
  >,
) => {
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
    baseURL: bindings.BETTER_AUTH_URL,
    trustedOrigins: [
      "http://localhost:8787",
      "http://localhost:5173",
      "https://securevault.shivamkarn.workers.dev",
      "https://vault.shivam-karn.com.np",
    ],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      google: {
        clientId: bindings.GOOGLE_CLIENT_ID,
        clientSecret: bindings.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: bindings.GITHUB_CLIENT_ID,
        clientSecret: bindings.GITHUB_CLIENT_SECRET,
      },
    },
  });
};

export { getBetterAuthInstance };
