import { Hono } from "hono";
import { cors } from "hono/cors";
import { getBetterAuthInstance } from "./lib/auth";
import mainRouter from "./routes";
import type { BindingsType, User } from "./lib/types";
import { rateLimit } from "./middleware/rateLimiter.middleware";

const app = new Hono<{ Bindings: BindingsType; Variables: { user: User } }>();

app.use(
  "*",
  cors({
    origin: ["vault.shivam-karn.com.np"],
    allowMethods: ["GET", "POST", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.text("Welcome to SecureVault API !");
});
app.use("/api/*", rateLimit);

app.on(["GET", "POST"], "/api/auth/**", (c) => {
  const auth = getBetterAuthInstance(
    c.env.securevault_db,
    c.env.BETTER_AUTH_SECRET,
    c.env,
  );
  return auth.handler(c.req.raw);
});

app.route("/api", mainRouter);

export default app;
