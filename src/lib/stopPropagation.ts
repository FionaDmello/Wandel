import type { TouchEvent } from "react";

export function stopPropagation(e: TouchEvent<HTMLInputElement>) {
  e.stopPropagation();
}
