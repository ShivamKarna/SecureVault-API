//Api link : localhost/api/vault/**

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

vaultRouter.use("/*", authCheck);
// Get routes
vaultRouter.get("/", ...vaultController.getVaults);
vaultRouter.get("/:id", ...vaultController.getVaultById);

vaultRouter.post("/", ...vaultController.createVault);
vaultRouter.patch("/:id", ...vaultController.updateVaultEntries);
vaultRouter.delete("/:id", ...vaultController.deleteVault);

export default vaultRouter;
