import { router } from "../trpc";
import { eventRouter } from "./event";
import { userRouter } from "./user";
import { notificationRouter } from "./notification";

export const appRouter = router({
  event: eventRouter,
  user: userRouter,
  notification: notificationRouter,
});

export type AppRouter = typeof appRouter;
