export const DEV_API_URL = "http://localhost:8787";
export const PROD_API_URL = "https://recurse.rocks";

import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { contract } from "@batchmate/api/contract";
import type { Router } from "@batchmate/api/router";

export type Client = ReturnType<typeof createClient>;

export function createClient(
  baseUrl: string = typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost",
) {
  const link = new OpenAPILink(contract, {
    url: `${baseUrl}/api/v1`,
  });

  const client: RouterClient<Router> = createORPCClient(link);

  return createTanstackQueryUtils(client);
}
