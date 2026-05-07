// getVaults
// getVaultById
// createVault
// updateVaultEntries
// deleteVault

import { and, eq, sql } from "drizzle-orm";
import { getDb } from "../db";
import { vaultEntries } from "../db/schema";
import { parse, z } from "zod";
import { encryptPassword } from "../lib/encryption";
import type { Context } from "hono";
import type { BindingsType, User } from "../lib/types";

type AppEnv = {
  Bindings: BindingsType;
  Variables: { user: User };
};

export class VaultController {
  getVaults = async (c: Context<AppEnv>) => {
    const db = getDb(c.env.securevault_db);
    const user = c.get("user");

    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 20);
    const offset = (page - 1) * limit;

    const [result, total] = await Promise.all([
      db
        .select()
        .from(vaultEntries)
        .where(eq(vaultEntries.userId, user.id))
        .offset(offset)
        .limit(limit),
      db
        .select({ count: sql<number>`count(*)` })
        .from(vaultEntries)
        .where(eq(vaultEntries.userId, user.id))
        .get(),
    ]);
    return c.json(
      {
        data: result,
        metaData: {
          page,
          limit,
          total: total?.count ?? 0,
          totalPages: Math.ceil((total?.count ?? 0) / limit),
        },
      },
      200,
    );
  };
  getVaultById = async (c: Context<AppEnv>) => {
    const id = c.req.param("id");
    if (!id) {
      return c.json({ error: "ID is required" }, 400);
    }
    const db = getDb(c.env.securevault_db);
    const user = c.get("user");

    const result = await db
      .select()
      .from(vaultEntries)
      .where(and(eq(vaultEntries.id, id), eq(vaultEntries.userId, user.id)))
      .get(); // get makes sure that it returns the first row or undefined

    return c.json({ result }, 200);
  };
  createVault = async (c: Context<AppEnv>) => {
    const userInput = await c.req.json();
    const db = getDb(c.env.securevault_db);
    const user = c.get("user");

    const schema = z.object({
      label: z.string().min(2).max(200),
      username: z.string().min(2).max(30),
      password: z.string().min(7).max(60),
      url: z.string().optional(),
      notes: z.string().optional(),
    }); //zod parsing

    const parsed = schema.safeParse(userInput);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues }, 400);
    }

    const encryptedPassword = await encryptPassword(
      parsed.data.password,
      c.env.ENCRYPTION_KEY,
    );
    if (!encryptedPassword) {
      return c.json({ message: " Internal Server Error" }, 500);
    }

    const [row] = await db
      .insert(vaultEntries)
      .values({
        userId: user.id,
        label: parsed.data.label,
        username: parsed.data.username,
        encryptedPassword,
        url: parsed.data.url ?? null,
        notes: parsed.data.notes ?? null,
      })
      .returning({
        id: vaultEntries.id,
        label: vaultEntries.label,
        username: vaultEntries.username,
        url: vaultEntries.url,
        notes: vaultEntries.notes,
      });
    if (!row) {
      return c.json({ message: "Internal Server Error" }, 500);
    }

    return c.json(
      {
        data: row,
        message: "Vault created Successfully",
      },
      201,
    );
  };
  updateVaultEntries = async (c: Context<AppEnv>) => {
    const db = getDb(c.env.securevault_db);

    const user = c.get("user");
    const vaultId = c.req.param("id");
    if (!vaultId) {
      return c.json({ error: "ID is required" }, 400);
    }
    const existenceProof = await db
      .select()
      .from(vaultEntries)
      .where(
        and(eq(vaultEntries.id, vaultId), eq(vaultEntries.userId, user.id)),
      )
      .get();

    if (!existenceProof) {
      return c.json({ message: "Vault Entry Not Found" }, 404);
    }

    const newValues = await c.req.json();
    const schema = z
      .object({
        label: z.string().min(2).max(200),
        username: z.string().min(2).max(30),
        password: z.string().min(7).max(60),
        url: z.string().optional(),
        notes: z.string().optional(),
      })
      .partial(); //zod parsing

    const parsed = schema.safeParse(newValues);
    if (!parsed.success) {
      return c.json({ error: parsed.error.issues }, 400);
    }

    const updateData: Partial<typeof vaultEntries.$inferInsert> = {};

    if (parsed.data.label !== undefined) updateData.label = parsed.data.label;
    if (parsed.data.username !== undefined)
      updateData.username = parsed.data.username;
    if (parsed.data.url !== undefined) updateData.url = parsed.data.url;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    if (parsed.data.password !== undefined) {
      updateData.encryptedPassword = await encryptPassword(
        parsed.data.password,
        c.env.ENCRYPTION_KEY,
      );
    }
    const [row] = await db
      .update(vaultEntries)
      .set(updateData)
      .where(
        and(eq(vaultEntries.id, vaultId), eq(vaultEntries.userId, user.id)),
      )
      .returning({
        id: vaultEntries.id,
        label: vaultEntries.label,
        username: vaultEntries.username,
        url: vaultEntries.url,
        notes: vaultEntries.notes,
      });

    if (!row) {
      return c.json({ message: "Vault entry not found" }, 404);
    }
    return c.json(
      {
        data: row,
        message: "Vault Entries Updated Successfully",
      },
      200,
    );
  };
  deleteVault = async (c: Context<AppEnv>) => {
    const db = getDb(c.env.securevault_db);
    const user = c.get("user");
    const vaultId = c.req.param("id");

    if (!vaultId) {
      return c.json({ message: "Id not provided" }, 400);
    }

    const existing = await db
      .select()
      .from(vaultEntries)
      .where(
        and(eq(vaultEntries.id, vaultId), eq(vaultEntries.userId, user.id)),
      )
      .get();

    if (!existing) {
      return c.json({ message: "Vault Entry not found" }, 404);
    }

    await db
      .delete(vaultEntries)
      .where(
        and(eq(vaultEntries.id, vaultId), eq(vaultEntries.userId, user.id)),
      );
    return c.json({ message: "Vault Deleted Successfully" }, 200);
  };
}

export const vaultController = new VaultController();
