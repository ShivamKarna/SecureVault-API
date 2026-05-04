import { createMiddleware } from "hono/factory";
import { getBetterAuthInstance } from "../lib/auth";
import type { BindingsType } from "../lib/types";
import type { User } from "../lib/types";

const authCheck = createMiddleware<{
  Bindings: BindingsType;
  Variables: { user: User };
}>(async (c, next) => {
  const auth = getBetterAuthInstance(
    c.env.securevault_db,
    c.env.BETTER_AUTH_SECRET,
  );
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ message: "Unauthorized Request" }, 401);
  }

  c.set("user", session.user);

  await next();
});

export { authCheck };
