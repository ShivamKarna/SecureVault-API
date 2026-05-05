// getSessions
// revokeSession

import { getDb } from "../db";
import { session } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { UAParser } from "ua-parser-js";
import type { Context } from "hono";
import type { BindingsType, User } from "../lib/types";

type AppEnv = {
  Bindings: BindingsType;
  Variables: { user: User };
};

class SessionController {
  getSessions = async (c: Context<AppEnv>) => {
    const db = getDb(c.env.securevault_db);
    const user = c.get("user");

    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, user.id));

    const parsed = sessions.map((s) => {
      const parser = new UAParser(s.userAgent ?? "");
      const result = parser.getResult();

      return {
        id: s.id,
        ipAddress: s.ipAddress,
        expiresAt: s.expiresAt,
        createdAt: s.createdAt,
        device: {
          browser: result.browser.name ?? "unknown",
          browserVersion: result.browser.version ?? "",
          os: result.os.name ?? "unknown",
          osVersion: result.os.version ?? "",
          deviceType: result.device.type ?? "desktop",
          deviceModel: result.device.model ?? "",
        },
      };
    });
    return c.json({ data: parsed }, 200);
  };
  revokeSession = async (c: Context<AppEnv>) => {
    const db = getDb(c.env.securevault_db);
    const user = c.get("user");
    const sessionId = c.req.param("id");

    if (!sessionId) {
      return c.json({ message: "SessionId is Required" }, 400);
    }

    const sessionToBeRevoked = await db
      .select()
      .from(session)
      .where(and(eq(session.id, sessionId), eq(session.userId, user.id)))
      .get();

    if (!sessionToBeRevoked) {
      return c.json({ message: "Session not found" }, 404);
    }

    await db
      .delete(session)
      .where(and(eq(session.id, sessionId), eq(session.userId, user.id)));

    return c.json({ message: "Session Revoked Successfully" }, 200);
  };
}

export const sessionController = new SessionController();
