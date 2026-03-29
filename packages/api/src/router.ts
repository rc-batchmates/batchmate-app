import { server } from "./context";
import { health } from "./procedures/health";

export const router = server.router({
  health,
});

export type Router = typeof router;
