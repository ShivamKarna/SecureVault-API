import { createMiddleware } from "hono/factory";
import { BindingsType } from "../lib/types";
import { unknown } from "zod";

type rateLimitBindingType = Pick<BindingsType, "RATE_LIMIT">;

const LIMIT = 30; // 30 requests each 60 seconds;
const WINDOW = 60;

const rateLimit = createMiddleware<{ Bindings: rateLimitBindingType }>(
  async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";

    const key = `rateLimit:${ip}`;

    const current = await c.env.RATE_LIMIT.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= LIMIT) {
      return c.json({ message: "Too many requests" }, 429);
    }

    await c.env.RATE_LIMIT.put(key, String(count + 1), {
      expirationTtl: WINDOW,
    });

    await next();
  },
);

export { rateLimit };
