import { createFileRoute } from "@tanstack/react-router";

import { BuildHabitScreen } from "@/features/build/BuildHabitScreen";

export const Route = createFileRoute("/build/$habitId")({
  component: BuildHabitScreen,
});
