import { Hono } from "hono";
import { cors } from "hono/cors";
import { getBetterAuthInstance } from "./lib/auth";
import mainRouter from "./routes";
import type { BindingsType, User } from "./lib/types";
import { rateLimit } from "./middleware/rateLimiter.middleware";

// swagger docs implementation
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

const app = new OpenAPIHono<{
  Bindings: BindingsType;
  Variables: { user: User };
}>();

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
  contact: "contact@shivam-karn.com.np",
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

app.doc("/docs/json", {
  openapi: "3.0.0",
  info: {
    title: "SecureVault API",
    version: "1.0",
    description: "Encrypted vault storage and session management.",
    contact: {
      email: "contact@shivam-karn.com.np",
    },
  },
  servers: [
    {
      url: "https://securevault.shivamkarn.workers.dev",
      description: "Production",
    },
    { url: "http://localhost:8787", description: "Local" },
  ],
});
app.get("/docs", swaggerUI({ url: "/docs/json" }));

export default app;
