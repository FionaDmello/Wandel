import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useAbandonDraft,
  useActiveDraft,
  useCompleteEntry,
  useCreateTakeUpSpaceEntry,
  useTakeUpSpaceEntries,
  useUpdateCostField,
  useUpdateTakeUpSpaceEntry,
} from "@/hooks/useTakeUpSpace";
import type { TakeUpSpaceEntry } from "@/types/takeUpSpace";

const {
  mockSecondOrder,
  mockMaybeSingle,
  mockInsertSingle,
  mockUpdate,
  mockDelete,
} = vi.hoisted(() => ({
  mockSecondOrder: vi.fn(),
  mockMaybeSingle: vi.fn(),
  mockInsertSingle: vi.fn(),
  mockUpdate: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  builder.order = () => ({ order: mockSecondOrder });
  builder.maybeSingle = mockMaybeSingle;
  builder.insert = () => ({ select: () => ({ single: mockInsertSingle }) });
  builder.update = () => builder;
  builder.then = (r: (v: unknown) => void, j: (e: unknown) => void) =>
    mockUpdate().then(r, j);
  builder.delete = () => ({ eq: () => ({ eq: () => mockDelete() }) });
  return { supabase: { from: () => builder } };
});

const ENTRY: TakeUpSpaceEntry = {
  id: "e-1",
  user_id: "user-1",
  date: "2026-05-29",
  mode: "in_the_moment",
  situation: "I was about to say yes when I meant no.",
  action: null,
  cost: null,
  need: null,
  choice_text: null,
  teaching: null,
  tag_ids: [],
  tag_names: [],
  choice_outcome: null,
  panel_tag: null,
  status: "draft",
  created_at: "2026-05-29T10:00:00Z",
  completed_at: null,
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe("useTakeUpSpaceEntries", () => {
  it("returns entries on success", async () => {
    mockSecondOrder.mockResolvedValue({ data: [ENTRY], error: null });

    const { result } = renderHook(() => useTakeUpSpaceEntries("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([ENTRY]);
  });

  it("returns empty array when no entries exist", async () => {
    mockSecondOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useTakeUpSpaceEntries("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on error", async () => {
    mockSecondOrder.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useTakeUpSpaceEntries("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(() => useTakeUpSpaceEntries(""), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockSecondOrder).not.toHaveBeenCalled();
  });
});

describe("useActiveDraft", () => {
  it("returns draft entry when one exists", async () => {
    mockMaybeSingle.mockResolvedValue({ data: ENTRY, error: null });

    const { result } = renderHook(() => useActiveDraft("user-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(ENTRY);
  });

  it("returns null when no draft exists", async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useActiveDraft("user-1"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("throws on error", async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useActiveDraft("user-1"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(() => useActiveDraft(""), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });
});

describe("useCreateTakeUpSpaceEntry", () => {
  it("resolves to the created entry", async () => {
    mockInsertSingle.mockResolvedValue({ data: ENTRY, error: null });

    const { result } = renderHook(() => useCreateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    let resolved: TakeUpSpaceEntry | undefined;
    await act(async () => {
      resolved = await result.current.mutateAsync({ date: "2026-05-29" });
    });

    expect(resolved).toEqual(ENTRY);
  });

  it("throws on error", async () => {
    mockInsertSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useCreateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({ date: "2026-05-29" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("falls back to the existing draft when insert conflicts with the one-draft-per-user constraint", async () => {
    mockInsertSingle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    });
    mockMaybeSingle.mockResolvedValue({ data: ENTRY, error: null });

    const { result } = renderHook(() => useCreateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    let resolved: TakeUpSpaceEntry | undefined;
    await act(async () => {
      resolved = await result.current.mutateAsync({ date: "2026-05-29" });
    });

    expect(resolved).toEqual(ENTRY);
  });

  it("propagates non-conflict insert errors without a fallback select", async () => {
    mockInsertSingle.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    const { result } = renderHook(() => useCreateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({ date: "2026-05-29" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockMaybeSingle).not.toHaveBeenCalled();
  });

  it("surfaces the original conflict error if the fallback select finds no draft", async () => {
    mockInsertSingle.mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message: "duplicate key value violates unique constraint",
      },
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useCreateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({ date: "2026-05-29" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useUpdateTakeUpSpaceEntry", () => {
  it("resolves without throwing on success", async () => {
    mockUpdate.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUpdateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "e-1",
        situation: "Updated situation.",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on error", async () => {
    mockUpdate.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useUpdateTakeUpSpaceEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({ id: "e-1", situation: "Updated." });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useCompleteEntry", () => {
  it("resolves without throwing on success", async () => {
    mockUpdate.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useCompleteEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "e-1",
        mode: "in_the_moment",
        choice_outcome: "paused",
        panel_tag: null,
        tag_ids: [],
        tag_names: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on error", async () => {
    mockUpdate.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useCompleteEntry("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({
        id: "e-1",
        mode: "in_the_moment",
        choice_outcome: "paused",
        panel_tag: null,
        tag_ids: [],
        tag_names: [],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useAbandonDraft", () => {
  it("resolves without throwing on success", async () => {
    mockDelete.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useAbandonDraft("user-1"), { wrapper });

    await act(async () => {
      await result.current.mutateAsync("e-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on error", async () => {
    mockDelete.mockResolvedValue({ error: { message: "DB error" } });

    const { result } = renderHook(() => useAbandonDraft("user-1"), { wrapper });

    await act(async () => {
      result.current.mutate("e-1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useUpdateCostField", () => {
  it("resolves without throwing on success", async () => {
    mockUpdate.mockResolvedValue({ data: null, error: null });

    const { result } = renderHook(() => useUpdateCostField("user-1"), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        id: "e-1",
        cost: "My peace of mind.",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on error", async () => {
    mockUpdate.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useUpdateCostField("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate({ id: "e-1", cost: "My peace of mind." });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
