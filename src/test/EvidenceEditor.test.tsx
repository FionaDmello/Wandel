import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EvidenceEditor } from "@/features/engine/EvidenceEditor";

const mockMutate = vi.fn();

let mockIsPending = false;

vi.mock("@/hooks/useSelfWorthEvidence", () => ({
  useAddEvidence: () => ({ mutate: mockMutate, isPending: mockIsPending }),
}));

const DEFAULT_PROPS = {
  userId: "user-1",
  date: "2026-05-28",
};

let onClose: () => void;
let onSuccess: () => void;

beforeEach(() => {
  vi.clearAllMocks();
  mockIsPending = false;
  onClose = vi.fn();
  onSuccess = vi.fn();
});

describe("EvidenceEditor", () => {
  it("submit button is disabled when all fields empty", () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    expect(screen.getByText("This is who you are.")).toBeDisabled();
  });

  it("submit button is disabled when only title filled", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "My title",
    );
    expect(screen.getByText("This is who you are.")).toBeDisabled();
  });

  it("submit button is disabled when title and situation filled but what_i_did_well empty", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "My title",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What was happening?"),
      "A situation",
    );
    expect(screen.getByText("This is who you are.")).toBeDisabled();
  });

  it("submit button is disabled when title and what_i_did_well filled but situation empty", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "My title",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What did you actually do well here?"),
      "I did this well",
    );
    expect(screen.getByText("This is who you are.")).toBeDisabled();
  });

  it("submit button is disabled when fields contain only whitespace", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "   ",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What was happening?"),
      "   ",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What did you actually do well here?"),
      "   ",
    );
    expect(screen.getByText("This is who you are.")).toBeDisabled();
  });

  it("submit button is disabled while mutation is pending", () => {
    mockIsPending = true;
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    expect(screen.getByText("This is who you are.")).toBeDisabled();
  });

  it("submit button is enabled when all three fields have non-empty trimmed values", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "My title",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What was happening?"),
      "A situation",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What did you actually do well here?"),
      "I did this well",
    );
    expect(screen.getByText("This is who you are.")).not.toBeDisabled();
  });

  it("calls mutate with correct payload on submit", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "My title",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What was happening?"),
      "A situation",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What did you actually do well here?"),
      "I did this well",
    );
    await userEvent.click(screen.getByText("This is who you are."));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        date: "2026-05-28",
        title: "My title",
        situation: "A situation",
        what_i_did_well: "I did this well",
      }),
      expect.any(Object),
    );
  });

  it("calls onSuccess after successful mutation", async () => {
    const localOnSuccess = vi.fn();
    mockMutate.mockImplementation(
      (_payload: unknown, options: { onSuccess: () => void }) => {
        options.onSuccess();
      },
    );
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={localOnSuccess}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText("What would you title this moment?"),
      "My title",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What was happening?"),
      "A situation",
    );
    await userEvent.type(
      screen.getByPlaceholderText("What did you actually do well here?"),
      "I did this well",
    );
    await userEvent.click(screen.getByText("This is who you are."));
    expect(localOnSuccess).toHaveBeenCalledOnce();
  });

  it("clicking Cancel calls onClose without submitting", async () => {
    render(
      <EvidenceEditor
        {...DEFAULT_PROPS}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    );
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledOnce();
    expect(mockMutate).not.toHaveBeenCalled();
  });
});
