import { factory } from "../lib/factory";

const getPasswords = factory.createHandlers(async (c) => {
  return c.json({ message: "Hey this is getPasswords Route" }, 200);
});

export { getPasswords };
