import { Hono } from "hono";
import passwordRouter from "./password.routes";

const mainRouter = new Hono();

mainRouter.route("/password", passwordRouter);

export default mainRouter;
