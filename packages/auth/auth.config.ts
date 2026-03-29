// CLI-only config for generating the Drizzle auth schema (pnpm db:generate-auth).
// The runtime auth lives in src/index.ts — plugins and features are defined
// there via authOptions so they stay in sync. This file only exists because
// the better-auth CLI needs a static `auth` export with a real DB connection,
// which Workers can't provide at module scope.
import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { authOptions } from "./src/index.js";

const sqlite = new Database(":memory:");

export const auth = betterAuth({
  ...authOptions,
  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "recurse",
          authorizationUrl: "https://www.recurse.com/oauth/authorize",
          tokenUrl: "https://www.recurse.com/oauth/token",
          userInfoUrl: "https://www.recurse.com/api/v1/profiles/me",
          clientId: "unused-by-cli",
          clientSecret: "unused-by-cli",
          scopes: [],
        },
      ],
    }),
  ],
  database: drizzleAdapter(drizzle(sqlite), {
    provider: "sqlite",
  }),
  secret: "unused-by-cli",
});
