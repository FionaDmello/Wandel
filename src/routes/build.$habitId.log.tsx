import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { BuildLogScreen } from "@/features/build/BuildLogScreen";

export const Route = createFileRoute("/build/$habitId/log")({
  validateSearch: z.object({
    date: z.string().optional(),
  }),
  component: BuildLogScreen,
});
