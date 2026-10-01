import "server-only";
import type { TaskDef } from "./types";
import { planCreate, planAdjust } from "./plan";

/** Every AI "task" the app can run through /api/ai/[task]. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TASKS: Record<string, TaskDef<any, any>> = {
  "plan-create": planCreate,
  "plan-adjust": planAdjust,
};
