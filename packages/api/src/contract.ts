import { oc } from "@orpc/contract";
import * as z from "zod";

export const contract = oc.router({
  health: oc.route({ method: "GET", path: "/health" }).output(
    z.object({
      status: z.string(),
      timestamp: z.string(),
    }),
  ),
});

export type Contract = typeof contract;
