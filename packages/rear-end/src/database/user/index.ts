import { JSONFilePreset } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";
import type { UserTypes } from "@/api/user";

const __filename = fileURLToPath(import.meta.url);

export type Data = UserTypes;

export const userDb = await JSONFilePreset<Data>(
  path.join(__filename, "../db.json"),
  {} as UserTypes
);

await userDb.read();
