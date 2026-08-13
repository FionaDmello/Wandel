import { createFileRoute } from "@tanstack/react-router";

import { HabitScreen } from "@/features/break/HabitScreen";

export const Route = createFileRoute("/break/$habitId/")({
  component: HabitScreen,
});
