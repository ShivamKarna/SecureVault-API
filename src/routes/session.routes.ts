import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authCheck } from "../middleware/auth.middleware";
import { sessionController } from "../controllers/session.controller";
import type { BindingsType, User } from "../lib/types";

const sessionRouter = new OpenAPIHono<{
  Bindings: BindingsType;
  Variables: { user: User };
}>();

sessionRouter.use("/*", authCheck);

sessionRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Session"],
    summary: "Get all sessions",
    responses: {
      200: { description: "List of Sessions" },
      401: { description: "Unauthorized" },
    },
  }),
  sessionController.getSessions,
);

sessionRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Session"],
    summary: "Revoke a session",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: { description: "Sessoin Revoked" },
      401: { description: "Unauthorized" },
      404: { description: "Not Found" },
    },
  }),
  sessionController.revokeSession,
);

export default sessionRouter;
