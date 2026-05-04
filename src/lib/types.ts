export type BindingsType = {
  securevault_db: D1Database;
  BETTER_AUTH_SECRET: string;
  ENCRYPTION_KEY: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
};
