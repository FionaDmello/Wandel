import { describe, expect, it } from "vitest";

import { trapFocus } from "@/lib/trapFocus";

function makeContainer(buttonCount: number, disabledIndexes: number[] = []) {
  const container = document.createElement("div");
  for (let i = 0; i < buttonCount; i++) {
    const button = document.createElement("button");
    button.textContent = `button-${i}`;
    if (disabledIndexes.includes(i)) button.disabled = true;
    container.appendChild(button);
  }
  document.body.appendChild(container);
  return container;
}

function makeTabEvent(shiftKey: boolean) {
  return new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey,
    cancelable: true,
  });
}

describe("trapFocus", () => {
  it("wraps forward from the last focusable element to the first", () => {
    const container = makeContainer(3);
    const buttons = container.querySelectorAll("button");
    (buttons[2] as HTMLButtonElement).focus();

    const event = makeTabEvent(false);
    trapFocus(event, container);

    expect(document.activeElement).toBe(buttons[0]);
    expect(event.defaultPrevented).toBe(true);
    container.remove();
  });

  it("wraps backward from the first focusable element to the last", () => {
    const container = makeContainer(3);
    const buttons = container.querySelectorAll("button");
    (buttons[0] as HTMLButtonElement).focus();

    const event = makeTabEvent(true);
    trapFocus(event, container);

    expect(document.activeElement).toBe(buttons[2]);
    expect(event.defaultPrevented).toBe(true);
    container.remove();
  });

  it("does nothing when focus is on a middle element", () => {
    const container = makeContainer(3);
    const buttons = container.querySelectorAll("button");
    (buttons[1] as HTMLButtonElement).focus();

    const event = makeTabEvent(false);
    trapFocus(event, container);

    expect(document.activeElement).toBe(buttons[1]);
    expect(event.defaultPrevented).toBe(false);
    container.remove();
  });

  it("excludes disabled elements from the boundary", () => {
    const container = makeContainer(3, [2]);
    const buttons = container.querySelectorAll("button");
    (buttons[1] as HTMLButtonElement).focus();

    const event = makeTabEvent(false);
    trapFocus(event, container);

    expect(document.activeElement).toBe(buttons[0]);
    expect(event.defaultPrevented).toBe(true);
    container.remove();
  });

  it("does nothing when the container has no focusable descendants", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const event = makeTabEvent(false);
    expect(() => trapFocus(event, container)).not.toThrow();
    expect(event.defaultPrevented).toBe(false);
    container.remove();
  });

  it("does nothing when container is null", () => {
    const event = makeTabEvent(false);
    expect(() => trapFocus(event, null)).not.toThrow();
    expect(event.defaultPrevented).toBe(false);
  });
});
