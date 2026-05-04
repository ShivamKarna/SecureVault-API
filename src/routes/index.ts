import { Hono } from "hono";
import vaultRouter from "./vault.routes";
import { sessionRouter } from "./session.routes";

const mainRouter = new Hono();

mainRouter.route("/vault", vaultRouter);
mainRouter.route("/sessions", sessionRouter);

export default mainRouter;
