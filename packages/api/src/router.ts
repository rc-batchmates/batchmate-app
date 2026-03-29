import { server } from "./context";
import { doorsOpen } from "./procedures/doors-open";
import { health } from "./procedures/health";

export const router = server.router({
  health,
  doorsOpen,
});

export type Router = typeof router;
