import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(drizzle({} as D1Database), {
    provider: "sqlite",
  }),
  secret: "temp",
  emailAndPassword: {
    enabled: true,
  },
});
