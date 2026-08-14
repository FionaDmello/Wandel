import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HardThingLogger } from "@/features/engine/HardThingLogger";

const mockMutate = vi.fn();

vi.mock("@/hooks/useHardThings", () => ({
  useLogHardThing: () => ({ mutate: mockMutate, isPending: false }),
}));

const DEFAULT_PROPS = {
  userId: "user-1",
  date: "2026-05-27",
  initialWhat: null,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe("HardThingLogger", () => {
  it("submit button is disabled when what is empty", () => {
    render(<HardThingLogger {...DEFAULT_PROPS} />);
    expect(screen.getByText("I did this")).toBeDisabled();
  });

  it("enables submit after typing into the what field", async () => {
    render(<HardThingLogger {...DEFAULT_PROPS} />);
    await userEvent.type(
      screen.getByPlaceholderText("What did you show up for?"),
      "A hard conversation",
    );
    expect(screen.getByText("I did this")).not.toBeDisabled();
  });

  it("calls mutate with correct payload on submit", async () => {
    render(<HardThingLogger {...DEFAULT_PROPS} />);
    await userEvent.type(
      screen.getByPlaceholderText("What did you show up for?"),
      "A hard conversation",
    );
    await userEvent.click(screen.getByText("I did this"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        date: "2026-05-27",
        what: "A hard conversation",
        before: 1,
        during: 1,
        after: 1,
        note: null,
        linked_intention: false,
      }),
      expect.any(Object),
    );
  });

  it("calls onSuccess after successful mutation", async () => {
    const onSuccess = vi.fn();
    mockMutate.mockImplementation(
      (_payload: unknown, options: { onSuccess: () => void }) => {
        options.onSuccess();
      },
    );
    render(<HardThingLogger {...DEFAULT_PROPS} onSuccess={onSuccess} />);
    await userEvent.type(
      screen.getByPlaceholderText("What did you show up for?"),
      "A hard conversation",
    );
    await userEvent.click(screen.getByText("I did this"));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("clicking Cancel calls onClose without submitting", async () => {
    const onClose = vi.fn();
    render(<HardThingLogger {...DEFAULT_PROPS} onClose={onClose} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
