import { Hono } from "hono";
import vaultRouter from "./vault.routes";

const mainRouter = new Hono();

mainRouter.route("/vault", vaultRouter);

export default mainRouter;
