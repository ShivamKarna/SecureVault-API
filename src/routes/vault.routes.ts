import { Hono } from "hono";
import { SmartRouter } from "hono/router/smart-router";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter } from "hono/router/trie-router";
import { authCheck } from "../middleware/auth.middleware";
import { vaultController } from "../controllers/vault.controller";

const vaultRouter = new Hono({
  router: new SmartRouter({
    routers: [new RegExpRouter(), new TrieRouter()],
  }),
});

// so api link will be : localhost/api/passwords/**
vaultRouter.use("/*", authCheck);
vaultRouter.get("/", ...vaultController.getVaults);

export default vaultRouter;
