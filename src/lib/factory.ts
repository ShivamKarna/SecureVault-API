import { createFactory } from "hono/factory";
import type { BindingsType, User } from "./types";

export const factory = createFactory<{
  Bindings: BindingsType;
  Variables: { user: User };
}>();
