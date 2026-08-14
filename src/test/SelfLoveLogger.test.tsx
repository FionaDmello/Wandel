import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SelfLoveLogger } from "@/features/engine/SelfLoveLogger";
import type { Practice } from "@/types/engine";

const PRACTICE: Practice = {
  id: "p-1",
  user_id: "user-1",
  name: "Breath",
  description: "Four slow breaths.",
  is_default: true,
  active: true,
  created_at: "2026-05-01T00:00:00Z",
};

const mockMutate = vi.fn();

vi.mock("@/hooks/useSelfLove", () => ({
  useLogSelfLove: () => ({ mutate: mockMutate, isPending: false }),
}));

vi.mock("@/hooks/usePractices", () => ({
  usePractices: () => ({ data: [PRACTICE] }),
}));

const DEFAULT_PROPS = {
  userId: "user-1",
  date: "2026-05-27",
  initialPractice: null,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

describe("SelfLoveLogger", () => {
  it("submit button is disabled when no practice is selected", () => {
    render(<SelfLoveLogger {...DEFAULT_PROPS} />);
    const btn = screen.getByText("That was for me");
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("enables submit after selecting a practice", async () => {
    render(<SelfLoveLogger {...DEFAULT_PROPS} />);
    await userEvent.click(screen.getByText("Breath"));
    const btn = screen.getByText("That was for me");
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it("selected practice chip has amber background class", async () => {
    render(<SelfLoveLogger {...DEFAULT_PROPS} />);
    const chip = screen.getByText("Breath");
    await userEvent.click(chip);
    expect(chip.className).toContain("bg-amber");
  });

  it("pre-selects initialPractice and enables submit", () => {
    render(<SelfLoveLogger {...DEFAULT_PROPS} initialPractice={PRACTICE} />);
    const btn = screen.getByText("That was for me");
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    expect(screen.getByText("Breath").className).toContain("bg-amber");
  });

  it("calls mutate with correct payload on submit", async () => {
    render(<SelfLoveLogger {...DEFAULT_PROPS} initialPractice={PRACTICE} />);
    await userEvent.click(screen.getByText("That was for me"));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        date: "2026-05-27",
        practice: "Breath",
        practice_id: "p-1",
        felt: 1,
        note: null,
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
    render(
      <SelfLoveLogger
        {...DEFAULT_PROPS}
        initialPractice={PRACTICE}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.click(screen.getByText("That was for me"));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  it("clicking Cancel calls onClose without submitting", async () => {
    const onClose = vi.fn();
    render(<SelfLoveLogger {...DEFAULT_PROPS} onClose={onClose} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
