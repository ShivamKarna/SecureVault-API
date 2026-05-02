export type BindingsType = {
  password_manager_db: D1Database;
  BETTER_AUTH_SECRET: string;
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
