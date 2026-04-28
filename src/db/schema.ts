import { refreshToken } from "better-auth/api";
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// For timetamps of tables
const timeStamps = {
  createdAt: integer("createdAt", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond) * 1000 as integer))`)
    .notNull(),

  updatedAt: integer("updatedAt", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
};

// vault table
// users table
// sessions table
// account table

export const vaultEntries = sqliteTable("vault_entries", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  label: text("label").notNull(),
  url: text("url"),
  notes: text("notes"),
  username: text("username").notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  ...timeStamps,
});

// users table
/* 
  id 
name 
email
emailVerified 
image 
createdAt 
updatedAt 
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  ...timeStamps,
});

// sessions table
/* id 
expiresAt 
token 
createdAt 
updatedAt 
ipAddress 
userAgent 
userId */
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    userAgent: text("user_agent").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timeStamps,
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

// account table
/* 
account
id 
accountId 
providerId 
userId 
accessToken 
refreshToken 
idToken 
accessTokenExpiresAt 
refreshTokenExpiresAt 
scope 
password 
createdAt 
updatedAt 
 */
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  idToken: text("id_token").notNull(),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  ...timeStamps,
});

// verification table

/*
id
identifier
value 
expiresAt 
createdAt 
 */
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).default(
    sql`(cast(unixepoch('subsecond') * 1000 as integer)`,
  ),
  ...timeStamps,
});
