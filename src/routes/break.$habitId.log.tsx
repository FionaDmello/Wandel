import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { BreakLogScreen } from "@/features/break/BreakLogScreen";

export const Route = createFileRoute("/break/$habitId/log")({
  validateSearch: z.object({
    date: z.string().optional(),
    entryId: z.string().optional(),
  }),
  component: BreakLogScreen,
});
