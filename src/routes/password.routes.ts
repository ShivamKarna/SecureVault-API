import { Hono } from "hono";
import { getPasswords } from "../controllers/password.controller";
import { SmartRouter } from "hono/router/smart-router";
import { RegExpRouter } from "hono/router/reg-exp-router";
import { TrieRouter } from "hono/router/trie-router";
import { authCheck } from "../middleware/auth.middleware";

const passwordRouter = new Hono({
  router: new SmartRouter({
    routers: [new RegExpRouter(), new TrieRouter()],
  }),
});

// so api link will be : localhost/api/passwords/**
passwordRouter.use("/*", authCheck);
passwordRouter.get("/", ...getPasswords);

export default passwordRouter;
