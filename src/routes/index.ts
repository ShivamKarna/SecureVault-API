import { Hono } from "hono";
import vaultRouter from "./vault.routes";
import sessionRouter from "./session.routes";
import { OpenAPIHono } from "@hono/zod-openapi";

const mainRouter = new OpenAPIHono();

mainRouter.route("/vault", vaultRouter);
mainRouter.route("/sessions", sessionRouter);

export default mainRouter;
