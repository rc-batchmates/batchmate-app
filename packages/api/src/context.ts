import { implement } from "@orpc/server";
import type { Database } from "@batchmate/db";
import { contract } from "./contract";

export interface Context {
  db: Database;
  user: { id: string; name: string; email: string } | null;
  session: { id: string } | null;
}

export const server = implement(contract).$context<Context>();
