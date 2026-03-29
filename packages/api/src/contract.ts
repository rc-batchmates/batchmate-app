import { oc } from "@orpc/contract";
import * as z from "zod";

export const FloorSchema = z.enum(["4", "5"]);
export type Floor = z.infer<typeof FloorSchema>;

export const EntrySchema = z.enum(["elevator", "stairs"]);
export type Entry = z.infer<typeof EntrySchema>;

export const contract = oc.router({
  health: oc.route({ method: "GET", path: "/health" }).output(
    z.object({
      status: z.string(),
      timestamp: z.string(),
    }),
  ),
  doorsOpen: oc
    .route({ method: "POST", path: "/doors/open" })
    .input(
      z.object({
        floor: FloorSchema,
        entry: EntrySchema,
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
      }),
    ),
});

export type Contract = typeof contract;
