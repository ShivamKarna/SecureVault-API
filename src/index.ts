import { Hono } from "hono";
import { getAuth } from "./lib/auth";

type Bindings = {
  password_manager_db: D1Database;
  BETTER_AUTH_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const auth = getAuth(c.env.password_manager_db, c.env.BETTER_AUTH_SECRET);
  return auth.handler(c.req.raw);
});

export default app;
