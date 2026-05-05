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

const startTime = Date.now();
const serviceInfo = {
  name: "SecureVault API",
  description: "Encrypted vault storage and session management.",
  contact: "support@shivam-karn.com.np",
};

app.get("/", (c) => {
  const upTime = Date.now() - startTime;

  return c.json({
    status: "ok",
    service: serviceInfo,
    apiBase: "/api",
    health: "/health",
    uptime: format(upTime),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  const upTime = Date.now() - startTime;

  return c.json({
    status: "ok",
    uptime: format(upTime),
    timestamp: new Date().toISOString(),
    note: "instance uptime (resets on cold start)",
  });
});
function format(ms: number) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60));

  return `${h}h ${m}m ${s}s`;
}
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
