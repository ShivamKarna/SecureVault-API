import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authCheck } from "../middleware/auth.middleware";
import { vaultController } from "../controllers/vault.controller";
import type { BindingsType, User } from "../lib/types";

const vaultRouter = new OpenAPIHono<{
  Bindings: BindingsType;
  Variables: { user: User };
}>();

vaultRouter.use("/*", authCheck);

vaultRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["Vault"],
    summary: "Get all vault entries",
    responses: {
      200: { description: "List of vault entries" },
      401: { description: "Unauthorized" },
    },
  }),
  vaultController.getVaults,
);

vaultRouter.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Vault"],
    summary: "Get single Vault with decrypted password",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: { description: "Vault entry with decrypted password" },
      401: { description: "Unauthoried" },
      404: { description: "Not Found" },
    },
  }),
  vaultController.getVaultById,
);

vaultRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Vault"],
    summary: "Create a vault Entry",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              label: z.string().min(2).max(200),
              username: z.string().min(2).max(30),
              password: z.string().min(7).max(60),
              url: z.string().optional(),
              notes: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: "Vault entry created" },
      400: { description: "Validation Error" },
      401: { description: "Unauthorized" },
    },
  }),
  vaultController.createVault,
);
vaultRouter.openapi(
  createRoute({
    method: "patch",
    path: "/{id}",
    tags: ["Vault"],
    summary: "Update a vault Entry",
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              label: z.string().min(2).max(200).optional(),
              username: z.string().min(2).max(30).optional(),
              password: z.string().min(7).max(60).optional(),
              url: z.string().optional(),
              notes: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      200: { description: "Vault entry updated" },
      400: { description: "Validation Error" },
      401: { description: "Unauthorized" },
      404: { description: "Not Found" },
    },
  }),
  vaultController.updateVaultEntries,
);

vaultRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{id}",
    tags: ["Vault"],
    summary: "Delete a Vault Entry",
    request: {
      params: z.object({ id: z.string() }),
    },
    responses: {
      200: { description: "Vault entry deleted" },
      401: { description: "Unauthoried" },
      404: { description: "Not Found" },
    },
  }),
  vaultController.deleteVault,
);

export default vaultRouter;
