import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/build/$habitId")({
  validateSearch: z.object({
    date: z.string().optional(),
  }),
  component: Outlet,
});
