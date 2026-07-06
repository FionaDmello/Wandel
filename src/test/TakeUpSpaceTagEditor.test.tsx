import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TakeUpSpaceTagEditor } from "@/features/engine/TakeUpSpaceTagEditor";
import type { TakeUpSpaceTag } from "@/types/takeUpSpace";

let mockTags: TakeUpSpaceTag[] = [];
let mockSaveMutate = vi.fn();
let mockDeleteMutate = vi.fn();
let mockSaveIsPending = false;

vi.mock("@/hooks/useTakeUpSpaceTags", () => ({
  useTakeUpSpaceTags: () => ({ data: mockTags }),
  useSaveTags: () => ({ mutate: mockSaveMutate, isPending: mockSaveIsPending }),
  useDeleteTag: () => ({ mutate: mockDeleteMutate }),
}));

vi.mock("@/features/protocols/ProtocolModal", () => ({
  ProtocolModal: ({
    children,
    onClose,
  }: {
    children: React.ReactNode;
    onClose: () => void;
  }) => (
    <div>
      <button type="button" onClick={onClose}>
        close
      </button>
      {children}
    </div>
  ),
}));

const defaultTag: TakeUpSpaceTag = {
  id: "tag-1",
  name: "settling",
  is_default: true,
  active: true,
  user_id: "user-1",
  created_at: "2026-01-01T00:00:00Z",
};

const userTag: TakeUpSpaceTag = {
  id: "tag-2",
  name: "custom",
  is_default: false,
  active: true,
  user_id: "user-1",
  created_at: "2026-01-02T00:00:00Z",
};

describe("TakeUpSpaceTagEditor", () => {
  beforeEach(() => {
    mockTags = [defaultTag, userTag];
    mockSaveMutate = vi.fn();
    mockDeleteMutate = vi.fn();
    mockSaveIsPending = false;
  });

  it("renders all tags including inactive", () => {
    mockTags = [defaultTag, { ...userTag, active: false }];
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    expect(screen.getByText("settling")).toBeInTheDocument();
    expect(screen.getByText("custom")).toBeInTheDocument();
  });

  it("shows toggle for default tag", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    expect(screen.getByLabelText("Deactivate tag")).toBeInTheDocument();
  });

  it("fires useSaveTags with flipped active on toggle", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Deactivate tag"));
    expect(mockSaveMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tag-1", active: false }),
    );
  });

  it("shows remove button for user-created tag", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    expect(screen.getByLabelText("Remove tag")).toBeInTheDocument();
  });

  it("shows confirm on remove click", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Remove tag"));
    expect(screen.getByText("Remove?")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("fires useDeleteTag on confirm Yes", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Remove tag"));
    fireEvent.click(screen.getByText("Yes"));
    expect(mockDeleteMutate).toHaveBeenCalledWith(
      "tag-2",
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it("dismisses confirm on Cancel", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("Remove tag"));
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText("Remove?")).not.toBeInTheDocument();
  });

  it("Add button is disabled when input is empty", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("Add button is disabled and shows warning for duplicate name", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Tag name"), {
      target: { value: "settling" },
    });
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
    expect(
      screen.getByText("A tag with this name already exists"),
    ).toBeInTheDocument();
  });

  it("duplicate check is case-insensitive", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Tag name"), {
      target: { value: "SETTLING" },
    });
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  it("fires useSaveTags on Add with trimmed name", () => {
    render(<TakeUpSpaceTagEditor userId="user-1" onClose={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Tag name"), {
      target: { value: "  focus  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    expect(mockSaveMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "focus",
        is_default: false,
        active: true,
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });
});
