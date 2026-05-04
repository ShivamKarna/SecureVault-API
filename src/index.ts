import { Hono } from "hono";
import { getBetterAuthInstance } from "./lib/auth";
import mainRouter from "./routes";
import type { BindingsType } from "./lib/types";

const app = new Hono<{ Bindings: BindingsType }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const auth = getBetterAuthInstance(
    c.env.securevault_db,
    c.env.BETTER_AUTH_SECRET,
  );
  return auth.handler(c.req.raw);
});

app.route("/api", mainRouter);

export default app;
