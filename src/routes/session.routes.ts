// API : /api/session
import { SmartRouter } from "hono/router/smart-router";
import { sessionController } from "../controllers/session.controller";
import { Hono } from "hono";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter } from "hono/router/trie-router";
import { authCheck } from "../middleware/auth.middleware";

const sessionRouter = new Hono({
  router: new SmartRouter({
    routers: [new RegExpRouter(), new TrieRouter()],
  }),
});

sessionRouter.use("/*", authCheck);
sessionRouter.get("/", ...sessionController.getSessions);
sessionRouter.delete("/:id", ...sessionController.revokeSession);

export { sessionRouter };
